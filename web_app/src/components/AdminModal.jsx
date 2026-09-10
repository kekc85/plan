import React, { useState, useEffect } from 'react';
import { 
  X, Users, UserPlus, Shield, Trash2, CheckCircle2, AlertCircle, 
  RefreshCw, Edit3, Eye, EyeOff, Save, Activity, Terminal, 
  Search, Download, Clock, Filter, ChevronRight, Copy, Check,
  AlertTriangle, Info, Server, Laptop, Database, Lock
} from 'lucide-react';
import { 
  adminListUsers, 
  adminCreateUser, 
  adminUpdateUser, 
  adminDeleteUser,
  adminGetLogs,
  adminGetLogSettings,
  adminUpdateLogSettings,
  adminClearLogs
} from '../utils/api';

export default function AdminModal({ isOpen, onClose, currentUser }) {
  // Навигация по вкладкам: 'users' | 'logs'
  const [activeTab, setActiveTab] = useState('users');

  // Состояние: Пользователи
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

  // Состояние: Журнал событий и логов
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logStats, setLogStats] = useState({ total: 0, error: 0, warn: 0, info: 0 });
  const [retentionDays, setRetentionDays] = useState(7);
  const [logFilterLevel, setLogFilterLevel] = useState('ALL');
  const [logFilterModule, setLogFilterModule] = useState('all');
  const [logSearch, setLogSearch] = useState('');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isChangingRetention, setIsChangingRetention] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'users') {
        loadUsers();
      } else if (activeTab === 'logs') {
        loadLogs();
        loadRetentionSettings();
      }
    }
  }, [isOpen, activeTab]);

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

  const loadLogs = async (overrideParams = {}) => {
    setLogsLoading(true);
    try {
      const params = {
        level: overrideParams.level !== undefined ? overrideParams.level : (logFilterLevel !== 'ALL' ? logFilterLevel : undefined),
        module: overrideParams.module !== undefined ? overrideParams.module : (logFilterModule !== 'all' ? logFilterModule : undefined),
        search: overrideParams.search !== undefined ? overrideParams.search : (logSearch.trim() || undefined),
        limit: 300
      };
      const res = await adminGetLogs(params);
      if (res && res.logs) {
        setLogs(res.logs);
        if (res.stats) setLogStats(res.stats);
        if (res.retention_days) setRetentionDays(res.retention_days);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Не удалось загрузить журнал логов');
    } finally {
      setLogsLoading(false);
    }
  };

  const loadRetentionSettings = async () => {
    try {
      const res = await adminGetLogSettings();
      if (res && res.retention_days) {
        setRetentionDays(res.retention_days);
      }
    } catch (err) {}
  };

  const handleRetentionChange = async (days) => {
    setIsChangingRetention(true);
    try {
      const res = await adminUpdateLogSettings(days);
      setRetentionDays(days);
      setSuccessMsg(`Срок хранения логов изменен на ${days} дней. ${res.message || ''}`);
      await loadLogs();
    } catch (err) {
      setErrorMsg(err.message || 'Ошибка обновления срока хранения');
    } finally {
      setIsChangingRetention(false);
    }
  };

  const handleClearLogs = async (clearAll = false) => {
    const confirmText = clearAll 
      ? 'Вы уверены, что хотите ПОЛНОСТЬЮ очистить все записи журнала логов?' 
      : `Очистить все логи старше ${retentionDays} дней?`;
    
    if (window.confirm(confirmText)) {
      setLogsLoading(true);
      try {
        const res = await adminClearLogs({ clearAll, days: retentionDays });
        setSuccessMsg(res.message || 'Логи успешно очищены');
        await loadLogs();
      } catch (err) {
        setErrorMsg(err.message || 'Ошибка при очистке логов');
      } finally {
        setLogsLoading(false);
      }
    }
  };

  const handleExportLogs = () => {
    if (!logs || logs.length === 0) return;
    const lines = logs.map(l => {
      const details = l.details ? `\nDetails: ${l.details}` : '';
      return `[${l.created_at}] [${l.level}] [${(l.module || '').toUpperCase()}] [User: ${l.username || 'system'}] [IP: ${l.ip_address || '-'}]\nMessage: ${l.message}${details}\n------------------------------------------------------------`;
    });
    const content = `AEROPLAN W&B - СИСТЕМНЫЙ ЖУРНАЛ И АУДИТ ОШИБОК\nВыгрузка от: ${new Date().toLocaleString('ru-RU')}\nВсего записей: ${logs.length}\n============================================================\n\n` + lines.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeroplan_logs_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyDetailToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
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

  const getLevelBadge = (level) => {
    const lvl = (level || '').toUpperCase();
    if (lvl.includes('ERROR') || lvl.includes('CRIT')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-3 h-3" />
          ERROR
        </span>
      );
    }
    if (lvl.includes('WARN')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
          <AlertTriangle className="w-3 h-3" />
          WARN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300">
        <Info className="w-3 h-3" />
        INFO
      </span>
    );
  };

  const getModuleBadge = (module) => {
    const mod = (module || 'system').toLowerCase();
    let label = mod.toUpperCase();
    let icon = <Server className="w-3 h-3" />;
    let colorClass = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";

    if (mod === 'aviabit') {
      label = 'AviaBit';
      colorClass = 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800';
    } else if (mod === 'auth') {
      label = 'Авторизация';
      icon = <Lock className="w-3 h-3" />;
      colorClass = 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    } else if (mod === 'shift') {
      label = 'Смена';
      colorClass = 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    } else if (mod === 'client') {
      label = 'Клиент (JS)';
      icon = <Laptop className="w-3 h-3" />;
      colorClass = 'bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    } else if (mod === 'db') {
      label = 'БД MySQL';
      icon = <Database className="w-3 h-3" />;
      colorClass = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }

    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${colorClass}`}>
        {icon}
        {label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-none flex items-center gap-2">
                Панель администратора
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  AeroPlan W&B
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Управление пользователями и аудит системных событий
              </p>
            </div>
          </div>

          {/* Вкладки переключения */}
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700 gap-1">
            <button
              onClick={() => {
                setActiveTab('users');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Пользователи</span>
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('logs');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'logs'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Журнал событий и ошибок</span>
              {logStats.error > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                  {logStats.error}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Уведомления */}
        <div className="px-5 pt-3">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* ========================================================== */}
          {/* ВКЛАДКА 1: ПОЛЬЗОВАТЕЛИ */}
          {/* ========================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-4">

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
                    placeholder="Например: Иванов Иван Иванович"
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
                    placeholder="Например: ivanov"
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
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 whitespace-nowrap">
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
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 whitespace-nowrap">
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
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 whitespace-nowrap">
                                  Новый пароль
                                </label>
                                <div className="relative flex items-center">
                                  <input
                                    type={showEditPassword ? 'text' : 'password'}
                                    value={editNewPassword}
                                    onChange={(e) => setEditNewPassword(e.target.value)}
                                    placeholder="Не менять (пусто)"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl pl-2.5 pr-8 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    tabIndex={-1}
                                  >
                                    {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                              </div>

                              {/* Роль */}
                              <div>
                                <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 whitespace-nowrap">
                                  Роль
                                </label>
                                <select
                                  value={editRole}
                                  onChange={(e) => setEditRole(e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
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
      )}

      {/* ========================================================== */}
      {/* ВКЛАДКА 2: ЖУРНАЛ СОБЫТИЙ И ОШИБОК */}
      {/* ========================================================== */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          
          {/* Сводные KPI карточки */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Всего записей</p>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">{logStats.total}</p>
              </div>
              <Terminal className="w-5 h-5 text-slate-400" />
            </div>

            <div className={`p-3 border rounded-xl flex items-center justify-between transition-colors ${
              logStats.error > 0 
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200' 
                : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <div>
                <p className="text-[11px] font-medium opacity-80">Ошибок (ERROR)</p>
                <p className="text-lg font-black mt-0.5">{logStats.error}</p>
              </div>
              <AlertCircle className={`w-5 h-5 ${logStats.error > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
            </div>

            <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">Предупреждений</p>
                <p className="text-lg font-black text-amber-900 dark:text-amber-100 mt-0.5">{logStats.warn}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>

            <div className="p-3 bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-900/40 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-sky-700 dark:text-sky-300">Информационных</p>
                <p className="text-lg font-black text-sky-900 dark:text-sky-100 mt-0.5">{logStats.info}</p>
              </div>
              <Info className="w-5 h-5 text-sky-500" />
            </div>
          </div>

          {/* Панель фильтров и управления */}
          <div className="p-3 bg-slate-50 dark:bg-slate-850/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              
              {/* Фильтры: Уровень, Модуль, Поиск */}
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                {/* Уровень */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={logFilterLevel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLogFilterLevel(val);
                      loadLogs({ level: val !== 'ALL' ? val : undefined });
                    }}
                    className="bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="ALL">Все уровни</option>
                    <option value="ERROR">🔴 Ошибки (ERROR)</option>
                    <option value="WARN">🟡 Предупреждения (WARN)</option>
                    <option value="INFO">🔵 Информация (INFO)</option>
                  </select>
                </div>

                {/* Модуль */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                  <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={logFilterModule}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLogFilterModule(val);
                      loadLogs({ module: val !== 'all' ? val : undefined });
                    }}
                    className="bg-transparent text-slate-800 dark:text-slate-200 font-bold focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="all">Все модули</option>
                    <option value="aviabit">AviaBit (Парсер)</option>
                    <option value="auth">Авторизация (Auth)</option>
                    <option value="shift">Смена (Shift)</option>
                    <option value="client">Клиент (JS UI)</option>
                    <option value="system">Система (System)</option>
                    <option value="db">База данных (DB)</option>
                  </select>
                </div>

                {/* Поиск */}
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadLogs()}
                    placeholder="Поиск по тексту или логину..."
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              {/* Настройки срока хранения логов (3 / 7 / 14 / 30 дней) */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-xs">
                <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium whitespace-nowrap">
                  Хранить логи:
                </span>
                <select
                  value={retentionDays}
                  disabled={isChangingRetention}
                  onChange={(e) => handleRetentionChange(Number(e.target.value))}
                  className="bg-transparent text-slate-900 dark:text-slate-100 font-extrabold focus:outline-none cursor-pointer text-xs"
                >
                  <option value={3}>3 дня</option>
                  <option value={7}>7 дней (стандарт)</option>
                  <option value={14}>14 дней</option>
                  <option value={30}>30 дней</option>
                </select>
              </div>

              {/* Кнопки действий */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadLogs()}
                  disabled={logsLoading}
                  className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                  title="Обновить журнал логов"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleExportLogs}
                  disabled={logs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
                  title="Скачать логи в файл .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Экспорт</span>
                </button>

                <button
                  onClick={() => handleClearLogs(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-semibold transition-colors"
                  title="Очистить устаревшие записи"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Очистить старые</span>
                </button>
              </div>

            </div>
          </div>

          {/* Таблица логов */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
            <div className="max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-3 py-2.5 w-[140px]">Время (МСК)</th>
                    <th className="px-3 py-2.5 w-[90px]">Уровень</th>
                    <th className="px-3 py-2.5 w-[110px]">Модуль</th>
                    <th className="px-3 py-2.5 w-[120px]">Пользователь / IP</th>
                    <th className="px-3 py-2.5">Сообщение события / Ошибка</th>
                    <th className="px-3 py-2.5 w-[80px] text-right">Детали</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                        {logsLoading ? (
                          <div className="flex flex-col items-center justify-center gap-2">
                            <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
                            <span>Загрузка журнала событий...</span>
                          </div>
                        ) : (
                          'Записи событий или ошибок за выбранный период не найдены'
                        )}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const hasDetails = Boolean(log.details);
                      const isError = (log.level || '').toUpperCase().includes('ERROR') || (log.level || '').toUpperCase().includes('CRIT');

                      return (
                        <tr 
                          key={log.id} 
                          className={`transition-colors ${
                            isError 
                              ? 'bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/60 dark:hover:bg-rose-950/20' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-850/50'
                          }`}
                        >
                          {/* Время */}
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : '-'}
                          </td>

                          {/* Уровень */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {getLevelBadge(log.level)}
                          </td>

                          {/* Модуль */}
                          <td className="px-3 py-2 whitespace-nowrap">
                            {getModuleBadge(log.module)}
                          </td>

                          {/* Пользователь и IP */}
                          <td className="px-3 py-2">
                            <div className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[110px]" title={log.username || 'система'}>
                              {log.username || 'система'}
                            </div>
                            {log.ip_address && (
                              <div className="text-[10px] font-mono text-slate-400 truncate" title={log.ip_address}>
                                {log.ip_address}
                              </div>
                            )}
                          </td>

                          {/* Сообщение */}
                          <td className="px-3 py-2">
                            <div className={`font-semibold text-xs ${isError ? 'text-rose-900 dark:text-rose-200' : 'text-slate-800 dark:text-slate-200'}`}>
                              {log.message}
                            </div>
                          </td>

                          {/* Кнопка подробностей */}
                          <td className="px-3 py-2 text-right whitespace-nowrap">
                            {hasDetails ? (
                              <button
                                onClick={() => setSelectedLogDetail(log)}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-950 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 rounded-lg text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                                title="Просмотреть стектрейс или подробности"
                              >
                                <span>Стек</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>

    {/* Modal: Просмотр стектрейса / подробностей ошибки */}
    {selectedLogDetail && (
      <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[88vh] flex flex-col animate-in fade-in zoom-in-95">
          
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center gap-2">
              {getLevelBadge(selectedLogDetail.level)}
              <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                Подробности события #{selectedLogDetail.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyDetailToClipboard(selectedLogDetail.details || selectedLogDetail.message)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                {copiedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSuccess ? 'Скопировано!' : 'Копировать'}</span>
              </button>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto space-y-3 font-mono text-xs flex-1">
            <div>
              <span className="text-slate-400 text-[11px] block font-sans font-bold mb-0.5">Сообщение:</span>
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-bold text-slate-900 dark:text-slate-100 font-sans">
                {selectedLogDetail.message}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px] block font-sans font-bold mb-0.5">Стектрейс / Технические данные (Details):</span>
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap font-mono border border-slate-800">
                {selectedLogDetail.details || 'Нет дополнительных данных'}
              </pre>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-sans">
              <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Модуль</span>
                <span className="font-bold">{selectedLogDetail.module}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Пользователь</span>
                <span className="font-bold">{selectedLogDetail.username || 'система'}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                <span className="text-slate-400 block text-[10px]">IP адрес</span>
                <span className="font-bold">{selectedLogDetail.ip_address || '-'}</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                <span className="text-slate-400 block text-[10px]">Время (МСК)</span>
                <span className="font-bold">{selectedLogDetail.created_at}</span>
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
            <button
              onClick={() => setSelectedLogDetail(null)}
              className="px-4 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold"
            >
              Закрыть
            </button>
          </div>

        </div>
      </div>
    )}

  </div>
</div>
);
}
