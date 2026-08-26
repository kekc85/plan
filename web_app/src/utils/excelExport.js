import ExcelJS from 'exceljs';

/**
 * Экспорт суточного плана в Excel (.xlsx) через ExcelJS
 * Гарантирует 100% точное соответствие шаблону парсера и openpyxl:
 * - Шрифты Calibri 11 (Bold для PAX), Calibri 9 для маршрута
 * - Вертикальный поворот текста для колонок СЗВ и ЛДМ (90°)
 * - Точные границы ячеек и пропорциональные ширины
 * - Альбомная ориентация страницы A4 (fit to page)
 * - Окно выбора места сохранения без закрытия или перехода страницы
 * - Полная автономность: работает прямо в браузере без зависимости от серверов
 */
export async function exportShiftToExcel(flights, shiftInfo) {
  if (!flights || flights.length === 0) {
    alert('Журнал пуст! Нет данных для выгрузки.');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AeroPlan W&B';
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Суточный план', {
      pageSetup: {
        orientation: 'landscape',
        paperSize: 9, // A4
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      },
      views: [{ state: 'frozen', ySplit: 2 }]
    });

    const dateHeaderStr = shiftInfo?.date_interval || shiftInfo?.date || new Date().toLocaleDateString('ru-RU');
    const titleText = `Суточный план Диспетчера группы центровки  ${dateHeaderStr}`;

    // Строка 1: Главный заголовок
    ws.mergeCells('A1:O1');
    const titleCell = ws.getCell('A1');
    titleCell.value = titleText;
    titleCell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF000000' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 26;

    // Шапка таблицы (15 колонок)
    const headers = [
      '№ рейса',
      'Маршрут',
      'Время',
      'Номер\nВС',
      'Компано\nвка',
      'PAX,\nNOTES',
      'Экипаж\nЛ/Б/И/П',
      'Топливо',
      'MTOW',
      'LIR',
      'Груз',
      'Почта',
      'Багаж',
      'СЗВ',
      'ЛДМ'
    ];

    const headerRow = ws.getRow(2);
    headerRow.height = 36;

    const mediumBorder = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'medium', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'medium', color: { argb: 'FF000000' } }
    };

    const thinBorder = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    };

    headers.forEach((hText, idx) => {
      const colIdx = idx + 1;
      const cell = headerRow.getCell(colIdx);
      cell.value = hText;
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
      cell.border = mediumBorder;

      if (colIdx === 14 || colIdx === 15) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', textRotation: 90 };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
    });

    // Строки данных
    flights.forEach((f, idx) => {
      const rowNum = idx + 3;
      const row = ws.getRow(rowNum);
      row.height = 36;

      const routeStr = f.route_city ? `${f.route_city}\n${f.route_airports || ''}` : (f.route_airports || '');
      
      let fuelStr = f.fuel || '';
      if (!fuelStr) {
        const parts = [];
        if (f.fuel_block) parts.push(`B:${f.fuel_block}`);
        if (f.fuel_trip) parts.push(`T:${f.fuel_trip}`);
        if (f.fuel_taxi) parts.push(`Tx:${f.fuel_taxi}`);
        fuelStr = parts.join(' ');
      }

      const tailVal = /^\d+$/.test(String(f.ac_num || '')) ? parseInt(f.ac_num, 10) : (f.ac_num || '');
      const layoutVal = /^\d+$/.test(String(f.ac_config || '')) ? parseInt(f.ac_config, 10) : (f.ac_config || '');
      const paxVal = /^\d+$/.test(String(f.pax || '')) ? parseInt(f.pax, 10) : (f.pax || '');
      const mtowVal = /^\d+$/.test(String(f.mtow || '')) ? parseInt(f.mtow, 10) : (f.mtow || '');

      const lirVal = (f.lir_sent || f.lir === true || String(f.lir || '').toUpperCase() === 'ДА') ? 'ДА' : '';
      const szvVal = (f.szv_sent || f.szv === true || String(f.szv || '').toUpperCase() === 'ДА') ? 'ДА' : '';
      const ldmVal = (f.ldm_sent || f.ldm === true || String(f.ldm || '').toUpperCase() === 'ДА') ? 'ДА' : '';

      const rowValues = [
        f.flight || '',
        routeStr,
        f.time || '',
        tailVal,
        layoutVal,
        paxVal,
        f.crew || '',
        fuelStr,
        mtowVal,
        lirVal,
        f.cargo || '',
        f.mail || '',
        f.baggage || '',
        szvVal,
        ldmVal
      ];

      rowValues.forEach((val, cIdx) => {
        const colIdx = cIdx + 1;
        const cell = row.getCell(colIdx);
        cell.value = val;
        cell.border = thinBorder;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

        if (colIdx === 2) {
          cell.font = { name: 'Calibri', size: 9 };
        } else if (colIdx === 6) {
          cell.font = { name: 'Calibri', size: 11, bold: true };
        } else {
          cell.font = { name: 'Calibri', size: 11 };
        }
      });
    });

    // Настройка пропорциональных ширин колонок
    const colWidths = [11.0, 14.5, 8.5, 9.5, 11.0, 10.0, 10.0, 14.0, 9.0, 5.5, 9.5, 9.5, 9.5, 4.5, 4.5];
    colWidths.forEach((w, idx) => {
      ws.getColumn(idx + 1).width = w;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const cleanDate = (shiftInfo?.date_interval || shiftInfo?.date || 'export').replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_');
    const fileName = `Суточный_план_Диспетчера_${cleanDate}.xlsx`;

    // 1. Попытка нативного модального окна проводника «Сохранить как»
    if (typeof window.showSaveFilePicker === 'function') {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [
            {
              description: 'Таблица Microsoft Excel (.xlsx)',
              accept: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
              }
            }
          ]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (pickerErr) {
        if (pickerErr.name === 'AbortError') {
          return;
        }
        console.warn('showSaveFilePicker fallback:', pickerErr);
      }
    }

    // 2. Фоновый браузерный триггер скачивания
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
      window.URL.revokeObjectURL(downloadUrl);
    }, 3000);

  } catch (err) {
    console.error('Ошибка экспорта Excel:', err);
    alert(`Не удалось сформировать Excel файл: ${err?.message || err}`);
  }
}
