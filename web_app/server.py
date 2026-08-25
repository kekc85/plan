"""
Сервер веб-приложения "Электронный журнал смены Диспетчера группы центровки".
Обеспечивает REST API для взаимодействия фронтенда с модулем парсера расписания (parser.py).
Использует стандартную библиотеку Python http.server (без внешних зависимостей).
"""

import sys
import os
import json
import traceback
from datetime import datetime, timedelta
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from concurrent.futures import ThreadPoolExecutor, as_completed

# Добавляем родительскую папку в sys.path для импорта parser.py
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(CURRENT_DIR)
if PARENT_DIR not in sys.path:
    sys.path.insert(0, PARENT_DIR)

try:
    from parser import (
        AviabitClient,
        ALLOWED_DEPARTURES,
        IATA_CITIES,
        MSK_TZ,
        parse_date_arg,
        parse_time_arg,
        process_flights
    )
except ImportError as e:
    print(f"[-] Ошибка импорта parser.py: {e}")

SHIFT_DATA_FILE = os.path.join(CURRENT_DIR, "current_shift.json")


def get_schedule_flights(start_date: datetime, end_date: datetime, start_time_str: str = "00:00", end_time_str: str = "23:59") -> list:
    """Выгрузка расписания через порталы Nordwind и Икар и преобразование в список объектов для журнала."""
    s_h, s_m = parse_time_arg(start_time_str, 0, 0)
    e_h, e_m = parse_time_arg(end_time_str, 23, 59)

    start_dt_msk = datetime(start_date.year, start_date.month, start_date.day, s_h, s_m, tzinfo=MSK_TZ)
    end_dt_msk = datetime(end_date.year, end_date.month, end_date.day, e_h, e_m, tzinfo=MSK_TZ)

    # 1. Запросы к обоим порталам
    client_nws = AviabitClient("aviabit.nordwindairlines.ru", "Nordwind")
    client_ikar = AviabitClient("aviabit.ikar.aero", "Икар")

    with ThreadPoolExecutor(max_workers=2) as executor:
        f_nws = executor.submit(client_nws.login_and_fetch, start_date, end_date, "WBGarantiya")
        f_ikar = executor.submit(client_ikar.login_and_fetch, start_date, end_date, "WBGarantiya")
        res_nws = f_nws.result()
        res_ikar = f_ikar.result()

    flights_nws = res_nws.get("flights", []) if res_nws.get("success") else []
    flights_ikar = res_ikar.get("flights", []) if res_ikar.get("success") else []

    preliminaries = {}
    if res_nws.get("success"):
        preliminaries.update(res_nws.get("preliminaries", {}))
    if res_ikar.get("success"):
        preliminaries.update(res_ikar.get("preliminaries", {}))

    for fl in flights_nws:
        fl["_client"] = client_nws
    for fl in flights_ikar:
        fl["_client"] = client_ikar

    combined_candidates = flights_nws + flights_ikar

    # Обработка с фильтрацией резервов (~РЕЗ / R), дат и времени
    processed_rows = process_flights(
        combined_candidates,
        preliminaries=preliminaries,
        start_dt_msk=start_dt_msk,
        end_dt_msk=end_dt_msk
    )

    # Преобразуем кортежи колонок в структурированный JSON для веб-журнала
    # Формат кортежа: (flight, route, time, ac_num, ac_config, pax, crew, fuel, mtow, lir, cargo, mail, baggage, szv, ldm)
    result_list = []
    for idx, row in enumerate(processed_rows):
        route_text = str(row[1] or "")
        route_parts = route_text.split("\n")
        route_city = route_parts[0] if len(route_parts) > 1 else ""
        route_airports = route_parts[1] if len(route_parts) > 1 else route_text

        flight_obj = {
            "id": f"fl_{idx}_{row[0]}_{row[2]}",
            "flight": str(row[0] or ""),
            "route_city": route_city,
            "route_airports": route_airports,
            "time": str(row[2] or ""),
            "ac_num": str(row[3] or ""),
            "ac_config": str(row[4] or ""),
            "pax": str(row[5] or ""),
            "crew": str(row[6] or ""),
            "fuel": str(row[7] or ""),
            "mtow": str(row[8] or ""),
            "lir": str(row[9] or ""),
            "cargo": str(row[10] or ""),
            "mail": str(row[11] or ""),
            "baggage": str(row[12] or ""),
            "szv": str(row[13] or ""),
            "ldm": str(row[14] or ""),
            "status": "pending",  # pending | in_progress | ready | delayed
            "notes": ""
        }
        result_list.append(flight_obj)

    return result_list


class ShiftJournalRequestHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "time": datetime.now().isoformat()}).encode("utf-8"))
            return

        elif path == "/api/shift":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self._send_cors_headers()
            self.end_headers()
            if os.path.exists(SHIFT_DATA_FILE):
                try:
                    with open(SHIFT_DATA_FILE, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
                    return
                except Exception as e:
                    pass
            self.wfile.write(json.dumps({"flights": [], "shift_date": "", "dispatcher": ""}).encode("utf-8"))
            return

        elif path == "/api/fetch-schedule":
            try:
                start_date_str = query.get("start_date", [datetime.now().strftime("%d.%m.%Y")])[0]
                end_date_str = query.get("end_date", [start_date_str])[0]
                start_time_str = query.get("start_time", ["00:00"])[0]
                end_time_str = query.get("end_time", ["23:59"])[0]

                start_date = parse_date_arg(start_date_str)
                end_date = parse_date_arg(end_date_str)

                flights = get_schedule_flights(start_date, end_date, start_time_str, end_time_str)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._send_cors_headers()
                self.end_headers()
                resp = {
                    "success": True,
                    "count": len(flights),
                    "start_date": start_date_str,
                    "end_date": end_date_str,
                    "start_time": start_time_str,
                    "end_time": end_time_str,
                    "flights": flights
                }
                self.wfile.write(json.dumps(resp, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._send_cors_headers()
                self.end_headers()
                err_resp = {"success": False, "error": str(e), "traceback": traceback.format_exc()}
                self.wfile.write(json.dumps(err_resp, ensure_ascii=False).encode("utf-8"))
            return

        # Отдача статических файлов сборки (если web_app/dist существует)
        dist_dir = os.path.join(CURRENT_DIR, "dist")
        if os.path.exists(dist_dir):
            clean_path = path.lstrip("/")
            file_path = os.path.join(dist_dir, clean_path)
            if not clean_path or not os.path.exists(file_path):
                file_path = os.path.join(dist_dir, "index.html")

            if os.path.exists(file_path) and os.path.isfile(file_path):
                mime = "text/html"
                if file_path.endswith(".js"):
                    mime = "application/javascript"
                elif file_path.endswith(".css"):
                    mime = "text/css"
                elif file_path.endswith(".svg"):
                    mime = "image/svg+xml"
                elif file_path.endswith(".json"):
                    mime = "application/json"
                elif file_path.endswith(".png"):
                    mime = "image/png"
                elif file_path.endswith(".ico"):
                    mime = "image/x-icon"

                self.send_response(200)
                self.send_header("Content-Type", f"{mime}; charset=utf-8" if "text" in mime or "json" in mime or "javascript" in mime else mime)
                self._send_cors_headers()
                self.end_headers()
                with open(file_path, "rb") as f:
                    self.wfile.write(f.read())
                return

        self.send_response(404)
        self.end_headers()
        self.wfile.write(b"Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/shift":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            try:
                data = json.loads(body.decode("utf-8"))
                with open(SHIFT_DATA_FILE, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "saved_at": datetime.now().isoformat()}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
            return

        self.send_response(404)
        self.end_headers()
        self.wfile.write(b"Not Found")

    def log_message(self, format, *args):
        # Компактный лог в консоль
        sys.stderr.write(f"[Server] {self.address_string()} - {format % args}\n")


def run_server(port=8000):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, ShiftJournalRequestHandler)
    print(f"[*] Сервер электронного журнала запущен: http://127.0.0.1:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Остановка сервера...")
        httpd.server_close()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    run_server(port)
