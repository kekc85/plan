import React, { useState, useEffect } from 'react';
import { X, Users, UserPlus, Shield, Key, Trash2, CheckCircle2, AlertCircle, RefreshCw, UserCheck, UserX, Edit3, Eye, EyeOff, Save } from 'lucide-react';
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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('dispatcher');

  // Состояние полного редактирования пользователя
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editRole, setEditRole] = useState('dispatcher');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);

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
        username: newUsername.trim().toLowerCase(),
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

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setEditFullName(user.full_name || '');
    setEditUsername(user.username || '');
    setEditRole(user.role || 'dispatcher');
    setEditNewPassword('');
    setEditIsActive(Boolean(user.is_active));
    setShowEditPassword(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditFullName('');
    setEditUsername('');
    setEditNewPassword('');
    setErrorMsg('');
  };

  const handleSaveEditUser = async (userId) => {
    if (!editFullName.trim() || !editUsername.trim()) {
      setErrorMsg('ФИО и логин не могут быть пустыми');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        full_name: editFullName.trim(),
        username: editUsername.trim().toLowerCase(),
        role: editRole,
        is_active: editIsActive
      };
      if (editNewPassword.trim()) {
        payload.new_password = editNewPassword.trim();
      }

      await adminUpdateUser(userId, payload);
      setSuccessMsg(`Данные пользователя ${editUsername} успешно сохранены`);
      setEditingUserId(null);
      await loadUsers();
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка сохранения пользователя');
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
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
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingUserId(null);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Скрыть форму' : '+ Добавить пользователя'}</span>
            </button>

            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </button>
          </div>

          {/* Form: Add User */}
          {showAddForm && (
            <form onSubmit={handleCreate} className="p-4 bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 rounded-2xl space-y-3 animate-in fade-in">
              <h4 className="text-xs font-extrabold text-sky-900 dark:text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                <UserPlus className="w-4 h-4" />
                Новая учётная запись
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ФИО диспетчера *
                  </label>
                  <input
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Например: Наталья Самарина"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Логин *
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Например: samarina"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Пароль *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-3 pr-9 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showNewPassword ? "Скрыть пароль" : "Показать пароль"}
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Роль
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="dispatcher">Диспетчер по центровке</option>
                    <option value="admin">Администратор системы</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Создание...' : 'Создать учётную запись'}
                </button>
              </div>
            </form>
          )}

          {/* Users Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">ФИО Диспетчера</th>
                  <th className="px-4 py-3">Логин</th>
                  <th className="px-4 py-3">Роль</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {users.map((u) => {
                  const isCurrent = currentUser && currentUser.id === u.id;
                  const isEditing = editingUserId === u.id;

                  if (isEditing) {
                    return (
                      <tr key={u.id} className="bg-amber-50/60 dark:bg-amber-950/20">
                        <td colSpan={5} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                                <Edit3 className="w-3.5 h-3.5" />
                                Редактирование пользователя #{u.id}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                              {/* ФИО */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  ФИО диспетчера
                                </label>
                                <input
                                  type="text"
                                  value={editFullName}
                                  onChange={(e) => setEditFullName(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                              </div>

                              {/* Логин */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  Логин
                                </label>
                                <input
                                  type="text"
                                  value={editUsername}
                                  onChange={(e) => setEditUsername(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                />
                              </div>

                              {/* Новый пароль */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  Новый пароль (оставьте пустым если не менять)
                                </label>
                                <div className="relative flex items-center">
                                  <input
                                    type={showEditPassword ? "text" : "password"}
                                    value={editNewPassword}
                                    onChange={(e) => setEditNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-2.5 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    title={showEditPassword ? "Скрыть" : "Показать"}
                                  >
                                    {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {/* Роль */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                  Роль
                                </label>
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                >
                                  <option value="dispatcher">Диспетчер</option>
                                  <option value="admin">Администратор</option>
                                </select>
                              </div>
                            </div>

                            {/* Кнопки сохранения */}
                            <div className="flex items-center justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={cancelEditUser}
                                className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-300 dark:hover:bg-slate-700"
                              >
                                Отмена
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEditUser(u.id)}
                                disabled={isLoading}
                                className="flex items-center gap-1.5 px-4 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Сохранить</span>
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                      
                      {/* ФИО */}
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {u.full_name}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded font-bold">
                            Вы
                          </span>
                        )}
                      </td>

                      {/* Логин */}
                      <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">
                        {u.username}
                      </td>

                      {/* Роль */}
                      <td className="px-4 py-3">
                        {u.role === 'admin' ? (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-[10px] font-extrabold">
                            Админ
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 rounded-full text-[10px] font-bold">
                            Диспетчер
                          </span>
                        )}
                      </td>

                      {/* Статус */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => !isCurrent && handleToggleStatus(u)}
                          disabled={isCurrent}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold transition-all ${
                            u.is_active
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                          } ${!isCurrent ? 'cursor-pointer hover:scale-105' : 'cursor-default opacity-80'}`}
                          title={isCurrent ? 'Нельзя отключить свой аккаунт' : 'Нажмите для переключения'}
                        >
                          {u.is_active ? 'Активен' : 'Отключен'}
                        </button>
                      </td>

                      {/* Действия */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Редактировать / Сменить пароль / Переименовать */}
                          <button
                            onClick={() => startEditUser(u)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors"
                            title="Редактировать ФИО, логин и пароль"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Удалить */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleDelete(u.id, u.username)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              title="Удалить пользователя"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
