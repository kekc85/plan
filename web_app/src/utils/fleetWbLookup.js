/**
 * Утилита автоматического определения DOW (Dry Operating Weight) и DOI (Dry Operating Index)
 * по официальным центровочным графикам (Weight & Balance Manual / Fleet Registry).
 * 
 * База данных сформирована напрямую из официальных PDF-документов авиакомпаний Nordwind (N4) и Икар (EO).
 * 
 * Особенность мокрого лизинга (Wet-lease):
 * Для бортов RA-73343 и RA-73344 действуют две разные центровочные матрицы в зависимости от перевозчика:
 *  - Рейсы N4 / NWS / Nordwind -> матрица WBR N4
 *  - Рейсы EO / KAR / Ikar     -> матрица WBR EO
 */

import fleetWbData from '../data/fleet_wb.json' with { type: 'json' };

export { fleetWbData };

/**
 * Извлечение чистого номера борта (5 цифр без префикса RA- и пробелов)
 * @param {string} val 
 * @returns {string} Например '73343', '73271', '02740'
 */
export function normalizeTailNumber(val) {
  if (!val) return '';
  const s = String(val).toUpperCase().trim();
  // Убираем RA-, RA, русское РА
  const clean = s.replace(/^(RA|РА)[-\s]?/i, '').replace(/\D/g, '');
  return clean;
}

/**
 * Определение кода авиакомпании/оператора рейса (N4 или EO)
 * @param {Object} flight 
 * @returns {'N4' | 'EO' | ''}
 */
export function detectFlightOperator(flight = {}) {
  const flightStr = String(flight.flight || flight.flight_no || flight.flight_number || '').toUpperCase().trim();
  
  // Явная проверка по префиксу рейса (латиница и кириллица)
  if (/^(EO|KAR|ИК|ЕО)/i.test(flightStr)) return 'EO';
  if (/^(N4|NWS|СВ|Н4)/i.test(flightStr)) return 'N4';
  
  // Проверка по явному полю operator авиакомпании
  if (flight.operator) {
    const op = String(flight.operator).toUpperCase().trim();
    if (op === 'EO' || op === 'KAR' || op === 'IKAR' || op === 'ИКАР') return 'EO';
    if (op === 'N4' || op === 'NWS' || op === 'NORDWIND' || op === 'СЕВЕРНЫЙ ВЕТЕР') return 'N4';
  }

  return '';
}

/**
 * Нормализация кода экипажа в формат 'X/Y' (например '2/5', '3/6', '2/0')
 * @param {string} val 
 * @returns {string}
 */
export function normalizeCrewCode(val) {
  if (!val) return '';
  const parts = String(val).split(/[\/\-\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parseInt(parts[0], 10)}/${parseInt(parts[1], 10)}`;
  }
  if (parts.length === 1 && !isNaN(parseInt(parts[0], 10))) {
    return `${parseInt(parts[0], 10)}/0`;
  }
  return '';
}

/**
 * Поиск конфигурационного ключа ВС в базе fleet_wb
 * @param {string} tail Чистый номер борта (5 цифр)
 * @param {'N4' | 'EO' | ''} operator 
 * @param {Object} options Дополнительные параметры (например flyKit)
 * @returns {string|null} Ключ в fleetWbData, например '73343_N4', '73343_EO', '73271_N4'
 */
export function resolveFleetConfigKey(tail, operator = '', options = {}) {
  if (!tail) return null;

  // 1. Прямая проверка с известным оператором
  if (operator) {
    const directKey = `${tail}_${operator}`;
    if (fleetWbData[directKey]) return directKey;

    // Для широкофюзеляжных с FAK (Fly-Away Kit)
    const fakSuffix = options.flyKit === false ? '_NO_FAK' : '_FAK_2AKE';
    const fakKey = `${tail}_${operator}${fakSuffix}`;
    if (fleetWbData[fakKey]) return fakKey;
  }

  // 2. Поиск среди всех ключей, начинающихся на этот борт
  const candidates = Object.keys(fleetWbData).filter(k => k.startsWith(`${tail}_`));
  if (candidates.length === 0) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  // 3. Если кандидатов несколько (например RA-73343 и RA-73344 в лизинге N4/EO)
  if (operator) {
    const match = candidates.find(k => k.includes(`_${operator}`));
    if (match) return match;
  }

  // По умолчанию для мокрого лизинга 73343/73344 приоритет N4 (Nordwind)
  const defaultN4 = candidates.find(k => k.includes('_N4'));
  if (defaultN4) return defaultN4;

  return candidates[0];
}

/**
 * Автоматический расчет/поиск DOW и DOI для рейса
 * 
 * @param {Object} flight Объект рейса из AeroPlan
 * @param {Object} options Опции (forceOperator, defaultPantry, flyKit)
 * @returns {Object} Результат поиска с полями dow, doi, model, revision
 */
export function lookupFleetWb(flight = {}, options = {}) {
  const tail = normalizeTailNumber(flight.ac_num || flight.tail);
  if (!tail) {
    return { success: false, reason: 'no_tail' };
  }

  const operator = options.forceOperator || detectFlightOperator(flight);
  const configKey = resolveFleetConfigKey(tail, operator, options);

  if (!configKey || !fleetWbData[configKey]) {
    return { success: false, reason: 'tail_not_in_fleet', tail };
  }

  const config = fleetWbData[configKey];
  const crewCode = normalizeCrewCode(flight.crew);

  if (!crewCode) {
    return {
      success: false,
      reason: 'no_crew',
      tail,
      configKey,
      model: config.model,
      revision: config.revision,
      date: config.date
    };
  }

  const crewRow = config.matrix ? config.matrix[crewCode] : null;
  if (!crewRow) {
    return {
      success: false,
      reason: 'crew_not_in_matrix',
      tail,
      crew: crewCode,
      configKey,
      model: config.model,
      revision: config.revision,
      date: config.date
    };
  }

  // Выбор кухни (Pantry code): A, B, D, E, F, G, K (по умолчанию 'D')
  let galley = String(flight.galley || options.defaultPantry || 'D').toUpperCase().trim();
  if (!galley) galley = 'D';

  let cell = crewRow[galley];

  // Если указанная кухня отсутствует в матрице данного борта, берем доступную
  if (!cell && config.pantry_codes && config.pantry_codes.length > 0) {
    const fallbackPantry = config.pantry_codes.includes('D') ? 'D' : config.pantry_codes[0];
    cell = crewRow[fallbackPantry];
    if (cell) galley = fallbackPantry;
  }

  if (!cell) {
    return {
      success: false,
      reason: 'galley_not_in_matrix',
      tail,
      crew: crewCode,
      galley,
      configKey,
      model: config.model,
      revision: config.revision
    };
  }

  return {
    success: true,
    dow: cell.dow,
    doi: cell.doi,
    tail,
    model: config.model,
    revision: config.revision,
    date: config.date,
    crew: crewCode,
    galley: galley,
    operator: config.operator,
    flyKitMode: config.fly_kit_mode,
    configKey,
    file: config.file
  };
}
