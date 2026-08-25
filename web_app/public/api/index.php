<?php
/**
 * AeroPlan W&B - PHP Backend API для хостинга Beget
 * Обеспечивает мгновенную работу с базой данных MySQL (kekc8584_plan)
 * без необходимости настраивать сложные демоны Python на виртуальном хостинге.
 */

header('Content-Type: application/json; charset=utf-8');
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
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'kekc8584_plan');
define('DB_USER', 'kekc8584_plan');
define('DB_PASS', 'Y4vZI5p*0dmQ');
define('JWT_SECRET', 'aeroplan_wb_secret_beget_2026_andrey');

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
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['detail' => 'Ошибка подключения к MySQL: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

// ----------------------------------------------------
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ХЕШИРОВАНИЯ И JWT
// ----------------------------------------------------
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
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
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

function getJsonInput() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

// ----------------------------------------------------
// 3. МАРШРУТИЗАЦИЯ API
// ----------------------------------------------------
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Нормализуем путь: убираем /plan/api или /api
$route = $path;
if (preg_match('#/(?:plan/)?api/(.*)$#', $path, $m)) {
    $route = '/' . $m[1];
} elseif (preg_match('#^/api/(.*)$#', $path, $m)) {
    $route = '/' . $m[1];
}

// Убираем завершающий слэш
$route = rtrim($route, '/');
if ($route === '') $route = '/health';

// ----------------------------------------------------
// ЭНДПОИНТ: /health
// ----------------------------------------------------
if ($route === '/health' || $route === 'health') {
    echo json_encode([
        'status' => 'ok',
        'service' => 'AeroPlan W&B Beget API',
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

    if (!$user || !verifyPassword($password, $user['password_hash'], $user['salt'])) {
        http_response_code(401);
        echo json_encode(['detail' => 'Неверный логин или пароль']);
        exit;
    }

    if (!$user['is_active']) {
        http_response_code(403);
        echo json_encode(['detail' => 'Учетная запись отключена']);
        exit;
    }

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
// ЭНДПОИНТ: /shift/current
// ----------------------------------------------------
if ($route === '/shift/current') {
    $db = getDb();
    $stmt = $db->query("SELECT * FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1");
    $shift = $stmt->fetch();

    $shiftInfo = null;
    if ($shift) {
        $shiftInfo = [
            'id' => (int)$shift['id'],
            'date_interval' => $shift['date_interval'],
            'dispatcher' => $shift['dispatcher_name'],
            'status' => $shift['status']
        ];
    }

    $stmt = $db->query("SELECT * FROM plan_flights ORDER BY sort_order ASC, departure_time ASC");
    $rawFlights = $stmt->fetchAll();
    $flights = [];

    foreach ($rawFlights as $r) {
        $flights[] = [
            'id' => (string)$r['id'],
            'flight' => (string)($r['flight_number'] ?? ''),
            'flight_date' => (string)($r['flight_date'] ?? ''),
            'route_city' => (string)($r['route_city'] ?? ''),
            'route_airports' => (string)($r['route_airports'] ?? ''),
            'time' => (string)($r['departure_time'] ?? ''),
            'release_time' => (string)($r['release_time'] ?? ''),
            'ac_num' => (string)($r['ac_num'] ?? ''),
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
            'notes' => (string)($r['notes'] ?? '')
        ];
    }

    echo json_encode(['shiftInfo' => $shiftInfo, 'flights' => $flights]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /shift/save
// ----------------------------------------------------
if ($route === '/shift/save') {
    $input = getJsonInput();
    $shiftInfo = $input['shiftInfo'] ?? [];
    $flights = $input['flights'] ?? [];

    $dateInterval = $shiftInfo['date_interval'] ?? $shiftInfo['date'] ?? date('d.m.Y');
    $dispatcher = $shiftInfo['dispatcher'] ?? 'Диспетчер по центровке';
    $nowStr = date('Y-m-d H:i:s');

    $db = getDb();
    $db->beginTransaction();

    $stmt = $db->query("SELECT id FROM plan_shifts WHERE status = 'active' ORDER BY id DESC LIMIT 1");
    $activeShift = $stmt->fetch();

    if ($activeShift) {
        $shiftId = $activeShift['id'];
        $upd = $db->prepare("UPDATE plan_shifts SET date_interval = ?, dispatcher_name = ? WHERE id = ?");
        $upd->execute([$dateInterval, $dispatcher, $shiftId]);
    } else {
        $ins = $db->prepare("INSERT INTO plan_shifts (date_interval, dispatcher_name, started_at, status, created_at) VALUES (?, ?, ?, 'active', ?)");
        $ins->execute([$dateInterval, $dispatcher, $nowStr, $nowStr]);
        $shiftId = $db->lastInsertId();
    }

    $db->exec("DELETE FROM plan_flights");
    $insertFlight = $db->prepare("
        INSERT INTO plan_flights (
            id, shift_id, flight_number, flight_date, route_city, route_airports,
            departure_time, release_time, ac_num, ac_config, pax, crew,
            fuel_block, fuel_trip, fuel_taxi, dow, doi, galley, mtow,
            lir_sent, cargo, mail, baggage, szv_sent, ldm_sent, astra_times_sent,
            status, notes, sort_order, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?
        )
    ");

    foreach ($flights as $index => $f) {
        $insertFlight->execute([
            (string)$f['id'],
            $shiftId,
            (string)($f['flight'] ?? ''),
            (string)($f['flight_date'] ?? ''),
            (string)($f['route_city'] ?? ''),
            (string)($f['route_airports'] ?? ''),
            (string)($f['time'] ?? ''),
            (string)($f['release_time'] ?? ''),
            (string)($f['ac_num'] ?? ''),
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
            $index,
            $nowStr
        ]);
    }

    $db->commit();
    echo json_encode(['success' => true, 'saved_count' => count($flights)]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /shift/smart_merge
// ----------------------------------------------------
if ($route === '/shift/smart_merge') {
    $input = getJsonInput();
    $current = $input['current_flights'] ?? [];
    $incoming = $input['incoming_flights'] ?? [];

    $existingMap = [];
    foreach ($current as $f) {
        $key = strtoupper(trim($f['flight'] ?? '')) . '_' . trim($f['flight_date'] ?? '');
        $existingMap[$key] = $f;
    }

    $merged = [];
    $processed = [];

    foreach ($incoming as $inc) {
        $key = strtoupper(trim($inc['flight'] ?? '')) . '_' . trim($inc['flight_date'] ?? '');
        if (isset($existingMap[$key])) {
            $old = $existingMap[$key];
            $item = array_merge($inc, [
                'id' => $old['id'] ?? $inc['id'],
                'status' => $old['status'] ?? $inc['status'] ?? 'pending',
                'lir_sent' => !empty($old['lir_sent']),
                'szv_sent' => !empty($old['szv_sent']),
                'ldm_sent' => !empty($old['ldm_sent']),
                'astra_times_sent' => !empty($old['astra_times_sent']),
                'notes' => $old['notes'] ?? $inc['notes'] ?? ''
            ]);

            foreach (['fuel_block', 'fuel_trip', 'fuel_taxi', 'dow', 'doi', 'galley', 'mtow', 'cargo', 'mail', 'baggage', 'pax', 'crew'] as $field) {
                if (!empty($old[$field])) {
                    $item[$field] = $old[$field];
                }
            }
            $merged[] = $item;
            $processed[$key] = true;
        } else {
            $merged[] = $inc;
            $processed[$key] = true;
        }
    }

    foreach ($current as $f) {
        $key = strtoupper(trim($f['flight'] ?? '')) . '_' . trim($f['flight_date'] ?? '');
        if (!isset($processed[$key])) {
            $merged[] = $f;
        }
    }

    echo json_encode(['flights' => $merged, 'merged_count' => count($merged)]);
    exit;
}

// ----------------------------------------------------
// ЭНДПОИНТ: /shift/handover
// ----------------------------------------------------
if ($route === '/shift/handover') {
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
    $ins->execute([$handedOverBy, $acceptedBy, $nowStr, count($activeFlights), $summaryText, $notes]);

    $db->prepare("UPDATE plan_shifts SET dispatcher_name = ? WHERE status = 'active'")->execute([$acceptedBy]);

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

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $db->query("SELECT id, username, full_name, role, is_active, created_at FROM plan_users ORDER BY id ASC");
        echo json_encode(['users' => $stmt->fetchAll()]);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

        list($hash, $salt) = hashPassword($password);
        $ins = $db->prepare("INSERT INTO plan_users (username, password_hash, salt, full_name, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)");
        $ins->execute([$username, $hash, $salt, $fullName, $role, date('Y-m-d H:i:s')]);

        echo json_encode(['success' => true, 'message' => "Пользователь $username успешно создан"]);
        exit;
    }
}

// Если маршрут не найден
http_response_code(404);
echo json_encode(['detail' => "Маршрут API не найден: $route"]);
