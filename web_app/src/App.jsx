import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SummaryStats from './components/SummaryStats';
import ShiftTable from './components/ShiftTable';
import NewFlightModal from './components/NewFlightModal';
import AviaBitFetchModal from './components/AviaBitFetchModal';
import { INITIAL_FLIGHTS } from './utils/mockData';
import { exportShiftToExcel } from './utils/excelExport';
import { parseExcelToFlights } from './utils/excelImport';
import { playReleaseAlertSound, initAudioUnlock } from './utils/audioAlert';
import { sortFlightsChronologically, isFlightReleaseOverdue } from './utils/validators';
import { arrayMove } from '@dnd-kit/sortable';
import { Bell, CheckCircle2, X, Volume2 } from 'lucide-react';

const STORAGE_KEY = 'aviabit_shift_journal_v4';

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem(`${STORAGE_KEY}_theme`);
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    return false; // По умолчанию светлая тема
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAviaBitModalOpen, setIsAviaBitModalOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState('');

  // Notifications for flights ready to be released
  const [activeAlert, setActiveAlert] = useState(null);
  const [dismissedAlerts, setDismissedAlerts] = useState({});
  const playedAlertsRef = React.useRef({});

  // Разблокировка Web Audio на первый клик пользователя
  useEffect(() => {
    initAudioUnlock();
  }, []);

  // Shift metadata (интервал 24-часовой смены 09:00 - 09:00)
  const [shiftInfo, setShiftInfo] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_info`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const formatD = (date) => {
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}.${m}.${y}`;
    };

    return {
      date: `${formatD(today)} — ${formatD(tomorrow)}`,
      date_interval: `${formatD(today)} — ${formatD(tomorrow)}`,
      dispatcher: ''
    };
  });

  // Flights list
  const [flights, setFlights] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_flights`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_FLIGHTS;
  });

  // Toggle dark class on root document
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_theme`, isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 min-h-screen font-sans antialiased select-none';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-100 text-slate-900 min-h-screen font-sans antialiased select-none';
    }
  }, [isDark]);

  // Auto-save to LocalStorage on every change
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_flights`, JSON.stringify(flights));
    localStorage.setItem(`${STORAGE_KEY}_info`, JSON.stringify(shiftInfo));
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    setLastSaved(timeStr);
  }, [flights, shiftInfo]);

  const initialSuppressionDoneRef = React.useRef(false);

  // При первой загрузке страницы: подавляем всплывающие окна для рейсов, чье время УЖЕ прошло в прошлом
  useEffect(() => {
    if (!initialSuppressionDoneRef.current && flights && flights.length > 0) {
      const pastAlerts = {};
      for (const flight of flights) {
        if (isFlightReleaseOverdue(flight)) {
          const alertKey = `${flight.id}_${flight.release_time || ''}`;
          pastAlerts[alertKey] = true;
          playedAlertsRef.current[alertKey] = true;
        }
      }
      setDismissedAlerts(prev => ({ ...pastAlerts, ...prev }));
      initialSuppressionDoneRef.current = true;
    }
  }, [flights]);

  // Проверка наступления времени выпуска рейсов (в реальном времени)
  useEffect(() => {
    const checkReleaseAlerts = () => {
      const now = new Date();
      
      // 1. Локальное время браузера
      const localTotal = now.getHours() * 60 + now.getMinutes();

      // 2. Московское время (МСК)
      let mskTotal = localTotal;
      try {
        const mskDateStr = now.toLocaleString("en-US", { timeZone: "Europe/Moscow" });
        const mskDate = new Date(mskDateStr);
        mskTotal = mskDate.getHours() * 60 + mskDate.getMinutes();
      } catch (e) {}

      for (const flight of flights) {
        // Пропускаем уже выпущенные или закрытые рейсы
        if (flight.status === 'released' || flight.status === 'closed' || flight.szv_sent || flight.ldm_sent) {
          continue;
        }

        const relTime = flight.release_time || '';
        if (!relTime || !relTime.includes(':')) continue;

        const parts = relTime.split(':').map(p => parseInt(p.trim(), 10));
        if (isNaN(parts[0]) || isNaN(parts[1])) continue;

        const releaseTotal = parts[0] * 60 + parts[1];

        // Разница в минутах
        const diffMsk = mskTotal - releaseTotal;
        const diffLocal = localTotal - releaseTotal;

        // Всплывающее окно и звук активируются только в момент наступления времени выпуска (окно до 2 минут)
        const isDueNow = (diffMsk >= 0 && diffMsk <= 2) || (diffLocal >= 0 && diffLocal <= 2);
        const alertKey = `${flight.id}_${relTime}`;

        if (isDueNow && !dismissedAlerts[alertKey] && !playedAlertsRef.current[alertKey]) {
          setActiveAlert(flight);
          playedAlertsRef.current[alertKey] = true;
          playReleaseAlertSound();
          break;
        }
      }
    };

    checkReleaseAlerts();
    const interval = setInterval(checkReleaseAlerts, 1000);
    return () => clearInterval(interval);
  }, [flights, dismissedAlerts]);

  // Быстрый выпуск рейса из всплывающего окна
  const handleQuickRelease = (flightId) => {
    setFlights(prev => prev.map(f => {
      if (f.id === flightId) {
        return {
          ...f,
          status: 'released',
          szv_sent: true,
          lir_sent: true
        };
      }
      return f;
    }));
    setActiveAlert(null);
  };

  const handleDismissAlert = (flight) => {
    if (!flight) return;
    const alertKey = `${flight.id}_${flight.release_time}`;
    setDismissedAlerts(prev => ({ ...prev, [alertKey]: true }));
    setActiveAlert(null);
  };

  // Обработка данных, полученных напрямую из AviaBit
  const handleAviaBitScheduleLoaded = (fetchedFlights, shiftInterval) => {
    // Для всех рейсов, чье время выпуска уже в прошлом, подавляем всплывающие окна
    const pastAlerts = {};
    for (const flight of fetchedFlights) {
      if (isFlightReleaseOverdue(flight)) {
        const alertKey = `${flight.id}_${flight.release_time || ''}`;
        pastAlerts[alertKey] = true;
        playedAlertsRef.current[alertKey] = true;
      }
    }
    setDismissedAlerts(prev => ({ ...pastAlerts, ...prev }));
    setFlights(fetchedFlights);
    if (shiftInterval) {
      setShiftInfo(prev => ({
        ...prev,
        date_interval: shiftInterval,
        date: shiftInterval
      }));
    }
  };

  // Обработка импорта файла Excel
  const handleImportExcelFile = async (file) => {
    try {
      const importedFlights = await parseExcelToFlights(file);
      if (!importedFlights || importedFlights.length === 0) {
        alert('В выбранном файле Excel не найдено подходящих строк рейсов.');
        return;
      }
      const pastAlerts = {};
      for (const flight of importedFlights) {
        if (isFlightReleaseOverdue(flight)) {
          const alertKey = `${flight.id}_${flight.release_time || ''}`;
          pastAlerts[alertKey] = true;
          playedAlertsRef.current[alertKey] = true;
        }
      }
      setDismissedAlerts(prev => ({ ...pastAlerts, ...prev }));
      setFlights(importedFlights);
      alert(`Успешно импортировано ${importedFlights.length} рейсов из файла Excel!`);
    } catch (err) {
      console.error(err);
      alert(`Ошибка чтения Excel файла: ${err.message}`);
    }
  };

  // Reorder via Drag-and-Drop
  const handleReorderFlights = (activeId, overId) => {
    setFlights((items) => {
      const oldIndex = items.findIndex(item => item.id === activeId);
      const newIndex = items.findIndex(item => item.id === overId);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  // Move up/down by arrow buttons
  const handleMoveUp = (index) => {
    if (index === 0) return;
    setFlights((items) => arrayMove(items, index, index - 1));
  };

  const handleMoveDown = (index) => {
    if (index >= flights.length - 1) return;
    setFlights((items) => arrayMove(items, index, index + 1));
  };

  // Update a single flight field with optional auto-sort
  const handleUpdateFlight = (id, updatedFields, shouldSort = false) => {
    setFlights(prev => {
      const updated = prev.map(f => (f.id === id ? { ...f, ...updatedFields } : f));
      if (shouldSort) {
        return sortFlightsChronologically(updated);
      }
      return updated;
    });
  };

  // Add new flight with chronological auto-sorting
  const handleAddFlight = (newFlight) => {
    const flightWithGalley = {
      galley: 'D',
      ...newFlight
    };
    setFlights(prev => sortFlightsChronologically([flightWithGalley, ...prev]));
  };

  // Delete flight
  const handleDeleteFlight = (id) => {
    const flight = flights.find(f => f.id === id);
    const flightName = flight ? flight.flight : 'рейс';
    if (window.confirm(`Удалить ${flightName} из журнала смены?`)) {
      setFlights(prev => prev.filter(f => f.id !== id));
    }
  };

  // Reset shift
  const handleResetShift = () => {
    if (window.confirm('Сбросить журнал смены к исходному демонстрационному расписанию?')) {
      setFlights(INITIAL_FLIGHTS);
      setDismissedAlerts({});
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    exportShiftToExcel(flights, shiftInfo);
  };

  // Filter flights by search query
  const filteredFlights = flights.filter(f => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (f.flight || '').toLowerCase().includes(q) ||
      (f.route_city || '').toLowerCase().includes(q) ||
      (f.route_airports || '').toLowerCase().includes(q) ||
      (f.ac_num || '').toLowerCase().includes(q) ||
      (f.baggage || '').toLowerCase().includes(q) ||
      (f.notes || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200">
      {/* Header Bar */}
      <Header
        shiftInfo={shiftInfo}
        setShiftInfo={setShiftInfo}
        onOpenAviaBitModal={() => setIsAviaBitModalOpen(true)}
        onImportExcelFile={handleImportExcelFile}
        onAddFlight={() => setIsAddModalOpen(true)}
        onExportExcel={handleExportExcel}
        onResetShift={handleResetShift}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isDark={isDark}
        setIsDark={setIsDark}
        lastSaved={lastSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 lg:p-4 max-w-[1920px] w-full mx-auto">
        
        {/* Printable Shift Title Header (visible only on print) */}
        <div className="hidden print-only mb-4 text-center">
          <h1 className="text-xl font-bold uppercase">
            Суточный план Диспетчера группы центровки
          </h1>
          <p className="text-sm">
            Смена: <strong>{shiftInfo.date_interval || shiftInfo.date} (09:00 - 09:00)</strong> | Диспетчер: <strong>{shiftInfo.dispatcher || '—'}</strong>
          </p>
        </div>

        {/* Summary Metric Tiles */}
        <SummaryStats flights={flights} />

        {/* Interactive Sortable Shift Table */}
        <ShiftTable
          flights={filteredFlights}
          onReorderFlights={handleReorderFlights}
          onUpdateFlight={handleUpdateFlight}
          onDeleteFlight={handleDeleteFlight}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onAddFlight={() => setIsAddModalOpen(true)}
        />
      </main>

      {/* Footer с версией и авторством */}
      <Footer />

      {/* Всплывающее окно оповещения о времени выпуска рейса */}
      {activeAlert && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200 max-w-md w-full no-print">
          <div className="bg-amber-500 dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500 rounded-2xl p-4 shadow-2xl text-slate-950 dark:text-white flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 text-amber-950 dark:text-amber-300 font-extrabold text-sm">
                <div className="p-2 rounded-lg bg-amber-600 dark:bg-amber-500/20 text-white dark:text-amber-400">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <span>ВРЕМЯ ВЫПУСКА РЕЙСА!</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={playReleaseAlertSound}
                  className="p-1 text-amber-900 dark:text-slate-400 hover:text-black dark:hover:text-white rounded"
                  title="Повторить звуковой сигнал"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDismissAlert(activeAlert)}
                  className="text-amber-900 dark:text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-xs text-amber-950 dark:text-slate-200 bg-white/60 dark:bg-slate-800/80 p-2.5 rounded-lg border border-amber-300 dark:border-slate-700 leading-snug">
              Пора выпускать рейс <strong className="text-sm font-mono text-sky-700 dark:text-sky-400">{activeAlert.flight}</strong> ({activeAlert.route_city || ''} {activeAlert.route_airports || ''}).
              <div className="flex items-center gap-3 mt-1.5 font-mono text-xs">
                <span>Выпуск: <strong className="text-emerald-700 dark:text-emerald-400">{activeAlert.release_time}</strong></span>
                <span>Вылет: <strong className="text-amber-700 dark:text-amber-400">{activeAlert.time}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => handleDismissAlert(activeAlert)}
                className="px-3 py-1 rounded-lg text-xs font-semibold text-amber-900 dark:text-slate-300 hover:bg-amber-400 dark:hover:bg-slate-800"
              >
                Напомнить позже
              </button>
              <button
                onClick={() => handleQuickRelease(activeAlert.id)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow transition-transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" /> Выпустить рейс
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно прямой загрузки из AviaBit */}
      <AviaBitFetchModal
        isOpen={isAviaBitModalOpen}
        onClose={() => setIsAviaBitModalOpen(false)}
        onScheduleLoaded={handleAviaBitScheduleLoaded}
      />

      {/* Add Flight Modal */}
      <NewFlightModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddFlight}
      />
    </div>
  );
}
