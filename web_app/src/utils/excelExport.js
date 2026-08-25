import * as XLSX from 'xlsx';

export async function exportShiftToExcel(flights, shiftInfo) {
  if (!flights || flights.length === 0) {
    alert('Журнал пуст! Нет данных для выгрузки.');
    return;
  }

  // 1. Попытка выгрузить через Python backend (openpyxl) со всеми нативными стилями печати, шрифтами и границами
  try {
    const response = await fetch('/api/export_excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flights: flights,
        shift_info: shiftInfo
      })
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanDate = (shiftInfo?.date_interval || shiftInfo?.date || 'export').replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_');
      a.download = `Суточный_план_Диспетчера_${cleanDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return;
    }
  } catch (err) {
    console.warn('Backend export endpoint unavailable, using client-side export:', err);
  }

  // 2. Клиентский резервный экспорт (15 канонических колонок)
  const dateInterval = shiftInfo?.date_interval || shiftInfo?.date || '';
  const shiftTitle = `Суточный план Диспетчера группы центровки  ${dateInterval}`;

  const headers = [
    "№ рейса",
    "Маршрут",
    "Время",
    "Номер\nВС",
    "Компано\nвка",
    "PAX,\nNOTES",
    "Экипаж\nЛ/Б/И/П",
    "Топливо",
    "MTOW",
    "LIR",
    "Груз",
    "Почта",
    "Багаж",
    "СЗВ",
    "ЛДМ"
  ];

  const dataRows = flights.map(f => {
    let routeCombined = f.route_airports || '';
    if (f.route_city) {
      routeCombined = `${f.route_city}\n${f.route_airports || ''}`;
    }

    const fuelParts = [];
    if (f.fuel_block) fuelParts.push(`B:${f.fuel_block}`);
    if (f.fuel_trip) fuelParts.push(`T:${f.fuel_trip}`);
    if (f.fuel_taxi) fuelParts.push(`Tx:${f.fuel_taxi}`);
    const fuelCombined = fuelParts.join(' ') || (f.fuel || '');

    const tailVal = f.ac_num ? (parseInt(f.ac_num, 10) || f.ac_num) : '';
    const configVal = f.ac_config ? (parseInt(f.ac_config, 10) || f.ac_config) : '';
    const paxVal = f.pax ? (parseInt(f.pax, 10) || f.pax) : '';
    const mtowVal = f.mtow ? (parseInt(f.mtow, 10) || f.mtow) : '';

    const lirVal = f.lir_sent ? 'ДА' : '';
    const szvVal = f.szv_sent ? 'ДА' : '';
    const ldmVal = f.ldm_sent ? 'ДА' : '';

    return [
      f.flight || '',
      routeCombined,
      f.time || '',
      tailVal,
      configVal,
      paxVal,
      f.crew || '',
      fuelCombined,
      mtowVal,
      lirVal,
      f.cargo || '',
      f.mail || '',
      f.baggage || '',
      szvVal,
      ldmVal
    ];
  });

  const wsData = [
    [shiftTitle],
    headers,
    ...dataRows
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } }
  ];

  ws['!cols'] = [
    { wch: 11.0 }, // A
    { wch: 14.5 }, // B
    { wch: 8.5  }, // C
    { wch: 9.5  }, // D
    { wch: 11.0 }, // E
    { wch: 10.0 }, // F
    { wch: 10.0 }, // G
    { wch: 14.0 }, // H
    { wch: 9.0  }, // I
    { wch: 5.5  }, // J
    { wch: 9.5  }, // K
    { wch: 9.5  }, // L
    { wch: 9.5  }, // M
    { wch: 4.5  }, // N
    { wch: 4.5  }  // O
  ];

  ws['!rows'] = [
    { hpt: 26 },
    { hpt: 36 },
    ...flights.map(() => ({ hpt: 36 }))
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Суточный план");

  const cleanName = (dateInterval || 'export').replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_');
  const fileName = `Суточный_план_Диспетчера_${cleanName}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
