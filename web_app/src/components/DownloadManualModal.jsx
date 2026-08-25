import React, { useState } from 'react';
import { X, BookOpen, Download, FolderCheck, CheckCircle2, FileText } from 'lucide-react';

export default function DownloadManualModal({ isOpen, onClose }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  if (!isOpen) return null;

  const fileName = 'Руководство_пользователя_AeroPlan.docx';
  const fileUrl = 'Руководство_пользователя_AeroPlan.docx';

  // Сохранение с выбором папки через File System Access API
  const handleSaveWithPicker = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Файл руководства временно недоступен');
      const blob = await response.blob();

      if ('showSaveFilePicker' in window) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: 'Документ Microsoft Word (*.docx)',
                accept: {
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                }
              }
            ]
          });

          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();

          setSaveStatus('success');
          setTimeout(() => {
            onClose();
            setSaveStatus(null);
          }, 1500);
          return;
        } catch (pickerErr) {
          if (pickerErr.name === 'AbortError') {
            setIsSaving(false);
            return;
          }
          console.warn('showSaveFilePicker fallback:', pickerErr);
        }
      }

      // Фолбэк для браузеров без showSaveFilePicker
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 200);

      setSaveStatus('success');
      setTimeout(() => {
        onClose();
        setSaveStatus(null);
      }, 1500);

    } catch (err) {
      console.error('Download error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Прямое скачивание
  const handleQuickDownload = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 200);

      setSaveStatus('success');
      setTimeout(() => {
        onClose();
        setSaveStatus(null);
      }, 1200);
    } catch (err) {
      console.error('Quick download error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-slate-100 leading-tight">
                Руководство пользователя
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Инструкция для диспетчеров группы центровки
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl flex items-start gap-3">
            <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                Формат Microsoft Word (.docx) с подробными цветными иллюстрациями
              </p>
              <p>
                Пошаговые действия: загрузка из AviaBit, контроль выпуска (-40 мин), ввод топлива и центровки (DOW/DOI), чеклист LIR/LDM и сдача смены.
              </p>
            </div>
          </div>

          {saveStatus === 'success' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Файл инструкции успешно сохранен на вашем компьютере!</span>
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            
            <button
              onClick={handleSaveWithPicker}
              disabled={isSaving}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 active:from-sky-700 active:to-indigo-700 text-white rounded-xl shadow-md shadow-sky-600/20 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-white/20 rounded-lg group-hover:scale-105 transition-transform">
                  <FolderCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black">Выбрать папку и сохранить (.docx)</div>
                  <div className="text-[11px] text-sky-100 font-medium">
                    Указать точную папку на диске или рабочем столе
                  </div>
                </div>
              </div>
              <Download className="w-4 h-4 opacity-80 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={handleQuickDownload}
              disabled={isSaving}
              className="w-full flex items-center justify-between p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Быстро скачать в стандартную папку «Загрузки»</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">.docx</span>
            </button>

          </div>

        </div>

        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            Приложение остаётся открытым на текущем экране
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Закрыть
          </button>
        </div>

      </div>
    </div>
  );
}
