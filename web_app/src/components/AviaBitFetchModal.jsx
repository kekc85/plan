import React, { useState } from 'react';
import { X, Plane, Zap, Calendar, Clock, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { formatValidDateInterval, formatValidTime, sortFlightsChronologically } from '../utils/validators';
import { fetchAviaBitSchedule, smartMergeSchedules } from '../utils/api';

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

  if (!isOpen) return null;

  // Быстрые пресеты дат
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

  const handleFetch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const activeAirportCodes = (airports && airports.length > 0)
      ? airports.filter(a => a.is_enabled).map(a => a.code)
      : undefined;

    const payload = {
      date_from: dateFrom,
      time_from: timeFrom,
      date_to: dateTo,
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

      // Умное слияние с сохранением данных предыдущего диспетчера
      if (useSmartMerge && currentFlights && currentFlights.length > 0) {
        const existingMap = new Map();
        currentFlights.forEach(f => {
          const flNum = (f.flight || '').replace(/[-\s]/g, '').toUpperCase();
          const flDate = (f.flight_date || '').trim();
          const key = `${flNum}_${flDate}`;
          existingMap.set(key, f);
        });

        // Обогащаем только входящие рейсы нового расписания
        finalFlights = finalFlights.map(inc => {
          const flNum = (inc.flight || '').replace(/[-\s]/g, '').toUpperCase();
          const flDate = (inc.flight_date || '').trim();
          const key = `${flNum}_${flDate}`;
          const old = existingMap.get(key);
          if (!old) return inc;

          const merged = { ...inc };
          if (old.id) merged.id = old.id;
          if (old.lir_sent !== undefined) merged.lir_sent = old.lir_sent;
          if (old.szv_sent !== undefined) merged.szv_sent = old.szv_sent;
          if (old.ldm_sent !== undefined) merged.ldm_sent = old.ldm_sent;
          if (old.astra_times_sent !== undefined) merged.astra_times_sent = old.astra_times_sent;
          if (old.notes) merged.notes = old.notes;

          let hasManualWork = false;
          ['fuel_block', 'fuel_trip', 'fuel_taxi', 'dow', 'doi', 'galley', 'mtow', 'cargo', 'mail', 'baggage'].forEach(field => {
            if (old[field] !== undefined && old[field] !== '') {
              merged[field] = old[field];
              hasManualWork = true;
            }
          });

          // Сохраняем статус только если была реальная работа или чекбоксы
          if (old.status === 'closed' || old.status === 'released' || old.status === 'lir_sent') {
            merged.status = old.status;
          } else if (old.status === 'prepared' && (hasManualWork || (old.notes && old.notes.trim()))) {
            merged.status = 'prepared';
          } else {
            merged.status = 'pending';
          }

          return merged;
        });
      }

      finalFlights = sortFlightsChronologically(finalFlights);

      setSuccessMsg(`Успешно загружено ${finalFlights.length} рейсов!`);
      setTimeout(() => {
        onScheduleLoaded(finalFlights, {
          date_interval: `${dateFrom} — ${dateTo}`,
          date: dateFrom
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
            <span className="text-xs text-slate-500 font-medium">Быстрый выбор:</span>
            <button
              type="button"
              onClick={setPresetToday}
              className={`text-xs px-3 py-1.5 rounded-xl transition-all duration-150 ${
                activePreset === 'today'
                  ? 'bg-sky-600 text-white font-extrabold border-2 border-sky-400 shadow-md shadow-sky-600/30 ring-2 ring-sky-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              Смена Сегодня (08:00 - 14:00)
            </button>
            <button
              type="button"
              onClick={setPresetTomorrow}
              className={`text-xs px-3 py-1.5 rounded-xl transition-all duration-150 ${
                activePreset === 'tomorrow'
                  ? 'bg-sky-600 text-white font-extrabold border-2 border-sky-400 shadow-md shadow-sky-600/30 ring-2 ring-sky-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750'
              }`}
            >
              Смена Завтра
            </button>
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
                  onChange={(e) => {
                    setDateFrom(formatValidDateInterval(e.target.value));
                    setActivePreset('custom');
                  }}
                  placeholder="25.08.2026"
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
                  onChange={(e) => {
                    setDateTo(formatValidDateInterval(e.target.value));
                    setActivePreset('custom');
                  }}
                  placeholder="26.08.2026"
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
