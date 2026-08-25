/**
 * Утилиты валидации и форматирования по маскам для электронного журнала центровки
 */

// Авто-маска и строгая валидация времени (ЧЧ:ММ) от 00:00 до 23:59
export function formatValidTime(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  
  if (digits.length === 1) {
    const d = parseInt(digits, 10);
    if (d > 2) return `0${d}:`;
    return digits;
  }
  
  let h = parseInt(digits.slice(0, 2), 10);
  if (h > 23) h = 23;
  const hStr = String(h).padStart(2, '0');

  if (digits.length === 2) {
    return raw.endsWith(':') ? `${hStr}:` : hStr;
  }

  if (digits.length === 3) {
    let m1 = parseInt(digits[2], 10);
    if (m1 > 5) m1 = 5;
    return `${hStr}:${m1}`;
  }

  let m = parseInt(digits.slice(2, 4), 10);
  if (m > 59) m = 59;
  const mStr = String(m).padStart(2, '0');

  return `${hStr}:${mStr}`;
}

// Расчет времени выпуска (по умолчанию за 40 минут до времени вылета)
export function calcReleaseTime(flightTime, offsetMinutes = 40) {
  if (!flightTime || !flightTime.includes(':')) return '';
  const parts = flightTime.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return '';

  let totalMins = h * 60 + m - offsetMinutes;
  if (totalMins < 0) totalMins += 24 * 60;

  const relH = Math.floor(totalMins / 60) % 24;
  const relM = totalMins % 60;

  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(relH)}:${pad(relM)}`;
}

// Авто-маска для ввода даты рейса (ДД.ММ, например при вводе 2608 -> 26.08)
export function formatValidDayMonth(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  
  if (digits.length === 1) {
    const d = parseInt(digits, 10);
    if (d > 3) return `0${d}.`;
    return digits;
  }
  
  let day = parseInt(digits.slice(0, 2), 10);
  if (day > 31) day = 31;
  if (day === 0) day = 1;
  const dayStr = String(day).padStart(2, '0');

  if (digits.length === 2) {
    return `${dayStr}.`;
  }

  if (digits.length === 3) {
    let m1 = parseInt(digits[2], 10);
    if (m1 > 1) m1 = 1;
    return `${dayStr}.${m1}`;
  }

  let month = parseInt(digits.slice(2, 4), 10);
  if (month > 12) month = 12;
  if (month === 0) month = 1;
  const monthStr = String(month).padStart(2, '0');

  return `${dayStr}.${monthStr}`;
}

// Авто-маска экипажа (Л/Б/И/П)
export function formatValidCrew(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length === 1) return digits[0];
  if (digits.length === 2) return `${digits[0]}/${digits[1]}`;
  if (digits.length === 3) return `${digits[0]}/${digits[1]}/${digits[2]}`;
  return `${digits[0]}/${digits[1]}/${digits[2]}/${digits[3]}`;
}

// Номер рейса: буквы префикса (N4, EO и т.д.) + до 5 цифр + до 1 буквы в конце
export function formatValidFlight(raw) {
  if (!raw) return '';
  return raw.toUpperCase().replace(/[^A-ZА-Я0-9]/g, '').slice(0, 8);
}

// Номер ВС: строго 5 цифр
export function formatValidAcNum(raw) {
  if (!raw) return '';
  return raw.replace(/\D/g, '').slice(0, 5);
}

// Компановка: цифры и слеш (максимум 7 символов)
export function formatValidAcConfig(raw) {
  if (!raw) return '';
  return raw.replace(/[^0-9\/]/g, '').slice(0, 7);
}

// MTOW: не более 6 цифр
export function formatValidMtow(raw) {
  if (!raw) return '';
  return raw.replace(/\D/g, '').slice(0, 6);
}

// Авто-маска даты и автоматический расчет суточного интервала (09:00 - 09:00)
export function formatValidDateInterval(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  
  if (digits.length >= 6) {
    let day = parseInt(digits.slice(0, 2), 10) || 1;
    if (day > 31) day = 31;
    if (day < 1) day = 1;

    let month = parseInt(digits.slice(2, 4), 10) || 1;
    if (month > 12) month = 12;
    if (month < 1) month = 1;

    let year = 2026;
    if (digits.length === 6) {
      const y2 = parseInt(digits.slice(4, 6), 10);
      year = 2000 + y2;
    } else if (digits.length >= 8) {
      year = parseInt(digits.slice(4, 8), 10) || 2026;
    }

    const d1 = new Date(year, month - 1, day);
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 1);

    const pad = (n) => String(n).padStart(2, '0');
    const s1 = `${pad(d1.getDate())}.${pad(d1.getMonth() + 1)}.${d1.getFullYear()}`;
    const s2 = `${pad(d2.getDate())}.${pad(d2.getMonth() + 1)}.${d2.getFullYear()}`;

    return `${s1} — ${s2}`;
  }

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

// Хронологическая сортировка рейсов по числу/дате и времени вылета (с учетом 24-часовой смены)
export function sortFlightsChronologically(flights, baseHour = 8) {
  if (!Array.isArray(flights)) return flights;
  return [...flights].sort((a, b) => {
    const getScore = (f) => {
      if (!f) return 99999999;
      const timeStr = f.time || '';
      if (!timeStr || !timeStr.includes(':')) return 99999999;

      const parts = timeStr.split(':').map(Number);
      const h = parts[0];
      const m = parts[1];
      if (isNaN(h) || isNaN(m)) return 99999999;

      // Если указано конкретное число/дата (например 25.08 или 26.08)
      let dayOffset = 0;
      const dStr = f.flight_date || f.date || '';
      if (dStr && dStr.includes('.')) {
        const dParts = dStr.split('.').map(Number);
        const day = dParts[0];
        const month = dParts[1];
        if (!isNaN(day) && !isNaN(month)) {
          dayOffset = (month * 32 + day) * 1440;
        }
      } else if (dStr) {
        const dayMatch = dStr.match(/\b(\d{1,2})\b/);
        if (dayMatch) {
          dayOffset = parseInt(dayMatch[1], 10) * 1440;
        }
      } else {
        const adjustedHour = (h < baseHour) ? (h + 24) : h;
        return adjustedHour * 60 + m;
      }

      return dayOffset + (h * 60 + m);
    };
    return getScore(a) - getScore(b);
  });
}

// Определение, просрочено ли время выпуска рейса (действие не выполнено)
export function isFlightReleaseOverdue(flight) {
  if (!flight) return false;
  // Если рейс уже выпущен или закрыт или отправлен СЗВ/LDM - не просрочен
  if (flight.status === 'released' || flight.status === 'closed' || flight.szv_sent || flight.ldm_sent) {
    return false;
  }
  const relTime = flight.release_time || '';
  if (!relTime || !relTime.includes(':')) return false;

  const parts = relTime.split(':').map(Number);
  const rH = parts[0];
  const rM = parts[1];
  if (isNaN(rH) || isNaN(rM)) return false;

  const now = new Date();
  let mskNow = now;
  try {
    const mskStr = now.toLocaleString("en-US", { timeZone: "Europe/Moscow" });
    mskNow = new Date(mskStr);
  } catch (e) {}

  const currentDay = mskNow.getDate();
  const currentMonth = mskNow.getMonth() + 1;
  const currentTotalMins = mskNow.getHours() * 60 + mskNow.getMinutes();

  // Если у рейса указана дата (например 25.08)
  const dStr = flight.flight_date || flight.date || '';
  if (dStr && dStr.includes('.')) {
    const dParts = dStr.split('.').map(Number);
    const fDay = dParts[0];
    const fMonth = dParts[1];
    if (!isNaN(fDay) && !isNaN(fMonth)) {
      if (fMonth < currentMonth || (fMonth === currentMonth && fDay < currentDay)) {
        return true; // Прошедшая дата
      }
      if (fMonth > currentMonth || (fMonth === currentMonth && fDay > currentDay)) {
        return false; // Будущая дата
      }
      return currentTotalMins >= (rH * 60 + rM);
    }
  }

  // Если дата не указана (в рамках суточной смены 09:00 - 09:00, база 8:00)
  const releaseMins = rH * 60 + rM;
  const normNow = (currentTotalMins - 8 * 60 + 1440) % 1440;
  const normRel = (releaseMins - 8 * 60 + 1440) % 1440;

  return normNow >= normRel;
}

// Проверка, вылетает ли рейс из Оренбурга (REN)
export function isRenDeparture(flight) {
  if (!flight) return false;
  const routeAirports = (flight.route_airports || '').toUpperCase();
  const routeCity = (flight.route_city || '').toUpperCase();
  const dep = (flight.dep_airport || '').toUpperCase();
  const origin = (flight.origin || '').toUpperCase();

  if (dep === 'REN' || origin === 'REN') return true;
  if (routeAirports.startsWith('REN') || routeAirports.startsWith('UWSG')) return true;
  if (routeCity.includes('ОРЕНБУРГ') || routeCity.startsWith('REN')) return true;

  return false;
}



