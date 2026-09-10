import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  X,
  RefreshCw,
  Search,
  User,
  Clock,
  ArrowRight,
  Download,
  AlertCircle,
  FileText,
  Fuel,
  Users,
  Plane,
  CheckSquare,
  Scale,
  Package,
  Calendar,
  Layers
} from 'lucide-react';
import { fetchFlightHistory } from '../utils/api';

const CATEGORY_MAP = {
  weights_fuel: ['fuel_block', 'fuel_trip', 'fuel_taxi', 'dow', 'doi', 'galley', 'mtow', 'pax', 'crew', 'cargo', 'mail', 'baggage'],
  statuses: ['status', 'lir_sent', 'szv_sent', 'ldm_sent', 'astra_times_sent'],
  schedule_plane: ['flight', 'flight_number', 'flight_date', 'time', 'departure_time', 'release_time', 'ac_num', 'ac_type', 'ac_config', 'route_city', 'route_airports'],
  notes: ['notes']
};

const FIELD_ICONS = {
  fuel_block: Fuel,
  fuel_trip: Fuel,
  fuel_taxi: Fuel,
  pax: Users,
  crew: Users,
  dow: Scale,
  doi: Scale,
  mtow: Scale,
  cargo: Package,
  mail: Package,
  baggage: Package,
  flight: Plane,
  flight_number: Plane,
  ac_num: Plane,
  ac_type: Plane,
  ac_config: Layers,
  time: Clock,
  departure_time: Clock,
  release_time: Clock,
  flight_date: Calendar,
  status: AlertCircle,
  lir_sent: CheckSquare,
  szv_sent: CheckSquare,
  ldm_sent: CheckSquare,
  astra_times_sent: CheckSquare,
  notes: FileText
};

export default function FlightHistoryModal({ isOpen, onClose, flight }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const flightNumber = flight ? (flight.flight || flight.flight_no || flight.flight_number || '') : '';
  const flightDate = flight ? (flight.flight_date || '') : '';
  const flightId = flight ? (flight.id || '') : '';
  const routeCity = flight ? (flight.route_city || '') : '';
  const routeAirports = flight ? (flight.route_airports || '') : '';

  const loadHistory = async () => {
    if (!flightNumber && !flightId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFlightHistory({
        flightId: flightId,
        flightNumber: flightNumber,
        flightDate: flightDate,
        limit: 200
      });
      if (res && res.history) {
        setHistory(res.history);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки истории рейса:', err);
      setError(err.message || 'Не удалось загрузить историю изменений');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, flightId, flightNumber, flightDate]);

  // Фильтрация записей
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // 1. Категория
      if (selectedCategory !== 'all') {
        const allowedFields = CATEGORY_MAP[selectedCategory] || [];
        if (!allowedFields.includes(item.field_name)) {
          return false;
        }
      }

      // 2. Поисковый запрос
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const label = (item.field_label || item.field_name || '').toLowerCase();
        const author = (item.changed_by || '').toLowerCase();
        const oldVal = (item.old_val || '').toLowerCase();
        const newVal = (item.new_val || '').toLowerCase();
        return label.includes(q) || author.includes(q) || oldVal.includes(q) || newVal.includes(q);
      }

      return true;
    });
  }, [history, selectedCategory, searchQuery]);

  // Экспорт истории в текстовый файл
  const handleExportTxt = () => {
    if (!history.length) return;
    let content = 'ПРОТОКОЛ АУДИТА И ИСТОРИИ ИЗМЕНЕНИЙ РЕЙСА\n';
    content += 'Рейс: ' + flightNumber + (flightDate ? (' (' + flightDate + ')') : '') + '\n';
    if (routeCity || routeAirports) content += 'Маршрут: ' + routeCity + ' (' + routeAirports + ')\n';
    content += 'Дата выгрузки: ' + new Date().toLocaleString('ru-RU') + '\n';
    content += 'Всего зафиксировано изменений: ' + history.length + '\n';
    content += '------------------------------------------------------------\n\n';

    history.forEach((h, idx) => {
      content += '[' + (idx + 1) + '] ' + h.created_at + ' (МСК) | Автор: ' + (h.changed_by || 'Диспетчер') + '\n';
      content += '    Поле: ' + (h.field_label || h.field_name) + '\n';
      content += '    Было:  "' + (h.old_val || '—') + '"\n';
      content += '    Стало: "' + (h.new_val || '—') + '"\n\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'История_рейса_' + flightNumber + '_' + (flightDate || 'все') + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-inner">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  История изменений рейса
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white font-mono font-black text-xs shadow-xs">
                  {flightNumber || '—'}
                </span>
                {flightDate && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
                    📅 {flightDate}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {routeCity ? (routeCity + ' ') : ''}
                {routeAirports ? ('(' + routeAirports + ') ') : ''}
                • Полный хронологический протокол правок диспетчеров
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadHistory}
              disabled={loading}
              className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Обновить историю"
            >
              <RefreshCw className={'w-4 h-4 ' + (loading ? 'animate-spin text-sky-500' : '')} />
            </button>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleExportTxt}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors border border-slate-200 dark:border-slate-700 shadow-xs"
                title="Экспортировать историю правок в файл"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Экспорт</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Панель фильтров и поиска */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex flex-wrap items-center justify-between gap-3">
          {/* Категории */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={'px-2.5 py-1 rounded-lg text-xs font-bold transition-all ' + (
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              Все ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('weights_fuel')}
              className={'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ' + (
                selectedCategory === 'weights_fuel'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <Fuel className="w-3.5 h-3.5" />
              <span>Топливо и Веса</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('statuses')}
              className={'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ' + (
                selectedCategory === 'statuses'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Статусы и Чекбоксы</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('schedule_plane')}
              className={'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ' + (
                selectedCategory === 'schedule_plane'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Расписание и Борт</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('notes')}
              className={'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ' + (
                selectedCategory === 'notes'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              )}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Примечания</span>
            </button>
          </div>

          {/* Поиск */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по правкам..."
              className="w-full pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Тело модального окна — Таймлайн изменений */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          {loading && history.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-xs font-semibold">Загрузка журнала изменений рейса...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <div className="font-bold">Ошибка загрузки истории</div>
                <div>{error}</div>
              </div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mb-3 shadow-inner">
                <History className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {searchQuery || selectedCategory !== 'all' ? 'Ничего не найдено по фильтрам' : 'История правок пуста'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Попробуйте сбросить поисковый запрос или выбрать категорию «Все».'
                  : 'По данному рейсу пока нет зафиксированных правок. При редактировании ячеек все изменения автоматически запишутся в этот журнал.'}
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {filteredHistory.map((item, idx) => {
                const IconComponent = FIELD_ICONS[item.field_name] || FileText;
                const isSystem = (item.changed_by || '').toLowerCase().includes('aviabit') || (item.changed_by || '').toLowerCase().includes('system');

                return (
                  <div
                    key={item.id || idx}
                    className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-md transition-all group"
                  >
                    {/* Точка таймлайна */}
                    <div className="absolute -left-[27px] top-3.5 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white dark:border-slate-900 shadow-xs group-hover:scale-125 transition-transform" />

                    {/* Верхняя строка карточки */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {item.field_label || item.field_name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        {/* Автор */}
                        <div className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                          {isSystem ? <Plane className="w-3 h-3 text-amber-500" /> : <User className="w-3 h-3 text-sky-500" />}
                          <span className={isSystem ? 'text-amber-700 dark:text-amber-400 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                            {item.changed_by || 'Диспетчер'}
                          </span>
                        </div>

                        {/* Время */}
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{item.created_at}</span>
                        </div>
                      </div>
                    </div>

                    {/* Блок Было -> Стало */}
                    <div className="pt-2.5 flex flex-wrap items-center gap-2 text-xs font-mono">
                      {/* Старое значение */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 max-w-full overflow-hidden">
                        <span className="text-[10px] font-sans font-bold text-slate-400 uppercase">Было:</span>
                        <span className="line-through truncate">
                          {item.old_val ? item.old_val : <span className="italic text-slate-400">пусто</span>}
                        </span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-sky-500 shrink-0" />

                      {/* Новое значение */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200 font-bold max-w-full overflow-hidden">
                        <span className="text-[10px] font-sans font-bold text-sky-600 dark:text-sky-400 uppercase">Стало:</span>
                        <span className="truncate">
                          {item.new_val ? item.new_val : <span className="italic opacity-60">пусто</span>}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Подвал */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 shrink-0 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Записей в истории: <span className="font-bold text-slate-900 dark:text-slate-100">{filteredHistory.length}</span>
            {filteredHistory.length !== history.length && (
              <span> (из {history.length})</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-semibold transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
