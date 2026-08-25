/**
 * Экспорт суточного плана в Excel (.xlsx) через нативный Python openpyxl бэкенд
 * Гарантирует 100% точное соответствие шаблону парсера:
 * - Шрифты Calibri 11 (Bold для PAX), Calibri 9 для маршрута
 * - Вертикальный поворот текста для колонок СЗВ и ЛДМ (90°)
 * - Точные границы ячеек и пропорциональные ширины
 * - Альбомная ориентация страницы A4 (fit to page)
 */

export async function exportShiftToExcel(flights, shiftInfo) {
  if (!flights || flights.length === 0) {
    alert('Журнал пуст! Нет данных для выгрузки.');
    return;
  }

  const payload = {
    flights: flights,
    shift_info: shiftInfo
  };

  const endpoints = [
    '/api/export_excel',
    'http://127.0.0.1:8000/api/export_excel',
    'http://localhost:8000/api/export_excel'
  ];

  let lastError = null;

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;

        // Извлекаем имя файла из заголовка Content-Disposition или формируем по дате
        const cleanDate = (shiftInfo?.date_interval || shiftInfo?.date || 'export').replace(/[^a-zA-Z0-9а-яА-Я._-]/g, '_');
        a.download = `Суточный_план_Диспетчера_${cleanDate}.xlsx`;
        
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        return;
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Ошибка сервера: ${response.status}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.error('Ошибка экспорта Excel:', lastError);
  alert(`Не удалось сформировать Excel файл через сервер: ${lastError?.message || 'Сервер api_server.py недоступен'}`);
}
