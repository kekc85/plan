import React, { useState } from 'react';
import { Plane, Lock, User, AlertCircle, LogIn, KeyRound } from 'lucide-react';
import { authLogin } from '../utils/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Пожалуйста, введите логин и пароль');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await authLogin(username.trim(), password);
      if (res && res.user) {
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка входа в систему');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md mb-3 shadow-inner">
            <Plane className="w-6 h-6 rotate-45 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">AEROPLAN W&B</h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">
            Электронный суточный план диспетчера по центровке
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Логин */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Логин диспетчера
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="например andrey или admin"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Пароль */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Пароль
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Кнопка Входа */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-extrabold text-sm py-2.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Проверка...' : 'Войти в систему'}</span>
          </button>

          {/* Подсказка для первой авторизации */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Учётные записи выдаются администратором группы центровки.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin', 'admin123')}
                className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400 hover:underline px-2 py-1 bg-sky-50 dark:bg-sky-950/40 rounded-md border border-sky-200 dark:border-sky-800"
              >
                Администратор (admin)
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('dispatcher', 'dispatch123')}
                className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 rounded-md border border-indigo-200 dark:border-indigo-800"
              >
                Диспетчер (dispatcher)
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
