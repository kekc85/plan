import React, { useState } from 'react';
import { X, Plane, Zap, Calendar, Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { formatValidDateInterval, formatValidTime } from '../utils/validators';

export default function AviaBitFetchModal({ isOpen, onClose, onScheduleLoaded }) {
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
    setErrorMsg('');
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const payload = {
      date_from: dateFrom,
      time_from: timeFrom,
      date_to: dateTo,
      time_to: timeTo,
      airline: airline,
      filter_name: 'WBGarantiya'
    };

    // Пробуем через прокси /api/fetch_schedule, а если недоступно - напрямую http://127.0.0.1:8000
    const endpoints = [
      '/api/fetch_schedule',
      'http://127.0.0.1:8000/api/fetch_schedule',
      'http://localhost:8000/api/fetch_schedule'
    ];

    let lastError = null;
    let fetched = false;

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.detail || `Ошибка сервера: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.message || 'Не удалось получить данные с серверов AviaBit');
        }

        if (result.count === 0) {
          setErrorMsg('За указанный интервал времени рейсов в AviaBit не найдено.');
          setIsLoading(false);
          return;
        }

        setSuccessMsg(`Успешно загружено ${result.count} рейсов из AviaBit!`);
        setTimeout(() => {
          onScheduleLoaded(result.flights, result.shift_interval);
          onClose();
        }, 500);

        fetched = true;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!fetched) {
      console.error(lastError);
      setErrorMsg(lastError?.message || 'Ошибка соединения с локальным API сервером. Проверьте api_server.py.');
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
              <h3 className="font-extrabold text-base leading-tight">Загрузка расписания из AviaBit</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Прямая подкачка суточного плана с портала</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Быстрый выбор:</span>
          <button
            type="button"
            onClick={setPresetToday}
            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 font-semibold transition-colors"
          >
            Сутки сегодня (08:00-14:00)
          </button>
          <button
            type="button"
            onClick={setPresetTomorrow}
            className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 font-semibold transition-colors"
          >
            Сутки завтра (08:00-14:00)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFetch} className="space-y-3.5 text-xs">
          
          {/* Дата и Время начала (по умолчанию 08:00) */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" /> Дата начала
              </label>
              <input
                type="text"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="25.08.2026"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Время начала (МСК)
              </label>
              <input
                type="text"
                value={timeFrom}
                onChange={(e) => setTimeFrom(formatValidTime(e.target.value))}
                placeholder="08:00"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-sm text-amber-600 dark:text-amber-300 text-center focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Дата и Время окончания (по умолчанию 14:00) */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" /> Дата окончания
              </label>
              <input
                type="text"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="26.08.2026"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-sm text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Время окончания (МСК)
              </label>
              <input
                type="text"
                value={timeTo}
                onChange={(e) => setTimeTo(formatValidTime(e.target.value))}
                placeholder="14:00"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-mono font-bold text-sm text-amber-600 dark:text-amber-300 text-center focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Выбор Авиакомпании */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
              Авиакомпания
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
