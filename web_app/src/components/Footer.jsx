import React from 'react';
import { APP_NAME, APP_VERSION, BUILD_DATE, DEVELOPER } from '../version';

export default function Footer() {
  return (
    <footer className="w-full py-4 text-center border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/50 no-print mt-auto">
      <div className="flex items-center justify-center gap-2 font-mono text-xs text-sky-800/80 dark:text-sky-400/80">
        <span className="font-semibold tracking-wide">
          {APP_NAME} <span className="text-sky-600 dark:text-sky-300 font-bold">{APP_VERSION}</span> ({BUILD_DATE})
        </span>
        <span className="text-slate-400 dark:text-slate-600">•</span>
        <span className="text-slate-600 dark:text-slate-400">
          Разработчик: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{DEVELOPER}</strong>
        </span>
      </div>
    </footer>
  );
}
