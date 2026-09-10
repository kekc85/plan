/**
 * Универсальный API-клиент для AeroPlan W&B.
 * Автоматически поддерживает работу как локально, так и на хостинге https://boostandgo.ru/plan/
 */

// Базовый путь для API: локально '/api', на хостинге под подпутем window.location.pathname
function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // В локальном режиме разработки всегда используем /api
    if (window.location.port === '5173' || window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
      return '/api';
    }
    const path = window.location.pathname;
    if (path.includes('/plan_test')) {
      return '/plan_test/api';
    }
    if (path.includes('/plan')) {
      return '/plan/api';
    }
  }
  return '/api';
}

export const API_BASE = getApiBaseUrl();

function getAuthHeader() {
  const token = localStorage.getItem('aeroplan_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  // Защита от кэширования GET-запросов мобильными браузерами (Safari/Chrome на смартфонах)
  const isGet = !options.method || options.method.toUpperCase() === 'GET';
  const separator = endpoint.includes('?') ? '&' : '?';
  const finalEndpoint = isGet ? `${endpoint}${separator}_t=${Date.now()}` : endpoint;
  const url = `${API_BASE}${finalEndpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers
  });


  if (response.status === 401 && !endpoint.includes('/auth/login')) {
    // Токен истек или недействителен (для защищенных эндпоинтов)
    localStorage.removeItem('aeroplan_token');
    localStorage.removeItem('aeroplan_user');
    window.dispatchEvent(new CustomEvent('aeroplan_auth_expired'));
    throw new Error('Сессия завершена. Пожалуйста, выполните вход.');
  }

  if (!response.ok) {
    let errorDetail = 'Ошибка сетевого запроса';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// --- АВТОРИЗАЦИЯ ---

export async function authLogin(username, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
  if (data.token) {
    localStorage.setItem('aeroplan_token', data.token);
    localStorage.setItem('aeroplan_user', JSON.stringify(data.user));
  }
  return data;
}

export async function authGetMe() {
  return request('/auth/me');
}

export async function getActiveUsers() {
  return request('/users/active');
}

export async function authChangePassword(oldPassword, newPassword) {
  return request('/auth/change_password', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
  });
}

export function authLogout() {
  localStorage.removeItem('aeroplan_token');
  localStorage.removeItem('aeroplan_user');
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('aeroplan_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- АДМИНИСТРИРОВАНИЕ УЧЕТНЫХ ЗАПИСЕЙ ---

export async function adminListUsers() {
  return request('/admin/users');
}

export async function adminCreateUser(userData) {
  return request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export async function adminUpdateUser(userId, userData) {
  return request(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
}

export async function adminDeleteUser(userId) {
  return request(`/admin/users/${userId}`, {
    method: 'DELETE'
  });
}

// --- СИНХРОНИЗАЦИЯ СМЕНЫ И РЕЙСОВ ---

export async function fetchCurrentShift() {
  return request('/shift/current');
}

export async function saveShift(shiftInfo, flights) {
  return request('/shift/save', {
    method: 'POST',
    body: JSON.stringify({ shiftInfo, flights })
  });
}

export async function smartMergeSchedules(currentFlights, incomingFlights) {
  return request('/shift/smart_merge', {
    method: 'POST',
    body: JSON.stringify({
      current_flights: currentFlights,
      incoming_flights: incomingFlights
    })
  });
}

export async function handoverShift(handoverData) {
  return request('/shift/handover', {
    method: 'POST',
    body: JSON.stringify(handoverData)
  });
}

export async function fetchHandoverHistory() {
  return request('/shift/handovers');
}

// --- ПАРСЕР AVIABIT ---

export async function fetchAviaBitSchedule(params) {
  return request('/fetch_schedule', {
    method: 'POST',
    body: JSON.stringify(params)
  });
}

// --- УПРАВЛЕНИЕ АЭРОПОРТАМИ ВЫЛЕТА (ФИЛЬТР) ---

export async function fetchDepartureAirports() {
  return request('/airports');
}

export async function saveDepartureAirports(airportsList) {
  return request('/airports/save', {
    method: 'POST',
    body: JSON.stringify({ airports: airportsList })
  });
}

export async function deleteDepartureAirport(code) {
  return request('/airports/delete', {
    method: 'POST',
    body: JSON.stringify({ code })
  });
}

// --- АДМИНИСТРИРОВАНИЕ ЖУРНАЛА СИСТЕМНЫХ ЛОГОВ И ОШИБОК ---

export async function adminGetLogs(params = {}) {
  const query = new URLSearchParams();
  if (params.level) query.append('level', params.level);
  if (params.module) query.append('module', params.module);
  if (params.search) query.append('search', params.search);
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);
  const qStr = query.toString();
  return request(`/admin/logs${qStr ? `?${qStr}` : ''}`);
}

export async function adminGetLogSettings() {
  return request('/admin/logs/settings');
}

export async function adminUpdateLogSettings(retentionDays) {
  return request('/admin/logs/settings', {
    method: 'POST',
    body: JSON.stringify({ retention_days: retentionDays })
  });
}

export async function adminClearLogs(options = {}) {
  return request('/admin/logs/clear', {
    method: 'POST',
    body: JSON.stringify({
      clear_all: Boolean(options.clearAll),
      days: options.days
    })
  });
}

export async function sendClientErrorLog(errorData) {
  try {
    return await request('/logs/client_error', {
      method: 'POST',
      body: JSON.stringify(errorData)
    });
  } catch (e) {
    // Игнорируем сбои отправки отчета об ошибке
    return null;
  }
}

// Защита от спама повторными ошибками на клиенте
const reportedErrorSet = new Set();

export function initGlobalErrorLogging() {
  if (typeof window === 'undefined') return;

  window.onerror = (message, source, lineno, colno, error) => {
    const key = `${message}:${source}:${lineno}`;
    if (reportedErrorSet.has(key)) return;
    reportedErrorSet.add(key);
    setTimeout(() => reportedErrorSet.delete(key), 30000);

    sendClientErrorLog({
      message: String(message),
      source: String(source || ''),
      lineno: lineno || null,
      colno: colno || null,
      stack: error && error.stack ? String(error.stack) : '',
      url: window.location.href
    });
  };

  window.onunhandledrejection = (event) => {
    const reason = event.reason || 'Unhandled Promise Rejection';
    const message = reason.message || String(reason);
    const key = `rejection:${message}`;
    if (reportedErrorSet.has(key)) return;
    reportedErrorSet.add(key);
    setTimeout(() => reportedErrorSet.delete(key), 30000);

    sendClientErrorLog({
      message: `Unhandled Rejection: ${message}`,
      stack: reason.stack ? String(reason.stack) : '',
      url: window.location.href
    });
  };
}

// --- ИНТЕГРАЦИЯ С TELEGRAM-БОТОМ (АДМИНИСТРАТОР) ---

export async function adminGetTelegramSettings() {
  return request('/admin/telegram/settings');
}

export async function adminUpdateTelegramSettings(settings) {
  return request('/admin/telegram/settings', {
    method: 'POST',
    body: JSON.stringify(settings)
  });
}

export async function adminTestTelegram(testData = {}) {
  return request('/admin/telegram/test', {
    method: 'POST',
    body: JSON.stringify(testData)
  });
}

// --- ПОСМЕННЫЕ АРХИВЫ И СНИМКИ (АДМИНИСТРАТОР) ---

export async function adminGetArchives(params = {}) {
  const query = new URLSearchParams();
  if (params.limit) query.append('limit', params.limit);
  if (params.offset) query.append('offset', params.offset);
  const qStr = query.toString();
  return request(`/admin/archives${qStr ? `?${qStr}` : ''}`);
}

export async function adminGetArchiveDetail(archiveId) {
  return request(`/admin/archives/${archiveId}`);
}

export async function adminCreateArchive(archiveData) {
  return request('/admin/archives/create', {
    method: 'POST',
    body: JSON.stringify(archiveData)
  });
}

export async function adminDeleteArchive(archiveId) {
  return request(`/admin/archives/${archiveId}`, {
    method: 'DELETE'
  });
}

// --- ИСТОРИЯ ПРАВОК ПО РЕЙСАМ (FLIGHT AUDIT TRAIL) ---

export async function fetchFlightHistory(params = {}) {
  const query = new URLSearchParams();
  if (params.flightId) query.append('flight_id', params.flightId);
  if (params.flightNumber) query.append('flight_number', params.flightNumber);
  if (params.flightDate) query.append('flight_date', params.flightDate);
  if (params.limit) query.append('limit', params.limit);
  const qStr = query.toString();
  return request(`/flight/history${qStr ? `?${qStr}` : ''}`);
}

