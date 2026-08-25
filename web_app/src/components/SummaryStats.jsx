import React from 'react';
import { Plane, CheckCircle2, Clock, CheckSquare, CheckCircle, ShieldCheck } from 'lucide-react';

export default function SummaryStats({ flights }) {
  const total = flights.length;
  const prepared = flights.filter(f => f.status === 'prepared').length;
  const lirSentCount = flights.filter(f => f.lir_sent).length;
  const released = flights.filter(f => f.status === 'released' || f.szv_sent).length;
  const closed = flights.filter(f => f.status === 'closed' || f.ldm_sent).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-3 no-print">
      {/* 1. Рейсов в плане */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
          <Plane className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Рейсов в плане</p>
          <p className="text-lg font-extrabold font-mono text-slate-950 dark:text-white leading-tight">{total}</p>
        </div>
      </div>

      {/* 2. Подготовлено */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
          <CheckCircle className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Подготовлено</p>
          <p className="text-lg font-extrabold font-mono text-sky-700 dark:text-sky-300 leading-tight">
            {prepared} <span className="text-xs font-semibold text-slate-400">/ {total}</span>
          </p>
        </div>
      </div>

      {/* 3. LIR отправлено */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
        <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
          <CheckSquare className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">LIR отправлено</p>
          <p className="text-lg font-extrabold font-mono text-indigo-700 dark:text-indigo-300 leading-tight">
            {lirSentCount} <span className="text-xs font-semibold text-slate-400">/ {total}</span>
          </p>
        </div>
      </div>

      {/* 4. Выпущено (СЗВ) */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Выпущено (СЗВ)</p>
          <p className="text-lg font-extrabold font-mono text-amber-700 dark:text-amber-300 leading-tight">
            {released} <span className="text-xs font-semibold text-slate-400">/ {total}</span>
          </p>
        </div>
      </div>

      {/* 5. Закрыто (LDM) */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center gap-2.5 shadow-sm">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Закрыто (LDM)</p>
          <p className="text-lg font-extrabold font-mono text-emerald-700 dark:text-emerald-300 leading-tight">
            {closed} <span className="text-xs font-semibold text-slate-400">/ {total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
