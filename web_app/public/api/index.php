<?php
/**
 * AeroPlan W&B - PHP Backend API для хостинга Beget
 * Подключение к MySQL: kekc8584_plan
 */

error_reporting(E_ALL);
ini_set('display_errors', '0');
date_default_timezone_set('Europe/Moscow');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------------------------------------------
// 1. КОНФИГУРАЦИЯ БАЗЫ ДАННЫХ MYSQL (BEGET)
// ----------------------------------------------------
// Подключение изолированной конфигурации базы данных Beget (если существует)
$configPaths = [__DIR__ . '/db_config.php', dirname(__DIR__) . '/db_config.php', __DIR__ . '/../db_config.php'];
foreach ($configPaths as $cfgFile) {
    if (file_exists($cfgFile)) {
        require_once $cfgFile;
        break;
    }
}

// Автоматическая загрузка .env файла (если он загружен на сервер)
$envPaths = [__DIR__ . '/.env', dirname(__DIR__) . '/.env', __DIR__ . '/../.env'];
foreach ($envPaths as $envFile) {
    if (file_exists($envFile)) {
        $envLines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($envLines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
            list($k, $v) = explode('=', $line, 2);
            $k = trim($k);
            $v = trim($v, " \t\n\r\0\x0B'\"");
            $_ENV[$k] = $v;
            putenv("$k=$v");
        }
        break;
    }
}

if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? 'localhost'));
if (!defined('DB_PORT')) define('DB_PORT', (int)(getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? 3306)));
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? 'kekc8584_plan'));
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? 'kekc8584_plan'));
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASSWORD') ?: ($_ENV['DB_PASSWORD'] ?? ''));
if (!defined('JWT_SECRET')) define('JWT_SECRET', getenv('PLAN_JWT_SECRET') ?: ($_ENV['PLAN_JWT_SECRET'] ?? 'aeroplan_wb_secret_beget_2026_andrey'));

function getDb() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);
            // Автоматическая безопасная миграция колонок в MySQL (если они отсутствуют)
            $migrations = [
                "ALTER TABLE plan_flights ADD COLUMN ac_type VARCHAR(16) NULL AFTER ac_num",
                "ALTER TABLE plan_flights ADD COLUMN unread_changes TEXT NULL",
                "ALTER TABLE plan_flights ADD COLUMN astra_times_sent TINYINT(1) DEFAULT 0",
                "ALTER TABLE plan_flights ADD COLUMN inbound_flight VARCHAR(32) NULL",
                "ALTER TABLE plan_flights ADD COLUMN inbound_dep VARCHAR(16) NULL",
                "ALTER TABLE plan_flights ADD COLUMN inbound_takeoff_time VARCHAR(16) NULL",
                "ALTER TABLE plan_flights ADD COLUMN inbound_landing_calc VARCHAR(16) NULL",
                "ALTER TABLE plan_flights ADD COLUMN inbound_landing_time VARCHAR(16) NULL",
                "ALTER TABLE plan_flights ADD COLUMN outbound_takeoff_time VARCHAR(16) NULL",
                "ALTER TABLE plan_flights ADD COLUMN plane_status VARCHAR(32) NULL",
                "ALTER TABLE plan_flights ADD COLUMN updated_by VARCHAR(128) NULL",
                "ALTER TABLE plan_shifts ADD COLUMN deleted_flights TEXT NULL"
            ];
            foreach ($migrations as $mSql) {
                try {
                    $pdo->exec($mSql);
                } catch (Exception $ign) {}
            }

            // Автоматическое обновление имени диспетчера по умолчанию на реальное имя и удаление старых резервных рейсов
            try {
                $pdo->exec("UPDATE plan_users SET full_name = 'Иван Иванов' WHERE username = 'dispatcher' AND full_name = 'Диспетчер по центровке'");
                $pdo->exec("DELETE FROM plan_flights WHERE flight_number LIKE '~%' OR flight_number LIKE '%РЕЗ%' OR flight_number LIKE '%REZ%' OR flight_number LIKE 'РЕ%'");
            } catch (Exception $ign) {}
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['detail' => 'Ошибка подключения к MySQL: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}


function initAirportsTable($db) {
    static $initialized = false;
    if ($initialized) return;
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS plan_departure_airports (
            code VARCHAR(10) PRIMARY KEY,
            city_name VARCHAR(100) NOT NULL,
            is_enabled TINYINT(1) DEFAULT 1,
            is_custom TINYINT(1) DEFAULT 0,
            sort_order INT DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $count = $db->query("SELECT COUNT(*) FROM plan_departure_airports")->fetchColumn();
        if ($count == 0) {
            $defaults = [
                ['KQT', 'Бохтар', 1, 0, 1], ['VRA', 'Варадеро', 1, 0, 2], ['GOI', 'Гоа', 1, 0, 3],
                ['GOX', 'Гоа', 1, 0, 4], ['DYU', 'Душанбе', 1, 0, 5], ['ISB', 'Исламабад', 1, 0, 6],
                ['CCC', 'Кайококо', 1, 0, 7], ['CXR', 'Камрань', 1, 0, 8], ['HOG', 'Ольгин', 1, 0, 9],
                ['REN', 'Оренбург', 1, 0, 10], ['OSS', 'Ош', 1, 0, 11], ['PMW', 'Парламар', 1, 0, 12],
                ['PMV', 'Парламар', 1, 0, 13], ['ROV', 'Ростов', 1, 0, 14], ['XIY', 'Сиань', 1, 0, 15],
                ['AER', 'Сочи', 1, 0, 16], ['SUI', 'Сухум', 1, 0, 17], ['UUD', 'Улан-Удэ', 1, 0, 18],
                ['UTP', 'Утапао', 1, 0, 19], ['LBD', 'Худжант', 1, 0, 20], ['HTA', 'Чита', 1, 0, 21],
                ['SSH', 'Шарм Эль Шейх', 1, 0, 22], ['SVO', 'Москва', 1, 0, 23], ['TAS', 'Ташкент', 1, 0, 24],
                ['NMA', 'Наманган', 1, 0, 25], ['TJU', 'Куляб', 1, 0, 26], ['SKD', 'Самарканд', 1, 0, 27]
            ];
            $stmt = $db->prepare("INSERT IGNORE INTO plan_departure_airports (code, city_name, is_enabled, is_custom, sort_order) VALUES (?, ?, ?, ?, ?)");
            foreach ($defaults as $d) {
                $stmt->execute($d);
            }
        }
        $initialized = true;
    } catch (Exception $e) {}

    $colsToMigrate = ['ac_type', 'unread_changes', 'inbound_flight', 'inbound_dep', 'inbound_takeoff_time', 'inbound_landing_calc', 'inbound_landing_time', 'outbound_takeoff_time', 'plane_status'];
    foreach ($colsToMigrate as $colName) {
        try {
            $db->exec("ALTER TABLE plan_flights ADD COLUMN $colName VARCHAR(64) NULL");
        } catch (Exception $e) {}
    }
}

function normalizePlaneType($rawType) {
    if (empty($rawType)) return '';
    $t = strtoupper(trim((string)$rawType));
    if ($t === '73H' || $t === '73Н') return '738';
    if ($t === '73J' || $t === '73Й') return '739';
    if ($t === 'E90') return '190';
    return $t;
}

function detectPlaneType($rawType = '', $tail = '', $layout = '') {
    if ($rawType) {
        $norm = normalizePlaneType($rawType);
        if ($norm) return $norm;
    }
    static $fleetMap = [
        '73270' => '332',
        '73849' => '333',
        '73273' => '321',
        '73326' => '321',
        '73272' => '772',
        '73347' => '772',
        '73343' => '739',
        '73344' => '739',
        '02740' => '190',
        '02741' => '190',
        '02743' => '190',
        '73269' => '738',
        '73312' => '738',
        '73313' => '738',
        '73314' => '738',
        '73315' => '738',
        '73316' => '738',
        '73317' => '738',
        '73318' => '738',
        '73319' => '738',
        '73321' => '738',
        '73325' => '738'
    ];
    static $layoutMap = [
        '365' => '332',
        '379' => '333',
        '440' => '772',
        '220' => '321',
        '214' => '321',
        '215' => '739',
        '189' => '738',
        '110' => '190'
    ];

    if ($tail) {
        $cleanTail = preg_replace('/\D/', '', str_replace(['RA-', 'RA', '-'], '', (string)$tail));
        if (isset($fleetMap[$cleanTail])) {
            return $fleetMap[$cleanTail];
        }
    }
    if ($layout) {
        $cleanLayout = trim((string)$layout);
        if (isset($layoutMap[$cleanLayout])) {
            return $layoutMap[$cleanLayout];
        }
    }
    return '';
}

function parseTelegramLoad($text, $code = '') {
    if (!$text) {
        return ['cargo' => '', 'mail' => '', 'baggage' => ''];
    }

    $lines = array_values(array_filter(array_map('trim', explode("\n", $text))));
    if (empty($lines)) {
        return ['cargo' => '', 'mail' => '', 'baggage' => ''];
    }

    $codeUpper = $code ? strtoupper(trim($code)) : '';
    $firstLineUpper = strtoupper($lines[0]);
    $secondLineUpper = isset($lines[1]) ? strtoupper($lines[1]) : '';

    // 1. ПРОВЕРКА И ПАРСИНГ ТЕЛЕГРАММЫ FBL (Freight Bill List) / FFM (Manifest)
    $isFblOrFfm = (
        in_array($codeUpper, ['FBL', 'FFM']) ||
        strpos($firstLineUpper, 'FBL') === 0 ||
        strpos($firstLineUpper, 'FFM') === 0 ||
        strpos($secondLineUpper, 'FBL') === 0 ||
        strpos($secondLineUpper, 'FFM') === 0
    );

    if ($isFblOrFfm) {
        $fblItems = [];
        $totalLines = count($lines);
        for ($i = 0; $i < $totalLines; $i++) {
            $line = $lines[$i];
            if (preg_match('/\/T(\d+)K([\d.]+)(?:[A-Z0-9.]+)?\/([A-Z0-9А-Яа-я\s_\-]+)/i', $line, $m)) {
                $pieces = (int)$m[1];
                $rawWeight = (float)$m[2];
                $weightRounded = (int)ceil($rawWeight);
                $nature = strtoupper(trim($m[3]));

                // Проверяем следующую строку на наличие IATA-кода (например /PEF, /PER, /VAL)
                $iataCode = '';
                if ($i + 1 < $totalLines) {
                    $nextLine = $lines[$i + 1];
                    if (preg_match('/^\/([A-Z]{3,4})(?:\/[A-Z]{3,4})*$/i', $nextLine) && strtoupper($nextLine) !== '/LAST') {
                        $iataCode = strtoupper(ltrim($nextLine, '/'));
                        $i++; // пропускаем строку кода
                    }
                }

                if ($iataCode) {
                    $fblItems[] = "{$pieces}/{$weightRounded}/{$iataCode}/{$nature}";
                } else {
                    $fblItems[] = "{$pieces}/{$weightRounded}/{$nature}";
                }
            }
        }
        if (!empty($fblItems)) {
            return [
                'cargo' => implode(', ', $fblItems),
                'mail' => '',
                'baggage' => ''
            ];
        }
    }

    // 2. ПРОВЕРКА И ПАРСИНГ ТЕЛЕГРАММЫ UWS (Unit Weight Signal)
    $isUws = (
        $codeUpper === 'UWS' ||
        strpos($firstLineUpper, 'UWS') === 0 ||
        strpos($secondLineUpper, 'UWS') === 0
    );

    if (!$isUws) {
        return ['cargo' => '', 'mail' => '', 'baggage' => ''];
    }

    $cargoTotal = 0;
    $mailTotal = 0;
    $baggageTotal = 0;
    $hasCargo = false;
    $hasMail = false;
    $hasBaggage = false;

    // Регулярное выражение для строк UWS:
    // -KEJ/154P/C или KEJ/154/C или /154P/C или -KEJ/154K/C или -KEJ/20P/M
    foreach ($lines as $line) {
        if (strtoupper($line) === 'UWS' || preg_match('/^[A-Z0-9]{2,6}\/\d{1,2}\.[A-Z]{3}/i', $line)) {
            continue;
        }

        if (preg_match_all('/(?:^|[-.\/\s])(?:[A-Z]{3}\/)?(\d+)(?:P|K|KG|PC)?\/([CMBE])(?:\b|[\/\s]|$)/i', $line, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $m) {
                $weight = (int)$m[1];
                $type = strtoupper($m[2]);
                if ($type === 'C') { // Cargo
                    $cargoTotal += $weight;
                    $hasCargo = true;
                } elseif ($type === 'M') { // Mail
                    $mailTotal += $weight;
                    $hasMail = true;
                } elseif ($type === 'B' || $type === 'E') { // Baggage / Equipment
                    $baggageTotal += $weight;
                    $hasBaggage = true;
                }
            }
        }
    }

    return [
        'cargo' => ($hasCargo && $cargoTotal > 0) ? (string)$cargoTotal : '',
        'mail' => ($hasMail && $mailTotal > 0) ? (string)$mailTotal : '',
        'baggage' => ($hasBaggage && $baggageTotal > 0) ? (string)$baggageTotal : ''
    ];
}

// Fallback для заголовков
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

function hashPassword($password, $salt = null) {
    if (!$salt) {
        $salt = bin2hex(random_bytes(16));
    }
    $hash = hash_pbkdf2('sha256', $password, $salt, 100000);
    return [$hash, $salt];
}

function verifyPassword($password, $hash, $salt) {
    $test = hash_pbkdf2('sha256', $password, $salt, 100000);
    return hash_equals($test, $hash);
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64UrlDecode($data) {
    return base64_decode(strtr($data, '-_', '+/'));
}

function createJwtToken($payload) {
    $header = json_encode(['alg' => 'HS256', 'typ' => 'JWT']);
    $payload['exp'] = time() + (7 * 24 * 3600);
    $payload['iat'] = time();
    $payloadJson = json_encode($payload);

    $base64Header = base64UrlEncode($header);
    $base64Payload = base64UrlEncode($payloadJson);
    $signature = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    $base64Signature = base64UrlEncode($signature);

    return "$base64Header.$base64Payload.$base64Signature";
}

function verifyJwtToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    list($base64Header, $base64Payload, $base64Signature) = $parts;

    $expectedSig = hash_hmac('sha256', "$base64Header.$base64Payload", JWT_SECRET, true);
    if (!hash_equals(base64UrlEncode($expectedSig), $base64Signature)) {
        return null;
    }

    $payload = json_decode(base64UrlDecode($base64Payload), true);
    if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
        return null;
    }
    return $payload;
}

function getAuthUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));
    if (!preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['detail' => 'Требуется авторизация']);
        exit;
    }
    $payload = verifyJwtToken($matches[1]);
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['detail' => 'Недействительный или истекший токен']);
        exit;
    }
    $db = getDb();
    $stmt = $db->prepare("SELECT id, username, full_name, role, is_active FROM plan_users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    if (!$user || !$user['is_active']) {
        http_response_code(401);
        echo json_encode(['detail' => 'Пользователь отключен или не найден']);
        exit;
    }
    return $user;
}

function getOptionalAuthUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? ''));
    if (!preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
        return null;
    }
    $payload = verifyJwtToken($matches[1]);
    if (!$payload) {
        return null;
    }
    try {
        $db = getDb();
        $stmt = $db->prepare("SELECT id, username, full_name, role, is_active FROM plan_users WHERE id = ?");
        $stmt->execute([$payload['user_id']]);
        $user = $stmt->fetch();
        if ($user && $user['is_active']) {
            return $user;
        }
    } catch (Exception $e) {}
    return null;
}

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

function initLogsTable($db) {
    static $initialized = false;
    if ($initialized) return;
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS plan_system_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            level VARCHAR(16) NOT NULL DEFAULT 'INFO',
            module VARCHAR(32) NOT NULL DEFAULT 'system',
            message TEXT NOT NULL,
            details MEDIUMTEXT NULL,
            user_id INT NULL,
            username VARCHAR(64) NULL,
            ip_address VARCHAR(64) NULL,
            created_at VARCHAR(64) NOT NULL,
            INDEX idx_logs_created_at (created_at),
            INDEX idx_logs_level (level),
            INDEX idx_logs_module (module)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $db->exec("CREATE TABLE IF NOT EXISTS plan_settings (
            setting_key VARCHAR(64) PRIMARY KEY,
            setting_value TEXT NOT NULL,
            updated_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        $db->exec("INSERT IGNORE INTO plan_settings (setting_key, setting_value, updated_at) VALUES ('log_retention_days', '7', NOW())");
        $initialized = true;
    } catch (Exception $e) {}
}

function getClientIp() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function getSystemSetting($key, $default = '') {
    try {
        $db = getDb();
        initLogsTable($db);
        $stmt = $db->prepare("SELECT setting_value FROM plan_settings WHERE setting_key = ? LIMIT 1");
        $stmt->execute([$key]);
        $row = $stmt->fetch();
        return $row ? $row['setting_value'] : $default;
    } catch (Exception $e) {
        return $default;
    }
}

function setSystemSetting($key, $value) {
    try {
        $db = getDb();
        initLogsTable($db);
        $now = date('Y-m-d H:i:s');
        $stmt = $db->prepare("INSERT INTO plan_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = VALUES(updated_at)");
        $stmt->execute([$key, (string)$value, $now]);
    } catch (Exception $e) {}
}

function getLogRetentionDays() {
    $days = (int)getSystemSetting('log_retention_days', '7');
    return ($days >= 1 && $days <= 365) ? $days : 7;
}

function cleanupOldLogs($days = null) {
    try {
        $db = getDb();
        initLogsTable($db);
        if ($days === null) {
            $days = getLogRetentionDays();
        }
        $cutoff = date('Y-m-d H:i:s', strtotime("-$days days"));
        $cutoffIso = date('c', strtotime("-$days days"));
        $stmt = $db->prepare("DELETE FROM plan_system_logs WHERE created_at < ? OR created_at < ?");
        $stmt->execute([$cutoff, $cutoffIso]);
        return $stmt->rowCount();
    } catch (Exception $e) {
        return 0;
    }
}

function logSystemEvent($level, $module, $message, $details = null, $userId = null, $username = null, $ipAddress = null) {
    try {
        $db = getDb();
        initLogsTable($db);
        $level = strtoupper($level ?: 'INFO');
        $module = strtolower($module ?: 'system');
        $now = date('Y-m-d H:i:s');
        if ($details !== null && !is_string($details)) {
            $details = json_encode($details, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        }
        $stmt = $db->prepare("INSERT INTO plan_system_logs (level, module, message, details, user_id, username, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$level, $module, $message, $details, $userId, $username, $ipAddress, $now]);
    } catch (Exception $e) {}
}

// ----------------------------------------------------
// 2. МАРШРУТИЗАЦИЯ
// ----------------------------------------------------
$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH) ?? '';

$route = '';
if (preg_match('#/(?:plan/)?api(?:/|$)(.*)#', $path, $m)) {
    $route = '/' . trim($m[1], '/');
} elseif (preg_match('#/api(?:/|$)(.*)#', $path, $m)) {
    $route = '/' . trim($m[1], '/');
} else {
    $route = '/' . trim($path, '/');
}

if ($route === '/' || $route === '') $route = '/health';

// ----------------------------------------------------
// ЭНДПОИНТ: /health
// ----------------------------------------------------
if ($route === '/health') {
    try {
        $db = getDb();
        $dbStatus = 'connected';
    } catch (Exception $e) {
        $dbStatus = 'error: ' . $e->getMessage();
    }
    echo json_encode([
        'status' => 'ok',
        'service' => 'AeroPlan W&B Beget API',
        'database' => $dbStatus,
        'version' => '1.0.14',
        'time_msk' => date('H:i:s')
    ]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /auth/login
// ----------------------------------------------------
if ($route === '/auth/login') {
    $input = getJsonInput();
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    $db = getDb();
    $stmt = $db->prepare("SELECT * FROM plan_users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    $isValid = false;
    if ($user) {
        $isValid = verifyPassword($password, $user['password_hash'], $user['salt']);
        
        // Автоматическое обновление хешей начальных аккаунтов при первом входе
        if (!$isValid) {
            if ($username === 'admin' && $password === 'admin123') {
                list($newHash, $newSalt) = hashPassword('admin123');
                $db->prepare("UPDATE plan_users SET password_hash = ?, salt = ? WHERE username = 'admin'")->execute([$newHash, $newSalt]);
                $isValid = true;
            } elseif ($username === 'dispatcher' && $password === 'dispatch123') {
                list($newHash, $newSalt) = hashPassword('dispatch123');
                $db->prepare("UPDATE plan_users SET password_hash = ?, salt = ? WHERE username = 'dispatcher'")->execute([$newHash, $newSalt]);
                $isValid = true;
            }
        }
    } else {
        // Если таблица была пустой - создаем базовых пользователей
        if ($username === 'admin' && $password === 'admin123') {
            list($newHash, $newSalt) = hashPassword('admin123');
            $db->prepare("INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at) VALUES (?, ?, ?, ?, 'admin', 1, ?)")->execute(['admin', $newHash, $newSalt, 'Администратор системы', date('Y-m-d H:i:s')]);
            $stmt = $db->prepare("SELECT * FROM plan_users WHERE username = 'admin'");
            $stmt->execute();
            $user = $stmt->fetch();
            $isValid = true;
        } elseif ($username === 'dispatcher' && $password === 'dispatch123') {
            list($newHash, $newSalt) = hashPassword('dispatch123');
            $db->prepare("INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at) VALUES (?, ?, ?, ?, 'dispatcher', 1, ?)")->execute(['dispatcher', $newHash, $newSalt, 'Диспетчер по центровке', date('Y-m-d H:i:s')]);
            $stmt = $db->prepare("SELECT * FROM plan_users WHERE username = 'dispatcher'");
            $stmt->execute();
            $user = $stmt->fetch();
            $isValid = true;
        }
    }

    $clientIp = getClientIp();

    if (!$user || !$isValid) {
        logSystemEvent('WARN', 'auth', "Неудачная попытка входа с логином '$username'", null, null, $username, $clientIp);
        http_response_code(401);
        echo json_encode(['detail' => 'Неверный логин или пароль']);
        exit;
    }

    if (!$user['is_active']) {
        logSystemEvent('WARN', 'auth', "Попытка входа в заблокированную учетную запись '{$user['username']}'", null, $user['id'], $user['username'], $clientIp);
        http_response_code(403);
        echo json_encode(['detail' => 'Учетная запись отключена']);
        exit;
    }

    logSystemEvent('INFO', 'auth', "Пользователь '{$user['username']}' ({$user['full_name']}) успешно вошел в систему", null, $user['id'], $user['username'], $clientIp);

    $token = createJwtToken([
        'user_id' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'full_name' => $user['full_name']
    ]);

    echo json_encode([
        'token' => $token,
        'user' => [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'full_name' => $user['full_name'],
            'role' => $user['role']
        ]
    ]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /auth/me
// ----------------------------------------------------
if ($route === '/auth/me') {
    $user = getAuthUser();
    echo json_encode(['user' => $user]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /users/active (Список активных пользователей)
// ----------------------------------------------------
if ($route === '/users/active') {
    getAuthUser();
    $db = getDb();
    $stmt = $db->query("SELECT id, username, full_name, role FROM plan_users WHERE is_active = 1 AND LOWER(username) NOT IN ('dispatcher') ORDER BY full_name ASC, username ASC");
    echo json_encode(['users' => $stmt->fetchAll()]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /shift/current
// ----------------------------------------------------
if ($route === '/shift/current') {
    $db = getDb();
    $stmt = $db->query("SELECT * FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1");
    $shift = $stmt->fetch();

    $shiftInfo = null;
    if ($shift) {
        $lastHandover = $db->query("SELECT * FROM plan_handover_logs ORDER BY id DESC LIMIT 1")->fetch();
        $handoverData = null;
        if ($lastHandover) {
            $handoverData = [
                'handed_over_by' => $lastHandover['handed_over_by'],
                'accepted_by' => $lastHandover['accepted_by'],
                'handover_time' => $lastHandover['handover_time'],
                'notes' => $lastHandover['notes'] ?? ''
            ];
        }

        $deletedFlights = [];
        if (!empty($shift['deleted_flights'])) {
            $parsedDeleted = json_decode($shift['deleted_flights'], true);
            if (is_array($parsedDeleted)) {
                $deletedFlights = $parsedDeleted;
            }
        }

        $shiftInfo = [
            'id' => (int)$shift['id'],
            'date_interval' => $shift['date_interval'],
            'dispatcher' => $shift['dispatcher_name'],
            'status' => $shift['status'],
            'deleted_flights' => $deletedFlights,
            'handover' => $handoverData
        ];
    }

    $stmt = $db->query("SELECT * FROM plan_flights ORDER BY sort_order ASC, departure_time ASC");
    $rawFlights = $stmt->fetchAll();
    $flights = [];

    foreach ($rawFlights as $r) {
        $flItem = [
            'id' => (string)$r['id'],
            'flight' => (string)($r['flight_number'] ?? ''),
            'flight_date' => (string)($r['flight_date'] ?? ''),
            'route_city' => (string)($r['route_city'] ?? ''),
            'route_airports' => (string)($r['route_airports'] ?? ''),
            'time' => (string)($r['departure_time'] ?? ''),
            'release_time' => (string)($r['release_time'] ?? ''),
            'ac_num' => (string)($r['ac_num'] ?? ''),
            'ac_type' => (string)($r['ac_type'] ?? ''),
            'ac_config' => (string)($r['ac_config'] ?? ''),
            'pax' => (string)($r['pax'] ?? ''),
            'crew' => (string)($r['crew'] ?? ''),
            'fuel_block' => (string)($r['fuel_block'] ?? ''),
            'fuel_trip' => (string)($r['fuel_trip'] ?? ''),
            'fuel_taxi' => (string)($r['fuel_taxi'] ?? ''),
            'dow' => (string)($r['dow'] ?? ''),
            'doi' => (string)($r['doi'] ?? ''),
            'galley' => (string)($r['galley'] ?? 'D'),
            'mtow' => (string)($r['mtow'] ?? ''),
            'lir_sent' => (bool)$r['lir_sent'],
            'cargo' => (string)($r['cargo'] ?? ''),
            'mail' => (string)($r['mail'] ?? ''),
            'baggage' => (string)($r['baggage'] ?? ''),
            'szv_sent' => (bool)$r['szv_sent'],
            'ldm_sent' => (bool)$r['ldm_sent'],
            'astra_times_sent' => (bool)$r['astra_times_sent'],
            'status' => (string)($r['status'] ?? 'pending'),
            'notes' => (string)($r['notes'] ?? ''),
            'inbound_flight' => (string)($r['inbound_flight'] ?? ''),
            'inbound_dep' => (string)($r['inbound_dep'] ?? ''),
            'inbound_takeoff_time' => (string)($r['inbound_takeoff_time'] ?? ''),
            'inbound_landing_calc' => (string)($r['inbound_landing_calc'] ?? ''),
            'inbound_landing_time' => (string)($r['inbound_landing_time'] ?? ''),
            'outbound_takeoff_time' => (string)($r['outbound_takeoff_time'] ?? ''),
            'plane_status' => (string)($r['plane_status'] ?? '')
        ];
        if (!empty($r['unread_changes'])) {
            $parsedUnread = json_decode($r['unread_changes'], true);
            if ($parsedUnread) {
                $flItem['unread_changes'] = $parsedUnread;
            }
        }
        $flights[] = $flItem;
    }

    echo json_encode(['shiftInfo' => $shiftInfo, 'flights' => $flights]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /shift/save
// ----------------------------------------------------
if ($route === '/shift/save') {
    $authUser = getOptionalAuthUser();
    $input = getJsonInput();
    $shiftInfo = $input['shiftInfo'] ?? [];
    $flights = $input['flights'] ?? [];

    $dateInterval = $shiftInfo['date_interval'] ?? $shiftInfo['date'] ?? date('d.m.Y');
    $dispatcher = $shiftInfo['dispatcher'] ?? ($authUser['full_name'] ?? 'Диспетчер по центровке');
    $deletedFlightsVal = $shiftInfo['deleted_flights'] ?? null;
    $deletedFlightsJson = $deletedFlightsVal !== null ? json_encode($deletedFlightsVal, JSON_UNESCAPED_UNICODE) : null;
    $nowStr = date('Y-m-d H:i:s');

    $db = getDb();
    try {
        $db->beginTransaction();

        $stmt = $db->query("SELECT id FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1");
        $activeShift = $stmt->fetch();

        if ($activeShift) {
            $shiftId = $activeShift['id'];
            $upd = $db->prepare("UPDATE plan_shifts SET date_interval = ?, dispatcher_name = ?, deleted_flights = ? WHERE id = ?");
            $upd->execute([$dateInterval, $dispatcher, $deletedFlightsJson, $shiftId]);
        } else {
            $ins = $db->prepare("INSERT INTO plan_shifts (date_interval, dispatcher_name, started_at, status, deleted_flights, created_at) VALUES (?, ?, ?, 'active', ?, ?)");
            $ins->execute([$dateInterval, $dispatcher, $nowStr, $deletedFlightsJson, $nowStr]);
            $shiftId = $db->lastInsertId();
        }

        $db->exec("DELETE FROM plan_flights");
        $insertFlight = $db->prepare("
            INSERT INTO plan_flights (
                id, shift_id, flight_number, flight_date, route_city, route_airports,
                departure_time, release_time, ac_num, ac_type, ac_config, pax, crew,
                fuel_block, fuel_trip, fuel_taxi, dow, doi, galley, mtow,
                lir_sent, cargo, mail, baggage, szv_sent, ldm_sent, astra_times_sent,
                status, notes, inbound_flight, inbound_dep, inbound_takeoff_time,
                inbound_landing_calc, inbound_landing_time, outbound_takeoff_time,
                plane_status, unread_changes, sort_order, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?
            )
        ");

        foreach ($flights as $index => $f) {
            $unreadChangesJson = !empty($f['unread_changes']) ? json_encode($f['unread_changes'], JSON_UNESCAPED_UNICODE) : null;
            $flightId = !empty($f['id']) ? (string)$f['id'] : ('fl_' . time() . '_' . $index . '_' . mt_rand(100, 999));
            $insertFlight->execute([
                $flightId,
                $shiftId,
                (string)($f['flight'] ?? ''),
                (string)($f['flight_date'] ?? ''),
                (string)($f['route_city'] ?? ''),
                (string)($f['route_airports'] ?? ''),
                (string)($f['time'] ?? ''),
                (string)($f['release_time'] ?? ''),
                (string)($f['ac_num'] ?? ''),
                normalizePlaneType($f['ac_type'] ?? ''),
                (string)($f['ac_config'] ?? ''),
                (string)($f['pax'] ?? ''),
                (string)($f['crew'] ?? ''),
                (string)($f['fuel_block'] ?? ''),
                (string)($f['fuel_trip'] ?? ''),
                (string)($f['fuel_taxi'] ?? ''),
                (string)($f['dow'] ?? ''),
                (string)($f['doi'] ?? ''),
                (string)($f['galley'] ?? 'D'),
                (string)($f['mtow'] ?? ''),
                !empty($f['lir_sent']) ? 1 : 0,
                (string)($f['cargo'] ?? ''),
                (string)($f['mail'] ?? ''),
                (string)($f['baggage'] ?? ''),
                !empty($f['szv_sent']) ? 1 : 0,
                !empty($f['ldm_sent']) ? 1 : 0,
                !empty($f['astra_times_sent']) ? 1 : 0,
                (string)($f['status'] ?? 'pending'),
                (string)($f['notes'] ?? ''),
                (string)($f['inbound_flight'] ?? ''),
                (string)($f['inbound_dep'] ?? ''),
                (string)($f['inbound_takeoff_time'] ?? ''),
                (string)($f['inbound_landing_calc'] ?? ''),
                (string)($f['inbound_landing_time'] ?? ''),
                (string)($f['outbound_takeoff_time'] ?? ''),
                (string)($f['plane_status'] ?? ''),
                $unreadChangesJson,
                $index,
                $nowStr
            ]);
        }

        $db->commit();
        echo json_encode(['success' => true, 'saved_count' => count($flights)]);
        exit;
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(500);
        echo json_encode(['detail' => 'Ошибка сохранения смены в MySQL: ' . $e->getMessage()]);
        exit;
    }
}


// ----------------------------------------------------
// ЭНДПОИНТ: /shift/smart_merge
// ----------------------------------------------------
if ($route === '/shift/smart_merge') {
    $authUser = getOptionalAuthUser();
    $input = getJsonInput();
    $current = $input['current_flights'] ?? [];
    $incoming = $input['incoming_flights'] ?? [];

    $existingMap = [];
    $existingByFlight = [];
    foreach ($current as $f) {
        $flightClean = strtoupper(str_replace(['-', ' '], '', trim($f['flight'] ?? '')));
        $flightDate = trim($f['flight_date'] ?? '');
        $key = "{$flightClean}_{$flightDate}";
        $existingMap[$key] = $f;
        if (!empty($flightClean) && !isset($existingByFlight[$flightClean])) {
            $existingByFlight[$flightClean] = $f;
        }
    }

    $merged = [];

    foreach ($incoming as $inc) {
        $flightClean = strtoupper(str_replace(['-', ' '], '', trim($inc['flight'] ?? '')));
        $flightDate = trim($inc['flight_date'] ?? '');
        $key = "{$flightClean}_{$flightDate}";
        $old = $existingMap[$key] ?? $existingByFlight[$flightClean] ?? null;

        if ($old !== null) {
            $item = $inc;
            $item['id'] = $old['id'] ?? $inc['id'];
            $item['status'] = $old['status'] ?? $inc['status'] ?? 'pending';
            $item['lir_sent'] = !empty($old['lir_sent']);
            $item['szv_sent'] = !empty($old['szv_sent']);
            $item['ldm_sent'] = !empty($old['ldm_sent']);
            $item['astra_times_sent'] = !empty($old['astra_times_sent']);
            $item['notes'] = !empty($old['notes']) ? $old['notes'] : ($inc['notes'] ?? '');

            // 1. Сохраняем ручные диспетчерские поля
            foreach (['fuel_block', 'fuel_trip', 'fuel_taxi', 'dow', 'doi', 'galley', 'mtow', 'baggage'] as $field) {
                if (isset($old[$field]) && $old[$field] !== '') {
                    $item[$field] = $old[$field];
                }
            }

            // 2. Выявляем изменения в оперативных полях AviaBit
            $trackedFields = [
                ['time', 'departure_time'],
                ['flight_date', 'flight_date'],
                ['ac_num', 'ac_num'],
                ['ac_type', 'ac_type'],
                ['ac_config', 'ac_config'],
                ['pax', 'pax'],
                ['crew', 'crew'],
                ['cargo', 'cargo'],
                ['mail', 'mail'],
                ['route_city', 'route_city'],
                ['route_airports', 'route_airports']
            ];

            $changes = !empty($old['unread_changes']) ? $old['unread_changes'] : [];
            if (is_string($changes)) {
                $decoded = json_decode($changes, true);
                $changes = $decoded ?: [];
            }

            foreach ($trackedFields as $tf) {
                $fKey = $tf[0];
                $altKey = $tf[1];
                $oldVal = trim((string)($old[$fKey] ?? $old[$altKey] ?? ''));
                $newVal = trim((string)($inc[$fKey] ?? $inc[$altKey] ?? ''));
                if ($newVal !== '' && $oldVal !== '' && $oldVal !== $newVal) {
                    $prevOld = isset($changes[$fKey]['old']) ? $changes[$fKey]['old'] : $oldVal;
                    $changes[$fKey] = [
                        'old' => $prevOld ?: '—',
                        'new' => $newVal,
                        'ts' => (int)(microtime(true) * 1000)
                    ];
                }
            }

            if (!empty($changes)) {
                $item['unread_changes'] = $changes;
            }

            $merged[] = $item;
        } else {
            $merged[] = $inc;
        }
    }

    // ВАЖНО: Мы НЕ добавляем старые рейсы, которых нет в подгруженном расписании ($incoming).
    // При переключении смен чужие/прошлые рейсы автоматически заменяются новым расписанием.
    echo json_encode(['flights' => $merged, 'merged_count' => count($merged)]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /shift/handover
// ----------------------------------------------------
if ($route === '/shift/handover') {
    getAuthUser();
    $input = getJsonInput();
    $handedOverBy = trim($input['handed_over_by'] ?? '');
    $acceptedBy = trim($input['accepted_by'] ?? '');
    $notes = trim($input['notes'] ?? '');
    $archiveClosed = !empty($input['archive_closed_flights']);
    $nowStr = date('Y-m-d H:i:s');

    $db = getDb();
    $stmt = $db->query("SELECT * FROM plan_flights WHERE status != 'closed' ORDER BY departure_time ASC");
    $activeFlights = $stmt->fetchAll();

    $summary = [];
    foreach ($activeFlights as $f) {
        $summary[] = "{$f['flight_number']} ({$f['departure_time']}) - {$f['status']}";
    }
    $summaryText = implode('; ', array_slice($summary, 0, 10));

    $ins = $db->prepare("
        INSERT INTO plan_handover_logs (
            handed_over_by, accepted_by, handover_time, active_flights_count,
            transferred_flights_summary, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");
    $ins->execute([
        $handedOverBy,
        $acceptedBy,
        $nowStr,
        count($activeFlights),
        $summaryText,
        $notes
    ]);

    $activeShift = $db->query("SELECT id FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1")->fetch();
    if ($activeShift) {
        $upd = $db->prepare("UPDATE plan_shifts SET dispatcher_name = ? WHERE id = ?");
        $upd->execute([$acceptedBy, $activeShift['id']]);
    }

    if ($archiveClosed) {
        $db->exec("DELETE FROM plan_flights WHERE status = 'closed'");
    }

    echo json_encode([
        'success' => true,
        'message' => "Смена передана диспетчеру $acceptedBy",
        'active_flights_transferred' => count($activeFlights),
        'handover_time' => date('d.m.Y H:i')
    ]);
    exit;
}

// ----------------------------------------------------
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ЗАПРОСА К AVIABIT С АВТОРИЗАЦИЕЙ
// ----------------------------------------------------
function getAviaBitCookie($name, $defaultCookie) {
    $sessionFile = __DIR__ . "/.session_{$name}.json";
    if (file_exists($sessionFile)) {
        $raw = @file_get_contents($sessionFile);
        $data = json_decode($raw, true);
        if (!empty($data['connect.sid'])) {
            return $data['connect.sid'];
        }
    }
    return $defaultCookie;
}

function saveAviaBitCookie($name, $cookieVal) {
    $sessionFile = __DIR__ . "/.session_{$name}.json";
    @file_put_contents($sessionFile, json_encode(['connect.sid' => $cookieVal], JSON_PRETTY_PRINT));
}

function fetchAviaBitSchedule($baseUrl, $username, $password, $startTsMs, $endTsMs, $name = 'nordwind', &$diag = []) {
    $origin = rtrim($baseUrl, '/');
    $referer = $origin . '/plan-flight';

    $defaultCookies = [
        'nordwind' => 's%3ArghcgrAycdgvsI__Q2iZay-vUij_Yaze.uyVqX6K71%2FcuQ7tYDw%2BH91oWDKhclzgYq6w6HGSqvsM',
        'ikar' => 's%3AS9kWveGtvxwmmq_YoZv0H6tOW0GW9a2O.MscjJmSqUjyniNClfqtbf61hqLGMwCfjXRuFNW6USUw'
    ];

    $cookieVal = getAviaBitCookie($name, $defaultCookies[$name] ?? '');

    $headers = [
        "Origin: $origin",
        "Referer: $referer",
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Content-Type: application/json',
        'Accept: application/json, text/plain, */*',
        "Cookie: connect.sid=$cookieVal"
    ];

    // 1. Прямой запрос суточного плана полетов со всеми бортами флота (полный охват входящих плеч)
    $url = "$origin/api/plan-flight?dateBegin={$startTsMs}&dateEnd={$endTsMs}&eng=false&apCode=3&apId=0&showCancel=false";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $schedRes = curl_exec($ch);
    $schedCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $schedErr = curl_error($ch);
    curl_close($ch);

    $diag[] = "[$name] sched_code: $schedCode, len: " . strlen($schedRes);

    if ($schedCode === 200 && $schedRes) {
        $data = json_decode($schedRes, true);
        if (is_array($data)) {
            return $data;
        }
    }

    // 2. Если сессия устарела (код 302, 401) - выполняем логин
    $authPayload = json_encode([
        'rememberMe' => true,
        'version' => [
            'date' => '2026-08-06T08:00:00.000Z',
            'company' => 'ООО "АвиаБит"',
            'number' => '9.8.1'
        ],
        'eng' => false,
        'username' => $username,
        'password' => $password
    ]);

    $ch = curl_init("$origin/api/auth");
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $authPayload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Origin: $origin",
        "Referer: $referer",
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Content-Type: application/json',
        'Accept: application/json, text/plain, */*'
    ]);
    $authFull = curl_exec($ch);
    curl_close($ch);

    if (preg_match('/connect\.sid=([^;]+)/', $authFull, $m)) {
        $newCookie = $m[1];
        saveAviaBitCookie($name, $newCookie);
        $headers[count($headers) - 1] = "Cookie: connect.sid=$newCookie";
    }

    // Повторный запрос расписания
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    $schedRes2 = curl_exec($ch);
    curl_close($ch);

    if ($schedRes2) {
        $data = json_decode($schedRes2, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return [];
}

// ----------------------------------------------------
// ЭНДПОИНТ: /fetch_schedule (Парсер AviaBit)
// ----------------------------------------------------
if ($route === '/fetch_schedule') {
    getAuthUser();
    $input = getJsonInput();
    $dateFrom = $input['date_from'] ?? date('d.m.Y');
    $timeFrom = $input['time_from'] ?? '08:00';
    $dateTo = $input['date_to'] ?? date('d.m.Y', strtotime('+1 day'));
    $timeTo = $input['time_to'] ?? '14:00';
    $airline = $input['airline'] ?? 'both';

    $dFromParts = explode('.', $dateFrom);
    $tFromParts = explode(':', $timeFrom);
    $dToParts = explode('.', $dateTo);
    $tToParts = explode(':', $timeTo);

    if (count($dFromParts) === 3 && count($dToParts) === 3) {
        $startBoundTs = mktime(0, 0, 0, (int)$dFromParts[1], (int)$dFromParts[0], (int)$dFromParts[2]);
        $endBoundTs = mktime(23, 59, 59, (int)$dToParts[1], (int)$dToParts[0], (int)$dToParts[2]);
        $shiftStartTs = mktime((int)($tFromParts[0] ?? 8), (int)($tFromParts[1] ?? 0), 0, (int)$dFromParts[1], (int)$dFromParts[0], (int)$dFromParts[2]);
        $shiftEndTs = mktime((int)($tToParts[0] ?? 14), (int)($tToParts[1] ?? 0), 0, (int)$dToParts[1], (int)$dToParts[0], (int)$dToParts[2]);
    } else {
        $startBoundTs = strtotime('today 00:00:00');
        $endBoundTs = strtotime('tomorrow 23:59:59');
        $shiftStartTs = strtotime('today 08:00:00');
        $shiftEndTs = strtotime('tomorrow 14:00:00');
    }

    $tsStartMs = $startBoundTs * 1000;
    $tsEndMs = $endBoundTs * 1000;

    // Динамический фильтр разрешенных аэропортов вылета
    $allowedDeps = [];
    if (!empty($input['allowed_departures']) && is_array($input['allowed_departures'])) {
        foreach ($input['allowed_departures'] as $code) {
            $c = strtoupper(trim($code));
            if ($c) $allowedDeps[$c] = true;
        }
    } else {
        try {
            $db = getDb();
            initAirportsTable($db);
            $rows = $db->query("SELECT code FROM plan_departure_airports WHERE is_enabled = 1")->fetchAll(PDO::FETCH_COLUMN);
            if (!empty($rows)) {
                foreach ($rows as $c) {
                    $allowedDeps[strtoupper(trim($c))] = true;
                }
            }
        } catch (Exception $e) {}
    }

    if (empty($allowedDeps)) {
        $allowedDeps = [
            'KQT' => true, 'VRA' => true, 'GOI' => true, 'GOX' => true, 'DYU' => true, 'ISB' => true,
            'CCC' => true, 'CXR' => true, 'HOG' => true, 'REN' => true, 'OSS' => true, 'PMW' => true,
            'PMV' => true, 'ROV' => true, 'XIY' => true, 'AER' => true, 'SUI' => true, 'UUD' => true,
            'UTP' => true, 'LBD' => true, 'HTA' => true, 'SSH' => true, 'SVO' => true, 'TAS' => true,
            'NMA' => true, 'TJU' => true, 'SKD' => true
        ];
    }

    $iataCities = [
        'KQT' => 'Бохтар', 'VRA' => 'Варадеро', 'GOI' => 'Гоа', 'GOX' => 'Гоа', 'DYU' => 'Душанбе',
        'ISB' => 'Исламабад', 'CCC' => 'Кайококо', 'CXR' => 'Камрань', 'HOG' => 'Ольгин',
        'REN' => 'Оренбург', 'OSS' => 'Ош', 'PMW' => 'Парламар', 'PMV' => 'Парламар',
        'ROV' => 'Ростов', 'XIY' => 'Сиань', 'AER' => 'Сочи', 'SUI' => 'Сухум',
        'UUD' => 'Улан-Удэ', 'UTP' => 'Утапао', 'LBD' => 'Худжант', 'HTA' => 'Чита',
        'SSH' => 'Шарм Эль Шейх', 'SVO' => 'Москва', 'TAS' => 'Ташкент', 'NMA' => 'Наманган',
        'TJU' => 'Куляб', 'SKD' => 'Самарканд', 'KZN' => 'Казань', 'BAX' => 'Барнаул',
        'LED' => 'Питер', 'UFA' => 'Уфа', 'KGD' => 'Калининград', 'SVX' => 'Екатеринбург',
        'IKT' => 'Иркутск', 'KJA' => 'Красноярск', 'OVB' => 'Новосибирск', 'PEE' => 'Пермь',
        'TOF' => 'Томск', 'TJM' => 'Тюмень', 'MRV' => 'Мин.Воды', 'MCX' => 'Махачкала',
        'GRV' => 'Грозный', 'VOG' => 'Волгоград', 'ASF' => 'Астрахань', 'AYT' => 'Анталья',
        'NJC' => 'Нижневартовск', 'OSW' => 'Орск', 'GOJ' => 'Н.Новгород', 'OMS' => 'Омск',
        'KUF' => 'Самара', 'CEK' => 'Челябинск', 'NOZ' => 'Новокузнецк', 'NBC' => 'Нижнекамск',
        'MQF' => 'Магнитогорск', 'SCW' => 'Сыктывкар', 'VVO' => 'Владивосток', 'KHV' => 'Хабаровск',
        'IJK' => 'Ижевск', 'CSY' => 'Чебоксары', 'KRR' => 'Краснодар', 'AAQ' => 'Анапа',
        'IST' => 'Стамбул', 'DXB' => 'Дубай', 'DWC' => 'Дубай', 'HRG' => 'Хургада',
        'BHK' => 'Бухара', 'FEG' => 'Фергана', 'UGU' => 'Ургенч', 'FRU' => 'Бишкек',
        'EVN' => 'Ереван', 'GYD' => 'Баку', 'TBS' => 'Тбилиси'
    ];

    try {
        $db = getDb();
        initAirportsTable($db);
        $customCities = $db->query("SELECT code, city_name FROM plan_departure_airports")->fetchAll(PDO::FETCH_KEY_PAIR);
        if ($customCities) {
            $iataCities = array_merge($iataCities, $customCities);
        }
    } catch (Exception $e) {}

    $avbUser = 'a.zubkov';
    $avbPass = 'SoLnCeVo1985';

    $rawFlights = [];
    $diag = [];
    if ($airline === 'both' || $airline === 'nordwind') {
        $nw = fetchAviaBitSchedule('https://aviabit.nordwindairlines.ru', $avbUser, $avbPass, $tsStartMs, $tsEndMs, 'nordwind', $diag);
        if (!empty($nw)) {
            foreach ($nw as &$f) { $f['_airline'] = 'nordwind'; }
            $rawFlights = array_merge($rawFlights, $nw);
        }
    }
    if ($airline === 'both' || $airline === 'ikar') {
        $ik = fetchAviaBitSchedule('https://aviabit.ikar.aero', $avbUser, $avbPass, $tsStartMs, $tsEndMs, 'ikar', $diag);
        if (!empty($ik)) {
            foreach ($ik as &$f) { $f['_airline'] = 'ikar'; }
            $rawFlights = array_merge($rawFlights, $ik);
        }
    }

    // Индексация всех рейсов флота по бортовым номерам для вычисления входящих плеч
    $flightsByTail = [];
    foreach ($rawFlights as $rf) {
        $rawT = trim($rf['pln'] ?? '');
        $cTail = str_replace(['RA-', 'RA', '-'], '', $rawT);
        if ($cTail) {
            if (!isset($flightsByTail[$cTail])) {
                $flightsByTail[$cTail] = [];
            }
            $flightsByTail[$cTail][] = $rf;
        }
    }

    // 1. Предварительная фильтрация кандидатов
    $candidates = [];
    $seenKeys = [];

    foreach ($rawFlights as $idx => $fl) {
        $flightNo = trim($fl['flight'] ?? '');
        $dep = strtoupper(trim($fl['airPortTOCode'] ?? ''));
        $arr = strtoupper(trim($fl['airPortLACode'] ?? ''));
        if (empty($flightNo) || empty($dep) || empty($arr)) continue;
        if (!isset($allowedDeps[$dep])) continue;

        // Исключаем резервные рейсы (~РЕ307д, ~РЕЗ, РЕЗ, REZ, ~ и т.д.) и спецрейсы
        if (strpos($flightNo, '~') !== false) continue;
        if (stripos($flightNo, 'РЕЗ') !== false || stripos($flightNo, 'REZ') !== false) continue;
        if (!empty($fl['isSpecialFlight'])) continue;
        $flClean = str_replace(['-', ' '], '', $flightNo);

        // Ожидаемое / расчетное время вылета (при переносе/задержке) или плановое по расписанию
        // Приоритет: 1. Расчетное/перенесенное (dateTakeoffCalculation) -> 2. Плановое (dateTakeoff) -> 3. Фактическое (dateTakeoffReal)
        // Обратите внимание: dateTakeoffReal не заменяет ожидаемое время вылета, а выводится отдельно в колонке "Маршрут" как реальный взлет!
        $takeoffRaw = $fl['dateTakeoffCalculation'] ?? $fl['dateTakeoff'] ?? $fl['dateTakeoffReal'] ?? '';

        $timeStr = '';
        $flightDate = date('d.m', $shiftStartTs);

        if ($takeoffRaw) {
            $dt = strtotime($takeoffRaw);
            if ($dt) {
                // Строгая фильтрация по Московскому времени смены
                if ($dt < $shiftStartTs || $dt > $shiftEndTs) {
                    continue;
                }
                $timeStr = date('G:i', $dt);
                $flightDate = date('d.m', $dt);
            }
        }

        $key = "{$flClean}_{$flightDate}_{$dep}_{$arr}";
        if (isset($seenKeys[$key])) continue;
        $seenKeys[$key] = true;

        $fl['_clean_flight'] = $flClean;
        $fl['_flight_date'] = $flightDate;
        $fl['_time_str'] = $timeStr;
        $candidates[] = $fl;
    }

    // 2. Параллельная загрузка оперативной информации (пассажиры, загрузка, экипаж) и списка телеграмм
    $preliminaries = [];
    $telexLists = [];
    $telegrams = [];

    if (!empty($candidates)) {
        $mh = curl_multi_init();
        $handles = [];
        $defaultCookies = [
            'nordwind' => 's%3ArghcgrAycdgvsI__Q2iZay-vUij_Yaze.uyVqX6K71%2FcuQ7tYDw%2BH91oWDKhclzgYq6w6HGSqvsM',
            'ikar' => 's%3AS9kWveGtvxwmmq_YoZv0H6tOW0GW9a2O.MscjJmSqUjyniNClfqtbf61hqLGMwCfjXRuFNW6USUw'
        ];

        foreach ($candidates as $c) {
            $pfId = $c['pfRecordId'] ?? null;
            if (!$pfId) continue;
            $airlineName = $c['_airline'] ?? 'nordwind';
            $baseUrl = ($airlineName === 'ikar') ? 'https://aviabit.ikar.aero' : 'https://aviabit.nordwindairlines.ru';
            $cookieVal = getAviaBitCookie($airlineName, $defaultCookies[$airlineName] ?? '');
            
            // 2.1 Запрос preliminary
            $urlPrelim = "$baseUrl/api/preliminary-crew-load?planFlightId=$pfId&eng=false";
            $ch1 = curl_init($urlPrelim);
            curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch1, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch1, CURLOPT_HTTPHEADER, [
                "Origin: $baseUrl",
                "Referer: $baseUrl/plan-flight",
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                'Accept: application/json, text/plain, */*',
                "Cookie: connect.sid=$cookieVal"
            ]);
            curl_multi_add_handle($mh, $ch1);
            $handles["prelim_{$pfId}"] = $ch1;

            // 2.2 Запрос списка телеграмм (telex-list)
            $urlTelexList = "$baseUrl/api/telex-list?planFlightId=$pfId";
            $ch2 = curl_init($urlTelexList);
            curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch2, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch2, CURLOPT_HTTPHEADER, [
                "Origin: $baseUrl",
                "Referer: $baseUrl/plan-flight",
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                'Accept: application/json, text/plain, */*',
                "Cookie: connect.sid=$cookieVal"
            ]);
            curl_multi_add_handle($mh, $ch2);
            $handles["tlist_{$pfId}"] = $ch2;
        }

        $running = null;
        do {
            curl_multi_exec($mh, $running);
            curl_multi_select($mh);
        } while ($running > 0);

        foreach ($handles as $key => $ch) {
            $resp = curl_multi_getcontent($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            if ($code === 200 && $resp) {
                $json = json_decode($resp, true);
                if (is_array($json)) {
                    if (strpos($key, 'prelim_') === 0) {
                        $pfId = (int)substr($key, 7);
                        $preliminaries[$pfId] = $json;
                    } elseif (strpos($key, 'tlist_') === 0) {
                        $pfId = (int)substr($key, 6);
                        $telexLists[$pfId] = $json;
                    }
                }
            }
            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }
        curl_multi_close($mh);

        // 2.3 Выбор наиболее приоритетной телеграммы (FBL -> FFM -> UWS -> LDM) и дозагрузка текста
        $msgHandles = [];
        $mh2 = curl_multi_init();
        $bestMeta = [];

        foreach ($candidates as $c) {
            $pfId = $c['pfRecordId'] ?? null;
            if (!$pfId || empty($telexLists[$pfId])) continue;
            
            $tData = $telexLists[$pfId];
            $allTelegrams = [];
            foreach ($tData as $route => $items) {
                if (is_array($items)) {
                    foreach ($items as $it) $allTelegrams[] = $it;
                }
            }

            $bestT = null;
            foreach (['FBL', 'FFM', 'UWS', 'LDM'] as $targetName) {
                foreach ($allTelegrams as $t) {
                    $tName = strtoupper($t['name'] ?? $t['telexCode'] ?? '');
                    if ($tName === $targetName) {
                        $bestT = $t;
                        break;
                    }
                }
                if ($bestT) break;
            }

            if ($bestT) {
                $tId = $bestT['id'] ?? $bestT['telexID'] ?? null;
                $tName = strtoupper($bestT['name'] ?? $bestT['telexCode'] ?? '');
                if ($tId) {
                    $airlineName = $c['_airline'] ?? 'nordwind';
                    $baseUrl = ($airlineName === 'ikar') ? 'https://aviabit.ikar.aero' : 'https://aviabit.nordwindairlines.ru';
                    $cookieVal = getAviaBitCookie($airlineName, $defaultCookies[$airlineName] ?? '');
                    $urlMsg = "$baseUrl/api/telex-message?id=$tId";

                    $chM = curl_init($urlMsg);
                    curl_setopt($chM, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($chM, CURLOPT_TIMEOUT, 6);
                    curl_setopt($chM, CURLOPT_SSL_VERIFYPEER, false);
                    curl_setopt($chM, CURLOPT_HTTPHEADER, [
                        "Origin: $baseUrl",
                        "Referer: $baseUrl/plan-flight",
                        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
                        'Accept: application/json, text/plain, */*',
                        "Cookie: connect.sid=$cookieVal"
                    ]);
                    curl_multi_add_handle($mh2, $chM);
                    $msgHandles[$pfId] = $chM;
                    $bestMeta[$pfId] = $tName;
                }
            }
        }

        if (!empty($msgHandles)) {
            $running2 = null;
            do {
                curl_multi_exec($mh2, $running2);
                curl_multi_select($mh2);
            } while ($running2 > 0);

            foreach ($msgHandles as $pfId => $chM) {
                $resp = curl_multi_getcontent($chM);
                $code = curl_getinfo($chM, CURLINFO_HTTP_CODE);
                if ($code === 200 && $resp) {
                    $json = json_decode($resp, true);
                    if (is_array($json)) {
                        $json['target_name'] = $bestMeta[$pfId] ?? '';
                        $telegrams[$pfId] = $json;
                    }
                }
                curl_multi_remove_handle($mh2, $chM);
                curl_close($chM);
            }
        }
        curl_multi_close($mh2);
    }

    // 3. Формирование итогового списка рейсов
    $processed = [];
    foreach ($candidates as $idx => $fl) {
        $flClean = $fl['_clean_flight'];
        $flightDate = $fl['_flight_date'];
        $timeStr = $fl['_time_str'];
        $dep = strtoupper(trim($fl['airPortTOCode'] ?? ''));
        $arr = strtoupper(trim($fl['airPortLACode'] ?? ''));
        $pfId = $fl['pfRecordId'] ?? null;

        $tailRaw = trim($fl['pln'] ?? '');
        $tail = str_replace(['RA-', 'RA', '-'], '', $tailRaw);
        $layout = trim($fl['prePlaneComponovkaInfo'] ?? '');
        $acType = detectPlaneType($fl['plnType'] ?? $fl['planeType'] ?? '', $tail, $layout);

        $relTime = '';
        if ($timeStr && strpos($timeStr, ':') !== false) {
            $p = explode(':', $timeStr);
            $totalMins = (int)$p[0] * 60 + (int)$p[1] - 40;
            if ($totalMins < 0) $totalMins += 24 * 60;
            $relH = floor($totalMins / 60) % 24;
            $relM = $totalMins % 60;
            $relTime = sprintf('%02d:%02d', $relH, $relM);
        }

        $operData = $preliminaries[$pfId] ?? [];
        $preliminaryList = $operData['preliminary'] ?? [];
        $loadList = $operData['load'] ?? [];
        $crewList = $operData['crew'] ?? [];

        // Извлекаем количество пассажиров: Взрослые (ADT) + РБ (CHD), без младенцев РМ (Inf)
        $paxRaw = '';
        if (!empty($preliminaryList) && is_array($preliminaryList)) {
            $leg0 = $preliminaryList[0] ?? [];
            if (is_array($leg0)) {
                $paxRaw = trim($leg0['prePassengerInfo'] ?? '');
                if (empty($layout)) {
                    $layout = trim($leg0['prePlaneComponovkaInfo'] ?? '');
                }
            }
        }

        if (empty($acType) && !empty($layout)) {
            $acType = detectPlaneType('', $tail, $layout);
        }

        $paxCount = '';
        if (!empty($loadList) && is_array($loadList)) {
            $ld0 = $loadList[0] ?? [];
            if (is_array($ld0) && (isset($ld0['ADT']) || isset($ld0['CHD']))) {
                $adt = (int)($ld0['ADT'] ?? 0);
                $chd = (int)($ld0['CHD'] ?? 0);
                $paxCount = (string)($adt + $chd);
            }
        }
        if ($paxCount === '' && !empty($paxRaw)) {
            $parts = explode('/', $paxRaw);
            if (count($parts) >= 2) {
                $adt = (int)trim($parts[0]);
                $chd = (int)trim($parts[1]);
                $paxCount = (string)($adt + $chd);
            } elseif (count($parts) === 1 && is_numeric(trim($parts[0]))) {
                $paxCount = (string)(int)trim($parts[0]);
            } else {
                $paxCount = trim($paxRaw);
            }
        }

        // Условие для SVO: рейсы из SVO включаются только если пассажиров 0 (пустые)
        if ($dep === 'SVO') {
            $paxInt = is_numeric($paxCount) ? (int)$paxCount : 0;
            if ($paxInt > 0) continue;
        }

        // Экипаж: Летный / Салон / ИТС / Пасс
        $cockpit = 0; $cabin = 0; $its = 0; $paxCrew = 0;
        if (!empty($crewList) && is_array($crewList)) {
            foreach ($crewList as $cr) {
                if (!empty($cr['isAirport'])) continue;
                $ctype = $cr['crewType'] ?? -1;
                if ($ctype === 0) $cockpit++;
                elseif ($ctype === 1) $cabin++;
                elseif ($ctype === 2) $its++;
                elseif ($ctype === 4) $paxCrew++;
            }
        }
        $crewStr = ($cockpit > 0 || $cabin > 0 || $its > 0 || $paxCrew > 0) ? "{$cockpit}/{$cabin}/{$its}/{$paxCrew}" : '';

        // Город прилёта (назначения)
        $cityName = $iataCities[$arr] ?? '';
        if (empty($cityName) && !empty($preliminaryList) && is_array($preliminaryList) && count($preliminaryList) > 1) {
            $leg1 = $preliminaryList[1] ?? [];
            $rawName = trim($leg1['airportName'] ?? '');
            if (strpos($rawName, '(') !== false) {
                $rawName = trim(explode('(', $rawName)[0]);
            }
            if (!empty($rawName)) {
                $cityName = $rawName;
            }
        }
        if (empty($cityName)) {
            $cityName = $arr;
        }

        $airports = "{$dep}-{$arr}";

        // Парсинг телеграмм (FBL / FFM / UWS) для извлечения Груза (Cargo) и Почты (Mail)
        $telexData = $telegrams[$pfId] ?? [];
        $telexText = $telexData['text'] ?? '';
        $telexCode = $telexData['target_name'] ?? $telexData['code'] ?? '';
        $tlgLoad = parseTelegramLoad($telexText, $telexCode);

        $cargoVal = $tlgLoad['cargo'] ?? '';
        $mailVal = $tlgLoad['mail'] ?? '';

        // Фолбэк на preliminary load block если в телеграмме нет
        if ($cargoVal === '' && !empty($loadList) && is_array($loadList)) {
            $ld0 = $loadList[0] ?? [];
            if (!empty($ld0['Cg']) && (int)$ld0['Cg'] > 0) {
                $cargoVal = (string)$ld0['Cg'];
            }
        }
        if ($mailVal === '' && !empty($loadList) && is_array($loadList)) {
            $ld0 = $loadList[0] ?? [];
            if (!empty($ld0['Ml']) && (int)$ld0['Ml'] > 0) {
                $mailVal = (string)$ld0['Ml'];
            }
        }

        // Расчет времени движения борта (В пути -> Сел -> Вылетел)
        $outboundTakeoffTime = '';
        if (!empty($fl['dateTakeoffReal'])) {
            $tTs = strtotime($fl['dateTakeoffReal']);
            if ($tTs) $outboundTakeoffTime = date('G:i', $tTs);
        }

        $inboundFlight = '';
        $inboundDep = '';
        $inboundTakeoffTime = '';
        $inboundLandingCalc = '';
        $inboundLandingTime = '';
        $planeStatus = '';

        $tailFlights = $flightsByTail[$tail] ?? [];
        $bestInbound = null;
        $bestInboundDepTs = -1;
        $airborneLeg = null;
        $flightTakeoffRaw = $fl['dateTakeoffCalculation'] ?? $fl['dateTakeoff'] ?? $fl['dateTakeoffReal'] ?? '';
        $flightTs = !empty($flightTakeoffRaw) ? strtotime($flightTakeoffRaw) : $shiftStartTs;

        foreach ($tailFlights as $cIn) {
            // Проверяем, находится ли борт в воздухе на каком-либо рейсе прямо сейчас
            if (!empty($cIn['dateTakeoffReal']) && empty($cIn['dateLandingReal'])) {
                $airborneLeg = $cIn;
            }

            $cInArr = strtoupper(trim($cIn['airPortLACode'] ?? ''));
            if ($cInArr !== $dep) continue;
            if (!empty($cIn['pfRecordId']) && !empty($fl['pfRecordId']) && $cIn['pfRecordId'] == $fl['pfRecordId']) continue;

            $inDepRaw = $cIn['dateTakeoffCalculation'] ?? $cIn['dateTakeoffReal'] ?? $cIn['dateTakeoff'] ?? '';
            if ($inDepRaw) {
                $inDepTs = strtotime($inDepRaw);
                if ($inDepTs) {
                    if ($flightTs > 0 && $inDepTs >= $flightTs) {
                        continue;
                    }
                    if ($inDepTs > $bestInboundDepTs) {
                        $bestInboundDepTs = $inDepTs;
                        $bestInbound = $cIn;
                    }
                }
            }
        }

        if ($bestInbound) {
            $inboundFlight = trim($bestInbound['flight'] ?? '');
            $inboundDep = strtoupper(trim($bestInbound['airPortTOCode'] ?? ''));
            if (!empty($bestInbound['dateTakeoffReal'])) {
                $t = strtotime($bestInbound['dateTakeoffReal']);
                if ($t) $inboundTakeoffTime = date('G:i', $t);
            }
            if (!empty($bestInbound['dateLandingReal'])) {
                $t = strtotime($bestInbound['dateLandingReal']);
                if ($t) $inboundLandingTime = date('G:i', $t);
            }
            $calcRaw = $bestInbound['dateLandingCalculation'] ?? $bestInbound['dateLanding'] ?? '';
            if ($calcRaw) {
                $t = strtotime($calcRaw);
                if ($t) $inboundLandingCalc = date('G:i', $t);
            }
        }

        if ($outboundTakeoffTime !== '') {
            $planeStatus = 'departed';
        } elseif ($inboundLandingTime !== '') {
            $planeStatus = 'landed';
        } elseif ($inboundTakeoffTime !== '') {
            $planeStatus = 'inbound_flying';
        } elseif ($airborneLeg) {
            $planeStatus = 'other_flying';
            $inboundFlight = trim($airborneLeg['flight'] ?? '');
            $inboundDep = strtoupper(trim($airborneLeg['airPortLACode'] ?? ''));
            $calcRaw = $airborneLeg['dateLandingCalculation'] ?? $airborneLeg['dateLanding'] ?? '';
            if ($calcRaw) {
                $t = strtotime($calcRaw);
                if ($t) $inboundLandingCalc = date('G:i', $t);
            }
        } elseif ($inboundDep !== '') {
            $planeStatus = 'scheduled';
        }

        $processed[] = [
            'id' => 'fl_' . time() . '_' . $idx,
            'flight' => $flClean,
            'flight_date' => $flightDate,
            'route_city' => $cityName,
            'route_airports' => $airports,
            'time' => $timeStr,
            'release_time' => $relTime,
            'ac_num' => $tail,
            'ac_type' => $acType,
            'ac_config' => $layout,
            'pax' => $paxCount,
            'crew' => $crewStr,
            'fuel_block' => '',
            'fuel_trip' => '',
            'fuel_taxi' => '',
            'dow' => '',
            'doi' => '',
            'galley' => 'D',
            'mtow' => '',
            'lir_sent' => false,
            'cargo' => $cargoVal,
            'mail' => $mailVal,
            'baggage' => '',
            'szv_sent' => false,
            'ldm_sent' => false,
            'astra_times_sent' => false,
            'status' => 'pending',
            'notes' => '',
            'inbound_flight' => $inboundFlight,
            'inbound_dep' => $inboundDep,
            'inbound_takeoff_time' => $inboundTakeoffTime,
            'inbound_landing_calc' => $inboundLandingCalc,
            'inbound_landing_time' => $inboundLandingTime,
            'outbound_takeoff_time' => $outboundTakeoffTime,
            'plane_status' => $planeStatus
        ];
    }

    echo json_encode([
        'success' => true,
        'count' => count($processed),
        'flights' => $processed,
        'diag' => $diag,
        'interval_info' => "{$dateFrom} {$timeFrom} — {$dateTo} {$timeTo}"
    ]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТЫ АДМИНИСТРАТОРА: /admin/users
// ----------------------------------------------------
if (strpos($route, '/admin/users') === 0) {
    $admin = getAuthUser();
    if ($admin['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['detail' => 'Доступ разрешен только Администратору']);
        exit;
    }

    $db = getDb();
    $method = $_SERVER['REQUEST_METHOD'];

    $targetId = null;
    if (preg_match('#/admin/users/(\d+)#', $route, $matches)) {
        $targetId = (int)$matches[1];
    }

    if ($method === 'GET') {
        $stmt = $db->query("SELECT id, username, full_name, role, is_active, created_at FROM plan_users ORDER BY id ASC");
        echo json_encode(['users' => $stmt->fetchAll()]);
        exit;
    }

    if ($method === 'POST' && !$targetId) {
        $input = getJsonInput();
        $username = strtolower(trim($input['username'] ?? ''));
        $password = $input['password'] ?? '';
        $fullName = trim($input['full_name'] ?? '');
        $role = $input['role'] ?? 'dispatcher';

        if (!$username || !$password || !$fullName) {
            http_response_code(400);
            echo json_encode(['detail' => 'Заполните обязательные поля']);
            exit;
        }

        $check = $db->prepare("SELECT id FROM plan_users WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            http_response_code(400);
            echo json_encode(['detail' => "Пользователь $username уже существует"]);
            exit;
        }

        $ins = $db->prepare("INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)");
        $ins->execute([$username, $hash, $salt, $fullName, $role, date('Y-m-d H:i:s')]);

        logSystemEvent('INFO', 'auth', "Администратор '{$admin['username']}' создал пользователя '$username' (роль: $role, ФИО: $fullName)", null, $admin['id'], $admin['username'], getClientIp());

        echo json_encode(['success' => true, 'message' => "Пользователь $username успешно создан"]);
        exit;
    }

    if ($method === 'PUT' || ($method === 'POST' && $targetId)) {
        $input = getJsonInput();
        $stmt = $db->prepare("SELECT * FROM plan_users WHERE id = ?");
        $stmt->execute([$targetId]);
        $targetUser = $stmt->fetch();

        if (!$targetUser) {
            http_response_code(404);
            echo json_encode(['detail' => 'Пользователь не найден']);
            exit;
        }

        $fullName = isset($input['full_name']) ? trim($input['full_name']) : $targetUser['full_name'];
        $username = isset($input['username']) ? strtolower(trim($input['username'])) : $targetUser['username'];
        $role = isset($input['role']) ? $input['role'] : $targetUser['role'];
        $isActive = isset($input['is_active']) ? ($input['is_active'] ? 1 : 0) : $targetUser['is_active'];

        if ($username !== $targetUser['username']) {
            $check = $db->prepare("SELECT id FROM plan_users WHERE username = ? AND id != ?");
            $check->execute([$username, $targetId]);
            if ($check->fetch()) {
                http_response_code(400);
                echo json_encode(['detail' => "Логин $username уже занят другим пользователем"]);
                exit;
            }
        }

        $passwordHash = $targetUser['password_hash'];
        $salt = $targetUser['salt'];

        $newPass = $input['new_password'] ?? $input['password'] ?? null;
        if (!empty($newPass)) {
            list($passwordHash, $salt) = hashPassword($newPass);
        }

        $upd = $db->prepare("UPDATE plan_users SET full_name = ?, username = ?, role = ?, is_active = ?, password_hash = ?, salt = ? WHERE id = ?");
        $upd->execute([$fullName, $username, $role, $isActive, $passwordHash, $salt, $targetId]);

        logSystemEvent('INFO', 'auth', "Администратор '{$admin['username']}' обновил пользователя '{$targetUser['username']}' (ID: $targetId)", null, $admin['id'], $admin['username'], getClientIp());

        echo json_encode([
            'success' => true,
            'message' => "Данные пользователя $username успешно обновлены"
        ]);
        exit;
    }

    if ($method === 'DELETE' && $targetId) {
        if ($targetId === (int)$admin['id']) {
            http_response_code(400);
            echo json_encode(['detail' => 'Нельзя удалить собственную учетную запись']);
            exit;
        }

        $stmt = $db->prepare("SELECT username FROM plan_users WHERE id = ?");
        $stmt->execute([$targetId]);
        $targetUser = $stmt->fetch();
        $deletedName = $targetUser ? $targetUser['username'] : "ID $targetId";

        $del = $db->prepare("DELETE FROM plan_users WHERE id = ?");
        $del->execute([$targetId]);

        logSystemEvent('WARN', 'auth', "Администратор '{$admin['username']}' удалил пользователя '$deletedName' (ID: $targetId)", null, $admin['id'], $admin['username'], getClientIp());

        echo json_encode(['success' => true, 'message' => 'Пользователь удален']);
        exit;
    }
}

// ----------------------------------------------------
// ЭНДПОИНТЫ АДМИНИСТРАТОРА: /admin/logs (Журнал системных логов)
// ----------------------------------------------------
if (strpos($route, '/admin/logs') === 0) {
    $admin = getAuthUser();
    if ($admin['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['detail' => 'Доступ разрешен только Администратору']);
        exit;
    }

    $db = getDb();
    initLogsTable($db);
    $method = $_SERVER['REQUEST_METHOD'];

    // 1. Настройки срока хранения логов
    if ($route === '/admin/logs/settings') {
        if ($method === 'GET') {
            echo json_encode(['retention_days' => getLogRetentionDays()]);
            exit;
        }
        if ($method === 'POST') {
            $input = getJsonInput();
            $days = max(1, min(365, (int)($input['retention_days'] ?? 7)));
            setSystemSetting('log_retention_days', (string)$days);
            $deleted = cleanupOldLogs($days);
            logSystemEvent('INFO', 'system', "Администратор '{$admin['username']}' изменил срок хранения логов на $days дней (удалено $deleted устаревших записей)", null, $admin['id'], $admin['username'], getClientIp());
            echo json_encode([
                'success' => true,
                'retention_days' => $days,
                'deleted_count' => $deleted,
                'message' => "Срок хранения установлен: $days дн. Удалено устаревших записей: $deleted"
            ]);
            exit;
        }
    }

    // 2. Очистка логов
    if ($route === '/admin/logs/clear' && $method === 'POST') {
        $input = getJsonInput();
        if (!empty($input['clear_all'])) {
            $stmt = $db->query("DELETE FROM plan_system_logs");
            $deleted = $stmt->rowCount();
            logSystemEvent('WARN', 'system', "Администратор '{$admin['username']}' полностью очистил журнал логов", null, $admin['id'], $admin['username'], getClientIp());
            echo json_encode(['success' => true, 'deleted_count' => $deleted, 'message' => 'Все логи успешно удалены']);
            exit;
        } else {
            $days = isset($input['days']) ? (int)$input['days'] : getLogRetentionDays();
            $deleted = cleanupOldLogs($days);
            logSystemEvent('INFO', 'system', "Администратор '{$admin['username']}' выполнил ручную очистку логов старше $days дней (удалено $deleted)", null, $admin['id'], $admin['username'], getClientIp());
            echo json_encode(['success' => true, 'deleted_count' => $deleted, 'message' => "Удалено $deleted записей старше $days дней"]);
            exit;
        }
    }

    // 3. Получение списка логов
    if ($method === 'GET') {
        cleanupOldLogs();

        $level = $_GET['level'] ?? null;
        $module = $_GET['module'] ?? null;
        $search = trim($_GET['search'] ?? '');
        $limit = max(1, min(1000, (int)($_GET['limit'] ?? 200)));
        $offset = max(0, (int)($_GET['offset'] ?? 0));

        $conditions = [];
        $params = [];

        if ($level && strtoupper($level) !== 'ALL') {
            $conditions[] = "level = ?";
            $params[] = strtoupper($level);
        }
        if ($module && strtolower($module) !== 'all') {
            $conditions[] = "module = ?";
            $params[] = strtolower($module);
        }
        if ($search !== '') {
            $term = "%$search%";
            $conditions[] = "(message LIKE ? OR details LIKE ? OR username LIKE ? OR ip_address LIKE ?)";
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
            $params[] = $term;
        }

        $whereClause = !empty($conditions) ? "WHERE " . implode(" AND ", $conditions) : "";

        // Общий подсчет
        $countStmt = $db->prepare("SELECT COUNT(*) as cnt FROM plan_system_logs $whereClause");
        $countStmt->execute($params);
        $totalCount = (int)$countStmt->fetchColumn();

        // Сводная статистика
        $statStmt = $db->query("SELECT level, COUNT(*) as cnt FROM plan_system_logs GROUP BY level");
        $statRows = $statStmt->fetchAll();
        $stats = ['total' => 0, 'error' => 0, 'warn' => 0, 'info' => 0];
        foreach ($statRows as $sr) {
            $lvl = strtoupper($sr['level']);
            $cnt = (int)$sr['cnt'];
            $stats['total'] += $cnt;
            if (strpos($lvl, 'ERROR') !== false || strpos($lvl, 'CRIT') !== false) {
                $stats['error'] += $cnt;
            } elseif (strpos($lvl, 'WARN') !== false) {
                $stats['warn'] += $cnt;
            } elseif (strpos($lvl, 'INFO') !== false) {
                $stats['info'] += $cnt;
            }
        }

        // Выборка записей
        $selectSql = "SELECT id, level, module, message, details, user_id, username, ip_address, created_at
            FROM plan_system_logs
            $whereClause
            ORDER BY id DESC
            LIMIT $limit OFFSET $offset";
        $selStmt = $db->prepare($selectSql);
        $selStmt->execute($params);
        $logs = $selStmt->fetchAll();

        echo json_encode([
            'logs' => $logs,
            'total' => $totalCount,
            'stats' => $stats,
            'retention_days' => getLogRetentionDays()
        ]);
        exit;
    }
}

// ----------------------------------------------------
// ЭНДПОИНТ: /logs/client_error (Прием JS-ошибок с фронтенда)
// ----------------------------------------------------
if ($route === '/logs/client_error' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = getOptionalAuthUser();
    $input = getJsonInput();
    $message = trim($input['message'] ?? 'Неизвестная ошибка фронтенда');
    $clientIp = getClientIp();

    logSystemEvent(
        'ERROR',
        'client',
        "Клиентская ошибка: $message",
        $input,
        $user ? $user['id'] : null,
        $user ? $user['username'] : 'anonymous',
        $clientIp
    );

    echo json_encode(['success' => true]);
    exit;
}


// ----------------------------------------------------
// ЭНДПОИНТ: /airports (Управление фильтром аэропортов вылета)
// ----------------------------------------------------
if ($route === '/airports') {
    $db = getDb();
    initAirportsTable($db);
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $db->query("SELECT code, city_name, is_enabled, is_custom, sort_order FROM plan_departure_airports ORDER BY sort_order ASC, code ASC");
        $rows = $stmt->fetchAll();
        $res = [];
        foreach ($rows as $r) {
            $res[] = [
                'code' => $r['code'],
                'city_name' => $r['city_name'],
                'is_enabled' => (bool)$r['is_enabled'],
                'is_custom' => (bool)$r['is_custom'],
                'sort_order' => (int)($r['sort_order'] ?? 0)
            ];
        }
        echo json_encode(['success' => true, 'airports' => $res]);
        exit;
    }

    if ($method === 'POST') {
        $input = getJsonInput();
        $airports = $input['airports'] ?? [];
        if (!empty($airports) && is_array($airports)) {
            $stmt = $db->prepare("INSERT INTO plan_departure_airports (code, city_name, is_enabled, is_custom, sort_order)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE city_name = VALUES(city_name), is_enabled = VALUES(is_enabled), is_custom = VALUES(is_custom), sort_order = VALUES(sort_order)");
            foreach ($airports as $idx => $item) {
                $code = strtoupper(trim($item['code'] ?? ''));
                $city = trim($item['city_name'] ?? '');
                $isEnabled = !empty($item['is_enabled']) ? 1 : 0;
                $isCustom = !empty($item['is_custom']) ? 1 : 0;
                $order = isset($item['sort_order']) ? (int)$item['sort_order'] : $idx;
                if ($code && $city) {
                    $stmt->execute([$code, $city, $isEnabled, $isCustom, $order]);
                }
            }
        }
        echo json_encode(['success' => true, 'message' => 'Список аэропортов успешно сохранен']);
        exit;
    }
}

if ($route === '/airports/save') {
    getAuthUser();
    $db = getDb();
    initAirportsTable($db);
    $input = getJsonInput();
    $airports = $input['airports'] ?? [];
    if (!empty($airports) && is_array($airports)) {
        $stmt = $db->prepare("INSERT INTO plan_departure_airports (code, city_name, is_enabled, is_custom, sort_order)
            VALUES (?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE city_name = VALUES(city_name), is_enabled = VALUES(is_enabled), is_custom = VALUES(is_custom), sort_order = VALUES(sort_order)");
        foreach ($airports as $idx => $item) {
            $code = strtoupper(trim($item['code'] ?? ''));
            $city = trim($item['city_name'] ?? '');
            $isEnabled = !empty($item['is_enabled']) ? 1 : 0;
            $isCustom = !empty($item['is_custom']) ? 1 : 0;
            $order = isset($item['sort_order']) ? (int)$item['sort_order'] : $idx;
            if ($code && $city) {
                $stmt->execute([$code, $city, $isEnabled, $isCustom, $order]);
            }
        }
    }
    echo json_encode(['success' => true, 'message' => 'Список аэропортов успешно сохранен']);
    exit;
}

if ($route === '/airports/delete') {
    getAuthUser();
    $db = getDb();
    initAirportsTable($db);
    $input = getJsonInput();
    $code = strtoupper(trim($input['code'] ?? ''));
    if ($code) {
        $del = $db->prepare("DELETE FROM plan_departure_airports WHERE code = ? AND is_custom = 1");
        $del->execute([$code]);
    }
    echo json_encode(['success' => true, 'message' => "Аэропорт $code удален"]);
    exit;
}

// Если маршрут не найден
http_response_code(404);
echo json_encode(['detail' => "Маршрут API не найден: $route"]);
