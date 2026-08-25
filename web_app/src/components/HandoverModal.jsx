import React, { useState } from 'react';
import { X, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertCircle, Clock, Plane, FileText, Check } from 'lucide-react';
import { handoverShift } from '../utils/api';

export default function HandoverModal({
  isOpen,
  onClose,
  flights,
  shiftInfo,
  currentUser,
  onHandoverSuccess
}) {
  const [incomingDispatcher, setIncomingDispatcher] = useState(currentUser?.full_name || '');
  const [notes, setNotes] = useState('');
  const [archiveClosed, setArchiveClosed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentDispatcher = shiftInfo?.dispatcher || currentUser?.full_name || 'Диспетчер по центровке';

  // Фильтруем активные рейсы (в работе / подготовленные / переходящие на 09:00 - 13:30)
  const activeFlights = flights.filter(f => f.status !== 'closed');
  const closedFlights = flights.filter(f => f.status === 'closed');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!incomingDispatcher.trim()) {
      setErrorMsg('Укажите ФИО принимающего диспетчера');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await handoverShift({
        handed_over_by: currentDispatcher,
        accepted_by: incomingDispatcher.trim(),
        notes: notes.trim(),
        archive_closed_flights: archiveClosed
      });

      if (res && res.success) {
        onHandoverSuccess(incomingDispatcher.trim(), archiveClosed);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка фиксации сдачи-приемки смены');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100 leading-none">
                Передача дежурства по смене
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Фиксация сдачи-приёмки суточного плана и переходящих рейсов
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Карточка Сдал -> Принял */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Смену сдаёт
              </span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {currentDispatcher}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 block mb-1">
                Смену принимает *
              </span>
              <input
                type="text"
                value={incomingDispatcher}
                onChange={(e) => setIncomingDispatcher(e.target.value)}
                placeholder="ФИО принимающего диспетчера..."
                className="w-full bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
          </div>

          {/* Сводка переходящих рейсов */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Переходящие активные рейсы ({activeFlights.length})</span>
              </h4>
              <span className="text-[11px] text-slate-500 font-semibold">
                Закрыто рейсов: {closedFlights.length}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold uppercase">
                    <th className="py-2 px-2.5">Рейс</th>
                    <th className="py-2 px-2">Маршрут</th>
                    <th className="py-2 px-2 text-center">Вылет</th>
                    <th className="py-2 px-2 text-center">Статус</th>
                    <th className="py-2 px-2">Пометки / Особые указания</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeFlights.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        Нет активных переходящих рейсов
                      </td>
                    </tr>
                  ) : (
                    activeFlights.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50">
                        <td className="py-2 px-2.5 font-mono font-extrabold text-sky-700 dark:text-sky-400">
                          {f.flight}
                        </td>
                        <td className="py-2 px-2 text-slate-800 dark:text-slate-200">
                          {f.route_city || f.route_airports}
                        </td>
                        <td className="py-2 px-2 font-mono font-bold text-center text-amber-700 dark:text-amber-300">
                          {f.time}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {f.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-[11px] text-slate-600 dark:text-slate-400 max-w-[180px] truncate" title={f.notes}>
                          {f.notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Чекбокс архивации закрытых рейсов */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
            <input
              type="checkbox"
              id="archiveClosed"
              checked={archiveClosed}
              onChange={(e) => setArchiveClosed(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
            />
            <label htmlFor="archiveClosed" className="text-xs text-slate-800 dark:text-slate-200 font-bold cursor-pointer">
              Архивировать выполненные рейсы (убрать из активного плана {closedFlights.length} закрытых рейсов)
            </label>
          </div>

          {/* Замечания и указания */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Особые замечания по смене (передаются сменщику)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: рейс EO413 задержка по метео, рейс N41402 спецбагаж в багажнике 2..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-500/20 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Фиксация...' : 'Зафиксировать приёмку смены'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
