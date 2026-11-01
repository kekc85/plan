import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plane, Search, Filter, UploadCloud, Download, CheckCircle2, 
  AlertCircle, RefreshCw, FileText, Layers, Scale, Sliders, 
  ChevronRight, Info, X, Edit3, Save, FileSpreadsheet, Sparkles,
  Maximize2, Printer,
  ArrowRightLeft, Check, AlertTriangle
} from 'lucide-react';
import { adminGetFleetWb, adminUpdateFleetWb, adminUploadFleetWbr } from '../utils/api';
import { fleetWbData as defaultFleetWb } from '../utils/fleetWbLookup';

export default function FleetWbManager() {
  // База данных флота W&B (по умолчанию бандлированный JSON)
  const [fleet, setFleet] = useState(defaultFleetWb);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Выбранный для детального просмотра борт (ключ конфигурации, например '73343_EO')
  const [selectedKey, setSelectedKey] = useState('73343_EO');

  // Фильтры
  const [searchQuery, setSearchQuery] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL'); // 'ALL' | 'N4' | 'EO' | 'WET_LEASE'
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'B738' | 'B739' | 'A321' | 'A332' | 'A333' | 'B772' | 'E190'

  // Интерактивный симулятор центровки (выбор экипажа и кухни)
  const [simCrew, setSimCrew] = useState('');
  const [simPantry, setSimPantry] = useState('');

  // Редактирование максимальных весов (MZFW, MTOW, MLAW)
  const [isEditingWeights, setIsEditingWeights] = useState(false);
  const [editMzfw, setEditMzfw] = useState('');
  const [editMtow, setEditMtow] = useState('');
  const [editMlaw, setEditMlaw] = useState('');
  const [isSavingWeight, setIsSavingWeight] = useState(false);

  // Загрузка нового WBR PDF / Drag & Drop
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFullMatrixModal, setShowFullMatrixModal] = useState(false);
  const fileInputRef = useRef(null);

  // Загрузка актуального реестра с сервера
  const loadFleetRegistry = async () => {
    setIsLoading(true);
    try {
      const res = await adminGetFleetWb();
      if (res && res.fleet && Object.keys(res.fleet).length > 0) {
        setFleet(res.fleet);
      }
    } catch (err) {
      console.warn('Используется локальная база флота fleet_wb:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFleetRegistry();
  }, []);

  // Список всех конфигураций
  const configKeys = useMemo(() => Object.keys(fleet), [fleet]);

  // Фильтрация флота
  const filteredKeys = useMemo(() => {
    return configKeys.filter(key => {
      const item = fleet[key];
      if (!item) return false;

      // Поиск по номеру борта или названию модели
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().replace(/^(ra|ра)[-\s]?/i, '').trim();
        const tailMatch = (item.tail || '').toLowerCase().includes(q);
        const modelMatch = (item.model || '').toLowerCase().includes(q);
        const fileMatch = (item.file || '').toLowerCase().includes(q);
        if (!tailMatch && !modelMatch && !fileMatch) return false;
      }

      // Фильтр по оператору
      if (operatorFilter === 'N4' && item.operator !== 'N4') return false;
      if (operatorFilter === 'EO' && item.operator !== 'EO') return false;
      if (operatorFilter === 'WET_LEASE') {
        const isWetLease = item.tail === '73343' || item.tail === '73344';
        if (!isWetLease) return false;
      }

      // Фильтр по типу ВС
      if (typeFilter !== 'ALL') {
        const m = (item.model || '').toUpperCase();
        if (typeFilter === 'B738' && !m.includes('737-800') && !m.includes('738')) return false;
        if (typeFilter === 'B739' && !m.includes('737-900') && !m.includes('739')) return false;
        if (typeFilter === 'A321' && !m.includes('321')) return false;
        if (typeFilter === 'A332' && !m.includes('330-200') && !m.includes('A332')) return false;
        if (typeFilter === 'A333' && !m.includes('330-300') && !m.includes('A333')) return false;
        if (typeFilter === 'B772' && !m.includes('777-200') && !m.includes('B772')) return false;
        if (typeFilter === 'E190' && !m.includes('190') && !m.includes('E190')) return false;
      }

      return true;
    });
  }, [fleet, configKeys, searchQuery, operatorFilter, typeFilter]);

  // Если выбранный ключ не входит в отфильтрованные, переключаем на первый
  useEffect(() => {
    if (filteredKeys.length > 0 && !filteredKeys.includes(selectedKey)) {
      setSelectedKey(filteredKeys[0]);
    }
  }, [filteredKeys, selectedKey]);

  // Текущий выбранный самолёт
  const currentAircraft = fleet[selectedKey] || null;

  // Инициализация симулятора при переключении борта
  useEffect(() => {
    if (currentAircraft && currentAircraft.matrix) {
      const crewKeys = Object.keys(currentAircraft.matrix);
      const defaultCrew = crewKeys.includes('2/5') ? '2/5' : (crewKeys.includes('2/2') ? '2/2' : crewKeys[0] || '');
      setSimCrew(defaultCrew);

      const pantryList = defaultCrew && currentAircraft.matrix[defaultCrew]
        ? Object.keys(currentAircraft.matrix[defaultCrew])
        : (currentAircraft.pantry_codes || []);
      
      const defaultPantry = pantryList.includes('E') ? 'E' : (pantryList[0] || '');
      setSimPantry(defaultPantry);

      // Инициализация максимальных весов
      const mw = currentAircraft.max_weights || {};
      setEditMzfw(mw.mzfw ? String(mw.mzfw) : '');
      setEditMtow(mw.mtow ? String(mw.mtow) : '');
      setEditMlaw(mw.mlaw ? String(mw.mlaw) : '');
      setIsEditingWeights(false);
    }
  }, [selectedKey, currentAircraft]);

  // Рассчитанные значения для симулятора
  const simResult = useMemo(() => {
    if (!currentAircraft || !currentAircraft.matrix || !simCrew || !simPantry) return null;
    const crewData = currentAircraft.matrix[simCrew];
    if (!crewData) return null;
    return crewData[simPantry] || null;
  }, [currentAircraft, simCrew, simPantry]);

  // Сохранение отредактированных весов
  const handleSaveWeights = async () => {
    if (!currentAircraft || !selectedKey) return;
    setIsSavingWeight(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const updatedAircraft = {
        ...currentAircraft,
        max_weights: {
          mzfw: editMzfw ? parseInt(editMzfw, 10) : null,
          mtow: editMtow ? parseInt(editMtow, 10) : null,
          mlaw: editMlaw ? parseInt(editMlaw, 10) : null
        }
      };

      // Локальное обновление
      setFleet(prev => ({ ...prev, [selectedKey]: updatedAircraft }));

      // Серверное обновление
      await adminUpdateFleetWb(selectedKey, updatedAircraft);

      setStatusMsg({ type: 'success', text: `Предельные веса для RA-${currentAircraft.tail} успешно сохранены` });
      setIsEditingWeights(false);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Ошибка сохранения предельных весов' });
    } finally {
      setIsSavingWeight(false);
    }
  };

  // Обработка загрузки WBR PDF
  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && !file.name.toLowerCase().endsWith('.json')) {
      setStatusMsg({ type: 'error', text: 'Пожалуйста, выберите файл центровочного графика в формате PDF или JSON' });
      return;
    }

    setUploadLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      // Если загружается JSON файл полной базы
      if (file.name.toLowerCase().endsWith('.json')) {
        const text = await file.text();
        const parsedJson = JSON.parse(text);
        if (typeof parsedJson === 'object') {
          setFleet(parsedJson);
          setStatusMsg({ type: 'success', text: `База флота успешно загружена из ${file.name} (${Object.keys(parsedJson).length} конфигураций)` });
          setShowUploadModal(false);
          return;
        }
      }

      // Отправка PDF на серверный парсер
      const res = await adminUploadFleetWbr(file);
      if (res && res.success && res.parsed) {
        setUploadPreview({
          key: res.key,
          data: res.parsed,
          file_name: file.name
        });
        setShowUploadModal(true);
      } else {
        throw new Error(res.message || 'Не удалось распознать структуру PDF графика WBR');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Ошибка парсинга PDF: ${err.message}` });
    } finally {
      setUploadLoading(false);
    }
  };

  // Подтверждение импорта распознанного WBR
  const handleConfirmImport = async () => {
    if (!uploadPreview) return;
    setUploadLoading(true);

    try {
      const { key, data } = uploadPreview;
      const updatedFleet = { ...fleet, [key]: data };
      setFleet(updatedFleet);
      setSelectedKey(key);

      await adminUpdateFleetWb(key, data);

      setStatusMsg({ 
        type: 'success', 
        text: `Центровочный график для RA-${data.tail} (${data.operator}, ${data.revision}) успешно добавлен в реестр!` 
      });
      setShowUploadModal(false);
      setUploadPreview(null);
    } catch (err) {
      setStatusMsg({ type: 'error', text: `Ошибка сохранения графика: ${err.message}` });
    } finally {
      setUploadLoading(false);
    }
  };

  // Экспорт базы флота в файл fleet_wb.json
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fleet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fleet_wb_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-100 animate-in fade-in">
      
      {/* 1. ВЕРХНЯЯ ПАНЕЛЬ: ЗАГОЛОВОК, СТАТИСТИКА И ДЕЙСТВИЯ */}
      <div className="bg-slate-50 dark:bg-slate-850 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
              <span>Реестр центровочных графиков флота (W&B)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300">
                {configKeys.length} ВС
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Официальные матрицы DOW / DOI (Dry Operating Weight & Index) авиакомпаний Nordwind и Икар
            </p>
          </div>
        </div>

        {/* Кнопки экспорта и загрузки */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm"
            title="Экспортировать актуальную базу W&B флота в файл fleet_wb.json"
          >
            <Download className="w-3.5 h-3.5 text-sky-500" />
            <span>Экспорт JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-sm">
            <UploadCloud className="w-4 h-4" />
            <span>Загрузить WBR (PDF)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Уведомления статуса */}
      {statusMsg.text && (
        <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold animate-in fade-in border ${
          statusMsg.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
        }`}>
          {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{statusMsg.text}</span>
          <button onClick={() => setStatusMsg({ type: '', text: '' })} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. ПАНЕЛЬ ФИЛЬТРОВ И ПОИСКА */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-100/70 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
        
        {/* Поисковая строка */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Номер борта (73343) или модель..."
            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Фильтры авиакомпании */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold">
          <button
            onClick={() => setOperatorFilter('ALL')}
            className={`px-2.5 py-1 rounded-md transition-all ${operatorFilter === 'ALL' ? 'bg-sky-500 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}
          >
            Все ({configKeys.length})
          </button>
          <button
            onClick={() => setOperatorFilter('N4')}
            className={`px-2.5 py-1 rounded-md transition-all ${operatorFilter === 'N4' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'}`}
          >
            Nordwind (N4)
          </button>
          <button
            onClick={() => setOperatorFilter('EO')}
            className={`px-2.5 py-1 rounded-md transition-all ${operatorFilter === 'EO' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-sky-600'}`}
          >
            Икар (EO)
          </button>
          <button
            onClick={() => setOperatorFilter('WET_LEASE')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${operatorFilter === 'WET_LEASE' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'}`}
            title="Борта RA-73343 и RA-73344 с двумя разными центровками"
          >
            <ArrowRightLeft className="w-3 h-3" />
            <span>Мокрый лизинг</span>
          </button>
        </div>

        {/* Фильтры типов ВС */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px] font-bold">
          {['ALL', 'B738', 'B739', 'A321', 'A332', 'A333', 'B772', 'E190'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-2 py-0.5 rounded-md border transition-all ${
                typeFilter === type
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              {type === 'ALL' ? 'Любой тип' : type}
            </button>
          ))}
        </div>
      </div>

      {/* 3. ОСНОВНОЙ ДВУХКОЛОНОЧНЫЙ СПЛИТ-ИНТЕРФЕЙС (ВАРИАНТ А) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА: СПИСОК ВС (40% ширины) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 space-y-2 max-h-[680px] overflow-y-auto shadow-sm">
          <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            <span>Воздушные суда ({filteredKeys.length})</span>
            <span>Базовый DOW / DOI</span>
          </div>

          {filteredKeys.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Plane className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              Самолетов по заданным фильтрам не найдено
            </div>
          ) : (
            filteredKeys.map(key => {
              const item = fleet[key];
              const isSelected = selectedKey === key;
              const isWetLease = item.tail === '73343' || item.tail === '73344';

              return (
                <div
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 shadow-sm ring-1 ring-sky-500/30'
                      : 'bg-slate-50/70 dark:bg-slate-850/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Номер борта + Авиакомпания */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                        RA-{item.tail}
                      </span>

                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-black uppercase ${
                        item.operator === 'N4'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                      }`}>
                        {item.operator}
                      </span>

                      {isWetLease && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-0.5" title="Мокрый лизинг: действует для N4 и EO">
                          <ArrowRightLeft className="w-2.5 h-2.5" />
                          Лизинг
                        </span>
                      )}

                      {item.fly_kit_mode === 'FAK_2AKE' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          FAK
                        </span>
                      )}
                    </div>

                    {/* Базовый вес и индекс */}
                    <div className="text-right font-mono text-[11px]">
                      {item.basic_weight ? (
                        <>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {item.basic_weight.toLocaleString()} кг
                          </span>
                          {item.basic_index !== undefined && item.basic_index !== null && (
                            <span className="text-slate-400 ml-1.5">
                              ({item.basic_index})
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 text-[10px]">
                          {item.matrix?.['0/0'] ? '0/0 в матрице' : 'По матрице W&B'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Дополнительная строка: модель и дата ревизии */}
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.model}
                    </span>
                    <span>
                      {item.revision || 'WBR'} {item.date ? `(${item.date})` : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ПРАВАЯ КОЛОНКА: ДЕТАЛЬНЫЙ ПРОСМОТР И МАТРИЦА W&B (60% ширины) */}
        <div className="lg:col-span-7 space-y-4">
          {currentAircraft ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
              
              {/* Шапка выбранного ВС */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-mono font-black text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                      RA-{currentAircraft.tail}
                    </h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      currentAircraft.operator === 'N4'
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                    }`}>
                      {currentAircraft.operator === 'N4' ? 'Nordwind Airlines' : 'Ikar Airlines'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {currentAircraft.model}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                      <FileText className="w-3.5 h-3.5 text-sky-500" />
                      {currentAircraft.file || 'WBR График центровки'}
                    </span>
                    <span>•</span>
                    <span>Ревизия: <strong className="text-slate-700 dark:text-slate-200">{currentAircraft.revision || 'Rev 1.0'}</strong></span>
                    <span>•</span>
                    <span>Дата: <strong className="text-slate-700 dark:text-slate-200">{currentAircraft.date || '—'}</strong></span>
                  </div>
                </div>

                {/* Базовые параметры */}
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Basic Weight / Index</div>
                  <div className="font-mono font-black text-sm text-sky-600 dark:text-sky-400">
                    {currentAircraft.basic_weight ? `${currentAircraft.basic_weight.toLocaleString()} кг` : <span className="text-slate-400 font-medium text-xs">В матрице W&B</span>} 
                    {currentAircraft.basic_index !== undefined && currentAircraft.basic_index !== null && (
                      <span className="text-slate-400 font-normal ml-1">/ {currentAircraft.basic_index}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* КАРТОЧКИ ПРЕДЕЛЬНЫХ ВЕСОВ: MZFW, MTOW, MLAW */}
              <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                    <Scale className="w-3.5 h-3.5 text-sky-500" />
                    Предельные взлетно-посадочные веса (Structural Limits)
                  </span>
                  
                  {!isEditingWeights ? (
                    <button
                      onClick={() => setIsEditingWeights(true)}
                      className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Изменить веса</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleSaveWeights}
                        disabled={isSavingWeight}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-xs"
                      >
                        <Save className="w-3 h-3" />
                        <span>{isSavingWeight ? 'Сохранение...' : 'Сохранить'}</span>
                      </button>
                      <button
                        onClick={() => setIsEditingWeights(false)}
                        className="px-2 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-600 rounded-lg"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {/* MZFW */}
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">MZFW (Zero Fuel)</div>
                    {isEditingWeights ? (
                      <input
                        type="number"
                        value={editMzfw}
                        onChange={(e) => setEditMzfw(e.target.value)}
                        placeholder="кг"
                        className="w-full mt-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold focus:ring-1 focus:ring-sky-500"
                      />
                    ) : (
                      <div className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                        {currentAircraft.max_weights?.mzfw ? `${currentAircraft.max_weights.mzfw.toLocaleString()} кг` : <span className="text-slate-400 font-normal text-xs">Не задан</span>}
                      </div>
                    )}
                  </div>

                  {/* MTOW */}
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">MTOW (Take-Off)</div>
                    {isEditingWeights ? (
                      <input
                        type="number"
                        value={editMtow}
                        onChange={(e) => setEditMtow(e.target.value)}
                        placeholder="кг"
                        className="w-full mt-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold focus:ring-1 focus:ring-sky-500"
                      />
                    ) : (
                      <div className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                        {currentAircraft.max_weights?.mtow ? `${currentAircraft.max_weights.mtow.toLocaleString()} кг` : <span className="text-slate-400 font-normal text-xs">Не задан</span>}
                      </div>
                    )}
                  </div>

                  {/* MLAW */}
                  <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200/80 dark:border-slate-700/80">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">MLAW (Landing)</div>
                    {isEditingWeights ? (
                      <input
                        type="number"
                        value={editMlaw}
                        onChange={(e) => setEditMlaw(e.target.value)}
                        placeholder="кг"
                        className="w-full mt-0.5 px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs font-mono font-bold focus:ring-1 focus:ring-sky-500"
                      />
                    ) : (
                      <div className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                        {currentAircraft.max_weights?.mlaw ? `${currentAircraft.max_weights.mlaw.toLocaleString()} кг` : <span className="text-slate-400 font-normal text-xs">Не задан</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ИНТЕРАКТИВНЫЙ СИМУЛЯТОР / КАЛЬКУЛЯТОР W&B */}
              <div className="bg-sky-50/70 dark:bg-sky-950/30 p-3 rounded-xl border border-sky-200 dark:border-sky-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-sky-950 dark:text-sky-200">
                      Интерактивный симулятор расчета DOW / DOI
                    </div>
                    <div className="text-[10px] text-sky-700 dark:text-sky-400">
                      Выберите экипаж и кухню для моментального вычисления и подсветки в матрице
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Селектор экипажа */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Экипаж:</label>
                    <select
                      value={simCrew}
                      onChange={(e) => setSimCrew(e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-lg text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      {currentAircraft.matrix && Object.keys(currentAircraft.matrix).map(crew => (
                        <option key={crew} value={crew}>{crew}</option>
                      ))}
                    </select>
                  </div>

                  {/* Селектор кухни */}
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500">Кухня:</label>
                    <select
                      value={simPantry}
                      onChange={(e) => setSimPantry(e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-lg text-xs font-bold font-mono text-slate-900 dark:text-slate-100 focus:outline-none"
                    >
                      {simCrew && currentAircraft.matrix?.[simCrew] && Object.keys(currentAircraft.matrix[simCrew]).map(pantry => (
                        <option key={pantry} value={pantry}>Pantry {pantry}</option>
                      ))}
                    </select>
                  </div>

                  {/* Результат симуляции */}
                  {simResult ? (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 rounded-xl shadow-xs font-mono">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 mr-1">DOW:</span>
                        <strong className="text-xs text-emerald-600 dark:text-emerald-400 font-black">{simResult.dow.toLocaleString()} кг</strong>
                      </div>
                      <div className="border-l border-slate-200 dark:border-slate-700 pl-2">
                        <span className="text-[10px] font-bold text-slate-400 mr-1">DOI:</span>
                        <strong className="text-xs text-sky-600 dark:text-sky-400 font-black">{simResult.doi}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-600 font-bold px-2 py-1 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
                      Комбинация отсутствует
                    </div>
                  )}
                </div>
              </div>

              {/* ПОЛНАЯ ТАБЛИЦА МАТРИЦЫ W&B */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] font-bold text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-700 dark:text-slate-200">Полная центровочная матрица графиков WBR</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">• Клик по ячейке для моментального выбора</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullMatrixModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-lg shadow-xs transition-all"
                    title="Открыть всю таблицу весов и индексов целиком как в оригинале"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Вся таблица целиком (Оригинал WBR)</span>
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[380px] overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 dark:bg-slate-850 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 text-[10px] font-extrabold uppercase text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="px-3 py-2 bg-slate-100 dark:bg-slate-850 sticky left-0 z-20">Экипаж</th>
                        {(currentAircraft.pantry_codes || ['A', 'B', 'E']).map(pCode => (
                          <th key={pCode} className="px-3 py-2 text-center border-l border-slate-200 dark:border-slate-800">
                            Pantry {pCode}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-mono text-[11px]">
                      {currentAircraft.matrix && Object.entries(currentAircraft.matrix).map(([crewCode, pantries]) => (
                        <tr key={crewCode} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                          <td className="px-3 py-1.5 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/50 sticky left-0 z-10 whitespace-nowrap">
                            {crewCode}
                          </td>
                          {(currentAircraft.pantry_codes || ['A', 'B', 'E']).map(pCode => {
                            const cell = pantries[pCode];
                            const isHighlighted = simCrew === crewCode && simPantry === pCode;

                            return (
                              <td
                                key={pCode}
                                onClick={() => {
                                  if (cell) {
                                    setSimCrew(crewCode);
                                    setSimPantry(pCode);
                                  }
                                }}
                                className={`px-2.5 py-1.5 text-center border-l border-slate-100 dark:border-slate-800/60 cursor-pointer transition-all ${
                                  isHighlighted
                                    ? 'bg-amber-100 dark:bg-amber-900/50 text-slate-950 dark:text-amber-100 font-black ring-2 ring-amber-500 scale-[1.02] shadow-sm'
                                    : cell
                                    ? 'hover:bg-sky-50 dark:hover:bg-sky-950/30'
                                    : 'text-slate-300 dark:text-slate-700'
                                }`}
                              >
                                {cell ? (
                                  <div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100">{cell.dow}</div>
                                    <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">{cell.doi}</div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 dark:text-slate-700">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <Plane className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Выберите самолет из списка слева</h4>
              <p className="text-xs text-slate-400 mt-1">Здесь откроется детальный график центровок DOW/DOI и предельные веса</p>
            </div>
          )}
        </div>

      </div>


      {/* 5. ПОЛНОЭКРАННОЕ МОДАЛЬНОЕ ОКНО ПРОСМОТРА ВСЕЙ ТАБЛИЦЫ WBR ЦЕЛИКОМ */}
      {showFullMatrixModal && currentAircraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Шапка модалки */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-850/90">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-600/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-black text-lg text-slate-900 dark:text-slate-100">
                      RA-{currentAircraft.tail}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      currentAircraft.operator === 'N4'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                    }`}>
                      {currentAircraft.operator === 'N4' ? 'Nordwind Airlines' : 'Ikar Airlines'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {currentAircraft.model}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentAircraft.file || 'WBR'} • Ревизия: <strong>{currentAircraft.revision || '1.0'}</strong> • Дата: <strong>{currentAircraft.date || '—'}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Печать</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFullMatrixModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Базовые веса и пределы ВС */}
            <div className="px-5 py-2.5 bg-slate-100/70 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-5 flex-wrap">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Basic Weight / Index:</span>
                  <span className="font-extrabold text-sm text-sky-600 dark:text-sky-400">
                    {currentAircraft.basic_weight ? `${currentAircraft.basic_weight.toLocaleString()} кг` : 'В строках матрицы W&B'}
                    {currentAircraft.basic_index !== undefined && currentAircraft.basic_index !== null && ` / ${currentAircraft.basic_index}`}
                  </span>
                </div>
                {currentAircraft.max_weights && (
                  <>
                    <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">MZFW (Zero Fuel):</span>
                      <strong className="text-slate-800 dark:text-slate-200">{currentAircraft.max_weights.mzfw ? `${currentAircraft.max_weights.mzfw.toLocaleString()} кг` : '—'}</strong>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">MTOW (Take-Off):</span>
                      <strong className="text-slate-800 dark:text-slate-200">{currentAircraft.max_weights.mtow ? `${currentAircraft.max_weights.mtow.toLocaleString()} кг` : '—'}</strong>
                    </div>
                    <div className="border-l border-slate-200 dark:border-slate-700 pl-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">MLAW (Landing):</span>
                      <strong className="text-slate-800 dark:text-slate-200">{currentAircraft.max_weights.mlaw ? `${currentAircraft.max_weights.mlaw.toLocaleString()} кг` : '—'}</strong>
                    </div>
                  </>
                )}
              </div>

              <div className="text-[11px] text-slate-500 font-sans">
                Выбрано в симуляторе: <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">Экипаж {simCrew} / Pantry {simPantry}</strong> 
                {simResult && <span className="ml-1 text-slate-700 dark:text-slate-300 font-mono font-bold">({simResult.dow ? simResult.dow.toLocaleString() : '—'} кг, DOI {simResult.doi})</span>}
              </div>
            </div>

            {/* Просторная полная таблица всей матрицы W&B без сплющивания */}
            <div className="p-4 sm:p-5 overflow-auto flex-1">
              <table className="w-full text-left border-collapse font-mono text-xs border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-xs">
                <thead className="bg-slate-200/90 dark:bg-slate-800 sticky top-0 z-20 text-slate-800 dark:text-slate-200 uppercase font-extrabold text-[11px]">
                  <tr>
                    <th className="px-4 py-3 bg-slate-200 dark:bg-slate-800 sticky left-0 z-30 border-r border-b border-slate-300 dark:border-slate-700">
                      Экипаж (Crew)
                    </th>
                    {(currentAircraft.pantry_codes || ['A', 'B', 'D', 'E', 'F']).map(pCode => (
                      <th key={pCode} className="px-4 py-3 text-center border-r border-b border-slate-300 dark:border-slate-700 last:border-r-0">
                        <div className="text-xs font-black">Pantry {pCode}</div>
                        <div className="text-[9px] text-slate-500 font-normal normal-case">DOW (кг) / DOI</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {currentAircraft.matrix && Object.entries(currentAircraft.matrix).map(([crewCode, pantries]) => (
                    <tr key={crewCode} className="hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-colors">
                      <td className="px-4 py-2 font-black text-slate-900 dark:text-slate-100 bg-slate-100/90 dark:bg-slate-850 sticky left-0 z-10 border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">
                        {crewCode}
                      </td>
                      {(currentAircraft.pantry_codes || ['A', 'B', 'D', 'E', 'F']).map(pCode => {
                        const cell = pantries[pCode];
                        const isHighlighted = simCrew === crewCode && simPantry === pCode;

                        return (
                          <td
                            key={pCode}
                            onClick={() => {
                              if (cell) {
                                setSimCrew(crewCode);
                                setSimPantry(pCode);
                              }
                            }}
                            className={`px-3 py-2 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0 cursor-pointer transition-all ${
                              isHighlighted
                                ? 'bg-amber-100 dark:bg-amber-900/60 font-black ring-2 ring-amber-500 ring-inset shadow-xs'
                                : cell
                                ? 'hover:bg-sky-100/50 dark:hover:bg-slate-800'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          >
                            {cell ? (
                              <div>
                                <div className="text-xs font-black text-slate-900 dark:text-slate-100">
                                  {cell.dow ? cell.dow.toLocaleString() : '—'}
                                </div>
                                <div className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                                  {cell.doi !== undefined ? cell.doi : '—'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Подвал модалки */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Кликните по любой ячейке для выбора этой связки экипажа и кухни в расчет W&B</span>
              <button
                type="button"
                onClick={() => setShowFullMatrixModal(false)}
                className="px-4 py-1.5 font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
              >
                Закрыть
              </button>
            </div>

          </div>
        </div>
      )}

            {/* 4. МОДАЛЬНОЕ ОКНО ПРЕДПРОСМОТРА И ПОДТВЕРЖДЕНИЯ ЗАГРУЖЕННОГО WBR PDF */}
      {showUploadModal && uploadPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                    Успешный разбор центровочного графика WBR
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Проверьте извлеченные параметры перед обновлением реестра
                  </p>
                </div>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">БОРТОВОЙ НОМЕР:</span>
                <strong className="text-sm font-black text-slate-900 dark:text-slate-100">RA-{uploadPreview.data.tail}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">АВИАКОМПАНИЯ:</span>
                <strong className="text-sm font-black text-sky-600 dark:text-sky-400">{uploadPreview.data.operator}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">МОДЕЛЬ ВС:</span>
                <strong>{uploadPreview.data.model}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">РЕВИЗИЯ И ДАТА:</span>
                <strong>{uploadPreview.data.revision} ({uploadPreview.data.date || '—'})</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">BASIC WEIGHT:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{uploadPreview.data.basic_weight} кг</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">BASIC INDEX:</span>
                <strong className="text-sky-600 dark:text-sky-400">{uploadPreview.data.basic_index}</strong>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-sans">
                <span>Вариантов экипажей: <strong>{uploadPreview.data.crew_count}</strong></span>
                <span>Кухни (Galleys): <strong>{(uploadPreview.data.pantry_codes || []).join(', ')}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={uploadLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>{uploadLoading ? 'Сохранение...' : 'Применить в реестр флота'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
