import React, { useState } from 'react';
import { X, Plane, Zap, Calendar, Clock, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { formatValidFullDate, formatValidTime, sortFlightsChronologically } from '../utils/validators';
import { fetchAviaBitSchedule, smartMergeSchedules } from '../utils/api';
import { smartMergeWithDelta } from '../utils/deltaSync';

export default function AviaBitFetchModal({
  isOpen,
  onClose,
  onScheduleLoaded,
  currentFlights = [],
  airports = [],
  onOpenAirportsModal
}) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pad = (n) => String(n).padStart(2, '0');
  const formatD = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;

  const [dateFrom, setDateFrom] = useState(formatD(today));
  const [timeFrom, setTimeFrom] = useState('08:00');
  const [dateTo, setDateTo] = useState(formatD(tomorrow));
  const [timeTo, setTimeTo] = useState('14:00');
  const [airline, setAirline] = useState('both'); // "both", "nordwind", "ikar"
  const [useSmartMerge, setUseSmartMerge] = useState(true);
  const [activePreset, setActivePreset] = useState('today');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Быстрые пресеты дат
  const setPresetYesterday = () => {
    const d1 = new Date();
    d1.setDate(d1.getDate() - 1);
    const d2 = new Date();
    setDateFrom(formatD(d1));
    setDateTo(formatD(d2));
    setTimeFrom('08:00');
    setTimeTo('14:00');
    setActivePreset('yesterday');
    setErrorMsg('');
  };

  const setPresetToday = () => {
    const d1 = new Date();
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 1);
    setDateFrom(formatD(d1));
    setDateTo(formatD(d2));
    setTimeFrom('08:00');
    setTimeTo('14:00');
    setActivePreset('today');
    setErrorMsg('');
  };

  const setPresetTomorrow = () => {
    const d1 = new Date();
    d1.setDate(d1.getDate() + 1);
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 1);
    setDateFrom(formatD(d1));
    setDateTo(formatD(d2));
    setTimeFrom('08:00');
    setTimeTo('14:00');
    setActivePreset('tomorrow');
    setErrorMsg('');
  };

  React.useEffect(() => {
    if (isOpen) {
      setPresetToday();
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const normalizeFullDate = (str) => {
    if (!str) return '';
    const parts = str.split('.');
    if (parts.length === 3 && parts[2].length === 4) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      return `${d}.${m}.${parts[2]}`;
    }
    return str;
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const cleanFrom = normalizeFullDate(dateFrom);
    const cleanTo = normalizeFullDate(dateTo);

    const pFrom = cleanFrom.split('.');
    const pTo = cleanTo.split('.');
    if (pFrom.length < 3 || (pFrom[2] && pFrom[2].length < 4)) {
      setErrorMsg('Укажите полную дату начала периода в формате ДД.ММ.ГГГГ');
      setIsLoading(false);
      return;
    }
    if (pTo.length < 3 || (pTo[2] && pTo[2].length < 4)) {
      setErrorMsg('Укажите полную дату окончания периода в формате ДД.ММ.ГГГГ');
      setIsLoading(false);
      return;
    }

    const d1 = new Date(parseInt(pFrom[2], 10), parseInt(pFrom[1], 10) - 1, parseInt(pFrom[0], 10));
    const d2 = new Date(parseInt(pTo[2], 10), parseInt(pTo[1], 10) - 1, parseInt(pTo[0], 10));
    if (d2 < d1) {
      setErrorMsg('Дата окончания периода не может быть раньше даты начала');
      setIsLoading(false);
      return;
    }

    const activeAirportCodes = (airports && airports.length > 0)
      ? airports.filter(a => a.is_enabled).map(a => a.code)
      : undefined;

    const payload = {
      date_from: cleanFrom,
      time_from: timeFrom,
      date_to: cleanTo,
      time_to: timeTo,
      airline: airline,
      filter_name: 'WBGarantiya',
      allowed_departures: activeAirportCodes
    };

    try {
      const result = await fetchAviaBitSchedule(payload);
      if (!result.success) {
        throw new Error(result.message || 'Не удалось получить данные с серверов AviaBit');
      }

      let finalFlights = result.flights || [];
      let totalChanges = 0;
      let newCount = 0;

      // Умное слияние с сохранением данных предыдущего диспетчера и детекцией изменений
      if (useSmartMerge && currentFlights && currentFlights.length > 0) {
        const mergeResult = smartMergeWithDelta(currentFlights, finalFlights);
        finalFlights = mergeResult.mergedFlights;
        totalChanges = mergeResult.totalNewChanges;
        newCount = mergeResult.newFlightsCount;
      }

      finalFlights = sortFlightsChronologically(finalFlights);

      let successText = `Успешно загружено ${finalFlights.length} рейсов!`;
      if (totalChanges > 0 || newCount > 0) {
        successText += ` Изменений: ${totalChanges}${newCount > 0 ? `, новых: ${newCount}` : ''}`;
      }
      setSuccessMsg(successText);
      setTimeout(() => {
        onScheduleLoaded(finalFlights, {
          date_interval: `${cleanFrom} — ${cleanTo}`,
          date: cleanFrom
        });
        onClose();
      }, 500);
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка подключения к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5 font-bold text-base">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-none">Загрузка из AviaBit</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Прямой парсер суточного плана авиакомпаний
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFetch} className="space-y-4">
          
          {/* Пресеты дат */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap shrink-0">Быстрый выбор:</span>
            <div className="grid grid-cols-3 gap-1.5 flex-1">
              <button
                type="button"
                onClick={setPresetYesterday}
                className={`text-xs py-1.5 px-2 text-center rounded-xl transition-all duration-150 font-bold truncate ${
                  activePreset === 'yesterday'
                    ? 'bg-sky-600 text-white font-extrabold border-2 border-sky-400 shadow-md shadow-sky-600/30 ring-2 ring-sky-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                Смена Вчера
              </button>
              <button
                type="button"
                onClick={setPresetToday}
                className={`text-xs py-1.5 px-2 text-center rounded-xl transition-all duration-150 font-bold truncate ${
                  activePreset === 'today'
                    ? 'bg-sky-600 text-white font-extrabold border-2 border-sky-400 shadow-md shadow-sky-600/30 ring-2 ring-sky-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                Смена Сегодня
              </button>
              <button
                type="button"
                onClick={setPresetTomorrow}
                className={`text-xs py-1.5 px-2 text-center rounded-xl transition-all duration-150 font-bold truncate ${
                  activePreset === 'tomorrow'
                    ? 'bg-sky-600 text-white font-extrabold border-2 border-sky-400 shadow-md shadow-sky-600/30 ring-2 ring-sky-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                Смена Завтра
              </button>
            </div>
          </div>

          {/* Дата и время начала */}
          <div className="bg-slate-50 dark:bg-slate-850/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span>Начало периода (по Москве):</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Дата (ДД.ММ.ГГГГ)</span>
                <input
                  type="text"
                  value={dateFrom}
                  maxLength={10}
                  onChange={(e) => {
                    setDateFrom(formatValidFullDate(e.target.value, dateFrom));
                    setActivePreset('custom');
                  }}
                  onBlur={() => {
                    if (dateFrom) {
                      setDateFrom(normalizeFullDate(dateFrom));
                    }
                  }}
                  placeholder="07.09.2026"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Время (ЧЧ:ММ)</span>
                <input
                  type="text"
                  value={timeFrom}
                  onChange={(e) => {
                    setTimeFrom(formatValidTime(e.target.value));
                    setActivePreset('custom');
                  }}
                  placeholder="08:00"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Дата и время окончания */}
          <div className="bg-slate-50 dark:bg-slate-850/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Окончание периода (по Москве):</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Дата (ДД.ММ.ГГГГ)</span>
                <input
                  type="text"
                  value={dateTo}
                  maxLength={10}
                  onChange={(e) => {
                    setDateTo(formatValidFullDate(e.target.value, dateTo));
                    setActivePreset('custom');
                  }}
                  onBlur={() => {
                    if (dateTo) {
                      setDateTo(normalizeFullDate(dateTo));
                    }
                  }}
                  placeholder="08.09.2026"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Время (ЧЧ:ММ)</span>
                <input
                  type="text"
                  value={timeTo}
                  onChange={(e) => {
                    setTimeTo(formatValidTime(e.target.value));
                    setActivePreset('custom');
                  }}
                  placeholder="14:00"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs font-bold focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Выбор Авиакомпании */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Plane className="w-3.5 h-3.5 text-sky-500" />
              <span>Авиакомпания:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAirline('both')}
                className={`py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                  airline === 'both'
                    ? 'bg-sky-600 text-white border-sky-600 shadow'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                Nordwind + Икар
              </button>
              <button
                type="button"
                onClick={() => setAirline('nordwind')}
                className={`py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                  airline === 'nordwind'
                    ? 'bg-sky-600 text-white border-sky-600 shadow'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                Только Nordwind
              </button>
              <button
                type="button"
                onClick={() => setAirline('ikar')}
                className={`py-1.5 rounded-lg border font-bold text-xs transition-colors ${
                  airline === 'ikar'
                    ? 'bg-sky-600 text-white border-sky-600 shadow'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                Только Икар
              </button>
            </div>
          </div>

          {/* Фильтр городов вылета */}
          <div className="flex items-center justify-between gap-2 p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                  Фильтр вылетов:{' '}
                  <span className="text-blue-600 dark:text-blue-400">
                    {airports.filter(a => a.is_enabled).length} из {airports.length || 26} городов
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                  {airports.filter(a => a.is_enabled).map(a => a.code).slice(0, 10).join(', ')}
                  {airports.filter(a => a.is_enabled).length > 10 ? '...' : ''}
                </span>
              </div>
            </div>
            {onOpenAirportsModal && (
              <button
                type="button"
                onClick={onOpenAirportsModal}
                className="px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 border border-blue-300 dark:border-blue-700 rounded-lg shadow-sm transition-colors shrink-0"
              >
                Настроить
              </button>
            )}
          </div>

          {/* Опция Smart Merge */}
          <div className="flex items-center gap-2 p-2.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 rounded-xl">
            <input
              type="checkbox"
              id="smartMergeAviaBit"
              checked={useSmartMerge}
              onChange={(e) => setUseSmartMerge(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer shrink-0"
            />
            <label htmlFor="smartMergeAviaBit" className="text-xs text-slate-800 dark:text-slate-200 font-bold cursor-pointer leading-tight">
              Умное слияние с сохранением введенных весов, чекбоксов и заметок переходящих рейсов
            </label>
          </div>

          {/* Сообщения об ошибке / успехе */}
          {errorMsg && (
            <div className="flex items-start gap-2 bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 p-2.5 rounded-lg text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-lg text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-xs"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-400 text-white font-extrabold px-5 py-2 rounded-xl shadow-lg transition-all active:scale-95 text-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Загрузка расписания...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Загрузить расписание</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
