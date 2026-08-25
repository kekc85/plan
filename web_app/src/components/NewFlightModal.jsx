import React, { useState } from 'react';
import { X, Plane, Plus, Check } from 'lucide-react';
import { 
  formatValidTime, 
  calcReleaseTime,
  formatValidCrew, 
  formatValidFlight, 
  formatValidAcNum, 
  formatValidAcConfig,
  formatValidMtow,
  formatValidDayMonth
} from '../utils/validators';

export default function NewFlightModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    flight: '',
    flight_date: '',
    route_city: '',
    route_airports: '',
    time: '',
    release_time: '',
    ac_num: '',
    ac_config: '189',
    pax: '',
    crew: '2/4/0/0',
    fuel_block: '',
    fuel_trip: '',
    fuel_taxi: '',
    dow: '',
    doi: '',
    galley: 'D',
    lir_sent: false,
    mtow: '',
    cargo: '',
    mail: '',
    baggage: '',
    szv_sent: false,
    ldm_sent: false,
    notes: '',
    status: 'pending'
  });

  if (!isOpen) return null;

  const handleDepartureTimeInput = (e) => {
    const formatted = formatValidTime(e.target.value);
    const updates = { time: formatted };
    if (formatted && formatted.length === 5) {
      updates.release_time = calcReleaseTime(formatted, 40);
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleFlightInput = (e) => {
    const formatted = formatValidFlight(e.target.value);
    setFormData(prev => ({ ...prev, flight: formatted }));
  };

  const handleCrewInput = (e) => {
    const formatted = formatValidCrew(e.target.value);
    setFormData(prev => ({ ...prev, crew: formatted }));
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const updates = { status: newStatus };
    if (newStatus === 'pending' || newStatus === 'in_progress' || newStatus === 'prepared') {
      updates.lir_sent = false;
      updates.szv_sent = false;
      updates.ldm_sent = false;
    } else if (newStatus === 'lir_sent') {
      updates.lir_sent = true;
      updates.szv_sent = false;
      updates.ldm_sent = false;
    } else if (newStatus === 'released') {
      updates.lir_sent = true;
      updates.szv_sent = true;
      updates.ldm_sent = false;
    } else if (newStatus === 'closed') {
      updates.lir_sent = true;
      updates.szv_sent = true;
      updates.ldm_sent = true;
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.flight.trim()) {
      alert('Пожалуйста, укажите номер рейса (например N41402 или EO413)');
      return;
    }

    const newFlight = {
      id: `fl_manual_${Date.now()}`,
      ...formData
    };

    onAdd(newFlight);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl max-w-2xl w-full p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Plane className="w-4 h-4" />
            </div>
            <span>Добавление рейса в смену</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5 text-xs">
          
          {/* Row 1: Рейс, Число, Город, DEP-ARR, Выпуск, Вылет */}
          <div className="grid grid-cols-6 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-0.5">№ Рейса *</label>
              <input
                type="text"
                value={formData.flight}
                onChange={handleFlightInput}
                placeholder="N41402"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white font-mono font-bold text-sm focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sky-600 dark:text-sky-400 font-bold mb-0.5">Дата (ДД.ММ)</label>
              <input
                type="text"
                value={formData.flight_date}
                onChange={(e) => setFormData(prev => ({ ...prev, flight_date: formatValidDayMonth(e.target.value) }))}
                placeholder="25.08"
                maxLength={5}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-sky-700 dark:text-sky-300 font-mono font-bold text-sm focus:border-sky-500 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">Город</label>
              <input
                type="text"
                value={formData.route_city}
                onChange={(e) => setFormData(prev => ({ ...prev, route_city: e.target.value }))}
                placeholder="Москва"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">DEP-ARR</label>
              <input
                type="text"
                value={formData.route_airports}
                onChange={(e) => setFormData(prev => ({ ...prev, route_airports: e.target.value.toUpperCase() }))}
                placeholder="KQT-SVO"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white font-mono font-bold uppercase focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">Выпуск (-40м)</label>
              <input
                type="text"
                value={formData.release_time}
                onChange={(e) => setFormData(prev => ({ ...prev, release_time: formatValidTime(e.target.value) }))}
                placeholder="13:40"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-sm focus:border-emerald-400 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-amber-600 dark:text-amber-400 font-bold mb-0.5">Вылет (МСК)</label>
              <input
                type="text"
                value={formData.time}
                onChange={handleDepartureTimeInput}
                placeholder="14:20"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-amber-600 dark:text-amber-300 font-mono font-bold text-sm focus:border-amber-400 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Row 2: Номер ВС, Комп., PAX, Экипаж */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">Борт (5 цифр)</label>
              <input
                type="text"
                value={formData.ac_num}
                onChange={(e) => setFormData(prev => ({ ...prev, ac_num: formatValidAcNum(e.target.value) }))}
                placeholder="73314"
                maxLength={5}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white font-mono font-bold focus:border-sky-500 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">Компановка</label>
              <input
                type="text"
                value={formData.ac_config}
                onChange={(e) => setFormData(prev => ({ ...prev, ac_config: formatValidAcConfig(e.target.value) }))}
                placeholder="189 или 12/168"
                maxLength={7}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white font-mono font-semibold focus:border-sky-500 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">PAX (макс 4)</label>
              <input
                type="text"
                value={formData.pax}
                onChange={(e) => setFormData(prev => ({ ...prev, pax: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                placeholder="146"
                maxLength={4}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white font-mono font-bold focus:border-sky-500 focus:outline-none text-center"
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-0.5">Экипаж</label>
              <input
                type="text"
                value={formData.crew}
                onChange={handleCrewInput}
                placeholder="2/4/0/0"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 text-slate-900 dark:text-white font-mono font-bold focus:border-sky-500 focus:outline-none text-center"
              />
            </div>
          </div>

          {/* Row 3: Топливо, Веса, Кухня, MTOW */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-2">
            <div className="grid grid-cols-7 gap-1.5 text-[11px]">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-0.5 font-bold">Block Fuel</label>
                <input
                  type="text"
                  value={formData.fuel_block}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuel_block: e.target.value }))}
                  placeholder="12500"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-sky-700 dark:text-sky-200 font-mono text-center focus:border-sky-500 focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-0.5 font-bold">Trip Fuel</label>
                <input
                  type="text"
                  value={formData.fuel_trip}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuel_trip: e.target.value }))}
                  placeholder="9800"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-800 dark:text-slate-200 font-mono text-center focus:border-sky-500 focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-0.5 font-bold">Taxi Fuel</label>
                <input
                  type="text"
                  value={formData.fuel_taxi}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuel_taxi: e.target.value }))}
                  placeholder="300"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-800 dark:text-slate-200 font-mono text-center focus:border-sky-500 focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-0.5 font-bold">DOW (кг)</label>
                <input
                  type="text"
                  value={formData.dow}
                  onChange={(e) => setFormData(prev => ({ ...prev, dow: e.target.value }))}
                  placeholder="42150"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-indigo-700 dark:text-indigo-200 font-mono text-center focus:border-indigo-400 focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-0.5 font-bold">DOI</label>
                <input
                  type="text"
                  value={formData.doi}
                  onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                  placeholder="48.2"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 text-indigo-700 dark:text-indigo-200 font-mono text-center focus:border-indigo-400 focus:outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-amber-600 dark:text-amber-400 text-[10px] mb-0.5 font-bold">Кухня</label>
                <select
                  value={formData.galley}
                  onChange={(e) => setFormData(prev => ({ ...prev, galley: e.target.value }))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1 py-0.5 font-mono text-amber-700 dark:text-amber-300 text-center font-bold focus:border-amber-400 focus:outline-none text-xs"
                >
                  <option value="">—</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="D">D</option>
                  <option value="F">F</option>
                  <option value="E">E</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] mb-0.5 font-bold">MTOW (макс 6)</label>
                <input
                  type="text"
                  value={formData.mtow}
                  onChange={(e) => setFormData(prev => ({ ...prev, mtow: formatValidMtow(e.target.value) }))}
                  placeholder="79000"
                  maxLength={6}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-0.5 font-mono text-slate-800 dark:text-slate-200 text-center focus:border-sky-500 focus:outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Груз, Почта, Багаж, Чекбоксы */}
          <div className="grid grid-cols-6 gap-2 items-center">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">Груз</label>
              <input
                type="text"
                value={formData.cargo}
                onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                placeholder="450кг"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">Почта</label>
              <input
                type="text"
                value={formData.mail}
                onChange={(e) => setFormData(prev => ({ ...prev, mail: e.target.value }))}
                placeholder="120кг"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-1.5 py-1 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">Багаж</label>
              <input
                type="text"
                value={formData.baggage}
                onChange={(e) => setFormData(prev => ({ ...prev, baggage: e.target.value }))}
                placeholder="Особенности багажа..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none text-xs"
              />
            </div>

            {/* Чекбоксы */}
            <div className="col-span-2 flex items-center gap-1.5 pt-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, lir_sent: !prev.lir_sent, status: !prev.lir_sent ? 'lir_sent' : prev.status }))}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded border font-bold text-[11px] transition-colors ${
                  formData.lir_sent
                    ? 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className={`w-3 h-3 rounded flex items-center justify-center border ${
                  formData.lir_sent ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-400 dark:border-slate-500'
                }`}>
                  {formData.lir_sent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>LIR</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, szv_sent: !prev.szv_sent, lir_sent: true, status: !prev.szv_sent ? 'released' : prev.status }))}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded border font-bold text-[11px] transition-colors ${
                  formData.szv_sent
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className={`w-3 h-3 rounded flex items-center justify-center border ${
                  formData.szv_sent ? 'bg-amber-500 border-amber-400 text-white' : 'border-slate-400 dark:border-slate-500'
                }`}>
                  {formData.szv_sent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>СЗВ</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, ldm_sent: !prev.ldm_sent, szv_sent: true, lir_sent: true, status: !prev.ldm_sent ? 'closed' : prev.status }))}
                className={`flex-1 flex items-center justify-center gap-1 py-1 rounded border font-bold text-[11px] transition-colors ${
                  formData.ldm_sent
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                }`}
              >
                <div className={`w-3 h-3 rounded flex items-center justify-center border ${
                  formData.ldm_sent ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-400 dark:border-slate-500'
                }`}>
                  {formData.ldm_sent && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </div>
                <span>LDM</span>
              </button>
            </div>
          </div>

          {/* Row 5: Статус и Заметки */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-0.5">Статус</label>
              <select
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white font-bold focus:border-sky-500 focus:outline-none"
              >
                <option value="pending">⚪ Ожидание</option>
                <option value="in_progress">🟡 В работе</option>
                <option value="prepared">🔵 Подготовлен</option>
                <option value="lir_sent">🟣 LIR отправлен</option>
                <option value="released">🟢 Выпущен</option>
                <option value="closed">⚫ Закрыт</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 mb-0.5 font-bold">Примечания</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Особые отметки диспетчера..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold text-xs"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white font-bold px-4 py-1 rounded shadow-sm transition-colors text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Добавить в журнал
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
