import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Calendar, 
  Plus, 
  Download, 
  Upload,
  Printer, 
  Moon, 
  Sun, 
  RotateCcw,
  Search,
  Clock,
  Globe,
  Zap,
  User,
  Shield,
  ArrowRightLeft,
  LogOut,
  LogIn
} from 'lucide-react';
import { formatValidDateInterval } from '../utils/validators';

export default function Header({
  shiftInfo,
  setShiftInfo,
  onOpenAviaBitModal,
  onImportExcelFile,
  onAddFlight,
  onExportExcel,
  onResetShift,
  searchQuery,
  setSearchQuery,
  isDark,
  setIsDark,
  lastSaved,
  currentUser,
  onOpenLoginModal,
  onOpenAdminModal,
  onOpenHandoverModal,
  onLogout
}) {
  const [utcTime, setUtcTime] = useState('');
  const [mskTime, setMskTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const fileInputRef = useRef(null);

  // Идущие часы UTC, МСК и текущая дата (каждую секунду)
  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();

      // UTC (ZULU)
      const uH = String(now.getUTCHours()).padStart(2, '0');
      const uM = String(now.getUTCMinutes()).padStart(2, '0');
      const uS = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${uH}:${uM}:${uS}`);

      // MSK (Europe/Moscow, UTC+3) Date & Time
      try {
        const mskDateFormatter = new Intl.DateTimeFormat('ru-RU', {
          timeZone: 'Europe/Moscow',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        setCurrentDateStr(mskDateFormatter.format(now));

        const mskTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
          timeZone: 'Europe/Moscow',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        setMskTime(mskTimeFormatter.format(now));
      } catch (e) {
        setMskTime(now.toLocaleTimeString('ru-RU'));
      }
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDateChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatValidDateInterval(rawVal);
    setShiftInfo(prev => ({
      ...prev,
      date_interval: formatted,
      date: formatted
    }));
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportExcelFile(file);
      e.target.value = '';
    }
  };

  return (
    <header className="bg-white/95 dark:bg-slate-950/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-md sticky top-0 z-30 px-2.5 sm:px-4 lg:px-6 py-2 no-print shadow-sm">
      <div className="max-w-[1920px] mx-auto flex flex-col gap-2.5">
        
        {/* Row 1: Brand + Clocks + User Profile + Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Бренд */}
          <div className="flex items-center gap-2">
            <div className="bg-sky-600 p-1.5 rounded-xl text-white shadow-md shadow-sky-500/20 flex items-center justify-center">
              <Plane className="w-5 h-5 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-950 dark:text-white leading-none">
                  AEROPLAN W&B
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-sky-500/10 text-sky-700 dark:text-sky-400 rounded-md border border-sky-500/20">
                  Центровка
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold leading-tight">
                Электронный суточный план
              </p>
            </div>
          </div>

          {/* Часы и Дата */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* ТЕКУЩЕЕ ЧИСЛО (МСК) */}
            <div className="flex items-center gap-1 bg-sky-50/90 dark:bg-slate-900/90 border border-sky-300 dark:border-sky-500/40 rounded-lg px-2 py-1 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[9px] uppercase font-extrabold text-sky-800 dark:text-sky-400 tracking-wider leading-none">ЧИСЛО (МСК)</span>
                <span className="font-mono text-xs sm:text-sm font-black text-sky-700 dark:text-sky-300 tracking-wide leading-tight">
                  {currentDateStr || '--.--.----'}
                </span>
              </div>
            </div>

            {/* UTC */}
            <div className="flex items-center gap-1 bg-emerald-50/90 dark:bg-slate-900/90 border border-emerald-300 dark:border-emerald-500/40 rounded-lg px-2 py-1 shadow-sm">
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[9px] uppercase font-extrabold text-emerald-800 dark:text-emerald-400/80 tracking-wider leading-none">UTC</span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-700 dark:text-emerald-300 tracking-wider leading-tight">
                  {utcTime || '--:--:--'}
                </span>
              </div>
            </div>

            {/* МСК */}
            <div className="flex items-center gap-1 bg-amber-50/90 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-500/40 rounded-lg px-2 py-1 shadow-sm">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[9px] uppercase font-extrabold text-amber-800 dark:text-amber-400/80 tracking-wider leading-none">МСК</span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-700 dark:text-amber-300 tracking-wider leading-tight">
                  {mskTime || '--:--:--'}
                </span>
              </div>
            </div>
          </div>

          {/* User profile & Action toggles */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                {/* Бейдж пользователя */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                  <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.full_name?.charAt(0) || '👤'}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {currentUser.full_name || currentUser.username}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {currentUser.role === 'admin' ? 'Администратор' : 'Диспетчер'}
                    </span>
                  </div>
                </div>

                {/* Кнопка Админ панели (для роли admin) */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={onOpenAdminModal}
                    className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-purple-300 dark:border-purple-800 shadow-sm transition-all"
                    title="Управление учетными записями диспетчеров"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Учётные записи</span>
                  </button>
                )}

                {/* Кнопка Передать смену */}
                <button
                  onClick={onOpenHandoverModal}
                  className="flex items-center gap-1 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 shadow-sm transition-all"
                  title="Зафиксировать передачу дежурства по смене"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Сдать смену</span>
                </button>

                {/* Кнопка Выход */}
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Выйти из системы"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-sm transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Войти</span>
              </button>
            )}

            {/* Печать А4 */}
            <button
              onClick={() => window.print()}
              className="p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-all"
              title="Печать листа смены (Альбом А4)"
            >
              <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Сброс */}
            <button
              onClick={onResetShift}
              className="p-1.5 sm:p-2 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-300 dark:border-slate-700 rounded-xl transition-all"
              title="Сбросить журнал к началу"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Переключатель темы */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-700/60"
              title={isDark ? "Включить светлую тему" : "Включить темную тему"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Row 2: Shift Interval + Dispatcher + Search + Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-800/80">
          
          {/* Shift info & Search */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-[280px]">
            {/* Интервал дат смены */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200 shadow-sm grow sm:grow-0">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
              <input
                type="text"
                value={shiftInfo.date_interval || shiftInfo.date || ''}
                onChange={handleDateChange}
                onFocus={(e) => e.target.select()}
                placeholder="260826 -> 26.08 — 27.08"
                className="bg-transparent font-mono font-extrabold focus:outline-none w-36 sm:w-44 text-sky-700 dark:text-sky-300 text-xs"
                title="Введите число (например 260826)"
              />
              <span className="text-[9px] font-mono px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200 font-bold shrink-0">
                09-09
              </span>
            </div>

            {/* Диспетчер */}
            <input
              type="text"
              value={shiftInfo.dispatcher || ''}
              onChange={(e) => setShiftInfo(prev => ({ ...prev, dispatcher: e.target.value }))}
              placeholder="ФИО Диспетчера..."
              className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none w-28 sm:w-36 placeholder:text-slate-400 font-medium shadow-sm grow sm:grow-0"
            />

            {/* Поиск рейса */}
            <div className="relative flex items-center grow sm:grow-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск рейса..."
                className="bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none w-full sm:w-28 sm:focus:w-40 transition-all placeholder:text-slate-400 font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            
            {/* КНОПКА 1: ЗАГРУЗКА ИЗ AVIABIT */}
            <button
              onClick={onOpenAviaBitModal}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95 border border-sky-500"
              title="Загрузить расписание напрямую из AviaBit"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>AviaBit</span>
            </button>

            {/* КНОПКА 2: ИМПОРТ EXCEL */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 transition-all active:scale-95"
              title="Импортировать готовый файл расписания Excel (.xlsx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Импорт</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".xlsx, .xls"
              className="hidden"
            />

            {/* Кнопка Добавить пустую строку */}
            <button
              onClick={onAddFlight}
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-all active:scale-95"
              title="Добавить новый рейс вручную"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Рейс</span>
            </button>

            {/* КНОПКА 4: ЭКСПОРТ В EXCEL */}
            <button
              onClick={onExportExcel}
              className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow transition-all active:scale-95"
              title="Выгрузить журнал в Excel (.xlsx)"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Excel</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
