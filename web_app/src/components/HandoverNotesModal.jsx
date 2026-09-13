import React from 'react';
import { X, MessageSquare, Clock, User, CheckCircle2 } from 'lucide-react';

export default function HandoverNotesModal({ isOpen, onClose, handoverData }) {
  if (!isOpen || !handoverData || !handoverData.notes) return null;

  const handoverTimeStr = handoverData.handover_time 
    ? new Date(handoverData.handover_time).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

  const readTimeStr = handoverData.read_at
    ? new Date(handoverData.read_at).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-900 dark:text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5 font-extrabold text-base text-amber-600 dark:text-amber-400">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span>Замечания по смене</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shift metadata */}
        <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Сдал смену</div>
              <div className="font-extrabold text-slate-800 dark:text-slate-200 truncate">
                {handoverData.handed_over_by || '—'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Принял смену</div>
              <div className="font-extrabold text-slate-800 dark:text-slate-200 truncate">
                {handoverData.accepted_by || '—'}
              </div>
            </div>
          </div>
          <div className="col-span-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2 mt-1">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Время передачи: <span className="font-mono font-bold text-slate-900 dark:text-slate-200">{handoverTimeStr}</span></span>
            </div>
            {handoverData.is_read ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ознакомлен</span>
              </span>
            ) : null}
          </div>
        </div>

        {/* Handover note content */}
        <div className="mb-5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Текст замечаний и указаний:
          </label>
          <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl text-slate-900 dark:text-amber-100 font-medium text-xs whitespace-pre-wrap leading-relaxed shadow-inner max-h-60 overflow-y-auto">
            {handoverData.notes}
          </div>
          {readTimeStr && (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 text-right font-mono">
              Подтверждено: {readTimeStr} {handoverData.read_by ? `(${handoverData.read_by})` : ''}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
