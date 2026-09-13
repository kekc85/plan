/**
 * Утилиты для переключения часовых поясов МСК (UTC+3) и UTC (ZULU)
 * Вся внутренняя база данных и API хранят данные в каноническом Московском времени (МСК).
 * Данные функции обеспечивают прозрачное отображение и редактирование времени в режиме UTC.
 */

const pad = (n) => String(n).padStart(2, '0');

/**
 * Сдвиг времени на заданное количество часов (-3 для МСК->UTC, +3 для UTC->МСК)
 */
export function shiftTimeByHours(timeStr, hoursDelta = 0) {
  if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) {
    return timeStr || '';
  }

  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);

  if (isNaN(h) || isNaN(m)) {
    return timeStr;
  }

  let newH = (h + hoursDelta) % 24;
  if (newH < 0) newH += 24;

  return `${pad(newH)}:${pad(m)}`;
}

/**
 * Сдвиг даты на заданное количество дней (+1 или -1 при переходе через полночь)
 * Поддерживает форматы "ДД.ММ" и "ДД.ММ.ГГГГ"
 */
export function shiftDateByDays(dateStr, daysDelta = 0) {
  if (!dateStr || typeof dateStr !== 'string' || daysDelta === 0) {
    return dateStr || '';
  }

  const parts = dateStr.trim().split('.');
  if (parts.length < 2) return dateStr;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();

  if (isNaN(day) || isNaN(month)) return dateStr;

  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + daysDelta);

  const resDay = pad(d.getDate());
  const resMonth = pad(d.getMonth() + 1);

  if (parts.length >= 3) {
    return `${resDay}.${resMonth}.${d.getFullYear()}`;
  }
  return `${resDay}.${resMonth}`;
}

/**
 * Перевод времени и даты рейса из Московского (МСК) в UTC (-3 часа)
 */
export function convertMskToUtc(timeStr, dateStr = '') {
  if (!timeStr || !timeStr.includes(':')) {
    return { time: timeStr || '', date: dateStr || '' };
  }

  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);

  if (isNaN(h) || isNaN(m)) {
    return { time: timeStr, date: dateStr };
  }

  let newH = h - 3;
  let dayShift = 0;

  if (newH < 0) {
    newH += 24;
    dayShift = -1;
  }

  const resTime = `${pad(newH)}:${pad(m)}`;
  const resDate = dayShift !== 0 && dateStr ? shiftDateByDays(dateStr, dayShift) : dateStr;

  return { time: resTime, date: resDate };
}

/**
 * Перевод времени и даты рейса из UTC в Московское (МСК) (+3 часа)
 */
export function convertUtcToMsk(timeStr, dateStr = '') {
  if (!timeStr || !timeStr.includes(':')) {
    return { time: timeStr || '', date: dateStr || '' };
  }

  const parts = timeStr.trim().split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);

  if (isNaN(h) || isNaN(m)) {
    return { time: timeStr, date: dateStr };
  }

  let newH = h + 3;
  let dayShift = 0;

  if (newH >= 24) {
    newH -= 24;
    dayShift = 1;
  }

  const resTime = `${pad(newH)}:${pad(m)}`;
  const resDate = dayShift !== 0 && dateStr ? shiftDateByDays(dateStr, dayShift) : dateStr;

  return { time: resTime, date: resDate };
}

/**
 * Получение всех отображаемых временных полей рейса с учетом выбранного часового пояса
 */
export function getDisplayFlightTimes(flight, timeMode = 'MSK') {
  if (!flight) return {};

  if (timeMode !== 'UTC') {
    return {
      time: flight.time || '',
      release_time: flight.release_time || '',
      flight_date: flight.flight_date || '',
      outbound_takeoff_time: flight.outbound_takeoff_time || '',
      inbound_takeoff_time: flight.inbound_takeoff_time || '',
      inbound_landing_time: flight.inbound_landing_time || '',
      inbound_landing_calc: flight.inbound_landing_calc || ''
    };
  }

  const utcFlight = convertMskToUtc(flight.time || '', flight.flight_date || '');

  return {
    time: utcFlight.time,
    release_time: shiftTimeByHours(flight.release_time || '', -3),
    flight_date: utcFlight.date,
    outbound_takeoff_time: shiftTimeByHours(flight.outbound_takeoff_time || '', -3),
    inbound_takeoff_time: shiftTimeByHours(flight.inbound_takeoff_time || '', -3),
    inbound_landing_time: shiftTimeByHours(flight.inbound_landing_time || '', -3),
    inbound_landing_calc: shiftTimeByHours(flight.inbound_landing_calc || '', -3)
  };
}
