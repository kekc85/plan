import * as XLSX from 'xlsx';
import { calcReleaseTime } from './validators';

/**
 * Читает Excel-файл суточного плана и преобразует его в массив рейсов
 */
export function parseExcelToFlights(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Преобразуем лист в двумерный массив строк
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (rows.length < 2) {
          throw new Error('Файл не содержит данных расписания');
        }

        // Поиск строки заголовков
        let headerRowIndex = -1;
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          const rowText = rows[i].join(' ').toLowerCase();
          if (rowText.includes('рейс') || rowText.includes('маршрут') || rowText.includes('время')) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          headerRowIndex = 1; // По умолчанию строка 2
        }

        const dataRows = rows.slice(headerRowIndex + 1);
        const flights = [];

        dataRows.forEach((r, idx) => {
          if (!r || r.length === 0 || !r[0]) return; // Пропуск пустых строк

          const flightNum = String(r[0] || '').trim();
          if (!flightNum) return;

          // Маршрут (может быть "Москва\nKQT-SVO" или "KQT-SVO")
          const routeRaw = String(r[1] || '').trim();
          let routeCity = '';
          let routeAirports = '';
          if (routeRaw.includes('\n')) {
            const parts = routeRaw.split('\n');
            routeCity = parts[0].trim();
            routeAirports = parts[1].trim();
          } else if (routeRaw.includes('-')) {
            routeAirports = routeRaw;
          } else {
            routeCity = routeRaw;
          }

          // Время
          let releaseTime = '';
          let depTime = '';

          // Если в файле 19 колонок (с временем выпуска)
          if (r.length >= 18) {
            releaseTime = String(r[2] || '').trim();
            depTime = String(r[3] || '').trim();
          } else {
            depTime = String(r[2] || '').trim();
            if (depTime && depTime.includes(':')) {
              releaseTime = calcReleaseTime(depTime, 40);
            }
          }

          // Номер ВС, Компановка, PAX, Экипаж
          const acNum = String(r[4] || r[3] || '').replace(/\D/g, '').slice(0, 5);
          const acConfig = String(r[5] || r[4] || '').trim();
          const pax = String(r[6] || r[5] || '').trim();
          const crew = String(r[7] || r[6] || '').trim();

          // Топливо Block/Trip/Taxi
          const fuelRaw = String(r[8] || r[7] || '').trim();
          let fuelBlock = '';
          let fuelTrip = '';
          let fuelTaxi = '';
          if (fuelRaw) {
            const bMatch = fuelRaw.match(/block:\s*([\d\w]+)/i);
            const trMatch = fuelRaw.match(/trip:\s*([\d\w]+)/i);
            const txMatch = fuelRaw.match(/taxi:\s*([\d\w]+)/i);
            if (bMatch) fuelBlock = bMatch[1];
            if (trMatch) fuelTrip = trMatch[1];
            if (txMatch) fuelTaxi = txMatch[1];
            if (!fuelBlock && !fuelTrip && !fuelTaxi) {
              fuelBlock = fuelRaw;
            }
          }

          // DOW / DOI / Кухня
          const dowDoiRaw = String(r[9] || r[8] || '').trim();
          let dow = '';
          let doi = '';
          let galley = '';
          if (dowDoiRaw) {
            const dowMatch = dowDoiRaw.match(/dow:\s*([\d\w]+)/i);
            const doiMatch = dowDoiRaw.match(/doi:\s*([\d\.\w]+)/i);
            const gMatch = dowDoiRaw.match(/кухня:\s*([A-ZА-Я]+)/i);
            if (dowMatch) dow = dowMatch[1];
            if (doiMatch) doi = doiMatch[1];
            if (gMatch) galley = gMatch[1];
          }

          // MTOW и LIR
          const mtow = String(r[10] || '').trim();
          const lirRaw = String(r[11] || '').toLowerCase();
          const lirSent = lirRaw.includes('да') || lirRaw.includes('true') || lirRaw.includes('отправлен');

          // Груз, Почта, Багаж
          const cargo = String(r[12] || '').trim();
          const mail = String(r[13] || '').trim();
          const baggage = String(r[14] || '').trim();

          // СЗВ, LDM
          const szvRaw = String(r[15] || '').toLowerCase();
          const ldmRaw = String(r[16] || '').toLowerCase();
          const szvSent = szvRaw.includes('да') || szvRaw.includes('true');
          const ldmSent = ldmRaw.includes('да') || ldmRaw.includes('true');

          // Статус
          const statusRaw = String(r[17] || '').toLowerCase();
          let status = 'pending';
          if (ldmSent || statusRaw.includes('закрыт')) {
            status = 'closed';
          } else if (szvSent || statusRaw.includes('выпущен')) {
            status = 'released';
          } else if (lirSent || statusRaw.includes('lir')) {
            status = 'lir_sent';
          } else if (statusRaw.includes('подготов') || statusRaw.includes('работ')) {
            status = 'prepared';
          }

          const notes = String(r[18] || '').trim();

          flights.push({
            id: `fl_imp_${Date.now()}_${idx}`,
            flight: flightNum,
            route_city: routeCity,
            route_airports: routeAirports,
            time: depTime,
            release_time: releaseTime,
            ac_num: acNum,
            ac_config: acConfig,
            pax: pax,
            crew: crew,
            fuel_block: fuelBlock,
            fuel_trip: fuelTrip,
            fuel_taxi: fuelTaxi,
            dow: dow,
            doi: doi,
            galley: galley,
            mtow: mtow,
            lir_sent: lirSent,
            cargo: cargo,
            mail: mail,
            baggage: baggage,
            szv_sent: szvSent,
            ldm_sent: ldmSent,
            status: status,
            notes: notes
          });
        });

        resolve(flights);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
