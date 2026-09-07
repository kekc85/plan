import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ArrowUp, ArrowDown, Check, Bell } from 'lucide-react';
import { 
  formatValidTime, 
  calcReleaseTime, 
  formatValidCrew, 
  formatValidFlight, 
  formatValidAcNum, 
  formatValidAcConfig,
  formatValidMtow,
  formatValidDayMonth,
  isFlightReleaseOverdue,
  isRenDeparture,
  normalizePlaneType,
  detectPlaneType
} from '../utils/validators';
import { getSafeUnreadChanges, TRACKED_AVIABIT_FIELDS } from '../utils/deltaSync';

// Компактный бейдж для подтверждения изменившегося параметра
function ChangeBadge({ change, onAcknowledge }) {
  if (!change) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onAcknowledge?.();
      }}
      className="inline-flex items-center gap-0.5 bg-amber-500 hover:bg-amber-600 text-white font-mono text-[8px] font-black px-1 py-0.2 rounded shadow transition-transform active:scale-95 cursor-pointer shrink-0 mt-0.5"
      title={`Изменено в AviaBit!\nБыло: ${change.old || '—'} → Стало: ${change.new}\nНажмите, чтобы подтвердить ознакомление`}
    >
      <span>было {change.old || '—'}</span>
      <Check className="w-2 h-2 stroke-[3]" />
    </button>
  );
}

export default function FlightRow({
  flight,
  index,
  onUpdateFlight,
  onDeleteFlight,
  onMoveUp,
  onMoveDown,
  onAcknowledgeField,
  onAcknowledgeFlight,
  isFirst,
  isLast
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: flight.id });

  const unread = getSafeUnreadChanges(flight);
  const unreadCount = Object.keys(unread).filter(
    k => (TRACKED_AVIABIT_FIELDS.includes(k) && k !== 'release_time') || k === '_is_new'
  ).length;
  const hasUnreadChanges = unreadCount > 0 || !!flight.is_new_flight;
  const isChanged = (field) => !!unread[field];
  const getChangedStyle = (field) => isChanged(field)
    ? 'ring-2 ring-amber-500 bg-amber-100/90 dark:bg-amber-950/80 text-amber-950 dark:text-amber-100 font-bold'
    : '';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleCellChange = (field, value) => {
    // При ручном редактировании поля диспетчером автоматически снимаем подсветку с этого поля
    if (unread[field] && onAcknowledgeField) {
      onAcknowledgeField(flight.id, field);
    }
    onUpdateFlight(flight.id, { [field]: value });
  };

  // Изменение времени вылета -> авто-расчет времени выпуска (-40 мин)
  const handleDepartureTimeChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatValidTime(rawVal);
    const updates = { time: formatted };

    if (formatted.length === 5 && formatted.includes(':')) {
      updates.release_time = calcReleaseTime(formatted);
    }
    if (unread['time'] && onAcknowledgeField) {
      onAcknowledgeField(flight.id, 'time');
    }
    onUpdateFlight(flight.id, updates);
  };

  // Авто-сортировка при потере фокуса на поле времени вылета
  const handleDepartureTimeBlur = () => {
    onUpdateFlight(flight.id, {}, true);
  };

  // Сортировка по нажатию клавиши Enter
  const handleDepartureTimeKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  // Изменение времени выпуска вручную
  const handleReleaseTimeChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatValidTime(rawVal);
    handleCellChange('release_time', formatted);
  };

  // Изменение бортового номера (с интеллектуальным определением типа ВС, если еще не задан)
  const handleAcNumChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatValidAcNum(rawVal);
    const updates = { ac_num: formatted };
    if (!flight.ac_type) {
      const detected = detectPlaneType({ ...flight, ac_num: formatted });
      if (detected) updates.ac_type = detected;
    }
    onUpdateFlight(flight.id, updates);
  };

  // Изменение компоновки (с интеллектуальным определением типа ВС, если еще не задан)
  const handleAcConfigChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatValidAcConfig(rawVal);
    const updates = { ac_config: formatted };
    if (!flight.ac_type) {
      const detected = detectPlaneType({ ...flight, ac_config: formatted });
      if (detected) updates.ac_type = detected;
    }
    onUpdateFlight(flight.id, updates);
  };

  // Смена статуса из выпадающего списка (с двусторонней синхронизацией чек-боксов)
  const handleStatusSelectChange = (e) => {
    const newStatus = e.target.value;
    const updates = { status: newStatus };

    if (newStatus === 'pending') {
      // Ожидание: все чекбоксы сброшены
      updates.lir_sent = false;
      updates.szv_sent = false;
      updates.ldm_sent = false;
      updates.astra_times_sent = false;
    } else if (newStatus === 'prepared') {
      // Подготовлен: данные внесены, чекбоксы еще не проставлены
      updates.lir_sent = false;
      updates.szv_sent = false;
      updates.ldm_sent = false;
      updates.astra_times_sent = false;
    } else if (newStatus === 'lir_sent') {
      // LIR отправлен: ставится чек-бокс LIR
      updates.lir_sent = true;
      updates.szv_sent = false;
      updates.ldm_sent = false;
      updates.astra_times_sent = false;
    } else if (newStatus === 'released') {
      // Выпущен: ставится чек-бокс СЗВ (и LIR)
      updates.lir_sent = true;
      updates.szv_sent = true;
      updates.ldm_sent = false;
      updates.astra_times_sent = false;
    } else if (newStatus === 'closed') {
      // Закрыт: на обычных рейсах ставится LDM, на REN (Оренбург) - ставится Времена (Astra)
      updates.lir_sent = true;
      updates.szv_sent = true;
      if (isRen) {
        updates.astra_times_sent = true;
        updates.ldm_sent = true;
      } else {
        updates.ldm_sent = true;
        updates.astra_times_sent = false;
      }
    }

    onUpdateFlight(flight.id, updates);
  };

  // Чекбокс LIR -> синхронизация
  const handleToggleLir = (e) => {
    if (e) e.stopPropagation();
    const nextVal = !flight.lir_sent;
    const updates = { lir_sent: nextVal };
    if (nextVal) {
      // Когда ставится LIR -> статус становится LIR отправлен (если рейс еще не выпущен/закрыт)
      if (flight.status !== 'released' && flight.status !== 'closed') {
        updates.status = 'lir_sent';
      }
    } else {
      // Когда снимается LIR -> если статус был lir_sent, возвращаем в prepared
      if (flight.status === 'lir_sent') {
        updates.status = 'prepared';
      }
    }
    onUpdateFlight(flight.id, updates);
  };

  // Чекбокс СЗВ -> синхронизация
  const handleToggleSzv = (e) => {
    if (e) e.stopPropagation();
    const nextVal = !flight.szv_sent;
    const updates = { szv_sent: nextVal };
    if (nextVal) {
      // Когда ставится СЗВ -> статус становится Выпущен, LIR также true
      updates.status = 'released';
      updates.lir_sent = true;
    } else {
      // Когда снимается СЗВ -> если был выпущен или закрыт, возвращаем в lir_sent (если lir_sent) или prepared
      if (flight.status === 'released' || flight.status === 'closed') {
        updates.status = flight.lir_sent ? 'lir_sent' : 'prepared';
        updates.ldm_sent = false;
        updates.astra_times_sent = false;
      }
    }
    onUpdateFlight(flight.id, updates);
  };

  const isRen = isRenDeparture(flight);

  // Чекбокс LDM -> синхронизация
  const handleToggleLdm = (e) => {
    if (e) e.stopPropagation();
    const nextVal = !flight.ldm_sent;
    const updates = { ldm_sent: nextVal };
    if (nextVal) {
      updates.lir_sent = true;
      updates.szv_sent = true;
      // Для рейсов из Оренбурга (REN) при проставлении LDM статус НЕ меняется на closed, а остается 'released'
      if (isRen) {
        updates.status = flight.astra_times_sent ? 'closed' : 'released';
      } else {
        // На обычных рейсах ставится 'closed'
        updates.status = 'closed';
      }
    } else {
      if (flight.status === 'closed' && !isRen) {
        updates.status = flight.szv_sent ? 'released' : (flight.lir_sent ? 'lir_sent' : 'prepared');
      }
    }
    onUpdateFlight(flight.id, updates);
  };

  // Чекбокс Проставить времена в Astra (для рейсов из REN Оренбург)
  const handleToggleAstraTimes = (e) => {
    if (e) e.stopPropagation();
    const nextVal = !flight.astra_times_sent;
    const updates = { astra_times_sent: nextVal };
    if (nextVal) {
      // На рейсах из Оренбурга статус меняется на "Закрыт" именно при установке чекбокса "Времена"
      updates.status = 'closed';
      updates.lir_sent = true;
      updates.szv_sent = true;
    } else {
      if (flight.status === 'closed') {
        updates.status = flight.szv_sent ? 'released' : (flight.lir_sent ? 'lir_sent' : 'prepared');
      }
    }
    onUpdateFlight(flight.id, updates);
  };

  const handleCheckboxKeyDown = (e, toggleFn) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFn();
    }
  };

  const currentStatus = flight.status || 'pending';
  const isOverdue = isFlightReleaseOverdue(flight);

  // Раздельные цветовые схемы для СВЕТЛОЙ и ТЕМНОЙ тем
  const rowStatusTheme = {
    pending: 'bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-900 dark:text-slate-100 border-l-4 border-l-slate-400 dark:border-l-slate-500',
    prepared: 'bg-sky-50/95 dark:bg-sky-950/80 hover:bg-sky-100/90 dark:hover:bg-sky-950/95 text-slate-950 dark:text-sky-100 border-l-4 border-l-sky-500 border-b border-b-sky-200 dark:border-b-sky-500/30',
    lir_sent: 'bg-indigo-50/95 dark:bg-indigo-950/85 hover:bg-indigo-100/90 dark:hover:bg-indigo-950/95 text-slate-950 dark:text-indigo-100 border-l-4 border-l-indigo-500 border-b border-b-indigo-200 dark:border-b-indigo-500/30',
    released: 'bg-emerald-50/95 dark:bg-emerald-950/80 hover:bg-emerald-100/90 dark:hover:bg-emerald-950/95 text-slate-950 dark:text-emerald-100 border-l-4 border-l-emerald-500 border-b border-b-emerald-200 dark:border-b-emerald-500/30',
    closed: 'bg-slate-300 dark:bg-black/95 hover:bg-slate-350 dark:hover:bg-black text-slate-950 dark:text-zinc-400 border-l-4 border-l-slate-800 dark:border-l-zinc-600 opacity-80 dark:opacity-60 font-semibold',
  };

  const activeRowTheme = isOverdue
    ? 'bg-rose-50/95 dark:bg-rose-950/40 hover:bg-rose-100/90 dark:hover:bg-rose-950/60 text-slate-950 dark:text-rose-100 shadow-sm'
    : (rowStatusTheme[currentStatus] || rowStatusTheme.pending);

  const overdueBorderTopBottom = isOverdue
    ? 'border-t-2 border-b-2 border-rose-500'
    : 'border-t border-b border-slate-200/80 dark:border-slate-800/80';

  const statusBadgeStyle = {
    pending: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600 font-semibold',
    prepared: 'bg-sky-100 dark:bg-sky-500/30 text-sky-900 dark:text-sky-200 border-sky-400 dark:border-sky-500 font-bold',
    lir_sent: 'bg-indigo-100 dark:bg-indigo-500/30 text-indigo-900 dark:text-indigo-200 border-indigo-400 dark:border-indigo-500 font-bold',
    released: 'bg-emerald-100 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-200 border-emerald-400 dark:border-emerald-500 font-bold',
    closed: 'bg-slate-400 dark:bg-slate-800 text-slate-950 dark:text-zinc-300 border-slate-500 dark:border-slate-700 font-extrabold',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group transition-all duration-150 ${activeRowTheme} cursor-grab active:cursor-grabbing rounded-2xl ${
        isDragging ? 'shadow-2xl ring-2 ring-sky-400 z-50 opacity-90' : ''
      }`}
    >
      {/* 1. Drag Handle & Index */}
      <td
        className={`sticky left-0 z-20 py-1.5 px-0.5 text-center whitespace-nowrap no-print w-7 min-w-[28px] bg-inherit hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors shadow-[1px_0_0_0_#cbd5e1] dark:shadow-[1px_0_0_0_#334155] rounded-l-2xl ${
          isOverdue ? 'border-l-2 border-l-rose-500 border-t-2 border-b-2 border-rose-500' : 'border-l border-t border-b border-slate-200/80 dark:border-slate-800/80'
        }`}
        title="Хватайте и перетаскивайте в любое место"
      >
        <div className="flex items-center justify-center gap-0.5">
          <GripVertical className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-sky-500" />
          <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">{index + 1}</span>
        </div>
      </td>

      {/* 2. № Рейса */}
      <td className={`sticky left-7 z-20 py-1.5 px-0.5 font-mono font-extrabold text-sm text-sky-700 dark:text-sky-400 whitespace-nowrap w-18 min-w-[72px] text-center bg-inherit shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)] ${
        isOverdue ? 'border-t-2 border-b-2 border-rose-500' : ''
      }`}>
        <div className="flex flex-col items-center justify-center gap-0.5">
          <input
            type="text"
            value={flight.flight || ''}
            onChange={(e) => handleCellChange('flight', formatValidFlight(e.target.value))}
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            className="bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-sky-500 rounded px-0.5 py-0.5 w-16 font-extrabold font-mono text-sm text-sky-700 dark:text-sky-400 outline-none cursor-text tracking-wide text-center"
          />
          {flight.is_new_flight && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAcknowledgeFlight?.(flight.id); }}
              className="inline-flex items-center gap-0.5 bg-amber-500 hover:bg-amber-600 text-white text-[8px] font-black uppercase px-1 py-0.2 rounded shadow animate-pulse cursor-pointer shrink-0"
              title="Новый рейс из AviaBit! Нажмите для подтверждения"
            >
              <span>НОВЫЙ</span>
              <Check className="w-2 h-2 stroke-[3]" />
            </button>
          )}
        </div>
      </td>

      {/* 3. Маршрут */}
      <td className={`py-1 px-1 whitespace-nowrap leading-tight text-center min-w-[95px] max-w-[115px] ${overdueBorderTopBottom}`}>
        <div className={`flex flex-col items-center justify-center gap-0.5 w-full rounded p-0.5 ${
          isChanged('route_city') || isChanged('route_airports') ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40' : ''
        }`}>
          <input
            type="text"
            value={flight.route_city || ''}
            onChange={(e) => handleCellChange('route_city', e.target.value)}
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Город"
            className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none w-full min-w-[85px] cursor-text text-center ${getChangedStyle('route_city')}`}
            title={flight.route_city || ''}
          />
          <ChangeBadge change={unread.route_city} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'route_city')} />
          <input
            type="text"
            value={flight.route_airports || ''}
            onChange={(e) => handleCellChange('route_airports', e.target.value.toUpperCase())}
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="DEP-ARR"
            className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 outline-none w-full min-w-[85px] uppercase cursor-text tracking-wider text-center ${getChangedStyle('route_airports')}`}
          />
          <ChangeBadge change={unread.route_airports} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'route_airports')} />
        </div>
      </td>

      {/* 4. ВРЕМЯ */}
      <td className={`py-0.5 px-0.5 whitespace-nowrap text-center min-w-[78px] ${overdueBorderTopBottom}`}>
        <div className={`flex flex-col items-center gap-0.5 rounded-md p-0.5 min-w-[74px] transition-colors ${
          isOverdue
            ? 'bg-rose-100/95 dark:bg-rose-950/80 border-2 border-rose-500 shadow-sm'
            : isChanged('time') || isChanged('flight_date')
            ? 'bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-500 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700'
        }`}>
          {/* 1. Время выпуска (-40 мин) */}
          <div className="flex items-center justify-center gap-0.5 w-full">
            <span className={`text-[8px] font-extrabold uppercase leading-none ${
              isOverdue ? 'text-rose-700 dark:text-rose-300 font-black animate-pulse' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              ВЫП:
            </span>
            <input
              type="text"
              value={flight.release_time || ''}
              onChange={handleReleaseTimeChange}
              onFocus={(e) => e.target.select()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="--:--"
              className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 rounded px-0.5 text-center font-mono font-extrabold text-[11px] outline-none w-12 cursor-text ${
                isOverdue
                  ? 'text-rose-900 dark:text-rose-100 focus:ring-rose-500 font-black'
                  : 'text-emerald-700 dark:text-emerald-300 focus:ring-emerald-500'
              }`}
              title={isOverdue ? 'ВНИМАНИЕ: Срок выпуска рейса истек! Выполните выпуск.' : 'Время выпуска (за 40 мин до вылета)'}
            />
          </div>

          {/* 2. Время вылета */}
          <div className="flex flex-col items-center justify-center w-full border-t border-slate-200 dark:border-slate-800 pt-0.5">
            <div className="flex items-center justify-center gap-0.5 w-full">
              <span className="text-[8px] font-bold text-amber-600 dark:text-amber-400 uppercase leading-none">ВЫЛ:</span>
              <input
                type="text"
                value={flight.time || ''}
                onChange={handleDepartureTimeChange}
                onBlur={handleDepartureTimeBlur}
                onKeyDown={handleDepartureTimeKeyDown}
                onFocus={(e) => e.target.select()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="00:00"
                className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-amber-500 rounded px-0.5 text-center font-mono font-extrabold text-xs text-amber-700 dark:text-amber-300 outline-none w-12 cursor-text ${getChangedStyle('time')}`}
                title="Время вылета (МСК) — нажмите Enter или смените поле для авто-сортировки"
              />
            </div>
            <ChangeBadge change={unread.time} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'time')} />
          </div>

          {/* 3. Дата рейса */}
          <div className="flex flex-col items-center justify-center w-full border-t border-slate-200 dark:border-slate-800 pt-0.5">
            <input
              type="text"
              value={flight.flight_date || ''}
              onChange={(e) => handleCellChange('flight_date', formatValidDayMonth(e.target.value))}
              onBlur={() => onUpdateFlight(flight.id, {}, true)}
              onFocus={(e) => e.target.select()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.target.blur();
                }
              }}
              placeholder="25.08"
              maxLength={5}
              className={`bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 focus:bg-white dark:focus:bg-slate-800 border border-sky-200 dark:border-sky-800/80 focus:ring-1 focus:ring-sky-500 rounded px-0.5 text-center font-mono font-extrabold text-[10px] text-sky-800 dark:text-sky-300 outline-none w-13 cursor-text tracking-wide ${getChangedStyle('flight_date')}`}
              title="Дата рейса (число.месяц)"
            />
            <ChangeBadge change={unread.flight_date} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'flight_date')} />
          </div>
        </div>
      </td>

      {/* 5. Номер ВС и Тип ВС */}
      <td className={`py-1 px-0.5 font-mono whitespace-nowrap text-center w-14 ${overdueBorderTopBottom}`}>
        <div className="flex flex-col items-center justify-center gap-0.5">
          <input
            type="text"
            value={flight.ac_num || ''}
            onChange={handleAcNumChange}
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="73314"
            maxLength={5}
            className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-sky-500 rounded px-0.5 py-0.5 w-14 text-center font-mono text-xs font-bold text-slate-900 dark:text-white outline-none cursor-text tracking-wider ${getChangedStyle('ac_num')}`}
            title="Бортовой номер ВС"
          />
          <ChangeBadge change={unread.ac_num} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'ac_num')} />

          <div className="border-t border-slate-200 dark:border-slate-800 w-full pt-0.5 flex flex-col items-center justify-center">
            <input
              type="text"
              value={flight.ac_type || ''}
              onChange={(e) => handleCellChange('ac_type', normalizePlaneType(e.target.value))}
              onFocus={(e) => e.target.select()}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="—"
              maxLength={4}
              className={`bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 focus:bg-white dark:focus:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:ring-1 focus:ring-sky-500 rounded px-0.5 py-0 text-center font-mono font-bold text-[10px] text-slate-700 dark:text-slate-300 outline-none w-11 cursor-text tracking-wider shadow-inner ${getChangedStyle('ac_type')}`}
              title="Тип ВС"
            />
            <ChangeBadge change={unread.ac_type} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'ac_type')} />
          </div>
        </div>
      </td>

      {/* 6. Компановка */}
      <td className={`py-1 px-0.5 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-nowrap text-center w-11 ${overdueBorderTopBottom}`}>
        <div className="flex flex-col items-center justify-center">
          <input
            type="text"
            value={flight.ac_config || ''}
            onChange={handleAcConfigChange}
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="189"
            maxLength={7}
            className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-sky-500 rounded px-0.5 py-0.5 w-10 text-center font-mono text-xs font-bold text-slate-800 dark:text-slate-200 outline-none cursor-text ${getChangedStyle('ac_config')}`}
          />
          <ChangeBadge change={unread.ac_config} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'ac_config')} />
        </div>
      </td>

      {/* 7. PAX */}
      <td className={`py-1 px-0.5 font-mono font-extrabold text-sm text-slate-950 dark:text-white whitespace-nowrap text-center w-11 ${overdueBorderTopBottom}`}>
        <div className="flex flex-col items-center justify-center">
          <input
            type="text"
            value={flight.pax || ''}
            onChange={(e) => handleCellChange('pax', e.target.value.replace(/\D/g, '').slice(0, 4))}
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="0"
            maxLength={4}
            className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-sky-500 rounded px-0.5 py-0.5 w-10 text-center font-mono font-extrabold text-sm text-slate-950 dark:text-white outline-none cursor-text ${getChangedStyle('pax')}`}
          />
          <ChangeBadge change={unread.pax} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'pax')} />
        </div>
      </td>

      {/* 8. Экипаж */}
      <td className={`py-1 px-0.5 font-mono text-xs text-slate-900 dark:text-slate-200 whitespace-nowrap text-center w-14 ${overdueBorderTopBottom}`}>
        <div className="flex flex-col items-center justify-center">
          <input
            type="text"
            value={flight.crew || ''}
            onChange={(e) => handleCellChange('crew', formatValidCrew(e.target.value))}
            onFocus={(e) => e.target.select()}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="2/4/0/0"
            className={`bg-transparent focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-sky-500 rounded px-0.5 py-0.5 w-14 text-center font-mono font-extrabold text-[11px] text-slate-900 dark:text-slate-100 outline-none cursor-text ${getChangedStyle('crew')}`}
          />
          <ChangeBadge change={unread.crew} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'crew')} />
        </div>
      </td>

      {/* 9. ТОПЛИВО И ВЕСА */}
      <td className={`py-0.5 px-0.5 w-[165px] ${overdueBorderTopBottom}`}>
        <div className="bg-white dark:bg-slate-900/95 border border-slate-300 dark:border-slate-700 rounded-lg p-1 flex flex-col gap-1 w-[165px] shadow-sm">
          <div className="grid grid-cols-3 gap-0.5 text-xs">
            <div>
              <span className="text-sky-700 dark:text-sky-400 text-[9px] font-extrabold block leading-none mb-0.5">BLOCK</span>
              <input
                type="text"
                value={flight.fuel_block || ''}
                onChange={(e) => handleCellChange('fuel_block', e.target.value)}
                onFocus={(e) => e.target.select()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="—"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:bg-white rounded px-0.5 py-0.5 font-mono text-[11px] font-extrabold text-sky-800 dark:text-sky-200 text-center outline-none cursor-text"
              />
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400 text-[9px] font-bold block leading-none mb-0.5">TRIP</span>
              <input
                type="text"
                value={flight.fuel_trip || ''}
                onChange={(e) => handleCellChange('fuel_trip', e.target.value)}
                onFocus={(e) => e.target.select()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="—"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:bg-white rounded px-0.5 py-0.5 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center outline-none cursor-text"
              />
            </div>
            <div>
              <span className="text-slate-600 dark:text-slate-400 text-[9px] font-bold block leading-none mb-0.5">TAXI</span>
              <input
                type="text"
                value={flight.fuel_taxi || ''}
                onChange={(e) => handleCellChange('fuel_taxi', e.target.value)}
                onFocus={(e) => e.target.select()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="—"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-sky-500 focus:bg-white rounded px-0.5 py-0.5 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 text-center outline-none cursor-text"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-0.5 text-xs pt-0.5 border-t border-slate-200 dark:border-slate-800 items-center">
            <div>
              <span className="text-indigo-700 dark:text-indigo-400 text-[9px] font-extrabold block leading-none mb-0.5">DOW</span>
              <input
                type="text"
                value={flight.dow || ''}
                onChange={(e) => handleCellChange('dow', e.target.value)}
                onFocus={(e) => e.target.select()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="—"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:bg-white rounded px-0.5 py-0.5 font-mono text-[11px] font-extrabold text-indigo-800 dark:text-indigo-200 text-center outline-none cursor-text"
              />
            </div>
            <div>
              <span className="text-indigo-700 dark:text-indigo-400 text-[9px] font-extrabold block leading-none mb-0.5">DOI</span>
              <input
                type="text"
                value={flight.doi || ''}
                onChange={(e) => handleCellChange('doi', e.target.value)}
                onFocus={(e) => e.target.select()}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder="—"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:bg-white rounded px-0.5 py-0.5 font-mono text-[11px] font-extrabold text-indigo-800 dark:text-indigo-200 text-center outline-none cursor-text"
              />
            </div>
            <div>
              <span className="text-amber-700 dark:text-amber-400 text-[9px] font-extrabold block leading-none mb-0.5">КУХНЯ</span>
              <select
                value={flight.galley || 'D'}
                onChange={(e) => handleCellChange('galley', e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-amber-500 rounded px-0.5 py-0.5 font-mono text-[11px] text-amber-800 dark:text-amber-300 text-center font-extrabold outline-none cursor-pointer"
              >
                <option value="">—</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="D">D</option>
                <option value="F">F</option>
                <option value="E">E</option>
              </select>
            </div>
          </div>
        </div>
      </td>

      {/* 10. MTOW */}
      <td className={`py-1 px-0.5 text-center w-12 min-w-[46px] ${overdueBorderTopBottom}`}>
        <input
          type="text"
          value={flight.mtow || ''}
          onChange={(e) => handleCellChange('mtow', formatValidMtow(e.target.value))}
          onFocus={(e) => e.target.select()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="—"
          maxLength={6}
          className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-sky-500 rounded px-0.5 py-0.5 text-center font-mono text-[11px] font-bold text-slate-900 dark:text-slate-200 outline-none cursor-text"
        />
      </td>
      {/* 11. LIR */}
      <td className={`py-1 px-0.5 text-center whitespace-nowrap w-11 ${overdueBorderTopBottom}`}>
        <button
          type="button"
          onClick={handleToggleLir}
          onKeyDown={(e) => handleCheckboxKeyDown(e, handleToggleLir)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          tabIndex={0}
          className={`flex items-center justify-center gap-0.5 px-1 py-1 rounded border text-[10px] font-extrabold transition-all focus:outline-none focus:ring-1 focus:ring-indigo-400 shadow-sm w-full ${
            flight.lir_sent
              ? 'bg-indigo-600 text-white border-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-200 dark:border-indigo-400'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
          }`}
          title="LIR"
        >
          <div className={`w-3 h-3 rounded flex items-center justify-center border ${
            flight.lir_sent ? 'bg-white text-indigo-700 border-white' : 'border-slate-400 dark:border-slate-500'
          }`}>
            {flight.lir_sent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>LIR</span>
        </button>
      </td>

      {/* 12. Груз */}
      <td className={`py-1 px-0.5 text-center min-w-[85px] max-w-[110px] ${overdueBorderTopBottom}`}>
        <div className="flex flex-col items-center justify-center">
          <textarea
            rows={2}
            value={flight.cargo || ''}
            onChange={(e) => handleCellChange('cargo', e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Груз..."
            title={flight.cargo || ''}
            className={`w-full resize-none overflow-hidden hover:overflow-y-auto focus:overflow-y-auto leading-tight bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-sky-500 rounded px-1 py-0.5 text-center outline-none cursor-text transition-all shadow-sm break-words [word-break:break-word] ${
              (flight.cargo || '').length > 15
                ? 'text-[10px] leading-[1.2] font-mono font-semibold tracking-tight'
                : (flight.cargo || '').length > 8
                ? 'text-[11px] leading-snug font-medium'
                : 'text-xs font-medium'
            } text-slate-900 dark:text-slate-200 ${getChangedStyle('cargo')}`}
          />
          <ChangeBadge change={unread.cargo} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'cargo')} />
        </div>
      </td>

      {/* 13. Почта */}
      <td className={`py-1 px-0.5 text-center min-w-[48px] max-w-[65px] ${overdueBorderTopBottom}`}>
        <div className="flex flex-col items-center justify-center">
          <textarea
            rows={2}
            value={flight.mail || ''}
            onChange={(e) => handleCellChange('mail', e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Почта..."
            title={flight.mail || ''}
            className={`w-full resize-none overflow-hidden hover:overflow-y-auto focus:overflow-y-auto leading-tight bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-sky-500 rounded px-0.5 py-0.5 text-center outline-none cursor-text transition-all shadow-sm break-words [word-break:break-word] ${
              (flight.mail || '').length > 12
                ? 'text-[10px] leading-[1.2] font-mono font-semibold tracking-tight'
                : (flight.mail || '').length > 7
                ? 'text-[11px] leading-snug font-medium'
                : 'text-xs font-medium'
            } text-slate-900 dark:text-slate-200 ${getChangedStyle('mail')}`}
          />
          <ChangeBadge change={unread.mail} onAcknowledge={() => onAcknowledgeField?.(flight.id, 'mail')} />
        </div>
      </td>

      {/* 14. Багаж */}
      <td className={`py-1 px-0.5 min-w-[90px] max-w-[120px] ${overdueBorderTopBottom}`}>
        <textarea
          rows={2}
          value={flight.baggage || ''}
          onChange={(e) => handleCellChange('baggage', e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Особенности багажа..."
          title={flight.baggage || ''}
          className="w-full resize-none overflow-hidden hover:overflow-y-auto focus:overflow-y-auto leading-tight bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-sky-500 rounded px-1 py-0.5 text-[11px] font-medium text-slate-900 dark:text-slate-200 outline-none cursor-text transition-all shadow-sm"
        />
      </td>

      {/* 15. СЗВ */}
      <td className={`py-1 px-0.5 text-center whitespace-nowrap w-11 ${overdueBorderTopBottom}`}>
        <button
          type="button"
          onClick={handleToggleSzv}
          onKeyDown={(e) => handleCheckboxKeyDown(e, handleToggleSzv)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          tabIndex={0}
          className={`flex items-center justify-center gap-0.5 px-1 py-1 rounded border text-[10px] font-extrabold transition-all focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-sm w-full ${
            flight.szv_sent
              ? 'bg-amber-600 text-white border-amber-700 dark:bg-amber-500/30 dark:text-amber-200 dark:border-amber-400'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
          }`}
          title="СЗВ"
        >
          <div className={`w-3 h-3 rounded flex items-center justify-center border ${
            flight.szv_sent ? 'bg-white text-amber-700 border-white' : 'border-slate-400 dark:border-slate-500'
          }`}>
            {flight.szv_sent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>СЗВ</span>
        </button>
      </td>

      {/* 16. ЛДМ */}
      <td className={`py-1 px-0.5 text-center whitespace-nowrap w-11 ${overdueBorderTopBottom}`}>
        <button
          type="button"
          onClick={handleToggleLdm}
          onKeyDown={(e) => handleCheckboxKeyDown(e, handleToggleLdm)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          tabIndex={0}
          className={`flex items-center justify-center gap-0.5 px-1 py-1 rounded border text-[10px] font-extrabold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-400 shadow-sm w-full ${
            flight.ldm_sent
              ? 'bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-200 dark:border-emerald-400'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-400'
          }`}
          title="LDM"
        >
          <div className={`w-3 h-3 rounded flex items-center justify-center border ${
            flight.ldm_sent ? 'bg-white text-emerald-700 border-white' : 'border-slate-400 dark:border-slate-500'
          }`}>
            {flight.ldm_sent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
          </div>
          <span>LDM</span>
        </button>
      </td>

      {/* 17. ВРЕМЕНА В ASTRA (Строго для рейсов вылетающих из REN Оренбург) */}
      <td className={`py-1 px-0.5 text-center whitespace-nowrap min-w-[68px] ${overdueBorderTopBottom}`}>
        {isRen ? (
          <button
            type="button"
            onClick={handleToggleAstraTimes}
            onKeyDown={(e) => handleCheckboxKeyDown(e, handleToggleAstraTimes)}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            tabIndex={0}
            className={`flex items-center justify-center gap-0.5 px-1 py-1 rounded border text-[10px] font-extrabold transition-all focus:outline-none focus:ring-1 focus:ring-teal-400 shadow-sm w-full ${
              flight.astra_times_sent
                ? 'bg-teal-600 text-white border-teal-700 dark:bg-teal-500/30 dark:text-teal-200 dark:border-teal-400'
                : 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-400/60 dark:border-teal-600/50 hover:bg-teal-100/70 hover:border-teal-500 animate-pulse'
            }`}
            title="Для рейса из Оренбурга (REN) необходимо вручную проставить время движения и взлёта в Astra!"
          >
            <div className={`w-3 h-3 rounded flex items-center justify-center border ${
              flight.astra_times_sent ? 'bg-white text-teal-700 border-white' : 'border-teal-500 dark:border-teal-400 bg-white dark:bg-slate-900'
            }`}>
              {flight.astra_times_sent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span>Времена</span>
          </button>
        ) : (
          <span className="text-slate-300 dark:text-slate-700 font-mono text-xs select-none">—</span>
        )}
      </td>

      {/* 18. СТАТУС РЕЙСА */}
      <td className={`py-1 px-0.5 text-center whitespace-nowrap w-24 min-w-[92px] ${overdueBorderTopBottom}`}>
        <select
          value={currentStatus}
          onChange={handleStatusSelectChange}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={`text-[11px] font-extrabold rounded px-1.5 py-0.5 border focus:outline-none cursor-pointer shadow-sm w-full ${statusBadgeStyle[currentStatus] || statusBadgeStyle.pending}`}
        >
          <option value="pending" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300">⚪ Ожидание</option>
          <option value="prepared" className="bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300">🔵 Подготовлен</option>
          <option value="lir_sent" className="bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300">🟣 LIR отправлен</option>
          <option value="released" className="bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300">🟢 Выпущен</option>
          <option value="closed" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300">⚫ Закрыт</option>
        </select>
      </td>

      {/* 19. Примечания */}
      <td className={`py-1 px-0.5 min-w-[85px] max-w-[120px] ${overdueBorderTopBottom}`}>
        <textarea
          rows={2}
          value={flight.notes || ''}
          onChange={(e) => handleCellChange('notes', e.target.value)}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Заметка..."
          title={flight.notes || ''}
          className="w-full resize-none overflow-hidden hover:overflow-y-auto focus:overflow-y-auto leading-tight bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-sky-500 rounded px-1 py-0.5 text-[11px] font-medium text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none cursor-text transition-all shadow-sm"
        />
      </td>

      {/* 20. Действия */}
      <td className={`py-1 px-0.5 text-center whitespace-nowrap no-print rounded-r-2xl w-16 ${
        isOverdue ? 'border-r-2 border-r-rose-500 border-t-2 border-b-2 border-rose-500' : 'border-r border-t border-b border-slate-200/80 dark:border-slate-800/80'
      }`}>
        <div className="flex items-center justify-center gap-1">
          {hasUnreadChanges && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onAcknowledgeFlight?.(flight.id); }}
              className="flex items-center justify-center gap-0.5 bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm transition-all active:scale-95 animate-pulse shrink-0 cursor-pointer"
              title="Подтвердить ознакомление со всеми изменениями в этом рейсе"
            >
              <Check className="w-2.5 h-2.5 stroke-[3]" />
              <span>✓{unreadCount > 0 ? ` (${unreadCount})` : ''}</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(index); }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isFirst}
              className="p-0.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-20 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Переместить вверх"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(index); }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isLast}
              className="p-0.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-300 disabled:opacity-20 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Переместить вниз"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteFlight(flight.id); }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="p-0.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-rose-100 dark:hover:bg-rose-950/40 transition-colors"
              title="Удалить рейс"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}
