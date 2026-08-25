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
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
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
