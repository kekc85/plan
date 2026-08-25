import React from 'react';
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import FlightRow from './FlightRow';
import { Plus, PlaneTakeoff } from 'lucide-react';

export default function ShiftTable({
  flights,
  onReorderFlights,
  onUpdateFlight,
  onDeleteFlight,
  onMoveUp,
  onMoveDown,
  onAddFlight
}) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // Для мыши (ПК/ноутбук): мгновенное перетаскивание при сдвиге на 8px
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // Для пальца на смартфоне/планшете: удержание 200мс (позволяет свободно скроллить и перетаскивать при удержании)
        tolerance: 6, // Допуск микро-сдвига пальца при зажатии
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderFlights(active.id, over.id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl shadow-md dark:shadow-2xl backdrop-blur-md w-full">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-175px)] w-full rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header */}
          <thead className="sticky top-0 z-30 shadow-sm">
            <tr className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 select-none text-xs">
              <th className="sticky top-0 left-0 z-40 bg-slate-100 dark:bg-slate-900 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-8 min-w-[32px] no-print shadow-[1px_0_0_0_#cbd5e1] dark:shadow-[1px_0_0_0_#334155]">#</th>
              <th className="sticky top-0 left-8 z-40 bg-slate-100 dark:bg-slate-900 py-3 px-1 font-extrabold tracking-wider uppercase w-20 min-w-[82px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] text-center">№ Рейса</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1.5 font-extrabold tracking-wider uppercase min-w-[125px] shadow-sm text-center">Маршрут</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase min-w-[90px] text-amber-700 dark:text-amber-300 shadow-sm">
                Время<br/>
                <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Вып (-40)</span> / <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">Вылет</span>
              </th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-16 shadow-sm">Номер ВС</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-14 shadow-sm">Комп.</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-12 shadow-sm">PAX</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-16 shadow-sm">Экипаж<br/><span className="text-[10px] font-medium text-slate-500">Л/Б/И/П</span></th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-[200px] text-sky-800 dark:text-sky-300 shadow-sm">Топливо и Веса<br/><span className="text-[10px] font-medium text-slate-500">Block / Trip / Taxi / DOW / DOI / Кухня</span></th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-0.5 text-center font-extrabold tracking-wider uppercase w-15 min-w-[58px] shadow-sm">MTOW</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-14 text-indigo-700 dark:text-indigo-300 shadow-sm">LIR</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-0.5 text-center font-extrabold tracking-wider uppercase min-w-[70px] shadow-sm">Груз</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-0.5 text-center font-extrabold tracking-wider uppercase min-w-[70px] shadow-sm">Почта</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 font-extrabold tracking-wider uppercase min-w-[140px] shadow-sm">Багаж (особенности)</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-0.5 text-center font-extrabold tracking-wider uppercase w-14 text-amber-700 dark:text-amber-300 shadow-sm">СЗВ</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-0.5 text-center font-extrabold tracking-wider uppercase w-14 text-emerald-700 dark:text-emerald-300 shadow-sm">LDM</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-0.5 text-center font-extrabold tracking-wider uppercase min-w-[85px] text-teal-700 dark:text-teal-300 shadow-sm">Астра (REN)<br/><span className="text-[9px] font-medium text-slate-500">Времена</span></th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-28 shadow-sm">Статус</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 font-extrabold tracking-wider uppercase min-w-[120px] shadow-sm">Примечания</th>
              <th className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-30 py-3 px-1 text-center font-extrabold tracking-wider uppercase w-14 no-print shadow-sm">Действия</th>
            </tr>
          </thead>

          {/* Table Body with Drag and Drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={flights.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-sans">
                {flights.length > 0 ? (
                  flights.map((flight, index) => (
                    <FlightRow
                      key={flight.id}
                      flight={flight}
                      index={index}
                      onUpdateFlight={onUpdateFlight}
                      onDeleteFlight={onDeleteFlight}
                      onMoveUp={onMoveUp}
                      onMoveDown={onMoveDown}
                      isFirst={index === 0}
                      isLast={index === flights.length - 1}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="20" className="text-center py-16 text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <PlaneTakeoff className="w-10 h-10 text-slate-400 dark:text-slate-600 animate-pulse" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">В журнале смены пока нет рейсов</p>
                        <button
                          onClick={onAddFlight}
                          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors shadow"
                        >
                          <Plus className="w-4 h-4" /> Добавить первый рейс
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>
      </div>

      {/* Footer bar */}
      <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 no-print">
        <div className="flex items-center gap-2.5">
          <span>Всего рейсов в суточном плане: <strong className="text-slate-950 dark:text-white font-mono text-sm font-extrabold">{flights.length}</strong></span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-slate-500">Зажимайте и перетаскивайте любую строку мышкой</span>
        </div>
        <button
          onClick={onAddFlight}
          className="flex items-center gap-1 text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-bold py-1 px-2.5 rounded hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
        >
          <Plus className="w-4 h-4" /> Добавить строку
        </button>
      </div>
    </div>
  );
}
