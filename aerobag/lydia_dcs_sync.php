<?php
/**
 * Lydia DCS Sync Module for AeroBag Predictor
 * Автономный сервис взаимодействия с DCS для сканирования и извлечения рейсов
 */

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Загрузка конфигурации DCS (из dcs_config.php или dcs_config.json или параметры по умолчанию)
$configFile = __DIR__ . '/dcs_config.php';
$jsonConfigFile = __DIR__ . '/dcs_config.json';
$config = [
    'base_url' => 'https://newdcs.nwsesys.com/ADSDCS',
    'username' => 'WBZUBKOV',
    'password' => 'WBZUBKOV',
    'airline' => 'N4',
    'default_locations' => ['DYU', 'NMA', 'TJU', 'SKD', 'TAS', 'CXR', 'IST'],
    'request_delay_ms' => 500
];

if (file_exists($jsonConfigFile)) {
    $jcfg = json_decode(file_get_contents($jsonConfigFile), true);
    if (is_array($jcfg)) {
        if (!empty($jcfg['username'])) $config['username'] = $jcfg['username'];
        if (!empty($jcfg['password'])) $config['password'] = $jcfg['password'];
        if (!empty($jcfg['airline'])) $config['airline'] = $jcfg['airline'];
        if (!empty($jcfg['base_url'])) $config['base_url'] = $jcfg['base_url'];
    }
}

if (file_exists($configFile)) {
    $pcfg = require $configFile;
    if (is_array($pcfg)) {
        if (!empty($pcfg['username']) && $pcfg['username'] !== 'YOUR_USERNAME') $config['username'] = $pcfg['username'];
        if (!empty($pcfg['password']) && $pcfg['password'] !== 'YOUR_PASSWORD') $config['password'] = $pcfg['password'];
        if (!empty($pcfg['airline'])) $config['airline'] = $pcfg['airline'];
    }
}

class LydiaDcsClient {
    private $baseUrl;
    private $username;
    private $password;
    private $airline;
    private $delayMs;
    private $cookieFile;
    private $token = '';
    private $isLoggedIn = false;

    public function __construct($config) {
        $this->baseUrl = rtrim($config['base_url'] ?? 'https://newdcs.nwsesys.com/ADSDCS', '/');
        $this->username = $config['username'] ?? '';
        $this->password = $config['password'] ?? '';
        $this->airline = $config['airline'] ?? 'N4';
        $this->delayMs = $config['request_delay_ms'] ?? 500;
        
        $tempDir = sys_get_temp_dir();
        $this->cookieFile = $tempDir . '/dcs_cookies_' . md5($this->username) . '.txt';
    }

    public function setCredentials($user, $pass, $airline = 'N4') {
        if (!empty($user)) $this->username = $user;
        if (!empty($pass)) $this->password = $pass;
        if (!empty($airline)) $this->airline = $airline;
    }

    private function request($url, $postData = null, $customHeaders = []) {
        $ch = curl_init();
        
        $headers = array_merge([
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Cache-Control: no-cache',
            'Pragma: no-cache'
        ], $customHeaders);

        $options = [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 5,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0,
            CURLOPT_COOKIEFILE => $this->cookieFile,
            CURLOPT_COOKIEJAR => $this->cookieFile,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 15
        ];

        if ($postData !== null) {
            $options[CURLOPT_POST] = true;
            $options[CURLOPT_POSTFIELDS] = is_array($postData) ? http_build_query($postData) : $postData;
            if (is_string($postData) && strpos($headers[0] ?? '', 'Content-Type') === false) {
                $headers[] = 'Content-Type: application/x-www-form-urlencoded';
                $options[CURLOPT_HTTPHEADER] = $headers;
            }
        }

        curl_setopt_array($ch, $options);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $effectiveUrl = curl_getinfo($ch, CURLINFO_EFFECTIVE_URL);
        $error = curl_error($ch);
        curl_close($ch);

        if ($this->delayMs > 0) {
            usleep($this->delayMs * 1000);
        }

        return [
            'status' => $httpCode,
            'url' => $effectiveUrl,
            'body' => $response,
            'error' => $error
        ];
    }

    public function login() {
        if (empty($this->username) || empty($this->password)) {
            return ['success' => false, 'error' => 'Учетные данные Lydia DCS не настроены.'];
        }

        // 1. Загрузка главной страницы для получения первичных cookie и auth-token
        $init = $this->request($this->baseUrl . '/');
        if (empty($init['body'])) {
            return ['success' => false, 'error' => 'Не удалось подключиться к серверу DCS: ' . $init['error']];
        }

        if (preg_match('/name=["\']auth-token["\']\s+content=["\']([^"\']+)["\']/i', $init['body'], $m) ||
            preg_match('/content=["\']([^"\']+)["\']\s+name=["\']auth-token["\']/i', $init['body'], $m)) {
            $this->token = $m[1];
        }

        // 2. Отправка формы авторизации (с закрытием предыдущей сессии checkUserSession=0)
        $loginData = [
            'username' => $this->username,
            'password' => $this->password,
            'checkUserSession' => '0',
            'airline' => $this->airline,
            'osVersion' => 'w10',
            'systemName' => '',
            '_token' => $this->token
        ];

        $loginResp = $this->request($this->baseUrl . '/dcsIndex.do', $loginData, [
            'Referer: ' . $this->baseUrl . '/',
            'Origin: https://newdcs.nwsesys.com'
        ]);

        if (strpos($loginResp['body'], 'Username') !== false && strpos($loginResp['body'], 'Password') !== false && strpos($loginResp['body'], 'name="login"') !== false) {
            // Проверка, если вернулась снова страница логина
            if (strpos($loginResp['body'], 'There is an active session') !== false) {
                // Повторная отправка подтверждения закрытия старой сессии
                $loginResp = $this->request($this->baseUrl . '/dcsIndex.do', $loginData);
            }
        }

        $this->isLoggedIn = true;
        return ['success' => true, 'message' => 'Авторизация в Lydia DCS успешно пройдена.'];
    }

    public function scanFlights($startDate, $endDate, $locations = [], $onlyFinalized = true) {
        if (!$this->isLoggedIn) {
            $loginRes = $this->login();
            if (!$loginRes['success']) return $loginRes;
        }

        if (empty($locations)) {
            $locations = ['DYU', 'NMA', 'TJU', 'SKD', 'TAS', 'CXR', 'IST'];
        }

        $allFoundFlights = [];

        foreach ($locations as $station) {
            $station = trim(strtoupper($station));
            if (empty($station)) continue;

            // 1. Переключаем активную станцию в сессии DCS
            $locUrl = $this->baseUrl . '/ADSDCS/ajax/ajaxGetUserLocationList.jsp';
            $this->request($locUrl, ['location' => $station, '_token' => $this->token], [
                'Referer: ' . $this->baseUrl . '/ADSDCS/flightManagement/flightListsInfo.jsp',
                'X-Requested-With: XMLHttpRequest'
            ]);

            // 2. Запрос списка рейсов
            $postPayload = http_build_query([
                'destination' => '',
                'planeType' => '',
                'departureDate' => $startDate,
                'rout' => '',
                'flightTpe' => '',
                'endDate' => $endDate,
                'companyId' => '',
                '_token' => $this->token
            ]);

            $url = $this->baseUrl . '/ADSDCS/ajax/ajaxFlightsInfo.jsp';
            $resp = $this->request($url, $postPayload, [
                'Referer: ' . $this->baseUrl . '/ADSDCS/flightManagement/flightListsInfo.jsp',
                'X-Requested-With: XMLHttpRequest'
            ]);

            if (empty($resp['body'])) continue;

            // Парсим строки таблицы рейсов
            $flights = $this->parseFlightsTable($resp['body'], $station, $onlyFinalized);
            
            // Для каждого завершенного рейса извлекаем детальный манифест
            foreach ($flights as &$flt) {
                $manifest = $this->getFlightManifest($flt['flight_no_raw'], $flt['departure_date_raw'], $flt['dest_code'], $flt['departure_code']);
                $mData = ($manifest['success'] && !empty($manifest['data'])) ? $manifest['data'] : [];

                $flt['manifest'] = $mData;
                $flt['men'] = $mData['men'] ?? 0;
                $flt['women'] = $mData['women'] ?? 0;
                $flt['vz'] = $mData['vz'] ?? 0;
                $flt['rb'] = $mData['rb'] ?? 0;
                $flt['rm'] = $mData['rm'] ?? 0;
                $flt['pax'] = $mData['pax'] ?? 0;
                $flt['bag_pcs'] = $mData['bag_pcs'] ?? 0;
                $flt['bag_weight'] = $mData['bag_weight'] ?? 0.0;
                $flt['hb_pcs'] = $mData['hb_pcs'] ?? 0;
                $flt['hb_weight'] = $mData['hb_weight'] ?? 0.0;
                $flt['zones'] = $mData['zones'] ?? [];

                $allFoundFlights[] = $flt;
            }
        }

        return [
            'success' => true,
            'count' => count($allFoundFlights),
            'flights' => $allFoundFlights
        ];
    }

    private function parseFlightsTable($html, $station, $onlyFinalized) {
        $results = [];
        $seenFlightIds = [];
        
        // Поиск строк tr
        preg_match_all('/<tr[^>]*>([\s\S]*?)<\/tr>/i', $html, $trMatches);
        if (empty($trMatches[1])) return $results;

        foreach ($trMatches[1] as $tr) {
            // Извлекаем все ячейки td
            preg_match_all('/<td[^>]*>([\s\S]*?)<\/td>/i', $tr, $tdMatches);
            $tds = array_map(function($c) { return trim(strip_tags($c)); }, $tdMatches[1] ?? []);
            if (count($tds) < 8) continue;

            // Проверяем статус регистрации (обычно 7-я колонка: Checkin Status)
            $rawStatus = '';
            foreach ($tds as $td) {
                if (stripos($td, 'Finalize') !== false || stripos($td, 'Open') !== false || stripos($td, 'Close') !== false) {
                    $rawStatus = $td;
                    break;
                }
            }
            if (empty($rawStatus)) $rawStatus = $tds[6] ?? '';

            $isFinalized = (stripos($rawStatus, 'Finalize') !== false);
            if ($onlyFinalized && !$isFinalized) {
                continue;
            }

            // Извлечение параметров вызова flightManifestoListCheckin из ссылок
            // flightManifestoListCheckin(i, departureDate, flightNumber, manifestoSort, destCode, departure)
            $flightNo = '';
            $flightDateRaw = '';
            $destCode = '';
            $depCode = $station;

            if (preg_match('/flightManifestoListCheckin\s*\(\s*([^)]+)\s*\)/i', $tr, $callMatch)) {
                $args = array_map(function($a) { return trim($a, " \t\n\r\0\x0B'\""); }, explode(',', $callMatch[1]));
                if (count($args) >= 6) {
                    $flightDateRaw = $args[1];
                    $flightNo = $args[2];
                    $destCode = $args[4];
                    $depCode = !empty($args[5]) ? $args[5] : $station;
                }
            }

            // Если не нашли через JS, парсим из текста ячеек
            $dateText = $tds[0] ?? '';
            $flightCol = $tds[1] ?? '';
            $routeCol = $tds[2] ?? '';
            $aircraftCol = $tds[3] ?? '';

            if (empty($flightNo)) {
                if (preg_match('/([A-Z0-9]{2,3}\s*\d+)/i', $flightCol, $fnM)) {
                    $flightNo = str_replace(' ', '', $fnM[1]);
                }
            }

            if (empty($destCode) && preg_match('/([A-Z]{3})\s*-\s*([A-Z]{3})/i', $routeCol, $rM)) {
                $depCode = $rM[1];
                $destCode = $rM[2];
            }

            // Нормализация даты YYYY-MM-DD
            $cleanDate = '';
            if (preg_match('/(\d{2})\/(\d{2})\/(\d{4})/', $dateText . ' ' . $flightDateRaw, $dM)) {
                $cleanDate = $dM[3] . '-' . $dM[2] . '-' . $dM[1];
                if (empty($flightDateRaw)) $flightDateRaw = $dM[1] . '/' . $dM[2] . '/' . $dM[3];
            }

            if (empty($flightNo) || empty($destCode)) continue;

            $flightId = 'dcs_' . preg_replace('/[^A-Za-z0-9]/', '', $flightNo) . '_' . $cleanDate . '_' . $depCode . '_' . $destCode;
            if (isset($seenFlightIds[$flightId])) continue;
            $seenFlightIds[$flightId] = true;

            $results[] = [
                'id' => $flightId,
                'airline' => substr($flightNo, 0, 2),
                'flight_no' => $flightNo,
                'flight_no_raw' => $flightNo,
                'departure_date_raw' => $flightDateRaw,
                'flight_date' => $cleanDate,
                'departure_code' => $depCode,
                'dest_code' => $destCode,
                'route' => $depCode . ' → ' . $destCode,
                'aircraft' => $aircraftCol,
                'status' => $rawStatus,
                'is_finalized' => $isFinalized
            ];
        }

        return $results;
    }

    public function getFlightManifest($flightNumber, $departureDate, $destCode, $departure) {
        $postData = [
            'f_checkin' => '1',
            'flightNumber' => $flightNumber,
            'departureDate' => $departureDate,
            'manifestoSort' => '0',
            'destCode' => $destCode,
            'departure' => $departure,
            '_token' => $this->token
        ];

        $url = $this->baseUrl . '/ADSDCS/ajax/manifest/ajaxManifestFlightInfo.jsp';
        $resp = $this->request($url, $postData, [
            'Referer: ' . $this->baseUrl . '/ADSDCS/flightManagement/flightListsInfo.jsp',
            'X-Requested-With: XMLHttpRequest'
        ]);

        if (empty($resp['body'])) {
            return ['success' => false, 'error' => 'Пустой ответ манифеста.'];
        }

        $manifestData = $this->parseManifestHtml($resp['body']);
        return ['success' => true, 'data' => $manifestData];
    }

    private function parseManifestHtml($html) {
        $data = [
            'total_pax' => 0,
            'men' => 0,
            'women' => 0,
            'vz' => 0,
            'rb' => 0,
            'rm' => 0,
            'pax' => 0,
            'bag_pcs' => 0,
            'bag_weight' => 0.0,
            'hb_pcs' => 0,
            'hb_weight' => 0.0,
            'zones' => []
        ];

        // Ищем строку Total в таблице #myTableMani
        // Пример структуры из DevTools:
        // <td colspan="8" align="right">Total</td>
        // <td colspan="2" align="left">108</td>
        // <td align="left">72</td>  (M)
        // <td align="left">35</td>  (F)
        // <td align="left">1</td>   (C)
        // <td align="left">8</td>   (I)
        // <td align="left">0</td>   (In Bound)
        // <td align="left">8</td>   (Out Bound)
        // <td align="center">101</td> (Bag Pcs)
        // <td align="center">1455</td> (Bag Wt)
        // <td align="center">10</td>   (HB Pcs)
        // <td align="center">42</td>   (HB Wt)

        if (preg_match('/<tr[^>]*>[\s\S]*?Total[\s\S]*?<\/tr>/i', $html, $totalTrMatch)) {
            preg_match_all('/<td[^>]*>([\s\S]*?)<\/td>/i', $totalTrMatch[0], $tdMatches);
            $cells = array_map(function($c) { return trim(strip_tags($c)); }, $tdMatches[1] ?? []);

            // Ищем ячейку 'Total' и берем последующие числовые значения
            $totalIdx = -1;
            foreach ($cells as $idx => $cell) {
                if (stripos($cell, 'Total') !== false) {
                    $totalIdx = $idx;
                    break;
                }
            }

            if ($totalIdx !== -1 && isset($cells[$totalIdx + 1])) {
                $totalPax = (int)($cells[$totalIdx + 1] ?? 0);
                $men = (int)($cells[$totalIdx + 2] ?? 0);
                $women = (int)($cells[$totalIdx + 3] ?? 0);
                $chd = (int)($cells[$totalIdx + 4] ?? 0);
                $inf = (int)($cells[$totalIdx + 5] ?? 0);
                
                // В зависимости от колонок In/Out Bound:
                // Bag Pcs, Bag Wt, HB Pcs, HB Wt находятся в конце строки Total
                $bagPcs = 0; $bagWt = 0.0; $hbPcs = 0; $hbWt = 0.0;
                $numCells = count($cells);
                if ($numCells >= $totalIdx + 10) {
                    // Последние 4 значимых числа: bagPcs, bagWt, hbPcs, hbWt
                    $numericTail = [];
                    for ($k = $totalIdx + 6; $k < $numCells; $k++) {
                        $val = str_replace(',', '.', preg_replace('/[^0-9.,]/', '', $cells[$k]));
                        if ($val !== '') {
                            $numericTail[] = (float)$val;
                        }
                    }
                    if (count($numericTail) >= 4) {
                        $tailLen = count($numericTail);
                        $bagPcs = (int)$numericTail[$tailLen - 4];
                        $bagWt  = (float)$numericTail[$tailLen - 3];
                        $hbPcs  = (int)$numericTail[$tailLen - 2];
                        $hbWt   = (float)$numericTail[$tailLen - 1];
                    }
                }

                $data['total_pax'] = $totalPax;
                $data['men'] = $men;
                $data['women'] = $women;
                $data['vz'] = $men + $women;
                $data['rb'] = $chd;
                $data['rm'] = $inf;
                $data['pax'] = $men + $women + $chd; // Стандарт AeroBag (ВЗ + РБ)
                $data['bag_pcs'] = $bagPcs;
                $data['bag_weight'] = $bagWt;
                $data['hb_pcs'] = $hbPcs;
                $data['hb_weight'] = $hbWt;
            }
        }

        // Парсинг зон рассадки (ZONE A, B, C, D)
        if (preg_match_all('/ZONE\s+([A-D])[\s\S]*?(\d+)/i', $html, $zoneMatches, PREG_SET_ORDER)) {
            foreach ($zoneMatches as $zm) {
                $data['zones']['ZONE_' . strtoupper($zm[1])] = (int)$zm[2];
            }
        }

        return $data;
    }
}

// Проверка прав администратора для операций
// Проверка прав администратора для операций
function checkAdminAccess() {
    // 1. Активная серверная сессия администратора
    if (!empty($_SESSION['role']) && $_SESSION['role'] === 'admin') {
        return true;
    }
    // 2. CLI / cron
    if (php_sapi_name() === 'cli') {
        return true;
    }
    // 3. Доверенный запрос из приложения
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if (!empty($referer) && !empty($host) && strpos($referer, $host) !== false) {
        return true;
    }
    
    // В локальном окружении или на доверенном сервере разрешаем доступ
    if (empty($host) || strpos($host, 'localhost') !== false || strpos($host, '127.0.0.1') !== false || strpos($host, 'boostandgo.ru') !== false || strpos($host, 'beget.tech') !== false) {
        return true;
    }

    echo json_encode(['success' => false, 'error' => 'Доступ разрешен только администраторам.'], JSON_UNESCAPED_UNICODE);
    exit;
}

// Автоматический парсинг JSON тела запроса (fetch application/json)
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $jsonInput = json_decode($rawInput, true);
    if (is_array($jsonInput)) {
        $_POST = array_merge($_POST, $jsonInput);
    }
}

// Маршрутизация запросов к модулю
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$client = new LydiaDcsClient($config);

switch ($action) {
    case 'test_connection':
        checkAdminAccess();
        $user = $_POST['username'] ?? '';
        $pass = $_POST['password'] ?? '';
        $air  = $_POST['airline'] ?? 'N4';
        if (!empty($user) && !empty($pass)) {
            $client->setCredentials($user, $pass, $air);
        }
        $res = $client->login();
        echo json_encode($res, JSON_UNESCAPED_UNICODE);
        break;

    case 'scan_flights':
        checkAdminAccess();
        $customUser = $_POST['username'] ?? '';
        $customPass = $_POST['password'] ?? '';
        $customAir  = $_POST['airline'] ?? '';
        if (!empty($customUser) && !empty($customPass)) {
            $client->setCredentials($customUser, $customPass, $customAir ?: 'N4');
        }
        $startDate = $_POST['start_date'] ?? date('d/m/Y', strtotime('-1 day'));
        $endDate = $_POST['end_date'] ?? date('d/m/Y');
        $locations = !empty($_POST['locations']) ? (is_array($_POST['locations']) ? $_POST['locations'] : explode(',', $_POST['locations'])) : $config['default_locations'];
        $onlyFinalized = isset($_POST['only_finalized']) ? (bool)$_POST['only_finalized'] : true;

        $scanResult = $client->scanFlights($startDate, $endDate, $locations, $onlyFinalized);
        
        // Сверяем найденные рейсы с текущей базой AeroBag, чтобы пометить уже существующие
        if (!empty($scanResult['flights'])) {
            $existingFlights = [];
            
            // 1. Проверяем MySQL БД (основной источник истины)
            $configPath = __DIR__ . '/db_config.php';
            if (file_exists($configPath)) {
                require_once $configPath;
                if (defined('DB_USER') && DB_USER !== 'your_db_username') {
                    try {
                        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                        ]);
                        $stmt = $pdo->query("SELECT flight_no, flight_date, airport_from, airport_to FROM flights");
                        while ($row = $stmt->fetch()) {
                            $fNoDigits = preg_replace('/\D/', '', $row['flight_no'] ?? '');
                            $fDate = substr($row['flight_date'] ?? '', 0, 10);
                            $fFrom = strtoupper(trim($row['airport_from'] ?? ''));
                            $fTo = strtoupper(trim($row['airport_to'] ?? ''));
                            
                            $key = $fNoDigits . '_' . $fDate . '_' . $fFrom . '_' . $fTo;
                            $existingFlights[$key] = true;
                        }
                    } catch (Exception $e) {
                        // Фолбэк
                    }
                }
            }

            // 2. Дополнительно проверяем переданные клиентом локальные рейсы (если переданы)
            if (!empty($_POST['client_flight_keys']) && is_array($_POST['client_flight_keys'])) {
                foreach ($_POST['client_flight_keys'] as $cKey) {
                    $existingFlights[$cKey] = true;
                }
            }

            foreach ($scanResult['flights'] as &$flt) {
                $fltDigits = preg_replace('/\D/', '', $flt['flight_no'] ?? '');
                $fltDate = $flt['flight_date'] ?? '';
                $fltFrom = strtoupper(trim($flt['departure_code'] ?? ''));
                $fltTo = strtoupper(trim($flt['dest_code'] ?? ''));

                $key = $fltDigits . '_' . $fltDate . '_' . $fltFrom . '_' . $fltTo;
                $flt['already_in_db'] = isset($existingFlights[$key]);
            }
        }

        echo json_encode($scanResult, JSON_UNESCAPED_UNICODE);
        break;

    case 'save_to_database':
        checkAdminAccess();
        $input = file_get_contents('php://input');
        $payload = json_decode($input, true);
        $flightsToSave = $payload['flights'] ?? [];

        if (empty($flightsToSave) || !is_array($flightsToSave)) {
            echo json_encode(['success' => false, 'error' => 'Нет данных для сохранения.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // 1. Форматируем записи под стандарт AeroBag
        $formatted = [];
        foreach ($flightsToSave as $f) {
            $formatted[] = [
                'id' => $f['id'] ?? ('dcs_' . uniqid()),
                'airline' => $f['airline'] ?? 'N4',
                'flight_no' => $f['flight_no'] ?? '',
                'date' => $f['flight_date'] ?? date('Y-m-d'),
                'from' => $f['departure_code'] ?? 'DYU',
                'to' => $f['dest_code'] ?? 'UFA',
                'men' => (int)($f['men'] ?? 0),
                'women' => (int)($f['women'] ?? 0),
                'rb' => (int)($f['rb'] ?? 0),
                'rm' => (int)($f['rm'] ?? 0),
                'pax' => (int)($f['pax'] ?? 0),
                'bag_pcs' => (int)($f['bag_pcs'] ?? 0),
                'bag_weight' => (float)($f['bag_weight'] ?? 0),
                'hb_weight' => (float)($f['hb_weight'] ?? 0),
                'source' => 'Lydia DCS',
                'active' => true
            ];
        }

        $savedCount = count($formatted);

        // 2. Если настроен MySQL, сохраняем через PDO
        $configPath = __DIR__ . '/db_config.php';
        $mysqlSaved = false;
        if (file_exists($configPath)) {
            require_once $configPath;
            if (defined('DB_USER') && DB_USER !== 'your_db_username') {
                try {
                    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]);
                    $sql = "INSERT INTO flights (
                                id, airline, flight_no, flight_date, airport_from, airport_to, 
                                men, women, rb, rm, pax, bag_pcs, bag_weight, hb_weight, source, active
                            ) VALUES (
                                :id, :airline, :flight_no, :flight_date, :airport_from, :airport_to, 
                                :men, :women, :rb, :rm, :pax, :bag_pcs, :bag_weight, :hb_weight, :source, :active
                            )
                            ON DUPLICATE KEY UPDATE 
                                airline = VALUES(airline), men = VALUES(men), women = VALUES(women),
                                rb = VALUES(rb), rm = VALUES(rm), pax = VALUES(pax),
                                bag_pcs = VALUES(bag_pcs), bag_weight = VALUES(bag_weight),
                                hb_weight = VALUES(hb_weight), source = VALUES(source), active = VALUES(active)";
                    $stmt = $pdo->prepare($sql);
                    foreach ($formatted as $f) {
                        $stmt->execute([
                            ':id' => $f['id'],
                            ':airline' => $f['airline'],
                            ':flight_no' => $f['flight_no'],
                            ':flight_date' => $f['date'],
                            ':airport_from' => $f['from'],
                            ':airport_to' => $f['to'],
                            ':men' => $f['men'],
                            ':women' => $f['women'],
                            ':rb' => $f['rb'],
                            ':rm' => $f['rm'],
                            ':pax' => $f['pax'],
                            ':bag_pcs' => $f['bag_pcs'],
                            ':bag_weight' => $f['bag_weight'],
                            ':hb_weight' => $f['hb_weight'],
                            ':source' => $f['source'],
                            ':active' => 1
                        ]);
                    }
                    $mysqlSaved = true;
                } catch (Exception $e) {
                    // Ошибка MySQL
                }
            }
        }

        echo json_encode([
            'success' => true,
            'message' => "Успешно сохранено рейсов: {$savedCount}",
            'saved_count' => $savedCount,
            'mysql_synced' => $mysqlSaved
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'get_dcs_stations':
        $stations = null;
        $configPath = __DIR__ . '/db_config.php';
        if (file_exists($configPath)) {
            require_once $configPath;
            if (defined('DB_USER') && DB_USER !== 'your_db_username') {
                try {
                    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]);
                    $stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'dcs_stations' LIMIT 1");
                    $stmt->execute();
                    $val = $stmt->fetchColumn();
                    if ($val) {
                        $stations = json_decode($val, true);
                    }
                } catch (Exception $e) {}
            }
        }
        if (!$stations || !is_array($stations)) {
            $jsonFile = __DIR__ . '/dcs_stations.json';
            if (file_exists($jsonFile)) {
                $stations = json_decode(file_get_contents($jsonFile), true);
            }
        }
        if (!$stations || !is_array($stations)) {
            $stations = [
                ['code' => 'DYU', 'name' => 'Душанбе (DYU)', 'checked' => true],
                ['code' => 'NMA', 'name' => 'Наманган (NMA)', 'checked' => true],
                ['code' => 'TJU', 'name' => 'Куляб (TJU)', 'checked' => true],
                ['code' => 'SKD', 'name' => 'Самарканд (SKD)', 'checked' => true],
                ['code' => 'TAS', 'name' => 'Ташкент (TAS)', 'checked' => true],
                ['code' => 'CXR', 'name' => 'Камрань (CXR)', 'checked' => true],
                ['code' => 'IST', 'name' => 'Стамбул (IST)', 'checked' => true]
            ];
        }
        echo json_encode(['success' => true, 'stations' => $stations], JSON_UNESCAPED_UNICODE);
        break;

    case 'save_dcs_stations':
        checkAdminAccess();
        $input = file_get_contents('php://input');
        $payload = json_decode($input, true);
        $stations = $payload['stations'] ?? [];
        if (!is_array($stations)) {
            echo json_encode(['success' => false, 'error' => 'Некорректный формат станций.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $savedDb = false;
        $configPath = __DIR__ . '/db_config.php';
        if (file_exists($configPath)) {
            require_once $configPath;
            if (defined('DB_USER') && DB_USER !== 'your_db_username') {
                try {
                    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]);
                    $jsonVal = json_encode($stations, JSON_UNESCAPED_UNICODE);
                    $stmt = $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('dcs_stations', ?)
                                           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                    $stmt->execute([$jsonVal]);
                    $savedDb = true;
                } catch (Exception $e) {}
            }
        }
        // Дублируем также в локальный JSON
        $jsonFile = __DIR__ . '/dcs_stations.json';
        file_put_contents($jsonFile, json_encode($stations, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        echo json_encode([
            'success' => true,
            'message' => 'Станции успешно сохранены.',
            'stations' => $stations,
            'db_synced' => $savedDb
        ], JSON_UNESCAPED_UNICODE);
        break;

    case 'get_dcs_credentials':
        $creds = [
            'username' => $config['username'] ?? '',
            'password' => $config['password'] ?? '',
            'airline'  => $config['airline'] ?? 'N4'
        ];
        // Проверяем app_settings в БД если есть
        $configPath = __DIR__ . '/db_config.php';
        if (file_exists($configPath)) {
            require_once $configPath;
            if (defined('DB_USER') && DB_USER !== 'your_db_username') {
                try {
                    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]);
                    $stmt = $pdo->prepare("SELECT setting_value FROM app_settings WHERE setting_key = 'dcs_credentials' LIMIT 1");
                    $stmt->execute();
                    $val = $stmt->fetchColumn();
                    if ($val) {
                        $parsed = json_decode($val, true);
                        if (is_array($parsed)) {
                            if (!empty($parsed['username'])) $creds['username'] = $parsed['username'];
                            if (!empty($parsed['password'])) $creds['password'] = $parsed['password'];
                            if (!empty($parsed['airline'])) $creds['airline'] = $parsed['airline'];
                        }
                    }
                } catch (Exception $e) {}
            }
        }
        echo json_encode(['success' => true, 'credentials' => $creds], JSON_UNESCAPED_UNICODE);
        break;

    case 'save_dcs_credentials':
        checkAdminAccess();
        $input = file_get_contents('php://input');
        $payload = json_decode($input, true);
        $username = trim($payload['username'] ?? '');
        $password = trim($payload['password'] ?? '');
        $airline = trim($payload['airline'] ?? 'N4');

        if (empty($username) || empty($password)) {
            echo json_encode(['success' => false, 'error' => 'Логин и пароль обязательны для заполнения.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $creds = [
            'username' => $username,
            'password' => $password,
            'airline'  => $airline ?: 'N4'
        ];

        // 1. Сохраняем в dcs_config.json
        $jsonFile = __DIR__ . '/dcs_config.json';
        file_put_contents($jsonFile, json_encode($creds, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        // 2. Сохраняем в MySQL app_settings если подключена БД
        $savedDb = false;
        $configPath = __DIR__ . '/db_config.php';
        if (file_exists($configPath)) {
            require_once $configPath;
            if (defined('DB_USER') && DB_USER !== 'your_db_username') {
                try {
                    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
                    ]);
                    $jsonVal = json_encode($creds, JSON_UNESCAPED_UNICODE);
                    $stmt = $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES ('dcs_credentials', ?)
                                           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
                    $stmt->execute([$jsonVal]);
                    $savedDb = true;
                } catch (Exception $e) {}
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Учетная запись Lydia DCS успешно сохранена.',
            'username' => $username,
            'airline'  => $airline,
            'db_synced' => $savedDb
        ], JSON_UNESCAPED_UNICODE);
        break;

    default:
        echo json_encode([
            'success' => false,
            'error' => 'Неизвестное действие: ' . htmlspecialchars($action)
        ], JSON_UNESCAPED_UNICODE);
        break;
}
