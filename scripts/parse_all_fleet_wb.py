#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Парсер официальных отчётов Weight & Balance Report (WBR / DOW-DOI)
для флота Nordwind Airlines (N4) и Ikar Airlines (EO).

Считывает все PDF-файлы из папки DOW-DOI, извлекает параметры ВС:
Бортовой номер (tail), оператор (N4 / EO), модель ВС, ревизия, дата, базовая масса и матрица [экипаж][кухня] -> {dow, doi}.
Результаты сохраняются в web_app/public/data/fleet_wb.json и локальную SQLite базу plan.db.
"""

import os
import glob
import re
import json
import sqlite3
import pdfplumber

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
DOW_DOI_DIR = r"E:\ANTIGRAVITY\AVERAGO BAGGEGE WEIGH\DOW-DOI"
OUTPUT_JSON = os.path.join(PROJECT_DIR, "web_app", "public", "data", "fleet_wb.json")
OUTPUT_JSONS = [
    os.path.join(PROJECT_DIR, "web_app", "src", "data", "fleet_wb.json"),
    os.path.join(PROJECT_DIR, "web_app", "public", "data", "fleet_wb.json"),
    os.path.join(PROJECT_DIR, "loadsheet", "fleet_wb.json"),
    r"C:\Users\kekc85\.gemini\antigravity\worktrees\AVERAGO BAGGEGE WEIGH\add_test_address_config\fleet_wb.json",
    r"C:\Users\kekc85\.gemini\antigravity\worktrees\AVERAGO BAGGEGE WEIGH\add_test_address_config\loadsheet\fleet_wb.json"
]
SQLITE_DB = os.path.join(PROJECT_DIR, "plan.db")

# Официальные структурные предельные веса ВС (MTOW, MLAW / MLW, MZFW)
MAX_WEIGHTS_MAP = {
    # A321-200 (CEO)
    "72271": {"mtow": 89000, "mlaw": 75500, "mzfw": 71500},
    "72273": {"mtow": 89000, "mlaw": 75500, "mzfw": 71500},
    "72324": {"mtow": 89000, "mlaw": 77800, "mzfw": 73800},
    "72325": {"mtow": 89000, "mlaw": 77800, "mzfw": 73800},
    "72326": {"mtow": 89000, "mlaw": 75500, "mzfw": 71500},
    "73271": {"mtow": 89000, "mlaw": 75500, "mzfw": 71500},
    "73273": {"mtow": 89000, "mlaw": 75500, "mzfw": 71500},
    "73324": {"mtow": 89000, "mlaw": 77800, "mzfw": 73800},
    "73325": {"mtow": 89000, "mlaw": 77800, "mzfw": 73800},
    "73326": {"mtow": 89000, "mlaw": 75500, "mzfw": 71500},

    # A330-200
    "73270": {"mtow": 233000, "mlaw": 180000, "mzfw": 168000},
    "73328": {"mtow": 233000, "mlaw": 182000, "mzfw": 170000},

    # A330-300
    "73848": {"mtow": 235000, "mlaw": 187000, "mzfw": 173000},
    "73849": {"mtow": 235000, "mlaw": 187000, "mzfw": 173000},
    "73850": {"mtow": 235000, "mlaw": 187000, "mzfw": 173000},

    # A321-253 (NEO)
    "72322": {"mtow": 93500, "mlaw": 79200, "mzfw": 75600},
    "72323": {"mtow": 93500, "mlaw": 79200, "mzfw": 75600},
    "73322": {"mtow": 93500, "mlaw": 79200, "mzfw": 75600},
    "73323": {"mtow": 93500, "mlaw": 79200, "mzfw": 75600},

    # B737-800
    "73269": {"mtow": 79015, "mlaw": 66360, "mzfw": 62731},
    "73321": {"mtow": 79015, "mlaw": 66360, "mzfw": 62731},
    "73311": {"mtow": 73508, "mlaw": 65317, "mzfw": 61688},
    "73312": {"mtow": 73508, "mlaw": 65317, "mzfw": 61688},
    "73313": {"mtow": 79000, "mlaw": 66360, "mzfw": 62731},
    "73316": {"mtow": 79000, "mlaw": 66360, "mzfw": 62731},
    "73317": {"mtow": 79000, "mlaw": 66360, "mzfw": 62731},
    "73314": {"mtow": 79015, "mlaw": 66360, "mzfw": 62731},
    "73315": {"mtow": 79015, "mlaw": 66360, "mzfw": 62731},
    "73318": {"mtow": 79000, "mlaw": 66360, "mzfw": 62731},
    "73319": {"mtow": 78925, "mlaw": 65770, "mzfw": 62731},

    # B737-900 (в т.ч. мокрый лизинг 73343, 73344)
    "73343": {"mtow": 85139, "mlaw": 71350, "mzfw": 67721},
    "73344": {"mtow": 85139, "mlaw": 71350, "mzfw": 67721},

    # B777-200ER (Nordwind)
    "73340": {"mtow": 294835, "mlaw": 208652, "mzfw": 195044},
    "73341": {"mtow": 294835, "mlaw": 208652, "mzfw": 195044},

    # B777-300ER (Nordwind)
    "73342": {"mtow": 344548, "mlaw": 251290, "mzfw": 237682},
    "73847": {"mtow": 344548, "mlaw": 251290, "mzfw": 237682},

    # B777-200 (Ikar)
    "73272": {"mtow": 294835, "mlaw": 208652, "mzfw": 195044},
    "73347": {"mtow": 286670, "mlaw": 208652, "mzfw": 195044},

    # Embraer 190 (Ikar)
    "02739": {"mtow": 50300, "mlaw": 43000, "mzfw": 40800},
    "02740": {"mtow": 50300, "mlaw": 43000, "mzfw": 40800},
    "02741": {"mtow": 50300, "mlaw": 43000, "mzfw": 40800},
    "02743": {"mtow": 50300, "mlaw": 43000, "mzfw": 40800},
}


def normalize_tail(raw_tail):
    """Приводит номер борта к 5-значному стандарту (например, 73271 или 02740)."""
    clean = re.sub(r'[^0-9]', '', str(raw_tail or ''))
    if len(clean) >= 5:
        return clean[-5:]
    return clean


def parse_wbr_file(filepath):
    """Универсальный парсер одного PDF-файла (Nordwind или Ikar)."""
    fname = os.path.basename(filepath)
    with pdfplumber.open(filepath) as pdf:
        p0 = pdf.pages[0]
        text = p0.extract_text() or ""
        tables = p0.extract_tables()

        is_ikar = "ikar" in text.lower() or "llc \"aircompany \"ikar\"" in text.lower() or "dnd" in fname.lower() or "e190" in fname.lower()
        if "wbr_737-900_ra-7334" in fname.lower():
            is_ikar = False
        elif "dow_doi b739 ra7334" in fname.lower():
            is_ikar = True

        operator = "EO" if is_ikar else "N4"

        # 1. Извлечение хвоста (tail)
        tail_match = re.search(r'(?:Registration:?\s*(?:RA-?)?|RA-?)(\d{5})', text)
        if not tail_match:
            tail_match = re.search(r'(?:RA-?)?(\d{5})', fname)
        tail = normalize_tail(tail_match.group(1) if tail_match else "UNKNOWN")

        # 2. Модель ВС
        model = "UNKNOWN"
        m_match = re.search(r'Model:?\s*([A-Za-z0-9\-\s]+)', text)
        if m_match:
            model = m_match.group(1).split('\n')[0].strip()
        elif "737-800" in fname or "738" in fname:
            model = "B737-800"
        elif "737-900" in fname or "739" in fname:
            model = "B737-900ER"
        elif "A321-NEO" in fname:
            model = "A321-NEO"
        elif "A321" in fname:
            model = "A321-200"
        elif "A332" in fname:
            model = "A330-200"
        elif "A333" in fname:
            model = "A330-300"
        elif "E190" in fname:
            model = "ERJ 190-100"
        elif "777-200" in fname or "B772" in fname:
            model = "B777-200ER"
        elif "777-300" in fname or "B773" in fname:
            model = "B777-300ER"

        # 3. Ревизия и дата
        rev_match = re.search(r'Revision\s*(?:No\.?)?:?\s*([^\n]+)', text, re.I)
        revision = rev_match.group(1).strip() if rev_match else ""
        if not revision:
            r_fname = re.search(r'rev_?(\d+)', fname, re.I)
            if r_fname: revision = f"Rev {r_fname.group(1)}"
        if not revision and "2026" in fname:
            d_m = re.search(r'(20\d{6})', fname)
            if d_m: revision = f"Rev {d_m.group(1)}"

        date_match = re.search(r'Date:?\s*([^\n]+)', text)
        date_val = date_match.group(1).strip() if date_match else ""
        if not date_val:
            d_fname = re.search(r'(20\d{6}|\d{2}[A-Za-z]{3}\d{2,4})', fname)
            if d_fname: date_val = d_fname.group(1)

        # 4. Базовый вес и базовый индекс
        basic_wt = None
        basic_idx = None

        # Проверка таблицы шапки (для Nordwind / WBR)
        if len(tables) > 0 and tables[0]:
            t0 = tables[0]
            for r_idx, row in enumerate(t0):
                if any('Basic' in str(c) for c in row if c):
                    if r_idx + 1 < len(t0):
                        next_row = t0[r_idx + 1]
                        vals = [str(c).strip() for c in next_row if c and str(c).strip()]
                        for v in vals:
                            clean_v = v.replace(' ', '')
                            if re.match(r'^\d{5,6}$', clean_v) and basic_wt is None:
                                try: basic_wt = int(clean_v)
                                except: pass
                            elif re.match(r'^\d+[,\.]\d{1,2}$', clean_v) and basic_idx is None:
                                try: basic_idx = float(clean_v.replace(',', '.'))
                                except: pass

        # Резервный поиск по тексту (для Ikar / DOW-DOI)
        if basic_wt is None:
            bw_m = re.search(r'(?:Basic Weight|Weight)\s*\n?(\d{5,6})', text, re.I)
            if bw_m:
                try: basic_wt = int(bw_m.group(1))
                except: pass

        if basic_idx is None:
            bi_m = re.search(r'Index\s*\n?([0-9]+[,\.][0-9]{2})', text, re.I)
            if bi_m:
                try: basic_idx = float(bi_m.group(1).replace(',', '.'))
                except: pass

        # 5. Признак аптечки (Fly Kit) для файлов NoFAK / FAK
        fly_kit_mode = "STANDARD"
        if "nofak" in fname.lower():
            fly_kit_mode = "NO_FAK"
        elif "fak2ake" in fname.lower():
            fly_kit_mode = "FAK_2AKE"

        matrix = {}

        # ----------------------------------------------------
        # ПАРСИНГ NORDWIND ТАБЛИЦЫ
        # ----------------------------------------------------
        if not is_ikar and len(tables) >= 2:
            table = tables[1]
            header_row_idx = -1
            pantry_codes = []

            for r_idx, row in enumerate(table[:5]):
                clean_cells = [str(c).strip() for c in row if c and str(c).strip()]
                letters = [c for c in clean_cells if len(c) == 1 and c in "ABDEFGK"]
                if len(letters) >= 2:
                    header_row_idx = r_idx
                    for c_idx, cell in enumerate(row):
                        val = str(cell).strip() if cell else ""
                        if val and val in "ABDEFGK":
                            pantry_codes.append((c_idx, val))
                    break

            for r_idx in range(header_row_idx + 1, len(table)):
                row = table[r_idx]
                if not row or not row[0]: continue
                crew_str = str(row[0]).replace('*', '').strip()
                if not re.match(r'^\d+/\d+', crew_str): continue

                matrix[crew_str] = {}
                for p_col_idx, p_code in pantry_codes:
                    dow_val = None
                    doi_val = None
                    if p_col_idx < len(row) and row[p_col_idx]:
                        try:
                            dow_val = int(float(str(row[p_col_idx]).replace(' ', '').replace(',', '.')))
                        except: pass
                    if p_col_idx + 1 < len(row) and row[p_col_idx + 1]:
                        try:
                            doi_val = float(str(row[p_col_idx + 1]).replace(' ', '').replace(',', '.'))
                        except: pass
                    if dow_val is not None:
                        matrix[crew_str][p_code] = {
                            "dow": dow_val,
                            "doi": doi_val
                        }

        # ----------------------------------------------------
        # ПАРСИНГ IKAR ТАБЛИЦЫ
        # ----------------------------------------------------
        elif is_ikar and len(tables) >= 2:
            table = tables[1]
            header_row_idx = -1
            header_row = None

            for r_idx, row in enumerate(table[:6]):
                clean = [str(c).strip() for c in row if c]
                if 'Crew' in clean and any(p in clean for p in ['A', 'B', 'E', 'C', 'D']):
                    header_row_idx = r_idx
                    header_row = row
                    break

            if header_row:
                # Список кухонь в первом блоке (Including Fly Kit)
                p_codes = []
                for c_idx in range(1, len(header_row)):
                    p = str(header_row[c_idx]).strip()
                    if p and p in "ABCDEFGK":
                        p_codes.append((c_idx, p))
                    # Для B739/E190 первый блок заканчивается на E
                    if len(p_codes) >= 3 and p == 'E':
                        break

                r_idx = header_row_idx + 1
                while r_idx < len(table):
                    row_wt = table[r_idx]
                    row_idx = table[r_idx + 1] if r_idx + 1 < len(table) else None

                    if not row_wt or not row_wt[0]:
                        r_idx += 1
                        continue

                    crew_str = str(row_wt[0]).strip()
                    if not re.match(r'^\d+/\d+', crew_str):
                        r_idx += 1
                        continue

                    matrix[crew_str] = {}
                    for c_idx, p_code in p_codes:
                        dow_val = None
                        doi_val = None
                        if c_idx < len(row_wt) and row_wt[c_idx]:
                            cell_str = str(row_wt[c_idx]).replace(' ', '').replace(',', '.')
                            # Если ячейка содержит 'weight' (например, для 2/0 кухни A), пропускаем
                            if 'weight' not in cell_str.lower():
                                try: dow_val = int(float(cell_str))
                                except: pass

                        if row_idx and c_idx < len(row_idx) and row_idx[c_idx]:
                            cell_idx_str = str(row_idx[c_idx]).replace(' ', '').replace(',', '.')
                            if 'index' not in cell_idx_str.lower():
                                try: doi_val = float(cell_idx_str)
                                except: pass

                        if dow_val is not None:
                            matrix[crew_str][p_code] = {
                                "dow": dow_val,
                                "doi": doi_val
                            }

                    # Переходим к следующему блоку экипажа (шаг 3 строки: weight, index, MAC)
                    r_idx += 3

        mw = MAX_WEIGHTS_MAP.get(tail, {"mtow": None, "mlaw": None, "mzfw": None})

        return {
            "file": fname,
            "operator": operator,
            "tail": tail,
            "model": model,
            "revision": revision,
            "date": date_val,
            "basic_weight": basic_wt,
            "basic_index": basic_idx,
            "max_weights": mw,
            "fly_kit_mode": fly_kit_mode,
            "crew_count": len(matrix),
            "pantry_codes": list(next(iter(matrix.values())).keys()) if matrix else [],
            "matrix": matrix
        }


def main():
    print(f"Поиск PDF-файлов в папке: {DOW_DOI_DIR}")
    files = sorted(glob.glob(os.path.join(DOW_DOI_DIR, "*.pdf")))
    print(f"Найдено файлов: {len(files)}")

    fleet_dict = {}

    for f in files:
        res = parse_wbr_file(f)
        tail = res['tail']
        operator = res['operator']
        fly_mode = res['fly_kit_mode']

        # Ключ в реестре: tail_operator[_flymode]
        # Для стандартных бортов (например 73271_N4, 02740_EO)
        # Для 73343: будут 73343_N4 и 73343_EO
        # Для 73344: будут 73344_N4 и 73344_EO
        key = f"{tail}_{operator}"
        if fly_mode != "STANDARD":
            key += f"_{fly_mode}"

        fleet_dict[key] = res
        p_str = ','.join(res['pantry_codes'])
        print(f"  [OK] {key:18} | Модель: {res['model'][:14]:14} | Экипажей: {res['crew_count']:2} | Кухни: {p_str:10} | {res['file'][:30]}")

    # Сохраняем в JSON (во все рабочие директории)
    for p in OUTPUT_JSONS:
        try:
            os.makedirs(os.path.dirname(p), exist_ok=True)
            with open(p, 'w', encoding='utf-8') as out_f:
                json.dump(fleet_dict, out_f, ensure_ascii=False, indent=2)
            print(f"[УСПЕХ] Обновлен JSON: {p}")
        except Exception as e:
            print(f"[SKIP] Не удалось записать {p}: {e}")

    # Сохраняем в SQLite plan.db
    if os.path.exists(SQLITE_DB):
        conn = sqlite3.connect(SQLITE_DB)
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS plan_fleet_wb (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                config_key TEXT UNIQUE,
                tail TEXT,
                operator TEXT,
                model TEXT,
                revision TEXT,
                rev_date TEXT,
                basic_weight INTEGER,
                basic_index REAL,
                mtow INTEGER,
                mlaw INTEGER,
                mzfw INTEGER,
                fly_kit_mode TEXT,
                pantry_codes TEXT,
                matrix_json TEXT,
                updated_at TEXT
            )
        """)

        # Безопасная миграция колонок предельных весов если таблица уже существовала
        c.execute("PRAGMA table_info(plan_fleet_wb)")
        existing_cols = [row[1] for row in c.fetchall()]
        for col, col_type in [('mtow', 'INTEGER'), ('mlaw', 'INTEGER'), ('mzfw', 'INTEGER')]:
            if col not in existing_cols:
                c.execute(f"ALTER TABLE plan_fleet_wb ADD COLUMN {col} {col_type}")

        for key, item in fleet_dict.items():
            p_str = ','.join(item['pantry_codes'])
            mw = item.get('max_weights', {})
            c.execute("""
                INSERT OR REPLACE INTO plan_fleet_wb
                (config_key, tail, operator, model, revision, rev_date, basic_weight, basic_index, mtow, mlaw, mzfw, fly_kit_mode, pantry_codes, matrix_json, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            """, (
                key,
                item['tail'],
                item['operator'],
                item['model'],
                item['revision'],
                item['date'],
                item['basic_weight'],
                item['basic_index'],
                mw.get('mtow'),
                mw.get('mlaw'),
                mw.get('mzfw'),
                item['fly_kit_mode'],
                p_str,
                json.dumps(item['matrix'], ensure_ascii=False)
            ))
        conn.commit()
        conn.close()
        print(f"[УСПЕХ] SQLite таблица plan_fleet_wb обновлена в {SQLITE_DB}")


if __name__ == "__main__":
    main()
