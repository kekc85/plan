# -*- coding: utf-8 -*-
"""
Модуль синхронизации Lydia DCS и вспомогательных функций для AeroBag Predictor.
Обеспечивает автономную работу без PHP и внешнего сервера Beget.
"""

import os
import sys
import re
import json
import ssl
import urllib.request
import urllib.parse
import http.cookiejar
from typing import Dict, Any, List

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
AEROBAG_DIR = os.path.join(BASE_DIR, 'aerobag')


def load_dcs_config() -> Dict[str, Any]:
    config = {
        'base_url': 'https://newdcs.nwsesys.com/ADSDCS',
        'username': 'WBZUBKOV',
        'password': 'WBZUBKOV',
        'airline': 'N4',
        'default_locations': ['DYU', 'NMA', 'TJU', 'SKD', 'TAS', 'CXR', 'IST'],
        'request_delay_ms': 500
    }
    
    # 1. Проверяем dcs_config.json в aerobag/ или корне
    for target_dir in [AEROBAG_DIR, BASE_DIR]:
        json_path = os.path.join(target_dir, 'dcs_config.json')
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    jcfg = json.load(f)
                    if isinstance(jcfg, dict):
                        if jcfg.get('username'): config['username'] = jcfg['username']
                        if jcfg.get('password'): config['password'] = jcfg['password']
                        if jcfg.get('airline'): config['airline'] = jcfg['airline']
                        if jcfg.get('base_url'): config['base_url'] = jcfg['base_url']
                        break
            except Exception as e:
                print("[DCS Config] Ошибка чтения JSON:", e)

    return config


def save_dcs_credentials(username: str, password: str, airline: str = 'N4') -> bool:
    try:
        cfg = load_dcs_config()
        cfg['username'] = username
        cfg['password'] = password
        cfg['airline'] = airline
        
        target_path = os.path.join(AEROBAG_DIR, 'dcs_config.json')
        with open(target_path, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print("[DCS Config] Ошибка сохранения учетных данных:", e)
        return False


def load_dcs_stations() -> List[Dict[str, Any]]:
    stations_file = os.path.join(AEROBAG_DIR, 'dcs_stations.json')
    if not os.path.exists(stations_file):
        stations_file = os.path.join(BASE_DIR, 'dcs_stations.json')
        
    if os.path.exists(stations_file):
        try:
            with open(stations_file, 'r', encoding='utf-8') as f:
                stations = json.load(f)
                if isinstance(stations, list) and len(stations) > 0:
                    return stations
        except Exception:
            pass

    return [
        {'code': 'DYU', 'name': 'Душанбе (DYU)', 'checked': True},
        {'code': 'NMA', 'name': 'Наманган (NMA)', 'checked': True},
        {'code': 'TJU', 'name': 'Куляб (TJU)', 'checked': True},
        {'code': 'SKD', 'name': 'Самарканд (SKD)', 'checked': True},
        {'code': 'TAS', 'name': 'Ташкент (TAS)', 'checked': True},
        {'code': 'CXR', 'name': 'Камрань (CXR)', 'checked': True},
        {'code': 'IST', 'name': 'Стамбул (IST)', 'checked': True}
    ]


def save_dcs_stations(stations: List[Dict[str, Any]]) -> bool:
    try:
        target_path = os.path.join(AEROBAG_DIR, 'dcs_stations.json')
        with open(target_path, 'w', encoding='utf-8') as f:
            json.dump(stations, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print("[DCS Stations] Ошибка сохранения станций:", e)
        return False


class DcsScraper:
    def __init__(self, config):
        self.config = config
        self.base_url = config['base_url'].rstrip('/')
        self.ctx = ssl.create_default_context()
        self.ctx.check_hostname = False
        self.ctx.verify_mode = ssl.CERT_NONE
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(
            urllib.request.HTTPCookieProcessor(self.cj),
            urllib.request.HTTPSHandler(context=self.ctx)
        )
        self.auth_token = ''
        self.is_logged_in = False

    def login(self, username=None, password=None):
        user = username or self.config['username']
        pw = password or self.config['password']
        if not user or not pw:
            return {'success': False, 'error': 'Учетные данные Lydia DCS не настроены.'}

        try:
            req0 = urllib.request.Request(self.base_url + '/', headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            })
            with self.opener.open(req0, timeout=10) as r0:
                p0 = r0.read().decode('utf-8', errors='ignore')
                m0 = re.search(r'name=["\']auth-token["\']\s+content=["\']([^"\']+)["\']', p0)
                if not m0:
                    m0 = re.search(r'content=["\']([^"\']+)["\']\s+name=["\']auth-token["\']', p0)
                tok0 = m0.group(1) if m0 else ''

            login_url = self.base_url + '/dcsIndex.do'
            post_data = urllib.parse.urlencode({
                'username': user,
                'password': pw,
                'checkUserSession': '0',
                'airline': self.config.get('airline', 'N4'),
                'osVersion': 'w10',
                'systemName': '',
                '_token': tok0
            }).encode('utf-8')

            req_login = urllib.request.Request(login_url, data=post_data, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': self.base_url + '/',
                'Content-Type': 'application/x-www-form-urlencoded'
            })

            with self.opener.open(req_login, timeout=12) as r_login:
                login_body = r_login.read().decode('utf-8', errors='ignore')
                m_post = re.search(r'content=["\']([^"\']+)["\']\s+name=["\']auth-token["\']', login_body)
                if not m_post:
                    m_post = re.search(r'name=["\']auth-token["\']\s+content=["\']([^"\']+)["\']', login_body)
                self.auth_token = m_post.group(1) if m_post else tok0

            flt_page = self.base_url + '/ADSDCS/flightManagement/flightListsInfo.jsp'
            req_page = urllib.request.Request(flt_page, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with self.opener.open(req_page, timeout=12) as r_page:
                page_html = r_page.read().decode('utf-8', errors='ignore')
                m_flt = re.search(r'content=["\']([^"\']+)["\']\s+name=["\']auth-token["\']', page_html)
                if m_flt:
                    self.auth_token = m_flt.group(1)

            self.is_logged_in = True
            return {'success': True, 'message': 'Авторизация в Lydia DCS успешно пройдена.'}
        except Exception as e:
            return {'success': False, 'error': f'Ошибка связи с Lydia DCS: {str(e)}'}

    def scan_flights(self, start_date, end_date, locations=None, only_finalized=True, client_flight_keys=None):
        if not self.is_logged_in:
            lres = self.login()
            if not lres.get('success'):
                return lres

        if not locations:
            locations = self.config.get('default_locations', ['DYU', 'NMA', 'TJU', 'SKD', 'TAS', 'CXR', 'IST'])

        flt_page = self.base_url + '/ADSDCS/flightManagement/flightListsInfo.jsp'
        flt_ajax = self.base_url + '/ADSDCS/ajax/ajaxFlightsInfo.jsp'
        
        all_flights = []

        for loc in locations:
            loc = loc.strip().upper()
            if not loc:
                continue

            loc_url = self.base_url + '/ADSDCS/ajax/ajaxGetUserLocationList.jsp'
            loc_data = urllib.parse.urlencode({'location': loc, '_token': self.auth_token}).encode('utf-8')
            req_loc = urllib.request.Request(loc_url, data=loc_data, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': flt_page,
                'X-Requested-With': 'XMLHttpRequest'
            })
            try:
                with self.opener.open(req_loc, timeout=10) as r_loc:
                    r_loc.read()
            except Exception as e:
                print(f"[DCS] Ошибка переключения локации {loc}:", e)

            payload = f"destination=null&planeType=null&departureDate={start_date}&rout=&flightTpe=null&endDate={end_date}&companyId=&_token={self.auth_token}"
            req_flt = urllib.request.Request(flt_ajax, data=payload.encode('utf-8'), headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': flt_page,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            })

            try:
                with self.opener.open(req_flt, timeout=15) as r_flt:
                    flt_body = r_flt.read().decode('utf-8', errors='ignore')
            except Exception as e:
                print(f"[DCS] Ошибка получения рейсов для {loc}:", e)
                continue

            tr_matches = re.findall(r'<tr[^>]*>([\s\S]*?)</tr>', flt_body, re.IGNORECASE)
            for tr in tr_matches:
                clean_tds = [re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', td)).strip() for td in re.findall(r'<td[^>]*>([\s\S]*?)</td>', tr)]
                if len(clean_tds) < 7:
                    continue

                raw_status = ''
                for td in clean_tds:
                    if any(st in td for st in ['Finalize', 'Open', 'Close', 'Boarding']):
                        raw_status = td
                        break
                if not raw_status and len(clean_tds) > 6:
                    raw_status = clean_tds[6]

                is_finalized = ('Finalize' in raw_status or 'FINALIZE' in raw_status.upper())
                if only_finalized and not is_finalized:
                    continue

                manifest_calls = re.findall(r'flightManifestoListCheckin\(([^)]+)\)', tr)
                flight_no = ''
                flight_date_raw = ''
                dest_code = ''
                dep_code = loc
                manifest_args = None

                if manifest_calls:
                    manifest_args = [a.strip(" '\"") for a in manifest_calls[0].split(',')]
                    if len(manifest_args) >= 6:
                        flight_date_raw = manifest_args[1]
                        flight_no = manifest_args[2]
                        dest_code = manifest_args[4]
                        dep_code = manifest_args[5] or loc

                if not flight_no and len(clean_tds) > 1:
                    flight_no = clean_tds[1]
                if not dest_code and len(clean_tds) > 2:
                    rm = re.search(r'([A-Z]{3})\s*-\s*([A-Z]{3})', clean_tds[2])
                    if rm:
                        dep_code = rm.group(1)
                        dest_code = rm.group(2)

                clean_date = ''
                dm = re.search(r'(\d{2})/(\d{2})/(\d{4})', (clean_tds[0] if clean_tds else '') + ' ' + flight_date_raw)
                if dm:
                    clean_date = f"{dm.group(3)}-{dm.group(2)}-{dm.group(1)}"
                    if not flight_date_raw:
                        flight_date_raw = f"{dm.group(1)}/{dm.group(2)}/{dm.group(3)}"

                if not flight_no or not dest_code:
                    continue

                if any(f.get('id') == f"dcs_{re.sub(r'[^A-Za-z0-9]', '', flight_no)}_{clean_date}_{dep_code}_{dest_code}" for f in all_flights):
                    continue

                manifest_data = self.get_manifest(flight_no, flight_date_raw, dest_code, dep_code, manifest_args)

                flight_item = {
                    'id': f"dcs_{re.sub(r'[^A-Za-z0-9]', '', flight_no)}_{clean_date}_{dep_code}_{dest_code}",
                    'airline': flight_no[:2] if len(flight_no) >= 2 else 'N4',
                    'flight_no': flight_no,
                    'flight_date': clean_date,
                    'departure_date_raw': flight_date_raw,
                    'departure_code': dep_code,
                    'dest_code': dest_code,
                    'route': f"{dep_code} → {dest_code}",
                    'aircraft': clean_tds[3] if len(clean_tds) > 3 else '',
                    'status': raw_status,
                    'is_finalized': is_finalized,
                    'men': manifest_data.get('men', 0),
                    'women': manifest_data.get('women', 0),
                    'vz': manifest_data.get('vz', 0),
                    'rb': manifest_data.get('rb', 0),
                    'rm': manifest_data.get('rm', 0),
                    'pax': manifest_data.get('pax', 0),
                    'bag_pcs': manifest_data.get('bag_pcs', 0),
                    'bag_weight': manifest_data.get('bag_weight', 0.0),
                    'hb_pcs': manifest_data.get('hb_pcs', 0),
                    'hb_weight': manifest_data.get('hb_weight', 0.0),
                    'zones': manifest_data.get('zones', {})
                }
                all_flights.append(flight_item)

        existing_keys = set(client_flight_keys or [])
        db_path = os.path.join(AEROBAG_DIR, 'baggage_db.json')
        if os.path.exists(db_path):
            try:
                with open(db_path, 'r', encoding='utf-8') as f:
                    db_json = json.load(f)
                    if isinstance(db_json, list):
                        for item in db_json:
                            fn_dig = re.sub(r'\D', '', str(item.get('flight_no', '')))
                            f_date = str(item.get('date', ''))[:10]
                            f_from = str(item.get('from', '')).upper().strip()
                            f_to = str(item.get('to', '')).upper().strip()
                            existing_keys.add(f"{fn_dig}_{f_date}_{f_from}_{f_to}")
            except Exception as e:
                print("[DCS] Baggage DB check error:", e)

        for flt in all_flights:
            fn_dig = re.sub(r'\D', '', str(flt.get('flight_no', '')))
            f_date = str(flt.get('flight_date', ''))[:10]
            f_from = str(flt.get('departure_code', '')).upper().strip()
            f_to = str(flt.get('dest_code', '')).upper().strip()
            k = f"{fn_dig}_{f_date}_{f_from}_{f_to}"
            flt['already_in_db'] = (k in existing_keys)

        return {
            'success': True,
            'count': len(all_flights),
            'flights': all_flights
        }

    def get_manifest(self, flight_no, departure_date, dest_code, departure, manifest_args=None):
        mani_url = self.base_url + '/ADSDCS/ajax/manifest/ajaxManifestFlightInfo.jsp'
        flt_page = self.base_url + '/ADSDCS/flightManagement/flightListsInfo.jsp'

        f_checkin = '1'
        mani_sort = manifest_args[3] if manifest_args and len(manifest_args) > 3 else '0'

        mani_data = urllib.parse.urlencode({
            'f_checkin': f_checkin,
            'flightNumber': flight_no,
            'departureDate': departure_date,
            'manifestoSort': mani_sort,
            'destCode': dest_code,
            'departure': departure,
            '_token': self.auth_token
        }).encode('utf-8')

        req_m = urllib.request.Request(mani_url, data=mani_data, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': flt_page,
            'X-Requested-With': 'XMLHttpRequest'
        })

        try:
            with self.opener.open(req_m, timeout=12) as rm:
                m_html = rm.read().decode('utf-8', errors='ignore')
        except Exception as e:
            print("[DCS] Manifest fetch error:", e)
            return {}

        return self.parse_manifest_html(m_html)

    def parse_manifest_html(self, html):
        data = {
            'total_pax': 0, 'men': 0, 'women': 0, 'vz': 0,
            'rb': 0, 'rm': 0, 'pax': 0, 'bag_pcs': 0,
            'bag_weight': 0.0, 'hb_pcs': 0, 'hb_weight': 0.0, 'zones': {}
        }

        tot = re.search(r'<tr[^>]*>[\s\S]*?Total[\s\S]*?</tr>', html, re.IGNORECASE)
        if tot:
            cells = [re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', td)).strip() for td in re.findall(r'<td[^>]*>([\s\S]*?)</td>', tot.group(0), re.IGNORECASE)]
            tot_idx = -1
            for i, c in enumerate(cells):
                if 'Total' in c:
                    tot_idx = i
                    break

            if tot_idx != -1 and len(cells) > tot_idx + 5:
                def to_int(v):
                    try: return int(re.sub(r'[^\d]', '', v))
                    except: return 0

                def to_float(v):
                    try: return float(re.sub(r'[^\d.]', '', v.replace(',', '.')))
                    except: return 0.0

                total_pax = to_int(cells[tot_idx + 1])
                men = to_int(cells[tot_idx + 2])
                women = to_int(cells[tot_idx + 3])
                chd = to_int(cells[tot_idx + 4])
                inf = to_int(cells[tot_idx + 5])

                num_tail = []
                for k in range(tot_idx + 6, len(cells)):
                    val = re.sub(r'[^\d.]', '', cells[k].replace(',', '.'))
                    if val:
                        try: num_tail.append(float(val))
                        except: pass

                bag_pcs = 0; bag_wt = 0.0; hb_pcs = 0; hb_wt = 0.0
                if len(num_tail) >= 4:
                    bag_pcs = int(num_tail[-4])
                    bag_wt = float(num_tail[-3])
                    hb_pcs = int(num_tail[-2])
                    hb_wt = float(num_tail[-1])

                data['total_pax'] = total_pax
                data['men'] = men
                data['women'] = women
                data['vz'] = men + women
                data['rb'] = chd
                data['rm'] = inf
                data['pax'] = men + women + chd
                data['bag_pcs'] = bag_pcs
                data['bag_weight'] = bag_wt
                data['hb_pcs'] = hb_pcs
                data['hb_weight'] = hb_wt

        return data
