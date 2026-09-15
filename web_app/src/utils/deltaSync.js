/**
 * deltaSync.js
 * Интеллектуальный модуль дельта-синхронизации суточного плана с AviaBit.
 * Выявляет изменения в расписании (время, борт, тип ВС, PAX, экипаж, груз, почта),
 * сохраняет ручную работу диспетчера и формирует структуру unread_changes
 * для визуальной подсветки до явного подтверждения диспетчером.
 */

// Поля, которые контролируются и обновляются из AviaBit
export const TRACKED_AVIABIT_FIELDS = [
  'time',
  'flight_date',
  'release_time',
  'ac_num',
  'ac_type',
  'ac_config',
  'pax',
  'crew',
  'cargo',
  'mail',
  'route_city',
  'route_airports'
];

// Русские наименования полей для отображения в подсказках диспетчеру
export const FIELD_LABELS = {
  time: 'Время вылета',
  flight_date: 'Дата рейса',
  release_time: 'Время выпуска',
  ac_num: 'Номер борта',
  ac_type: 'Тип ВС',
  ac_config: 'Компоновка',
  pax: 'Пассажиры (PAX)',
  crew: 'Экипаж',
  cargo: 'Груз (FBL/UWS)',
  mail: 'Почта',
  route_city: 'Город назначения',
  route_airports: 'Аэропорты маршрута',
  _is_new: 'Новый рейс в расписании'
};

/**
 * Нормализация значения для корректного сравнения (исключение ложных срабатываний из-за пробелов или типов)
 */
function normalizeVal(val) {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Нормализация номера рейса (убираем пробелы, дефисы, русские буквы -> латиница, E0 -> EO)
 */
export function normalizeFlightNumber(fl) {
  if (!fl) return '';
  let s = String(fl).toUpperCase().replace(/[-\s]/g, '');
  // Замена похожих русских букв на латинские
  const cyrToLat = {
    'А': 'A', 'В': 'B', 'Е': 'E', 'К': 'K', 'М': 'M',
    'Н': 'N', 'О': 'O', 'Р': 'R', 'С': 'C', 'Т': 'T',
    'У': 'Y', 'Х': 'X'
  };
  s = s.replace(/[АВЕКМНОРСТУХ]/g, m => cyrToLat[m] || m);
  // Замена E0 -> EO (частая путаница нуля и буквы O в коде Икар EO)
  s = s.replace(/^E0/, 'EO');
  return s;
}

/**
 * Нормализация даты рейса (приведение ДД.ММ, ДД.ММ.ГГГГ или ГГГГ-ММ-ДД к ДД.ММ)
 */
export function normalizeFlightDate(d) {
  if (!d) return '';
  const s = String(d).trim();
  if (s.includes('-')) {
    const parts = s.split('-');
    if (parts[0].length === 4 && parts.length >= 3) {
      // YYYY-MM-DD -> DD.MM
      return `${parts[2].padStart(2, '0')}.${parts[1].padStart(2, '0')}`;
    }
    if (parts[2]?.length === 4) {
      // DD-MM-YYYY -> DD.MM
      return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}`;
    }
  }
  const parts = s.split('.');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}.${parts[1].padStart(2, '0')}`;
  }
  return s;
}

/**
 * Очистка номера рейса для сопоставления
 */
export function getFlightKey(flight) {
  if (!flight) return '';
  const flNum = normalizeFlightNumber(flight.flight || flight.flight_no || flight.flight_number || '');
  const flDate = normalizeFlightDate(flight.flight_date);
  return flDate ? `${flNum}_${flDate}` : flNum;
}

/**
 * Генерация вариантов ключей ДЛЯ УДАЛЕНИЯ (строго с датой рейса)
 * Чтобы удаление рейса N4-123 за 16.09 никогда не блокировало рейс N4-123 за 17.09
 */
export function getDeletionKeyVariants(flight) {
  if (!flight) return [];
  const rawFlight = flight.flight || flight.flight_no || flight.flight_number || '';
  const normFlight = normalizeFlightNumber(rawFlight);
  const normDate = normalizeFlightDate(flight.flight_date || flight.date);
  const digitsOnly = normFlight.replace(/\D/g, '');

  if (!normDate) {
    return [];
  }

  const variants = new Set();
  if (normFlight && normDate) {
    variants.add(`${normFlight}_${normDate}`);
  }
  if (digitsOnly && normDate) {
    variants.add(`NUM_${digitsOnly}_${normDate}`);
    variants.add(`${digitsOnly}_${normDate}`);
  }
  if (rawFlight && normDate) {
    const rawClean = String(rawFlight).replace(/[-\s]/g, '').toUpperCase();
    variants.add(`${rawClean}_${normDate}`);
  }

  return Array.from(variants);
}

/**
 * Проверка попадания рейса во временной интервал смены (по дате и времени вылета)
 * @param {Object} flight - рейс с полями flight_date и time
 * @param {string} dateFromStr - дата начала "ДД.ММ" или "ДД.ММ.ГГГГ"
 * @param {string} timeFromStr - время начала "ЧЧ:ММ" (по умолчанию "08:00")
 * @param {string} dateToStr - дата окончания "ДД.ММ" или "ДД.ММ.ГГГГ"
 * @param {string} timeToStr - время окончания "ЧЧ:ММ" (по умолчанию "14:00")
 * @returns {boolean} true если рейс попадает в диапазон
 */
export function isFlightInShiftInterval(flight, dateFromStr, timeFromStr = '08:00', dateToStr, timeToStr = '14:00') {
  if (!flight) return false;
  const flDate = normalizeFlightDate(flight.flight_date || flight.date);
  const flTime = flight.time || '';
  if (!flDate || !flTime || !flTime.includes(':')) return false;

  const parseDateParts = (dStr) => {
    if (!dStr) return null;
    const parts = dStr.split('.');
    if (parts.length < 2) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parts[2] ? parseInt(parts[2], 10) : new Date().getFullYear();
    if (isNaN(day) || isNaN(month)) return null;
    return { day, month, year };
  };

  const parseTimeParts = (tStr) => {
    if (!tStr || !tStr.includes(':')) return { h: 0, m: 0 };
    const parts = tStr.split(':');
    return { h: parseInt(parts[0], 10) || 0, m: parseInt(parts[1], 10) || 0 };
  };

  const pFrom = parseDateParts(dateFromStr);
  const pTo = parseDateParts(dateToStr);
  const pFl = parseDateParts(flDate);
  if (!pFrom || !pTo || !pFl) return false;

  const tFrom = parseTimeParts(timeFromStr);
  const tTo = parseTimeParts(timeToStr);
  const tFl = parseTimeParts(flTime);

  const baseYear = pFrom.year || pTo.year || new Date().getFullYear();
  let flYear = baseYear;
  // Обработка перехода через Новый год: если смена декабрь-январь
  if (pFrom.month === 12 && pTo.month === 1 && pFl.month === 1) {
    flYear = baseYear + 1;
  }

  const startTs = new Date(pFrom.year, pFrom.month - 1, pFrom.day, tFrom.h, tFrom.m, 0, 0).getTime();
  const endTs = new Date(pTo.year, pTo.month - 1, pTo.day, tTo.h, tTo.m, 59, 999).getTime();
  const flTs = new Date(flYear, pFl.month - 1, pFl.day, tFl.h, tFl.m, 0, 0).getTime();

  return flTs >= startTs && flTs <= endTs;
}

/**
 * Генерация всех возможных вариантов ключей рейса для гарантированного сопоставления
 */
export function getFlightKeyVariants(flight) {
  if (!flight) return [];
  const rawFlight = flight.flight || flight.flight_no || flight.flight_number || '';
  const normFlight = normalizeFlightNumber(rawFlight);
  const normDate = normalizeFlightDate(flight.flight_date || flight.date);
  const digitsOnly = normFlight.replace(/\D/g, '');

  const variants = new Set();
  if (normFlight && normDate) variants.add(`${normFlight}_${normDate}`);
  if (normFlight) variants.add(normFlight);
  if (digitsOnly && normDate) variants.add(`NUM_${digitsOnly}_${normDate}`);
  if (digitsOnly) variants.add(`NUM_${digitsOnly}`);
  if (rawFlight) {
    const rawClean = String(rawFlight).replace(/[-\s]/g, '').toUpperCase();
    variants.add(rawClean);
    if (normDate) variants.add(`${rawClean}_${normDate}`);
  }

  return Array.from(variants);
}

/**
 * Сравнение двух версий одного рейса и выявление изменений
 * @param {Object} oldFlight - текущая версия рейса в плане
 * @param {Object} incomingFlight - свежие данные из AviaBit
 * @returns {Object} объект изменений { [fieldName]: { old, new, ts } }
 */
export function detectFlightChanges(oldFlight, incomingFlight) {
  const changes = {};
  if (!oldFlight || !incomingFlight) return changes;

  const existingUnread = oldFlight.unread_changes || {};

  TRACKED_AVIABIT_FIELDS.forEach(field => {
    // Если экипаж был изменен диспетчером вручную, не детектируем изменения из AviaBit
    if (field === 'crew' && oldFlight.crew_manual) {
      return;
    }

    const oldVal = normalizeVal(oldFlight[field]);
    const newVal = normalizeVal(incomingFlight[field]);

    // Если значение изменилось в новом ответе AviaBit
    if (newVal !== '' && oldVal !== newVal) {
      // Если по этому полю уже висела неподтвержденная подсветка, сохраняем исходное старое значение
      const prevOld = existingUnread[field]?.old !== undefined ? existingUnread[field].old : oldVal;
      changes[field] = {
        old: prevOld || '—',
        new: newVal,
        ts: Date.now()
      };
    } else if (existingUnread[field]) {
      // Если значение совпадает с текущим, но у диспетчера висит неподтвержденное старое изменение,
      // сохраняем его пока диспетчер не нажмет подтверждение
      changes[field] = existingUnread[field];
    }
  });

  return changes;
}

/**
 * Умное слияние входящего расписания с текущим суточным планом
 * @param {Array} currentFlights - текущие рейсы в журнале диспетчера
 * @param {Array} incomingFlights - свежие рейсы из AviaBit
 * @param {Object} options - дополнительные опции слияния { deletedFlightKeys: [], ignoreDeleted: false, targetInterval: null }
 * @returns {{ mergedFlights: Array, totalNewChanges: number, newFlightsCount: number }}
 */
export function smartMergeWithDelta(currentFlights = [], incomingFlights = [], options = {}) {
  const { deletedFlightKeys = [], ignoreDeleted = false, targetInterval = null } = options;
  const deletedSet = new Set();

  if (!ignoreDeleted) {
    (Array.isArray(deletedFlightKeys) ? deletedFlightKeys : []).forEach(k => {
      if (!k) return;
      const strK = String(k).trim().toUpperCase();
      // Ключ удаления ОБЯЗАН содержать дату (разделитель '_'), чтобы не отсекать рейсы других суток
      if (!strK.includes('_')) return;

      deletedSet.add(strK);
      deletedSet.add(strK.replace(/[-\s]/g, ''));
      const parts = strK.split('_');
      if (parts.length >= 2) {
        const normNum = normalizeFlightNumber(parts[0]);
        const normD = normalizeFlightDate(parts[1]);
        if (normNum && normD) {
          deletedSet.add(`${normNum}_${normD}`);
        }
        const digits = parts[0].replace(/\D/g, '');
        if (digits && normD) {
          deletedSet.add(`NUM_${digits}_${normD}`);
          deletedSet.add(`${digits}_${normD}`);
        }
      }
    });
  }

  const existingMap = new Map();
  const existingByDigits = new Map();
  const existingByFlightNum = new Map();
  const existingFlightNumCounts = new Map();

  currentFlights.forEach(f => {
    if (!f) return;
    const key = getFlightKey(f);
    if (key) existingMap.set(key, f);
    const flNum = normalizeFlightNumber(f.flight || f.flight_no || f.flight_number || '');
    const digits = flNum.replace(/\D/g, '');
    const flDate = normalizeFlightDate(f.flight_date);
    if (digits && flDate) {
      existingByDigits.set(`${digits}_${flDate}`, f);
    }
    if (flNum) {
      existingFlightNumCounts.set(flNum, (existingFlightNumCounts.get(flNum) || 0) + 1);
      existingByFlightNum.set(flNum, f);
    }
  });

  let totalNewChanges = 0;
  let newFlightsCount = 0;

  const mergedFlights = [];
  const matchedOldIds = new Set();

  for (const inc of incomingFlights) {
    const key = getFlightKey(inc);
    const flNum = normalizeFlightNumber(inc.flight || inc.flight_no || inc.flight_number || '');
    const digits = flNum.replace(/\D/g, '');
    const flDate = normalizeFlightDate(inc.flight_date);

    // Строгое сопоставление по номеру рейса и дате (исключает ошибочную склейку рейсов за разные даты)
    let old = existingMap.get(key) || (digits && flDate ? existingByDigits.get(`${digits}_${flDate}`) : null);

    // Если дата не была задана у одного из рейсов, но номер рейса уникален среди текущих
    if (!old && flNum && existingFlightNumCounts.get(flNum) === 1) {
      const candidate = existingByFlightNum.get(flNum);
      const candDate = normalizeFlightDate(candidate?.flight_date);
      if (!candDate || !flDate || candDate === flDate) {
        old = candidate;
      }
    }

    if (!old) {
      // Проверяем: был ли этот рейс удален диспетчером в этой смене? (только если не ignoreDeleted)
      if (!ignoreDeleted && deletedSet.size > 0) {
        const incDeletionKeys = getDeletionKeyVariants(inc);
        const isDeleted = incDeletionKeys.some(v => deletedSet.has(v));
        if (isDeleted) {
          // Пропускаем удаленный рейс — не подкачиваем его обратно при фоновой авто-сверке
          continue;
        }
      }

      // Совершенно новый рейс, добавленный в расписание AviaBit
      newFlightsCount++;
      const flightId = inc.id || `flight_${flNum || 'fl'}_${flDate || ''}_${(inc.time || '').replace(':', '')}_${Math.random().toString(36).substr(2, 6)}`;
      mergedFlights.push({
        ...inc,
        id: flightId,
        is_new_flight: true,
        unread_changes: {
          _is_new: { old: null, new: true, ts: Date.now() }
        }
      });
      continue;
    }

    if (old && old.id) {
      matchedOldIds.add(old.id);
    }

    // Выявляем изменившиеся оперативные параметры
    const changes = detectFlightChanges(old, inc);
    const newChangesCountForFlight = Object.keys(changes).filter(k => !old.unread_changes?.[k]).length;
    totalNewChanges += newChangesCountForFlight;

    const merged = { ...inc };

    // 1. Сохраняем идентификатор
    merged.id = old.id || inc.id || `flight_${flNum || 'fl'}_${flDate || ''}_${(inc.time || '').replace(':', '')}_${Math.random().toString(36).substr(2, 6)}`;

    // 2. Строго сохраняем ручные поля диспетчера центровки
    const manualFields = [
      'fuel_block',
      'fuel_trip',
      'fuel_taxi',
      'dow',
      'doi',
      'galley',
      'mtow',
      'baggage',
      'notes'
    ];

    manualFields.forEach(field => {
      if (old[field] !== undefined && old[field] !== '') {
        merged[field] = old[field];
      }
    });

    // 2.1. Если экипаж был введен/изменен вручную диспетчером — сохраняем его и не перезаписываем из AviaBit
    if (old.crew_manual) {
      merged.crew = old.crew;
      merged.crew_manual = true;
    }

    // 3. Сохраняем чекбоксы технологического графика
    if (old.lir_sent !== undefined) merged.lir_sent = old.lir_sent;
    if (old.szv_sent !== undefined) merged.szv_sent = old.szv_sent;
    if (old.ldm_sent !== undefined) merged.ldm_sent = old.ldm_sent;
    if (old.astra_times_sent !== undefined) merged.astra_times_sent = old.astra_times_sent;

    // 4. Сохраняем статус рейса (включая closed)
    if (old.status) {
      merged.status = old.status;
    } else {
      merged.status = inc.status || 'pending';
    }

    // 5. Прикрепляем неподтвержденные изменения
    if (Object.keys(changes).length > 0) {
      merged.unread_changes = changes;
    } else if (old.unread_changes && Object.keys(old.unread_changes).length > 0) {
      merged.unread_changes = old.unread_changes;
    } else {
      delete merged.unread_changes;
    }

    if (old.is_new_flight) {
      merged.is_new_flight = true;
    }

    mergedFlights.push(merged);
  }

  // Сохраняем все рейсы из текущего плана, которых не было в новом ответе AviaBit
  // (например, добавленные вручную диспетчером или переходящие рейсы)
  currentFlights.forEach(f => {
    if (!f || !f.id) return;
    if (!matchedOldIds.has(f.id)) {
      if (!ignoreDeleted && deletedSet.size > 0) {
        const fDeletionKeys = getDeletionKeyVariants(f);
        const isDeleted = fDeletionKeys.some(v => deletedSet.has(v));
        if (isDeleted) return;
      }

      // Если задан целевой интервал новой смены (targetInterval):
      // не тянем закрытые рейсы предыдущей смены, не входящие в новый интервал
      if (targetInterval && targetInterval.dateFrom && targetInterval.dateTo) {
        const inInterval = isFlightInShiftInterval(
          f,
          targetInterval.dateFrom,
          targetInterval.timeFrom || '08:00',
          targetInterval.dateTo,
          targetInterval.timeTo || '14:00'
        );
        if (!inInterval && f.status === 'closed') {
          return;
        }
      }

      mergedFlights.push(f);
    }
  });

  return {
    mergedFlights,
    totalNewChanges,
    newFlightsCount
  };
}

/**
 * Безопасное извлечение объекта unread_changes
 */
export function getSafeUnreadChanges(flight) {
  if (!flight || !flight.unread_changes) return {};
  let unread = flight.unread_changes;
  if (typeof unread === 'string') {
    try {
      unread = JSON.parse(unread);
    } catch {
      return {};
    }
  }
  return (unread && typeof unread === 'object') ? unread : {};
}

/**
 * Подтверждение ознакомления с отдельным измененным полем рейса.
 * Если все видимые изменения в строке прокликаны, полностью удаляет unread_changes и is_new_flight.
 */
export function acknowledgeFieldChange(flight, fieldName) {
  if (!flight) return flight;

  const unread = getSafeUnreadChanges(flight);
  const updatedUnread = { ...unread };

  delete updatedUnread[fieldName];
  // Время выпуска release_time связано со временем вылета time
  if (fieldName === 'time') {
    delete updatedUnread['release_time'];
  }

  // Проверяем, остались ли еще какие-либо видимые изменения в рейсе
  const remainingVisibleKeys = Object.keys(updatedUnread).filter(
    k => TRACKED_AVIABIT_FIELDS.includes(k) && k !== 'release_time'
  );

  const updatedFlight = { ...flight };

  // Если видимых изменений больше нет (или прокликано последнее), полностью очищаем статус новизны и подсветку
  if (remainingVisibleKeys.length === 0) {
    delete updatedFlight.unread_changes;
    delete updatedFlight.is_new_flight;
  } else {
    updatedFlight.unread_changes = updatedUnread;
    if (fieldName === '_is_new') {
      delete updatedFlight.is_new_flight;
    }
  }

  return updatedFlight;
}

/**
 * Подтверждение ознакомления со ВСЕМИ изменениями конкретного рейса
 */
export function acknowledgeFlightChanges(flight) {
  if (!flight) return flight;
  const updatedFlight = { ...flight };
  delete updatedFlight.unread_changes;
  delete updatedFlight.is_new_flight;
  return updatedFlight;
}

/**
 * Подтверждение ознакомления со ВСЕМИ изменениями суточного плана
 */
export function acknowledgeAllChanges(flights = []) {
  return flights.map(acknowledgeFlightChanges);
}

/**
 * Подсчет общего количества неподтвержденных изменений во всех рейсах
 */
export function countUnreadChanges(flights = []) {
  if (!Array.isArray(flights)) return 0;
  return flights.reduce((sum, f) => {
    const unread = getSafeUnreadChanges(f);
    const visibleCount = Object.keys(unread).filter(
      k => (TRACKED_AVIABIT_FIELDS.includes(k) && k !== 'release_time') || k === '_is_new'
    ).length;
    return sum + visibleCount;
  }, 0);
}
