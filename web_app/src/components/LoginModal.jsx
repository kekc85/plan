import React, { useState } from 'react';
import { Plane, Lock, User, AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { authLogin } from '../utils/api';

export default function LoginModal({ isOpen, isFullScreen = false, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
        if (onClose) onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Неверный логин или пароль');
    } finally {
      setIsLoading(false);
    }
  };

  const containerClasses = isFullScreen
    ? "w-full max-w-md"
    : "fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4";

  return (
    <div className={containerClasses}>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-7 text-white text-center relative shadow-md">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 border border-white/30 backdrop-blur-md mb-3 shadow-inner">
            <Plane className="w-7 h-7 rotate-45 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">AEROPLAN W&B</h2>
          <p className="text-xs text-sky-100 mt-1 font-medium">
            Электронный суточный план диспетчера по центровке
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Логин */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Логин
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите ваш логин"
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Пароль с кнопкой показать / скрыть */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Пароль
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Кнопка Входа */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:from-sky-700 active:to-blue-700 text-white font-extrabold text-sm py-3 rounded-xl shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98] disabled:opacity-50 mt-3"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Проверка...' : 'Войти в систему'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
