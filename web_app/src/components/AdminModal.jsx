import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Shield, Key, Trash2, CheckCircle2, AlertCircle, RefreshCw, UserCheck, UserX } from 'lucide-react';
import { adminListUsers, adminCreateUser, adminUpdateUser, adminDeleteUser } from '../utils/api';

export default function AdminModal({ isOpen, onClose, currentUser }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Форма добавления нового пользователя
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('dispatcher');

  // Форма сброса пароля
  const [resetUserId, setResetUserId] = useState(null);
  const [resetNewPassword, setResetNewPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await adminListUsers();
      if (res && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Не удалось загрузить список пользователей');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword || !newFullName.trim()) {
      setErrorMsg('Заполните все обязательные поля');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await adminCreateUser({
        username: newUsername.trim(),
        password: newPassword,
        full_name: newFullName.trim(),
        role: newRole
      });
      setSuccessMsg(`Пользователь ${newUsername} успешно создан`);
      setNewUsername('');
      setNewPassword('');
      setNewFullName('');
      setShowAddForm(false);
      await loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка создания пользователя');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminUpdateUser(user.id, { is_active: !user.is_active });
      await loadUsers();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!resetNewPassword) {
      setErrorMsg('Введите новый пароль');
      return;
    }
    try {
      await adminUpdateUser(userId, { new_password: resetNewPassword });
      setSuccessMsg('Пароль успешно обновлен');
      setResetUserId(null);
      setResetNewPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (userId, username) => {
    if (window.confirm(`Вы уверены, что хотите удалить пользователя "${username}"?`)) {
      try {
        await adminDeleteUser(userId);
        setSuccessMsg(`Пользователь ${username} удален`);
        await loadUsers();
      } catch (err) {
        setErrorMsg(err.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-none">
                Управление учётными записями
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Панель администратора группы центровки
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Скрыть форму' : '+ Добавить диспетчера'}</span>
            </button>
            <button
              type="button"
              onClick={loadUsers}
              className="flex items-center gap-1 text-slate-600 dark:text-slate-400 text-xs font-semibold p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700"
              title="Обновить список"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </button>
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Новая учётная запись
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    ФИО диспетчера *
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Логин *
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="ivanov"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Роль
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="dispatcher">Диспетчер по центровке</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Создать пользователя
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-extrabold uppercase text-[10px]">
                  <th className="py-2.5 px-3">ФИО Диспетчера</th>
                  <th className="py-2.5 px-3">Логин</th>
                  <th className="py-2.5 px-3 text-center">Роль</th>
                  <th className="py-2.5 px-3 text-center">Статус</th>
                  <th className="py-2.5 px-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {u.full_name}
                      {u.id === currentUser?.id && (
                        <span className="ml-1.5 text-[9px] px-1.5 py-0.5 bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 rounded font-mono font-bold">
                          (Вы)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-600 dark:text-slate-400">
                      {u.username}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                          : 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
                      }`}>
                        {u.role === 'admin' ? 'Админ' : 'Диспетчер'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        disabled={u.id === currentUser?.id}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300'
                        }`}
                        title="Нажмите для переключения активности"
                      >
                        {u.is_active ? 'Активен' : 'Отключен'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setResetUserId(resetUserId === u.id ? null : u.id)}
                          className="p-1 text-slate-500 hover:text-amber-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Сменить пароль"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Prompt сброса пароля */}
                      {resetUserId === u.id && (
                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-lg text-left">
                          <label className="block text-[10px] font-bold text-amber-800 dark:text-amber-300 mb-1">
                            Новый пароль для {u.username}:
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="password"
                              value={resetNewPassword}
                              onChange={(e) => setResetNewPassword(e.target.value)}
                              placeholder="••••••••"
                              className="bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded px-2 py-0.5 text-xs text-slate-900 dark:text-slate-100 flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleResetPassword(u.id)}
                              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded"
                            >
                              Сохранить
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
