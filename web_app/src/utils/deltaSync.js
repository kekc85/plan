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
 * Очистка номера рейса для сопоставления (убираем пробелы, дефисы, приводим к верхнему регистру)
 */
export function getFlightKey(flight) {
  if (!flight) return '';
  const flNum = (flight.flight || '').replace(/[-\s]/g, '').toUpperCase();
  const flDate = (flight.flight_date || '').trim();
  return `${flNum}_${flDate}`;
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
 * @returns {{ mergedFlights: Array, totalNewChanges: number, newFlightsCount: number }}
 */
export function smartMergeWithDelta(currentFlights = [], incomingFlights = []) {
  const existingMap = new Map();
  currentFlights.forEach(f => {
    const key = getFlightKey(f);
    if (key) existingMap.set(key, f);
  });

  let totalNewChanges = 0;
  let newFlightsCount = 0;

  const mergedFlights = incomingFlights.map(inc => {
    const key = getFlightKey(inc);
    const old = existingMap.get(key);

    if (!old) {
      // Совершенно новый рейс, добавленный в расписание AviaBit
      newFlightsCount++;
      return {
        ...inc,
        is_new_flight: true,
        unread_changes: {
          _is_new: { old: null, new: true, ts: Date.now() }
        }
      };
    }

    // Выявляем изменившиеся оперативные параметры
    const changes = detectFlightChanges(old, inc);
    const newChangesCountForFlight = Object.keys(changes).filter(k => !old.unread_changes?.[k]).length;
    totalNewChanges += newChangesCountForFlight;

    const merged = { ...inc };

    // 1. Сохраняем идентификатор
    if (old.id) merged.id = old.id;

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

    let hasManualWork = false;
    manualFields.forEach(field => {
      if (old[field] !== undefined && old[field] !== '') {
        merged[field] = old[field];
        hasManualWork = true;
      }
    });

    // 3. Сохраняем чекбоксы технологического графика
    if (old.lir_sent !== undefined) merged.lir_sent = old.lir_sent;
    if (old.szv_sent !== undefined) merged.szv_sent = old.szv_sent;
    if (old.ldm_sent !== undefined) merged.ldm_sent = old.ldm_sent;
    if (old.astra_times_sent !== undefined) merged.astra_times_sent = old.astra_times_sent;

    // 4. Сохраняем статус рейса
    if (['closed', 'released', 'lir_sent'].includes(old.status)) {
      merged.status = old.status;
    } else if (old.status === 'prepared' && (hasManualWork || (old.notes && old.notes.trim()))) {
      merged.status = 'prepared';
    } else {
      merged.status = old.status || 'pending';
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

    return merged;
  });

  return {
    mergedFlights,
    totalNewChanges,
    newFlightsCount
  };
}

/**
 * Подтверждение ознакомления с отдельным измененным полем рейса
 */
export function acknowledgeFieldChange(flight, fieldName) {
  if (!flight || !flight.unread_changes) return flight;

  const updatedUnread = { ...flight.unread_changes };
  delete updatedUnread[fieldName];

  const updatedFlight = { ...flight };
  if (Object.keys(updatedUnread).length === 0) {
    delete updatedFlight.unread_changes;
    delete updatedFlight.is_new_flight;
  } else {
    updatedFlight.unread_changes = updatedUnread;
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
    if (!f.unread_changes) return sum;
    return sum + Object.keys(f.unread_changes).length;
  }, 0);
}
