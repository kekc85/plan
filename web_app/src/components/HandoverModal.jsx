import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, ShieldCheck, CheckCircle2, AlertCircle, Clock, Plane, FileText, Check, ChevronDown, User } from 'lucide-react';
import { handoverShift, getActiveUsers } from '../utils/api';

export default function HandoverModal({
  isOpen,
  onClose,
  flights,
  shiftInfo,
  currentUser,
  onHandoverSuccess
}) {
  const currentDispatcher = shiftInfo?.dispatcher || currentUser?.full_name || 'Диспетчер по центровке';
  const [incomingDispatcher, setIncomingDispatcher] = useState('');
  const [activeUsers, setActiveUsers] = useState([
    { id: 1, full_name: 'Администратор системы', username: 'admin', role: 'admin' },
    { id: 2, full_name: 'Диспетчер по центровке', username: 'dispatcher', role: 'dispatcher' }
  ]);
  const [notes, setNotes] = useState('');
  const [archiveClosed, setArchiveClosed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDispatchers();
    }
  }, [isOpen]);

  const loadDispatchers = async () => {
    try {
      const res = await getActiveUsers();
      if (res && res.users && res.users.length > 0) {
        setActiveUsers(res.users);
        // Выбираем первого сменщика (отличного от текущего)
        const others = res.users.filter(u => u.full_name !== currentDispatcher);
        if (others.length > 0) {
          setIncomingDispatcher(others[0].full_name);
        } else {
          setIncomingDispatcher(res.users[0].full_name);
        }
      }
    } catch {
      // Игнорируем ошибку, используем список по умолчанию
    }
  };

  if (!isOpen) return null;

  // Фильтруем активные рейсы (в работе / подготовленные / переходящие на 09:00 - 13:30)
  const activeFlights = flights.filter(f => f.status !== 'closed');
  const closedFlights = flights.filter(f => f.status === 'closed');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalIncoming = incomingDispatcher || (activeUsers[0] ? activeUsers[0].full_name : currentDispatcher);
    if (!finalIncoming.trim()) {
      setErrorMsg('Выберите принимающего диспетчера');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await handoverShift({
        handed_over_by: currentDispatcher,
        accepted_by: finalIncoming.trim(),
        notes: notes.trim(),
        archive_closed_flights: archiveClosed
      });

      if (res && res.success) {
        onHandoverSuccess(finalIncoming.trim(), archiveClosed, {
          handed_over_by: currentDispatcher,
          accepted_by: finalIncoming.trim(),
          notes: notes.trim(),
          handover_time: new Date().toISOString()
        });
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 items-center">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                Смену сдаёт
              </span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 py-1">
                {currentDispatcher}
              </p>
            </div>

            <div>
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-400 block mb-1.5 whitespace-nowrap">
                Смену принимает *
              </label>
              <div className="relative">
                <select
                  value={incomingDispatcher}
                  onChange={(e) => setIncomingDispatcher(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-900 border-2 border-sky-400 dark:border-sky-500 rounded-xl pl-3 pr-9 py-2 text-xs text-slate-900 dark:text-slate-100 font-extrabold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm cursor-pointer"
                >
                  {activeUsers.map(u => (
                    <option key={u.id} value={u.full_name}>
                      👤 {u.full_name} ({u.role === 'admin' ? 'Админ' : 'Диспетчер'})
                    </option>
                  ))}
                  {incomingDispatcher && !activeUsers.some(u => u.full_name === incomingDispatcher) && (
                    <option value={incomingDispatcher}>👤 {incomingDispatcher}</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-sky-600 dark:text-sky-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
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
                      <td colSpan={5} className="py-4 text-center text-slate-400 text-xs">
                        Нет активных переходящих рейсов
                      </td>
                    </tr>
                  ) : (
                    activeFlights.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-1.5 px-2.5 font-bold font-mono text-sky-600 dark:text-sky-400">
                          {f.flight}
                        </td>
                        <td className="py-1.5 px-2 font-medium text-slate-700 dark:text-slate-300">
                          {f.route_city}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                          {f.time || '—'}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {f.status}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs">
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
          <label className="flex items-center gap-2.5 p-3 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 rounded-xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={archiveClosed}
              onChange={(e) => setArchiveClosed(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded border-slate-300 dark:border-slate-600 focus:ring-sky-500"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Архивировать выполненные рейсы (убрать из активного плана {closedFlights.length} закрытых рейсов)
            </span>
          </label>

          {/* Заметки для сменщика */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Особые замечания по смене (передаются сменщику)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: рейс EO413 задержка по метео, рейс N41402 спецбагаж в багажнике 2..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Кнопка подтверждения */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:from-sky-700 active:to-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isLoading ? 'Передача смены...' : 'Подтвердить передачу смены'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
