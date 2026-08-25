import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
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
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderFlights(active.id, over.id);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl overflow-hidden shadow-md dark:shadow-2xl backdrop-blur-md w-full">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header */}
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-b border-slate-300 dark:border-slate-700 select-none text-xs">
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-8 no-print">#</th>
              <th className="py-3 px-1 font-extrabold tracking-wider uppercase w-20">№ Рейса</th>
              <th className="py-3 px-1 font-extrabold tracking-wider uppercase w-20">Маршрут</th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-20 text-amber-700 dark:text-amber-300">
                Время<br/>
                <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Вып (-40)</span> / <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">Вылет</span>
              </th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-16">Номер ВС</th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-14">Комп.</th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-12">PAX</th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-16">Экипаж<br/><span className="text-[10px] font-medium text-slate-500">Л/Б/И/П</span></th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-[200px] text-sky-800 dark:text-sky-300">Топливо и Веса<br/><span className="text-[10px] font-medium text-slate-500">Block / Trip / Taxi / DOW / DOI / Кухня</span></th>
              <th className="py-3 px-0.5 text-center font-extrabold tracking-wider uppercase w-15 min-w-[58px]">MTOW</th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-14 text-indigo-700 dark:text-indigo-300">LIR</th>
              <th className="py-3 px-0.5 text-center font-extrabold tracking-wider uppercase min-w-[70px]">Груз</th>
              <th className="py-3 px-0.5 text-center font-extrabold tracking-wider uppercase min-w-[70px]">Почта</th>
              <th className="py-3 px-1 font-extrabold tracking-wider uppercase min-w-[140px]">Багаж (особенности)</th>
              <th className="py-3 px-0.5 text-center font-extrabold tracking-wider uppercase w-14 text-amber-700 dark:text-amber-300">СЗВ</th>
              <th className="py-3 px-0.5 text-center font-extrabold tracking-wider uppercase w-14 text-emerald-700 dark:text-emerald-300">LDM</th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-28">Статус</th>
              <th className="py-3 px-1 font-extrabold tracking-wider uppercase min-w-[120px]">Примечания</th>
              <th className="py-3 px-1 text-center font-extrabold tracking-wider uppercase w-14 no-print">Действия</th>
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
                    <td colSpan="19" className="text-center py-16 text-slate-500">
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
