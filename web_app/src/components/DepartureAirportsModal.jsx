import React, { useState, useEffect } from 'react';
import { X, PlaneTakeoff, Search, Plus, Trash2, RotateCcw, Check, CheckSquare, Square, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { fetchDepartureAirports, saveDepartureAirports, deleteDepartureAirport } from '../utils/api';

const DEFAULT_AIRPORTS_FALLBACK = [
  { code: 'KQT', city_name: 'Бохтар', is_enabled: true, is_custom: false, sort_order: 1 },
  { code: 'VRA', city_name: 'Варадеро', is_enabled: true, is_custom: false, sort_order: 2 },
  { code: 'GOI', city_name: 'Гоа', is_enabled: true, is_custom: false, sort_order: 3 },
  { code: 'GOX', city_name: 'Гоа', is_enabled: true, is_custom: false, sort_order: 4 },
  { code: 'DYU', city_name: 'Душанбе', is_enabled: true, is_custom: false, sort_order: 5 },
  { code: 'ISB', city_name: 'Исламабад', is_enabled: true, is_custom: false, sort_order: 6 },
  { code: 'CCC', city_name: 'Кайококо', is_enabled: true, is_custom: false, sort_order: 7 },
  { code: 'CXR', city_name: 'Камрань', is_enabled: true, is_custom: false, sort_order: 8 },
  { code: 'HOG', city_name: 'Ольгин', is_enabled: true, is_custom: false, sort_order: 9 },
  { code: 'REN', city_name: 'Оренбург', is_enabled: true, is_custom: false, sort_order: 10 },
  { code: 'OSS', city_name: 'Ош', is_enabled: true, is_custom: false, sort_order: 11 },
  { code: 'PMW', city_name: 'Парламар', is_enabled: true, is_custom: false, sort_order: 12 },
  { code: 'PMV', city_name: 'Парламар', is_enabled: true, is_custom: false, sort_order: 13 },
  { code: 'ROV', city_name: 'Ростов', is_enabled: true, is_custom: false, sort_order: 14 },
  { code: 'XIY', city_name: 'Сиань', is_enabled: true, is_custom: false, sort_order: 15 },
  { code: 'AER', city_name: 'Сочи', is_enabled: true, is_custom: false, sort_order: 16 },
  { code: 'SUI', city_name: 'Сухум', is_enabled: true, is_custom: false, sort_order: 17 },
  { code: 'UUD', city_name: 'Улан-Удэ', is_enabled: true, is_custom: false, sort_order: 18 },
  { code: 'UTP', city_name: 'Утапао', is_enabled: true, is_custom: false, sort_order: 19 },
  { code: 'LBD', city_name: 'Худжант', is_enabled: true, is_custom: false, sort_order: 20 },
  { code: 'HTA', city_name: 'Чита', is_enabled: true, is_custom: false, sort_order: 21 },
  { code: 'SSH', city_name: 'Шарм Эль Шейх', is_enabled: true, is_custom: false, sort_order: 22 },
  { code: 'SVO', city_name: 'Москва', is_enabled: true, is_custom: false, sort_order: 23 },
  { code: 'TAS', city_name: 'Ташкент', is_enabled: true, is_custom: false, sort_order: 24 },
  { code: 'NMA', city_name: 'Наманган', is_enabled: true, is_custom: false, sort_order: 25 },
  { code: 'TJU', city_name: 'Куляб', is_enabled: true, is_custom: false, sort_order: 26 },
  { code: 'SKD', city_name: 'Самарканд', is_enabled: true, is_custom: false, sort_order: 27 }
];

export default function DepartureAirportsModal({
  isOpen,
  onClose,
  airports,
  onAirportsChange
}) {
  const [localAirports, setLocalAirports] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCity, setNewCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      if (airports && airports.length > 0) {
        setLocalAirports(airports);
      } else {
        loadAirports();
      }
    }
  }, [isOpen, airports]);

  const loadAirports = async () => {
    try {
      const res = await fetchDepartureAirports();
      if (res && res.airports && res.airports.length > 0) {
        setLocalAirports(res.airports);
        if (onAirportsChange) onAirportsChange(res.airports);
      } else {
        setLocalAirports(DEFAULT_AIRPORTS_FALLBACK);
      }
    } catch (e) {
      console.warn('Fallback to local airports:', e);
      setLocalAirports(DEFAULT_AIRPORTS_FALLBACK);
    }
  };

  if (!isOpen) return null;

  // Переключение активности одного аэропорта
  const handleToggle = (code) => {
    setLocalAirports(prev =>
      prev.map(a => a.code === code ? { ...a, is_enabled: !a.is_enabled } : a)
    );
  };

  // Выбрать все
  const handleSelectAll = () => {
    setLocalAirports(prev => prev.map(a => ({ ...a, is_enabled: true })));
  };

  // Снять все
  const handleDeselectAll = () => {
    setLocalAirports(prev => prev.map(a => ({ ...a, is_enabled: false })));
  };

  // Сбросить к стандартному списку
  const handleResetToDefault = () => {
    if (window.confirm('Сбросить список городов вылета к стандартным настройкам?')) {
      setLocalAirports(DEFAULT_AIRPORTS_FALLBACK);
    }
  };

  // Добавление нового города/аэропорта
  const handleAddAirport = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const codeClean = newCode.trim().toUpperCase();
    const cityClean = newCity.trim();

    if (!codeClean || !cityClean) {
      setErrorMsg('Укажите 3-буквенный IATA код и название города');
      return;
    }

    if (codeClean.length < 2 || codeClean.length > 4) {
      setErrorMsg('Код IATA должен состоять из 3 букв (например KZN, LED, SVX)');
      return;
    }

    if (localAirports.some(a => a.code === codeClean)) {
      setErrorMsg(`Аэропорт с кодом ${codeClean} уже есть в списке`);
      return;
    }

    const newEntry = {
      code: codeClean,
      city_name: cityClean,
      is_enabled: true,
      is_custom: true,
      sort_order: localAirports.length + 1
    };

    setLocalAirports(prev => [...prev, newEntry]);
    setNewCode('');
    setNewCity('');
    setSuccessMsg(`Аэропорт ${codeClean} (${cityClean}) добавлен!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Удаление кастомного аэропорта
  const handleDeleteCustom = async (code) => {
    if (!window.confirm(`Удалить аэропорт ${code} из списка?`)) return;
    try {
      await deleteDepartureAirport(code);
    } catch (e) {}
    setLocalAirports(prev => prev.filter(a => a.code !== code));
  };

  // Сохранение и закрытие
  const handleSaveAndClose = async () => {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await saveDepartureAirports(localAirports);
      if (onAirportsChange) {
        onAirportsChange(localAirports);
      }
      localStorage.setItem('aeroplan_departure_airports', JSON.stringify(localAirports));
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка сохранения');
      // В любом случае сохраняем локально
      if (onAirportsChange) {
        onAirportsChange(localAirports);
      }
      localStorage.setItem('aeroplan_departure_airports', JSON.stringify(localAirports));
      setTimeout(() => onClose(), 800);
    } finally {
      setIsSaving(false);
    }
  };

  // Фильтрация списка поиском
  const filtered = localAirports.filter(a => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return a.code.toLowerCase().includes(q) || a.city_name.toLowerCase().includes(q);
  });

  const enabledCount = localAirports.filter(a => a.is_enabled).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleIn">
        
        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <PlaneTakeoff className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                Аэропорты и города вылета
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Фильтр AviaBit
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Включайте или добавляйте города, рейсы из которых должны загружаться в смену
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Панель управления и поиска */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Поиск */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по коду (AER) или городу (Сочи)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Быстрые действия */}
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black px-2.5 py-1 rounded-lg mr-1 ${
              enabledCount > 0
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50'
            }`}>
              Включено: {enabledCount} из {localAirports.length}
            </span>

            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
              title="Включить все города"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
              Все
            </button>

            <button
              onClick={handleDeselectAll}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
              title="Отключить все города"
            >
              <Square className="w-3.5 h-3.5 text-slate-400" />
              Снять
            </button>

            <button
              onClick={handleResetToDefault}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
              title="Сбросить к стандарту (26 городов)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              Сброс
            </button>
          </div>
        </div>

        {/* Уведомления */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Сетка карточек городов */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <PlaneTakeoff className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-bold">Города не найдены</p>
              <p className="text-xs">Попробуйте изменить поисковый запрос или добавьте новый город ниже</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filtered.map(item => {
                const isChecked = !!item.is_enabled;
                return (
                  <div
                    key={item.code}
                    onClick={() => handleToggle(item.code)}
                    className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between select-none group ${
                      isChecked
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 shadow-sm hover:border-blue-400 dark:hover:border-blue-700'
                        : 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200/60 dark:border-slate-800/60 opacity-60 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Чек-бокс индикатор */}
                      <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      {/* Текстовая информация */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white tracking-wide">
                            {item.code}
                          </span>
                          {item.is_custom && (
                            <span className="text-[9px] font-bold px-1 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                              нов
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate" title={item.city_name}>
                          {item.city_name}
                        </p>
                      </div>
                    </div>

                    {/* Кнопка удаления для добавленных вручную городов */}
                    {item.is_custom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustom(item.code);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-md transition-all shrink-0 ml-1"
                        title="Удалить добавленный город"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Форма быстрого добавления нового города */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40">
          <form onSubmit={handleAddAirport} className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-blue-500" />
              Добавить город:
            </span>
            <input
              type="text"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              placeholder="IATA (KZN)"
              maxLength={4}
              className="w-24 px-2.5 py-1.5 text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              placeholder="Название города (Казань)"
              className="flex-1 min-w-[140px] px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Добавить
            </button>
          </form>
        </div>

        {/* Футер */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Выбрано <b className="text-blue-600 dark:text-blue-400">{enabledCount}</b> городов вылета
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSaveAndClose}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? 'Сохранение...' : 'Применить и сохранить'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
