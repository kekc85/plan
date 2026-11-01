import React, { useState } from 'react';
import { 
  X, BookOpen, Download, Plane, Luggage, FileSpreadsheet, 
  HelpCircle, ArrowRight, CheckCircle2, ChevronRight, Layers, 
  Clock, ShieldCheck, Sparkles, ExternalLink, Printer, Eye
} from 'lucide-react';

import planScreenImg from '../assets/manual/plan_screen.png';
import planHeaderImg from '../assets/manual/plan_header.png';
import rowScreenImg from '../assets/manual/row_screen.png';
import aerobagScreenImg from '../assets/manual/aerobag_screen.png';
import aerobagSidebarImg from '../assets/manual/aerobag_sidebar.png';
import aerobagCalcImg from '../assets/manual/aerobag_calc.png';
import loadsheetScreenImg from '../assets/manual/loadsheet_screen.png';
import loadsheetLimitsImg from '../assets/manual/loadsheet_limits.png';
import loadsheetEnvelopeImg from '../assets/manual/loadsheet_envelope.png';


export default function DownloadManualModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  if (!isOpen) return null;

  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') + '/';
  const docxFileName = 'Руководство_пользователя_AeroPlan.docx';
  const docxUrl = basePath + docxFileName;

  // Скачивание файла Word (.docx)
  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      const response = await fetch(docxUrl);
      if (!response.ok) throw new Error('Файл временно недоступен');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = docxFileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 300);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Ошибка скачивания руководства:', err);
      window.open(docxUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: '1. Обзор комплекса', icon: Layers },
    { id: 'aeroplan', label: '2. AeroPlan (Суточный план)', icon: Plane },
    { id: 'aerobag', label: '3. AeroBag (Багаж и отсеки)', icon: Luggage },
    { id: 'loadsheet', label: '4. W&B Loadsheet (Центровка)', icon: FileSpreadsheet },
    { id: 'workflow', label: '5. Пример по шагам', icon: ArrowRight },
    { id: 'faq', label: '6. Частые вопросы', icon: HelpCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl h-[94vh] flex flex-col overflow-hidden">
        
        {/* Шапка модального окна */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-slate-900 dark:text-slate-100 leading-tight">
                  Руководство пользователя AeroPlan 2.0
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Иллюстрированное практическое руководство диспетчера группы центровки
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isDownloading}
              className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs shadow-md shadow-sky-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              title="Скачать полную иллюстрированную инструкцию в Microsoft Word (.docx)"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Загрузка...' : 'Скачать в Word (.docx)'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Закрыть руководство"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Файл «Руководство_пользователя_AeroPlan.docx» успешно сохранен на ваш компьютер!</span>
            </div>
            <button onClick={() => setDownloadSuccess(false)} className="text-emerald-600 hover:underline">Скрыть</button>
          </div>
        )}

        {/* Навигационные вкладки */}
        <div className="flex items-center gap-1 px-6 pt-2 bg-slate-100/70 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer border-t border-x ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border-slate-200 dark:border-slate-800 shadow-sm relative -bottom-[1px]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Основной прокручиваемый контент */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">

          {/* ======================================================== */}
          {/* ВКЛАДКА 1: ОБЗОР КОМПЛЕКСА */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50/60 dark:from-slate-850 dark:to-slate-800 p-5 rounded-2xl border border-sky-100 dark:border-slate-700/60 shadow-sm">
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  Единая система управления центровкой AeroPlan 2.0
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Комплекс объединяет суточный план полетов, расчет коммерческой загрузки багажа и центровочные графики в неразрывную рабочую среду. Все модули работают на <strong>общей оперативной базе данных</strong>: данные обновляются синхронно, исключая двойной рутинный ввод.
                </p>
              </div>

              {/* Главный скриншот системы */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-slate-50 dark:bg-slate-800">
                <div className="relative group cursor-pointer" onClick={() => setSelectedImage(planScreenImg)}>
                  <img 
                    src={planScreenImg} 
                    alt="AeroPlan Full Overview" 
                    className="w-full object-cover max-h-[380px] group-hover:opacity-95 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="px-3 py-1.5 bg-slate-900/80 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm">
                      <Eye className="w-3.5 h-3.5" /> Нажмите для увеличения
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-850 text-xs text-slate-500 dark:text-slate-400 italic text-center border-t border-slate-200 dark:border-slate-700">
                  Общий рабочий стол AeroPlan: суточный график, статусы движения самолетов, таймер готовности и кнопки перехода.
                </div>
              </div>

              {/* Схема взаимодействия */}
              <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 bg-white dark:bg-slate-850 shadow-sm">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  Схема сквозной работы модулей:
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-slate-800 border border-sky-200/80 dark:border-sky-800/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-black text-sm text-sky-800 dark:text-sky-300 mb-1.5">
                        <Plane className="w-4 h-4 text-sky-600" />
                        <span>1. AeroPlan</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <p>• Суточный план рейсов смены</p>
                        <p>• Контроль вылетов (-40 минут)</p>
                        <p>• Пассажиры (дети РБ и младенцы РМ)</p>
                        <p>• Авто-подстановка взлетного веса MTOW</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-sky-200/60 dark:border-sky-800/40 text-[11px] font-bold text-sky-700 dark:text-sky-400">
                      Стартовая точка работы
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-slate-800 border border-indigo-200/80 dark:border-indigo-800/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-black text-sm text-indigo-800 dark:text-indigo-300 mb-1.5">
                        <Luggage className="w-4 h-4 text-indigo-600" />
                        <span>2. AeroBag</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <p>• Боковой список всех рейсов смены</p>
                        <p>• Расчет средней массы багажа</p>
                        <p>• Перенос в Preliminary в 1 клик</p>
                        <p>• Навигация клавишей Tab по отсекам</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-indigo-200/60 dark:border-indigo-800/40 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                      Вызов в 1 клик из плана
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-black text-sm text-emerald-800 dark:text-emerald-300 mb-1.5">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>3. W&B Loadsheet</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                        <p>• Официальный бланк ведомости (А4)</p>
                        <p>• Расчет пределов взлета (Zero/TO/Landing)</p>
                        <p>• Центровочный график (% MAC)</p>
                        <p>• Отправка телеграмм LIR / LDM</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      Данные подставляются сами
                    </div>
                  </div>

                </div>
              </div>

              {/* Главные преимущества */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Ключевые преимущества для диспетчера:
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Защита ручных правок:</strong> если диспетчер изменил MTOW или экипаж руками, система запоминает это и фоновая синхронизация никогда не перетрет введенное значение.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Сохранение детей и младенцев:</strong> данные о детях (РБ) и младенцах (РМ) надежно защищены от стирания и автоматически передаются в графы CH и INF в центровку.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Боковой список рейсов в AeroBag:</strong> можно переключаться между рейсами смены прямо в AeroBag без необходимости возвращаться в суточный план.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Автоматический выбор наименьшего лимита взлета:</strong> в Loadsheet программа сама сравнивает ограничения по Zero Fuel, Take-Off и Landing Fuel и выделяет безопасный лимит.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* ВКЛАДКА 2: AEROPLAN */}
          {/* ======================================================== */}
          {activeTab === 'aeroplan' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
                  AeroPlan: Электронный суточный план смены
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Главный экран смены, где диспетчер ведет оперативный контроль рейсов
                </p>
              </div>

              {/* 1. Скриншот шапки */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  1. Шапка плана смены и оперативные часы:
                </span>
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-850">
                  <img 
                    src={planHeaderImg} 
                    alt="AeroPlan Header" 
                    onClick={() => setSelectedImage(planHeaderImg)} 
                    className="w-full object-cover max-h-[140px] cursor-pointer hover:opacity-95 transition-opacity"
                  />
                  <div className="p-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <p>• <strong>Даты смены и диспетчер:</strong> фиксируют границы дежурства.</p>
                    <p>• <strong>Часы MSK / UTC:</strong> переключают отображение времени во всем плане.</p>
                    <p>• <strong>Сводные счетчики:</strong> «Рейсов в плане», «Подготовлено», «LIR отправлено» — наглядный индикатор готовности всей смены.</p>
                    <p>• <strong>Быстрый переход:</strong> кнопки [AeroBag] и [Loadsheet] в шапке для оперативного доступа.</p>
                  </div>
                </div>
              </div>

              {/* 2. Скриншот строки рейса крупным планом */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  2. Строка рейса крупным планом:
                </span>
                <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-850">
                  <img 
                    src={rowScreenImg} 
                    alt="AeroPlan Flight Row" 
                    onClick={() => setSelectedImage(rowScreenImg)} 
                    className="w-full object-cover max-h-[110px] cursor-pointer hover:opacity-95 transition-opacity"
                  />
                  <div className="p-3 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700 space-y-1">
                    <p>• <strong>Маршрут и статус ВС:</strong> город, трасса (REN-SVO) и оперативный статус («Вылет REN 16:04»).</p>
                    <p>• <strong>Время (-40 мин):</strong> при приближении к вылету плашка подсвечивается бирюзовым сигналом.</p>
                    <p>• <strong>Пассажиры (PAX):</strong> крупное число 193 и синяя строка <strong>14рб 1рм</strong> (14 детей, 1 младенец).</p>
                    <p>• <strong>MTOW:</strong> автоматически подставляется 89000 кг (для A321). При ручной правке значение блокируется от стирания.</p>
                    <p>• <strong>Топливо и веса:</strong> Block 10900, Trip 5700, Taxi 200, DOW 48424, DOI 36, Кухня F.</p>
                  </div>
                </div>
              </div>

              {/* Таблица колонок плана */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Подробное назначение всех колонок суточного плана:
                </h5>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3 text-left w-36">Колонка</th>
                        <th className="py-2.5 px-3 text-left w-48">Отображение</th>
                        <th className="py-2.5 px-3 text-left">Назначение для диспетчера</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">№ Рейса и кнопки</td>
                        <td className="py-2.5 px-3">Номер рейса, кнопки [AeroBag] и [Loadsheet]</td>
                        <td className="py-2.5 px-3">Открывает соответствующее приложение с моментальной подстановкой всех параметров этого рейса.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">Маршрут и статус ВС</td>
                        <td className="py-2.5 px-3">Город, трасса (KBV-SVX) и статус движения</td>
                        <td className="py-2.5 px-3">Показывает оперативную информацию: «Сел в AER 13:23», «Вылет KBV 9:30». Видно, прибыл ли самолет под оборот.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">Время (-40 мин)</td>
                        <td className="py-2.5 px-3">Время расписания и контрольное время</td>
                        <td className="py-2.5 px-3">За 40 минут до вылета плашка подсвечивается бирюзовым цветом — напоминание диспетчеру о подготовке документов.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">Борт и Тип ВС</td>
                        <td className="py-2.5 px-3">Номер борта (73326) и модель (321, 738, 772)</td>
                        <td className="py-2.5 px-3">При смене борта система сама подставляет новые базовые веса DOW, DOI и MTOW.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">PAX (Пассажиры)</td>
                        <td className="py-2.5 px-3">Общее число, внизу: 14рб 1рм</td>
                        <td className="py-2.5 px-3">Синяя подсказка показывает детей (РБ) и младенцев (РМ). Данные передаются в Loadsheet без потерь.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">Экипаж</td>
                        <td className="py-2.5 px-3">Формат: 3 / 5 / 0 / 1</td>
                        <td className="py-2.5 px-3">Летный состав / проводники / инженеры / дополнительные. Ручные изменения защищены от сброса.</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">Топливо и Веса</td>
                        <td className="py-2.5 px-3">Block / Trip / Taxi / DOW / DOI / Кухня</td>
                        <td className="py-2.5 px-3">Заправка подгружается из расчета CFP. DOW и DOI берутся из базы флота, кухня выбирается из списка (A..F).</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">Окошко MTOW</td>
                        <td className="py-2.5 px-3">Взлетный вес (например 89000)</td>
                        <td className="py-2.5 px-3">Подставляется автоматически. При ручной правке диспетчера подсвечивается мягкой рамкой и фиксируется!</td>
                      </tr>
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-2.5 px-3 font-bold text-sky-700 dark:text-sky-400">Чеклисты LIR/LDM</td>
                        <td className="py-2.5 px-3">Галочки готовности документов и грузов</td>
                        <td className="py-2.5 px-3">Зеленый цвет галочек подтверждает старшему диспетчеру отправку всех обязательных телеграмм.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* ВКЛАДКА 3: AEROBAG */}
          {/* ======================================================== */}
          {activeTab === 'aerobag' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
                  AeroBag: Расчет коммерческой загрузки и багажа
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Современный трехколоночный интерфейс с боковой панелью рейсов
                </p>
              </div>

              {/* 1. Скриншот AeroBag общий */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-850">
                <img 
                  src={aerobagScreenImg} 
                  alt="AeroBag Full Screen" 
                  onClick={() => setSelectedImage(aerobagScreenImg)} 
                  className="w-full object-cover max-h-[380px] cursor-pointer hover:opacity-95 transition-opacity"
                />
                <div className="p-3 text-xs text-slate-500 dark:text-slate-400 italic text-center border-t border-slate-200 dark:border-slate-700">
                  Общий вид AeroBag: боковая панель рейсов слева, калькулятор средней массы и отсеки лайнера.
                </div>
              </div>

              {/* 2. Двойной блок скриншотов деталей AeroBag */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-850 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 block mb-2 uppercase">
                      Боковой список рейсов смены:
                    </span>
                    <img 
                      src={aerobagSidebarImg} 
                      alt="AeroBag Sidebar" 
                      onClick={() => setSelectedImage(aerobagSidebarImg)} 
                      className="w-full object-contain bg-slate-900 max-h-[220px] rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                    Все рейсы смены под рукой. Клик по рейсу моментально загружает его параметры без выхода из модуля.
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-850 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block mb-2 uppercase">
                      Калькулятор и отсеки багажа:
                    </span>
                    <img 
                      src={aerobagCalcImg} 
                      alt="AeroBag Calculation" 
                      onClick={() => setSelectedImage(aerobagCalcImg)} 
                      className="w-full object-contain bg-slate-900 max-h-[220px] rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                    Кнопка <strong>«Перенести в Preliminary»</strong> заносит багаж в CPT 1, 3, 4. Клавиша <kbd className="px-1 bg-slate-100 dark:bg-slate-700 rounded font-mono font-bold">Tab</kbd> быстро переключает поля.
                  </p>
                </div>

              </div>

              <div className="space-y-4">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Пошаговый алгоритм работы в AeroBag:
                </h5>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">1. Выбор рейса из списка слева</strong>
                    В левой колонке перечислены все рейсы смены, отсортированные по времени вылета. Чтобы переключиться на нужный рейс, просто кликните по нему — центральная таблица загрузки и отсеки сразу откроются для этого рейса.
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">2. Ввод количества сданного багажа</strong>
                    В центральной колонке введите число мест сданного багажа. Программа автоматически рассчитает среднюю массу с учетом взрослых пассажиров, детей и нормы сезона (лето/зима).
                  </div>

                  <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800">
                    <strong className="text-sky-800 dark:text-sky-300 block mb-1">3. Кнопка «Перенести в Preliminary»</strong>
                    Нажмите кнопку «Перенести в Preliminary». Места и рассчитанные килограммы автоматически занесутся в таблицу отсеков лайнера (отсеки 1, 3, 4).
                  </div>

                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <strong className="text-indigo-800 dark:text-indigo-300 block mb-1">4. Быстрая навигация клавишей [Tab]</strong>
                    Сразу после переноса фокус ввода прыгает в первую строку отсека. Нажимая клавишу <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 font-mono font-bold">Tab</kbd>, диспетчер быстро перемещается по ячейкам: <em>Тип загрузки → Места → Вес → Следующий отсек</em> без использования мышки.
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">5. Возврат в суточный план</strong>
                    Нажмите стрелку «Назад в AeroPlan» в левом верхнем углу. Вы вернетесь точно в рабочий суточный план с сохранением всех внесенных правок.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* ВКЛАДКА 4: LOADSHEET */}
          {/* ======================================================== */}
          {activeTab === 'loadsheet' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
                  W&B Loadsheet: Центровочный график и ведомость
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Официальный центровочный бланк международного стандарта А4
                </p>
              </div>

              {/* 1. Скриншот полного бланка */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-850">
                <img 
                  src={loadsheetScreenImg} 
                  alt="W&B Loadsheet Blank" 
                  onClick={() => setSelectedImage(loadsheetScreenImg)} 
                  className="w-full object-contain max-h-[440px] bg-slate-50 dark:bg-slate-900 cursor-pointer hover:opacity-95 transition-opacity"
                />
                <div className="p-3 text-xs text-slate-500 dark:text-slate-400 italic text-center border-t border-slate-200 dark:border-slate-700">
                  Полный бланк центровки W&B Loadsheet: расчет весовых лимитов, пассажирские зоны, отсеки и центровочная трапеция.
                </div>
              </div>

              {/* 2. Двойной блок деталей Loadsheet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-850 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-sky-700 dark:text-sky-400 block mb-2 uppercase">
                      Расчет взлетных лимитов (1, 2, 3):
                    </span>
                    <img 
                      src={loadsheetLimitsImg} 
                      alt="Loadsheet Take-off limits" 
                      onClick={() => setSelectedImage(loadsheetLimitsImg)} 
                      className="w-full object-contain bg-white dark:bg-slate-900 max-h-[140px] rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                    Автоматический расчет трех лимитов взлета (Zero Fuel, Take-Off, Landing). Программа сама выделяет наименьший допустимый предел.
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-850 p-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-2 uppercase">
                      Сводная ведомость центровки (Balance / Underload):
                    </span>
                    <img 
                      src={loadsheetEnvelopeImg} 
                      alt="Loadsheet Trim Envelope" 
                      onClick={() => setSelectedImage(loadsheetEnvelopeImg)} 
                      className="w-full object-contain bg-white dark:bg-slate-900 max-h-[140px] rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-95 transition-opacity"
                    />
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                    Взлетная и посадочная центровка наглядно наносятся на график. Зеленый цвет подтверждает безопасность полета.
                  </p>
                </div>

              </div>

              <div className="space-y-4">
                <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Главные функции и автоматические расчеты:
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">Бесшовная передача из плана</strong>
                    При переходе из AeroPlan в бланке уже стоят: рейс, дата, направление, регистрация ВС, экипаж, пассажиры (взрослые, дети в CH, младенцы в INF), топливо Block/Trip и базовые веса DOW/DOI.
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">Расчет взлетных лимитов (1, 2, 3)</strong>
                    Система одновременно рассчитывает три предела: 1) по весу без топлива, 2) по максимальному взлетному весу, 3) по посадочному весу с учетом Trip Fuel. Автоматически выбирается наименьший безопасный предел!
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">Распределение по отсекам (CPT 1..5)</strong>
                    Коммерческая загрузка (багаж, груз, почта) разносится по физическим багажникам самолета с контролем предельной нагрузки на пол отсека.
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700">
                    <strong className="text-sky-700 dark:text-sky-400 block mb-1">Центровочный график (% MAC)</strong>
                    Наглядный график показывает взлетную и посадочную центровку в % САХ. Зеленая зона подтверждает нахождение внутри коридора безопасности авиакомпании.
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
                  <strong>Печать документа:</strong> нажмите кнопку печати в нижней части экрана — лист будет выведен на печать в стандартном книжном формате А4 без обрезки полей и искажения шрифтов.
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* ВКЛАДКА 5: СКВОЗНОЙ ПРИМЕР */}
          {/* ======================================================== */}
          {activeTab === 'workflow' && (
            <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-150">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
                  Сквозной практический пример: рейс N4078
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Пошаговая инструкция диспетчера от открытия смены до выпуска рейса
                </p>
              </div>

              <div className="space-y-4">
                
                <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-xs space-y-1">
                    <strong className="text-sm font-extrabold text-slate-900 dark:text-white block">
                      Шаг 1: Контроль в плане (AeroPlan)
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300">
                      Открываем суточный план. Находим строку рейса N4078 (Оренбург — Москва).
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Борт <strong>73326</strong> — система сама подставила базовый вес DOW = 48424, индекс DOI = 36.0, кухню F и взлетный вес MTOW = 89000 кг. В ячейке пассажиров видим: <strong>193</strong> человека, а под цифрой синяя подсказка: <strong>14рб 1рм</strong> (14 детей и 1 младенец).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-xs space-y-1">
                    <strong className="text-sm font-extrabold text-slate-900 dark:text-white block">
                      Шаг 2: Расчет багажа в AeroBag
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300">
                      Кликаем кнопку <strong>[AeroBag]</strong> прямо в строке рейса N4078. Открывается окно AeroBag, где в списке слева уже активен рейс N4078.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Вводим число мест багажа и нажимаем кнопку <strong>«Перенести в Preliminary»</strong>. Багаж автоматически разносится по отсекам 1, 3 и 4. Нажимаем клавишу Tab для быстрой проверки. Жмем стрелку «Назад в AeroPlan».
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-xs space-y-1">
                    <strong className="text-sm font-extrabold text-slate-900 dark:text-white block">
                      Шаг 3: Центровка в Loadsheet
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300">
                      В строке рейса нажимаем кнопку <strong>[Loadsheet]</strong>. Открывается центровочный бланк, в котором уже проставлены: взрослые пассажиры, 14 детей в графе CH, 1 младенец в графе INF, заправка топливом и отсеки багажа.
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Проверяем центровочную точку (% MAC) — она находится в безопасном эксплуатационном коридоре. Сохраняем и отправляем центровку.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-sky-700 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div className="text-xs space-y-1">
                    <strong className="text-sm font-extrabold text-slate-900 dark:text-white block">
                      Шаг 4: Закрытие чеклиста и выпуск рейса
                    </strong>
                    <p className="text-slate-600 dark:text-slate-300">
                      Возвращаемся в суточный план AeroPlan. Проставляем чеклисты LIR, LDM, СЗВ и переводим статус в «Выпущен».
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      В статистике смены счетчик «Подготовлено» увеличивается на единицу. Рейс успешно оформлен и отправлен без единой повторной ручной операции!
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ВКЛАДКА 6: FAQ */}
          {/* ======================================================== */}
          {activeTab === 'faq' && (
            <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-150 text-xs">
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white mb-1">
                  Часто задаваемые вопросы (FAQ)
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  Быстрые ответы на популярные вопросы диспетчеров
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-sm text-sky-700 dark:text-sky-400">
                    Что делать, если заменили самолет (изменился бортовой номер)?
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Выберите новый бортовой номер в выпадающем списке колонки «Номер ВС» или дождитесь автоматической подгрузки из Авиабит. Система моментально пересчитает базовый вес DOW, индекс DOI и взлетный вес MTOW под новый самолет. Никаких ручных пересчетов делать не нужно!
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-sm text-sky-700 dark:text-sky-400">
                    Как ограничить MTOW вручную при короткой полосе или жаре?
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Кликните прямо в ячейку MTOW и введите меньшее значение (например, 76500 вместо 89000). Рамка ячейки подсветится мягким оранжевым цветом. Это означает, что включен режим ручной защиты: фоновые обновления расписания больше не перезапишут эту цифру до конца рейса.
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-sm text-sky-700 dark:text-sky-400">
                    Куда делись дети, если в графе PAX стоит просто число?
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Посмотрите чуть ниже числа — под ним отображается компактная синяя строчка, например: <span className="font-bold text-sky-600">14рб 1рм</span>. При наведении мышки всплывает подробная подсказка. Данные о детях надежно сохраняются и передаются в Loadsheet.
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="font-bold text-sm text-sky-700 dark:text-sky-400">
                    Как вернуться в суточный план, если случайно закрыли вкладку?
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    Главная ссылка комплекса всегда одна. Все данные непрерывно сохраняются в базе данных и сразу отобразятся в актуальном состоянии при открытии страницы.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Подвал модального окна */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
            <span>💡 Совет: Чтобы распечатать или отправить памятку коллегам, используйте кнопку «Скачать в Word (.docx)».</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
          >
            Закрыть руководство
          </button>
        </div>

      </div>

      {/* Окно полноразмерного просмотра скриншотов */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl border border-white/20">
            <img src={selectedImage} alt="Enlarged Screenshot" className="max-w-full max-h-[85vh] object-contain" />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
