/**
 * AeroBag Predictor - Lydia DCS Synchronization Module
 * Управление модальным окном предпросмотра и пакетным импортом рейсов
 */

(function() {
    'use strict';

    // Конфигурация доступных станций DCS по умолчанию
    const DEFAULT_DCS_STATIONS = [
        { code: 'DYU', name: 'Душанбе (DYU)', checked: true },
        { code: 'NMA', name: 'Наманган (NMA)', checked: true },
        { code: 'TJU', name: 'Куляб (TJU)', checked: true },
        { code: 'SKD', name: 'Самарканд (SKD)', checked: true },
        { code: 'TAS', name: 'Ташкент (TAS)', checked: true },
        { code: 'CXR', name: 'Камрань (CXR)', checked: true },
        { code: 'IST', name: 'Стамбул (IST)', checked: true }
    ];

    let dcsStations = loadCachedDcsStations();
    let dcsCredentials = loadCachedDcsCredentials();
    let scannedFlights = [];
    let isScanning = false;

    function loadCachedDcsCredentials() {
        try {
            const saved = localStorage.getItem('averago_dcs_credentials');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object' && parsed.username) {
                    return parsed;
                }
            }
        } catch (e) {}
        return { username: 'WBZUBKOV', password: 'WBZUBKOV', airline: 'N4' };
    }

    async function fetchServerDcsCredentials() {
        try {
            const endpoint = (window.location.port === '8080' || window.location.protocol === 'file:')
                ? 'http://localhost:8080/api/dcs_sync?action=get_dcs_credentials'
                : 'lydia_dcs_sync.php?action=get_dcs_credentials';

            const resp = await fetch(endpoint, { method: 'GET', credentials: 'same-origin' });
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.success) {
                    const creds = data.credentials || data;
                    if (creds && creds.username) {
                        dcsCredentials.username = creds.username;
                        if (creds.password) dcsCredentials.password = creds.password;
                        if (creds.airline) dcsCredentials.airline = creds.airline;
                        try {
                            localStorage.setItem('averago_dcs_credentials', JSON.stringify(dcsCredentials));
                        } catch (e) {}
                        updateDcsAccountUI();
                    }
                }
            }
        } catch (e) {
            console.warn('Не удалось загрузить учетные данные DCS с сервера:', e);
        }
    }

    function loadCachedDcsStations() {
        try {
            const saved = localStorage.getItem('averago_dcs_stations');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Ошибка чтения averago_dcs_stations из LocalStorage:', e);
        }
        return JSON.parse(JSON.stringify(DEFAULT_DCS_STATIONS));
    }

    async function fetchServerDcsStations() {
        try {
            const endpoint = (window.location.port === '8080' || window.location.protocol === 'file:')
                ? 'http://localhost:8080/api/dcs_sync?action=get_dcs_stations'
                : 'lydia_dcs_sync.php?action=get_dcs_stations';

            const resp = await fetch(endpoint, {
                method: 'GET',
                credentials: 'same-origin'
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.success && Array.isArray(data.stations) && data.stations.length > 0) {
                    const currentCheckMap = new Map();
                    dcsStations.forEach(s => currentCheckMap.set(s.code, s.checked !== false));

                    dcsStations = data.stations.map(s => {
                        const isChecked = currentCheckMap.has(s.code) ? currentCheckMap.get(s.code) : (s.checked !== false);
                        return Object.assign({}, s, { checked: isChecked });
                    });

                    try {
                        localStorage.setItem('averago_dcs_stations', JSON.stringify(dcsStations));
                    } catch (e) {}
                    renderDcsStationChips();
                }
            }
        } catch (e) {
            console.warn('Не удалось загрузить станции DCS с сервера:', e);
        }
    }

    async function saveDcsStations(list) {
        if (!Array.isArray(list)) return;
        try {
            localStorage.setItem('averago_dcs_stations', JSON.stringify(list));
        } catch (e) {
            console.warn('Ошибка сохранения в LocalStorage:', e);
        }

        try {
            const endpoint = (window.location.port === '8080' || window.location.protocol === 'file:')
                ? 'http://localhost:8080/api/dcs_sync?action=save_dcs_stations'
                : 'lydia_dcs_sync.php?action=save_dcs_stations';

            await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stations: list })
            });

            if (window.location.port !== '8080' && window.location.protocol !== 'file:') {
                fetch('api.php?action=save_settings', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        setting_key: 'dcs_stations',
                        setting_value: list
                    })
                }).catch(() => {});
            }
        } catch (e) {
            console.warn('Ошибка отправки станций DCS на сервер:', e);
        }
    }

    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDcsSyncUI);
    } else {
        initDcsSyncUI();
    }

    function initDcsSyncUI() {
        injectDcsModal();
        renderDcsStationChips();
        fetchServerDcsStations();
        fetchServerDcsCredentials();
        updateDcsAccountUI();
    }

    // Создание HTML-разметки модального окна
    function injectDcsModal() {
        if (document.getElementById('dcsSyncModal')) return;

        const modalHtml = `
        <div id="dcsSyncModal" class="dcs-modal-overlay" style="display:none;">
            <div class="dcs-modal-container">
                <!-- Шапка модального окна -->
                <div class="dcs-modal-header">
                    <div class="dcs-header-title">
                        <span class="dcs-logo-icon">📡</span>
                        <div>
                            <h3>Синхронизация с Lydia DCS</h3>
                            <p>Автоматический сбор данных о пассажирах, багаже и ручной клади</p>
                        </div>
                    </div>
                    <button class="dcs-modal-close" onclick="window.closeDcsModal()">&times;</button>
                </div>

                <!-- Тело модального окна -->
                <div class="dcs-modal-body">
                    <!-- Панель параметров сканирования -->
                    <div class="dcs-filter-card">
                        <!-- Полоса учетной записи Lydia DCS -->
                        <div class="dcs-auth-strip">
                            <div class="dcs-auth-info">
                                <span class="dcs-auth-key-icon">🔐</span>
                                <span class="dcs-auth-label">Учетная запись DCS:</span>
                                <strong id="dcsAccountDisplay" class="dcs-account-display">WBZUBKOV</strong>
                                <span id="dcsAuthStatusBadge" class="dcs-auth-status-badge ready">🟢 Настроена</span>
                            </div>
                            <div class="dcs-auth-tools">
                                <button type="button" id="btnToggleDcsAccount" class="dcs-btn-auth-toggle" onclick="window.toggleDcsAccountForm()">
                                    <span id="dcsAccountToggleIcon">⚙️</span> <span id="dcsAccountToggleLabel">Изменить логин / пароль</span>
                                </button>
                            </div>
                        </div>

                        <!-- Выдвижная форма смены логина и пароля -->
                        <div id="dcsAccountFormRow" class="dcs-account-form-row" style="display:none;">
                            <div class="dcs-account-form-grid">
                                <div class="dcs-add-field-group">
                                    <label for="dcsInputUsername">Логин DCS:</label>
                                    <input type="text" id="dcsInputUsername" class="dcs-input" placeholder="WBZUBKOV" autocomplete="off">
                                </div>
                                <div class="dcs-add-field-group">
                                    <label for="dcsInputPassword">Пароль DCS:</label>
                                    <div class="dcs-pwd-field-wrap">
                                        <input type="password" id="dcsInputPassword" class="dcs-input" placeholder="••••••••" autocomplete="off">
                                        <button type="button" id="btnToggleDcsPwd" class="dcs-btn-pwd-eye" onclick="window.toggleDcsPwdVisibility()" title="Показать/скрыть пароль">👁️</button>
                                    </div>
                                </div>
                                <div class="dcs-add-field-group dcs-airline-col">
                                    <label for="dcsInputAirline">АК:</label>
                                    <input type="text" id="dcsInputAirline" class="dcs-input dcs-input-code" placeholder="N4" maxlength="3" value="N4">
                                </div>
                                <div class="dcs-account-actions">
                                    <button type="button" id="btnDcsTestConn" class="dcs-btn-test-auth" onclick="window.testDcsCredentials()">
                                        ⚡ Проверить связь
                                    </button>
                                    <button type="button" id="btnDcsSaveCreds" class="dcs-btn-save-auth" onclick="window.saveDcsCredentials()">
                                        💾 Сохранить
                                    </button>
                                    <button type="button" class="dcs-btn-cancel-add" onclick="window.toggleDcsAccountForm(false)">
                                        Закрыть
                                    </button>
                                </div>
                            </div>
                            <div id="dcsAccountFeedback" class="dcs-account-feedback" style="display:none;"></div>
                        </div>

                        <div class="dcs-filter-row">
                            <div class="dcs-filter-group">
                                <label>Дата начала</label>
                                <input type="date" id="dcsStartDate" class="dcs-input">
                            </div>
                            <div class="dcs-filter-group">
                                <label>Дата окончания</label>
                                <input type="date" id="dcsEndDate" class="dcs-input">
                            </div>
                            <div class="dcs-filter-group dcs-quick-dates">
                                <label>Быстрый выбор</label>
                                <div class="dcs-pill-group">
                                    <button type="button" class="dcs-pill" onclick="window.setDcsQuickDate('today', event)">Сегодня</button>
                                    <button type="button" class="dcs-pill active" onclick="window.setDcsQuickDate('yesterday', event)">Вчера и Сегодня</button>
                                    <button type="button" class="dcs-pill" onclick="window.setDcsQuickDate('3days', event)">3 дня</button>
                                </div>
                            </div>
                        </div>

                        <!-- Станции вылета -->
                        <div class="dcs-stations-section">
                            <div class="dcs-stations-header">
                                <label>Города вылета (Станции):</label>
                                <div class="dcs-stations-actions">
                                    <button type="button" id="btnToggleAddStation" class="dcs-btn-add-station" onclick="window.toggleDcsAddStationForm()">
                                        <span class="dcs-btn-add-icon">➕</span> Добавить станцию
                                    </button>
                                    <span class="dcs-stations-divider">|</span>
                                    <div class="dcs-stations-toggle">
                                        <a href="javascript:void(0)" onclick="window.toggleAllDcsStations(true)">Выбрать все</a> | 
                                        <a href="javascript:void(0)" onclick="window.toggleAllDcsStations(false)">Снять все</a> | 
                                        <a href="javascript:void(0)" class="dcs-link-reset" title="Восстановить станции по умолчанию" onclick="window.resetDcsStationsToDefault()">Сбросить</a>
                                    </div>
                                </div>
                            </div>

                            <!-- Форма быстрого добавления новой станции -->
                            <div id="dcsAddStationRow" class="dcs-add-station-row" style="display:none;">
                                <div class="dcs-add-station-inputs">
                                    <div class="dcs-add-field-group">
                                        <label for="dcsNewStationInput">Код аэропорта (IATA):</label>
                                        <div class="dcs-input-with-list">
                                            <input type="text" id="dcsNewStationInput" list="dcsKnownAirportsList" class="dcs-input dcs-input-code" placeholder="NQZ или Астана" autocomplete="off" maxlength="30" oninput="window.handleDcsStationInput(event)" onkeydown="if(event.key==='Enter'){event.preventDefault();window.saveNewDcsStation();}">
                                            <datalist id="dcsKnownAirportsList"></datalist>
                                        </div>
                                    </div>
                                    <div class="dcs-add-field-group">
                                        <label for="dcsNewStationCity">Название города / станции:</label>
                                        <input type="text" id="dcsNewStationCity" class="dcs-input dcs-input-city" placeholder="Астана" autocomplete="off" maxlength="40" onkeydown="if(event.key==='Enter'){event.preventDefault();window.saveNewDcsStation();}">
                                    </div>
                                    <div class="dcs-add-buttons">
                                        <button type="button" class="dcs-btn-confirm-add" onclick="window.saveNewDcsStation()">
                                            ➕ Добавить
                                        </button>
                                        <button type="button" class="dcs-btn-cancel-add" onclick="window.toggleDcsAddStationForm(false)">
                                            Отмена
                                        </button>
                                    </div>
                                </div>
                                <div id="dcsAddStationHint" class="dcs-add-station-hint" style="display:none;"></div>
                            </div>

                            <!-- Список чипсов станций (динамический рендер) -->
                            <div class="dcs-stations-chips" id="dcsStationsContainer"></div>
                        </div>

                        <!-- Чекбокс только Finalize и кнопка запуска -->
                        <div class="dcs-action-row">
                            <label class="dcs-checkbox-label">
                                <input type="checkbox" id="dcsOnlyFinalize" checked>
                                <span>Собирать только завершенные рейсы (статус <strong>Finalize</strong>)</span>
                            </label>

                            <button id="btnDcsStartScan" class="dcs-btn-scan" onclick="window.startDcsScan()">
                                <span class="dcs-btn-icon">🔍</span> Найти рейсы в Lydia DCS
                            </button>
                        </div>
                    </div>

                    <!-- Индикатор прогресса -->
                    <div id="dcsProgressBox" class="dcs-progress-box" style="display:none;">
                        <div class="dcs-spinner"></div>
                        <div class="dcs-progress-info">
                            <div class="dcs-progress-text-row">
                                <span id="dcsProgressText">Подключение к серверу Lydia DCS...</span>
                                <span id="dcsProgressPercent">0%</span>
                            </div>
                            <div class="dcs-progress-bar-wrap">
                                <div id="dcsProgressBar" class="dcs-progress-bar" style="width: 0%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Таблица предварительного просмотра -->
                    <div id="dcsResultsSection" class="dcs-results-section" style="display:none;">
                        <div class="dcs-results-header">
                            <div class="dcs-results-count">
                                Найдено рейсов: <strong id="dcsFoundCount">0</strong> 
                                (<span id="dcsNewCount">0 новых</span>)
                            </div>
                            <div class="dcs-select-tools">
                                <button type="button" class="dcs-btn-mini" onclick="window.selectOnlyNewDcsFlights()">Выбрать только новые</button>
                                <button type="button" class="dcs-btn-mini" onclick="window.toggleAllDcsResults(true)">Выбрать все</button>
                                <button type="button" class="dcs-btn-mini" onclick="window.toggleAllDcsResults(false)">Снять все</button>
                            </div>
                        </div>

                        <div class="dcs-table-wrapper">
                            <table class="dcs-preview-table">
                                <thead>
                                    <tr>
                                        <th width="36"><input type="checkbox" id="dcsMasterCheck" onchange="window.toggleAllDcsResults(this.checked)"></th>
                                        <th>Дата</th>
                                        <th>Рейс</th>
                                        <th>Маршрут</th>
                                        <th>Пассажиры</th>
                                        <th>Взрослые</th>
                                        <th>Дети (РБ)</th>
                                        <th>Млад. (РМ)</th>
                                        <th>Багаж</th>
                                        <th>Р/Кладь</th>
                                        <th>Статус</th>
                                    </tr>
                                </thead>
                                <tbody id="dcsTableBody">
                                    <!-- Строки рендерятся динамически -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Подвал модального окна -->
                <div class="dcs-modal-footer">
                    <button class="dcs-btn-secondary" onclick="window.closeDcsModal()">Отмена</button>
                    <button id="btnDcsSaveSelected" class="dcs-btn-primary" style="display:none;" onclick="window.saveDcsSelectedFlights()">
                        💾 Загрузить выбранные рейсы в базу (<span id="dcsSelectedCount">0</span>)
                    </button>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        initModalDates();
    }

    function initModalDates() {
        refreshDcsDatesByActivePill();
        
        // Снимаем подсветку быстрых кнопок при ручном изменении дат
        const startInput = document.getElementById('dcsStartDate');
        const endInput = document.getElementById('dcsEndDate');
        const handleManualDateChange = () => {
            document.querySelectorAll('.dcs-pill').forEach(btn => btn.classList.remove('active'));
        };
        if (startInput) startInput.addEventListener('change', handleManualDateChange);
        if (endInput) endInput.addEventListener('change', handleManualDateChange);
    }

    function refreshDcsDatesByActivePill() {
        const activePill = document.querySelector('.dcs-pill.active');
        let type = 'yesterday';
        if (activePill) {
            const onclickAttr = activePill.getAttribute('onclick') || '';
            const match = onclickAttr.match(/'([^']+)'/);
            if (match && match[1]) {
                type = match[1];
            }
        }
        window.setDcsQuickDate(type);
    }

    window.openDcsModal = function() {
        const modal = document.getElementById('dcsSyncModal');
        if (modal) {
            refreshDcsDatesByActivePill();
            populateDcsKnownAirportsList();
            renderDcsStationChips();
            updateDcsAccountUI();
            const isLight = document.documentElement.classList.contains('light-theme') || 
                            document.body.classList.contains('light-theme') || 
                            localStorage.getItem('averago_theme') === 'light';
            modal.classList.toggle('light-theme', isLight);
            modal.classList.toggle('dcs-light-mode', isLight);
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeDcsModal = function() {
        const modal = document.getElementById('dcsSyncModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    function updateDcsAccountUI() {
        const display = document.getElementById('dcsAccountDisplay');
        const badge = document.getElementById('dcsAuthStatusBadge');
        const userInput = document.getElementById('dcsInputUsername');
        const passInput = document.getElementById('dcsInputPassword');
        const airInput = document.getElementById('dcsInputAirline');

        const user = dcsCredentials.username || 'Не настроена';
        if (display) display.innerText = user;

        if (userInput && !userInput.value) userInput.value = dcsCredentials.username || '';
        if (passInput && !passInput.value) passInput.value = dcsCredentials.password || '';
        if (airInput && !airInput.value) airInput.value = dcsCredentials.airline || 'N4';

        if (badge) {
            if (dcsCredentials.username && dcsCredentials.password) {
                badge.className = 'dcs-auth-status-badge ready';
                badge.innerText = '🟢 Настроена';
            } else {
                badge.className = 'dcs-auth-status-badge warning';
                badge.innerText = '🟡 Не заполнена';
            }
        }
    }

    window.toggleDcsAccountForm = function(force) {
        const row = document.getElementById('dcsAccountFormRow');
        const btn = document.getElementById('btnToggleDcsAccount');
        const label = document.getElementById('dcsAccountToggleLabel');
        if (!row) return;

        const isCurrentlyVisible = (row.style.display !== 'none');
        const show = (typeof force === 'boolean') ? force : !isCurrentlyVisible;

        row.style.display = show ? 'block' : 'none';
        if (btn) btn.classList.toggle('active', show);

        if (show) {
            const userInput = document.getElementById('dcsInputUsername');
            const passInput = document.getElementById('dcsInputPassword');
            const airInput = document.getElementById('dcsInputAirline');
            if (userInput) {
                userInput.value = dcsCredentials.username || '';
                userInput.focus();
            }
            if (passInput) passInput.value = dcsCredentials.password || '';
            if (airInput) airInput.value = dcsCredentials.airline || 'N4';

            const feedback = document.getElementById('dcsAccountFeedback');
            if (feedback) feedback.style.display = 'none';

            if (label) label.innerText = 'Скрыть форму';
        } else {
            if (label) label.innerText = 'Изменить логин / пароль';
        }
    };

    window.toggleDcsPwdVisibility = function() {
        const pwdInput = document.getElementById('dcsInputPassword');
        const eyeBtn = document.getElementById('btnToggleDcsPwd');
        if (!pwdInput) return;

        if (pwdInput.type === 'password') {
            pwdInput.type = 'text';
            if (eyeBtn) eyeBtn.innerText = '🙈';
        } else {
            pwdInput.type = 'password';
            if (eyeBtn) eyeBtn.innerText = '👁️';
        }
    };

    window.saveDcsCredentials = async function() {
        const userInput = document.getElementById('dcsInputUsername');
        const passInput = document.getElementById('dcsInputPassword');
        const airInput = document.getElementById('dcsInputAirline');
        const feedback = document.getElementById('dcsAccountFeedback');
        const saveBtn = document.getElementById('btnDcsSaveCreds');

        const username = (userInput ? userInput.value : '').trim();
        const password = (passInput ? passInput.value : '').trim();
        const airline = (airInput ? airInput.value : 'N4').trim().toUpperCase() || 'N4';

        if (!username || !password) {
            if (feedback) {
                feedback.className = 'dcs-account-feedback error';
                feedback.innerText = '⚠️ Логин и пароль не могут быть пустыми.';
                feedback.style.display = 'block';
            }
            if (!username && userInput) userInput.focus();
            else if (!password && passInput) passInput.focus();
            return;
        }

        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerText = '💾 Сохранение...';
        }

        try {
            const endpoint = (window.location.port === '8080' || window.location.protocol === 'file:')
                ? 'http://localhost:8080/api/dcs_sync?action=save_dcs_credentials'
                : 'lydia_dcs_sync.php?action=save_dcs_credentials';

            const resp = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, airline })
            });

            const data = await resp.json();
            if (data && data.success) {
                dcsCredentials.username = username;
                dcsCredentials.password = password;
                dcsCredentials.airline = airline;
                try {
                    localStorage.setItem('averago_dcs_credentials', JSON.stringify(dcsCredentials));
                } catch (e) {}

                updateDcsAccountUI();

                if (feedback) {
                    feedback.className = 'dcs-account-feedback success';
                    feedback.innerText = '✅ Учетные данные Lydia DCS успешно сохранены!';
                    feedback.style.display = 'block';
                }

                setTimeout(() => {
                    window.toggleDcsAccountForm(false);
                }, 1200);
            } else {
                if (feedback) {
                    feedback.className = 'dcs-account-feedback error';
                    feedback.innerText = `❌ ${data.error || 'Ошибка при сохранении'}`;
                    feedback.style.display = 'block';
                }
            }
        } catch (e) {
            console.error('Save DCS credentials error:', e);
            if (feedback) {
                feedback.className = 'dcs-account-feedback error';
                feedback.innerText = `❌ Ошибка запроса к серверу: ${e.message}`;
                feedback.style.display = 'block';
            }
        } finally {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerText = '💾 Сохранить';
            }
        }
    };

    window.testDcsCredentials = async function() {
        const userInput = document.getElementById('dcsInputUsername');
        const passInput = document.getElementById('dcsInputPassword');
        const airInput = document.getElementById('dcsInputAirline');
        const feedback = document.getElementById('dcsAccountFeedback');
        const testBtn = document.getElementById('btnDcsTestConn');
        const badge = document.getElementById('dcsAuthStatusBadge');

        const username = (userInput ? userInput.value : '').trim();
        const password = (passInput ? passInput.value : '').trim();
        const airline = (airInput ? airInput.value : 'N4').trim().toUpperCase() || 'N4';

        if (!username || !password) {
            if (feedback) {
                feedback.className = 'dcs-account-feedback error';
                feedback.innerText = '⚠️ Введите логин и пароль для проверки.';
                feedback.style.display = 'block';
            }
            return;
        }

        if (testBtn) {
            testBtn.disabled = true;
            testBtn.innerText = '⏳ Проверка...';
        }
        if (feedback) {
            feedback.className = 'dcs-account-feedback info';
            feedback.innerText = 'Подключение к Lydia DCS...';
            feedback.style.display = 'block';
        }

        try {
            const endpoint = (window.location.port === '8080' || window.location.protocol === 'file:')
                ? 'http://localhost:8080/api/dcs_sync?action=test_connection'
                : 'lydia_dcs_sync.php?action=test_connection';

            const resp = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, airline })
            });

            const data = await resp.json();
            if (data && data.success) {
                if (feedback) {
                    feedback.className = 'dcs-account-feedback success';
                    feedback.innerText = '✅ ' + (data.message || 'Связь с Lydia DCS установлена! Авторизация подтверждена.');
                    feedback.style.display = 'block';
                }
                if (badge) {
                    badge.className = 'dcs-auth-status-badge ready';
                    badge.innerText = '🟢 Подключено';
                }
            } else {
                if (feedback) {
                    feedback.className = 'dcs-account-feedback error';
                    feedback.innerText = '❌ ' + (data.error || 'Ошибка авторизации в Lydia DCS');
                    feedback.style.display = 'block';
                }
                if (badge) {
                    badge.className = 'dcs-auth-status-badge error';
                    badge.innerText = '🔴 Ошибка доступа';
                }
            }
        } catch (e) {
            if (feedback) {
                feedback.className = 'dcs-account-feedback error';
                feedback.innerText = `❌ Ошибка сети: ${e.message}`;
                feedback.style.display = 'block';
            }
        } finally {
            if (testBtn) {
                testBtn.disabled = false;
                testBtn.innerText = '⚡ Проверить связь';
            }
        }
    };

    function renderDcsStationChips() {
        const container = document.getElementById('dcsStationsContainer');
        if (!container) return;

        container.innerHTML = dcsStations.map((s) => `
            <label class="dcs-chip" title="${s.name}">
                <input type="checkbox" name="dcs_station" value="${s.code}" ${s.checked !== false ? 'checked' : ''} onchange="window.handleDcsStationCheckChange(this)">
                <span class="dcs-chip-label">${s.name}</span>
                <button type="button" class="dcs-chip-delete" title="Удалить станцию ${s.code}" onclick="window.removeDcsStation('${s.code}', event)">&times;</button>
            </label>
        `).join('');
    }

    window.handleDcsStationCheckChange = function(cb) {
        const code = cb.value;
        const target = dcsStations.find(s => s.code === code);
        if (target) {
            target.checked = cb.checked;
            try {
                localStorage.setItem('averago_dcs_stations', JSON.stringify(dcsStations));
            } catch (e) {}
        }
    };

    window.toggleAllDcsStations = function(checked) {
        dcsStations.forEach(s => s.checked = checked);
        try {
            localStorage.setItem('averago_dcs_stations', JSON.stringify(dcsStations));
        } catch (e) {}
        document.querySelectorAll('#dcsStationsContainer input[type="checkbox"]').forEach(cb => {
            cb.checked = checked;
        });
    };

    window.resetDcsStationsToDefault = function() {
        if (!confirm('Восстановить исходный список станций вылета Lydia DCS по умолчанию?')) return;
        dcsStations = JSON.parse(JSON.stringify(DEFAULT_DCS_STATIONS));
        saveDcsStations(dcsStations);
        renderDcsStationChips();
    };

    window.toggleDcsAddStationForm = function(forceState) {
        const row = document.getElementById('dcsAddStationRow');
        const btn = document.getElementById('btnToggleAddStation');
        if (!row) return;

        const isCurrentlyVisible = (row.style.display !== 'none');
        const show = (typeof forceState === 'boolean') ? forceState : !isCurrentlyVisible;

        row.style.display = show ? 'block' : 'none';
        if (btn) btn.classList.toggle('active', show);

        if (show) {
            populateDcsKnownAirportsList();
            const inputCode = document.getElementById('dcsNewStationInput');
            if (inputCode) {
                inputCode.value = '';
                inputCode.focus();
            }
            const inputCity = document.getElementById('dcsNewStationCity');
            if (inputCity) inputCity.value = '';
            const hint = document.getElementById('dcsAddStationHint');
            if (hint) {
                hint.style.display = 'none';
                hint.innerText = '';
            }
        }
    };

    function populateDcsKnownAirportsList() {
        const datalist = document.getElementById('dcsKnownAirportsList');
        if (!datalist) return;
        datalist.innerHTML = '';

        const dbAirports = (window.baggageDb && window.baggageDb.airports) ? window.baggageDb.airports : {};
        const addedCodes = new Set();

        Object.values(dbAirports).forEach(ap => {
            if (!ap) return;
            const iata = (ap.iata || '').toUpperCase().trim();
            if (iata && iata.length === 3 && !addedCodes.has(iata)) {
                addedCodes.add(iata);
                const cityName = ap.name || ap.city || iata;
                const opt = document.createElement('option');
                opt.value = `${iata} - ${cityName}`;
                datalist.appendChild(opt);
            }
        });
    }

    window.handleDcsStationInput = function(e) {
        const val = (e.target.value || '').trim();
        const cityInput = document.getElementById('dcsNewStationCity');
        const hint = document.getElementById('dcsAddStationHint');
        if (hint) hint.style.display = 'none';
        if (!cityInput) return;

        // Формат автокомплита: "NQZ - Астана"
        const match = val.match(/^([A-Za-z]{3})\s*[-–—]\s*(.+)$/);
        if (match) {
            e.target.value = match[1].toUpperCase();
            cityInput.value = match[2].trim();
            return;
        }

        // Поиск по коду или названию в baggageDb
        const upper = val.toUpperCase();
        if (window.baggageDb && window.baggageDb.airports) {
            if (window.baggageDb.airports[upper]) {
                const ap = window.baggageDb.airports[upper];
                cityInput.value = ap.name || ap.city || upper;
                return;
            }
            // Поиск по кириллическому имени
            for (const a of Object.values(window.baggageDb.airports)) {
                if (a && a.name && a.name.toLowerCase() === val.toLowerCase()) {
                    e.target.value = (a.iata || '').toUpperCase();
                    cityInput.value = a.name;
                    return;
                }
            }
        }
    };

    window.saveNewDcsStation = function() {
        const inputCode = document.getElementById('dcsNewStationInput');
        const inputCity = document.getElementById('dcsNewStationCity');
        const hint = document.getElementById('dcsAddStationHint');
        if (!inputCode || !inputCity) return;

        let code = (inputCode.value || '').trim().toUpperCase();
        let city = (inputCity.value || '').trim();

        // Проверка формата "NQZ - Астана"
        const match = code.match(/^([A-Z]{3})\s*[-–—]\s*(.+)$/i);
        if (match) {
            code = match[1].toUpperCase();
            if (!city) city = match[2].trim();
        }

        // Если ввели кириллический 3-буквенный код, пробуем конвертировать
        if (code.length === 3 && typeof window.ruToIata === 'function') {
            const converted = window.ruToIata(code);
            if (converted && converted.length === 3 && /^[A-Z]{3}$/.test(converted)) {
                code = converted;
            }
        }

        if (!/^[A-Z]{3}$/.test(code)) {
            if (hint) {
                hint.innerText = '⚠️ Введите корректный 3-буквенный код IATA (например: NQZ, AER, KZN).';
                hint.style.display = 'block';
            }
            inputCode.focus();
            return;
        }

        // Проверка на дублирование
        const existing = dcsStations.find(s => s.code === code);
        if (existing) {
            if (hint) {
                hint.innerText = `⚠️ Станция ${code} уже присутствует в списке (${existing.name}).`;
                hint.style.display = 'block';
            }
            return;
        }

        // Если город не указан, пробуем найти в базе или ставим код
        if (!city && window.baggageDb && window.baggageDb.airports) {
            const ap = window.baggageDb.airports[code];
            if (ap && (ap.name || ap.city)) {
                city = ap.name || ap.city;
            }
        }
        if (!city) {
            city = code;
        }

        const fullName = `${city} (${code})`;
        const newStation = {
            code: code,
            name: fullName,
            checked: true,
            isCustom: true
        };

        dcsStations.push(newStation);

        // Также регистрируем аэропорт в глобальной базе baggageDb, если его там еще нет
        if (window.baggageDb && window.baggageDb.airports && !window.baggageDb.airports[code]) {
            window.baggageDb.airports[code] = { iata: code, ru: code, name: city };
        }

        saveDcsStations(dcsStations);
        renderDcsStationChips();
        window.toggleDcsAddStationForm(false);
    };

    window.removeDcsStation = function(code, evt) {
        if (evt) {
            evt.stopPropagation();
            evt.preventDefault();
        }
        const idx = dcsStations.findIndex(s => s.code === code);
        if (idx !== -1) {
            dcsStations.splice(idx, 1);
            saveDcsStations(dcsStations);
            renderDcsStationChips();
        }
    };

    window.setDcsQuickDate = function(type, evt) {
        const startInput = document.getElementById('dcsStartDate');
        const endInput = document.getElementById('dcsEndDate');
        if (!startInput || !endInput) return;

        const now = new Date();
        const formatDate = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };

        const todayStr = formatDate(now);
        endInput.value = todayStr;

        if (type === 'today') {
            startInput.value = todayStr;
        } else if (type === 'yesterday') {
            const yDate = new Date(now);
            yDate.setDate(now.getDate() - 1);
            startInput.value = formatDate(yDate);
        } else if (type === '3days') {
            const d3Date = new Date(now);
            d3Date.setDate(now.getDate() - 3);
            startInput.value = formatDate(d3Date);
        }

        // Подсветка кнопок
        document.querySelectorAll('.dcs-pill').forEach(btn => btn.classList.remove('active'));
        if (evt && evt.target && evt.target.classList && evt.target.classList.contains('dcs-pill')) {
            evt.target.classList.add('active');
        } else {
            const defaultBtn = document.querySelector(`.dcs-pill[onclick*="'${type}'"]`);
            if (defaultBtn) defaultBtn.classList.add('active');
        }
    };

    function getActiveDbFlights() {
        if (typeof window.userFlights !== 'undefined' && Array.isArray(window.userFlights)) {
            return window.userFlights;
        }
        if (typeof userFlights !== 'undefined' && Array.isArray(userFlights)) {
            return userFlights;
        }
        try {
            const saved = localStorage.getItem('averago_user_flights_local');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {}
        return [];
    }

    function isFlightAlreadyInDb(flt) {
        const dbList = getActiveDbFlights();
        if (dbList && dbList.length > 0) {
            const fltDigits = String(flt.flight_no).replace(/\D/g, '');
            const fltDate = (flt.flight_date || '').substring(0, 10);
            const fltFrom = (flt.departure_code || '').toUpperCase().trim();
            const fltTo = (flt.dest_code || '').toUpperCase().trim();

            const found = dbList.some(item => {
                const itemDigits = String(item.flight_no || item.flt_no || '').replace(/\D/g, '');
                const itemDate = (item.date || item.flight_date || '').substring(0, 10);
                const itemFrom = (item.from || item.airport_from || '').toUpperCase().trim();
                const itemTo = (item.to || item.airport_to || '').toUpperCase().trim();

                return itemDigits === fltDigits && itemDate === fltDate && itemFrom === fltFrom && itemTo === fltTo;
            });

            return found;
        }

        return !!flt.already_in_db;
    }

    window.startDcsScan = async function() {
        if (isScanning) return;

        const startVal = document.getElementById('dcsStartDate').value;
        const endVal = document.getElementById('dcsEndDate').value;
        if (!startVal || !endVal) {
            alert('Пожалуйста, укажите даты диапазона сканирования.');
            return;
        }

        // Конвертируем YYYY-MM-DD в DD/MM/YYYY
        const convertDate = (val) => {
            const [y, m, d] = val.split('-');
            return `${d}/${m}/${y}`;
        };

        const startDateDcs = convertDate(startVal);
        const endDateDcs = convertDate(endVal);

        const checkedStations = Array.from(document.querySelectorAll('#dcsStationsContainer input[type="checkbox"]:checked')).map(cb => cb.value);
        if (checkedStations.length === 0) {
            alert('Выберите хотя бы один город вылета.');
            return;
        }

        const onlyFinalize = document.getElementById('dcsOnlyFinalize').checked;

        // UI в состояние сканирования
        isScanning = true;
        document.getElementById('btnDcsStartScan').disabled = true;
        document.getElementById('dcsProgressBox').style.display = 'flex';
        document.getElementById('dcsResultsSection').style.display = 'none';
        document.getElementById('btnDcsSaveSelected').style.display = 'none';

        const updateProgress = (text, pct) => {
            const safePct = Math.min(100, Math.max(0, Math.round(pct)));
            const elText = document.getElementById('dcsProgressText');
            const elPct = document.getElementById('dcsProgressPercent');
            const elBar = document.getElementById('dcsProgressBar');
            if (elText) elText.innerText = text;
            if (elPct) elPct.innerText = `${safePct}%`;
            if (elBar) elBar.style.width = `${safePct}%`;
        };

        const getStationName = (code) => {
            const found = dcsStations.find(s => s.code === code);
            return found ? found.name : code;
        };

        updateProgress('Авторизация в Lydia DCS...', 5);
        scannedFlights = [];

        try {
            // Определяем эндпоинт (локальный Python сервер или PHP на хостинге)
            const endpoint = (window.location.port === '8080' || window.location.protocol === 'file:') 
                ? 'http://localhost:8080/api/dcs_sync?action=scan_flights' 
                : 'lydia_dcs_sync.php?action=scan_flights';

            const totalStations = checkedStations.length;
            const seenIds = new Set();
            let lastScanError = '';

            const dbList = getActiveDbFlights();
            const clientFlightKeys = dbList.map(item => {
                const itemDigits = String(item.flight_no || item.flt_no || '').replace(/\D/g, '');
                const itemDate = (item.date || item.flight_date || '').substring(0, 10);
                const itemFrom = (item.from || item.airport_from || '').toUpperCase().trim();
                const itemTo = (item.to || item.airport_to || '').toUpperCase().trim();
                return `${itemDigits}_${itemDate}_${itemFrom}_${itemTo}`;
            });

            for (let i = 0; i < totalStations; i++) {
                const locCode = checkedStations[i];
                const locName = getStationName(locCode);
                const startPct = Math.round(5 + (i / totalStations) * 90);

                updateProgress(`[${i + 1}/${totalStations}] ${locName}... (Найдено: ${scannedFlights.length})`, startPct);

                try {
                    const resp = await fetch(endpoint, {
                        method: 'POST',
                        credentials: 'same-origin',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            start_date: startDateDcs,
                            end_date: endDateDcs,
                            locations: [locCode],
                            only_finalized: onlyFinalize,
                            client_flight_keys: clientFlightKeys,
                            username: dcsCredentials.username || undefined,
                            password: dcsCredentials.password || undefined,
                            airline: dcsCredentials.airline || 'N4'
                        })
                    });

                    const data = await resp.json();
                    if (data && data.success && Array.isArray(data.flights)) {
                        for (const flt of data.flights) {
                            if (!seenIds.has(flt.id)) {
                                seenIds.add(flt.id);
                                scannedFlights.push(flt);
                            }
                        }
                    } else if (data && !data.success && data.error) {
                        lastScanError = data.error;
                        console.warn(`Error scanning station ${locCode}:`, data.error);
                    }
                } catch (locErr) {
                    lastScanError = locErr.message;
                    console.warn(`Error scanning station ${locCode}:`, locErr);
                }

                const endPct = Math.round(5 + ((i + 1) / totalStations) * 90);
                updateProgress(`[${i + 1}/${totalStations}] ${locName} (Найдено: ${scannedFlights.length})`, endPct);
            }

            updateProgress(`Сбор завершен! Всего найдено рейсов: ${scannedFlights.length}`, 100);
            await new Promise(r => setTimeout(r, 450));

            renderDcsTable(scannedFlights, lastScanError);

        } catch (err) {
            console.error('DCS Scan Error:', err);
            alert('Ошибка связи с сервером DCS: ' + err.message);
        } finally {
            isScanning = false;
            document.getElementById('btnDcsStartScan').disabled = false;
            document.getElementById('dcsProgressBox').style.display = 'none';
        }
    };

    function renderDcsTable(flights, lastError) {
        const tbody = document.getElementById('dcsTableBody');
        tbody.innerHTML = '';

        if (flights.length === 0) {
            const errorMsg = lastError 
                ? `Внимание: ${lastError}` 
                : `Рейсов со статусом Finalize за выбранный период не найдено.`;
            tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding: 24px; color: ${lastError ? '#f87171' : '#a0aec0'};">${errorMsg}</td></tr>`;
            document.getElementById('dcsResultsSection').style.display = 'block';
            document.getElementById('dcsFoundCount').innerText = '0';
            document.getElementById('dcsNewCount').innerText = '0 новых';
            return;
        }

        let newCount = 0;

        flights.forEach((flt, idx) => {
            const inDb = isFlightAlreadyInDb(flt);
            flt.already_in_db = inDb;
            const isNew = !inDb;
            if (isNew) newCount++;

            const tr = document.createElement('tr');
            tr.className = isNew ? 'dcs-row-new' : 'dcs-row-existing';

            tr.innerHTML = `
                <td>
                    <input type="checkbox" class="dcs-flight-cb" data-idx="${idx}" ${isNew ? 'checked' : ''} onchange="window.updateDcsSelectedCount()">
                </td>
                <td><strong>${flt.flight_date}</strong></td>
                <td><span class="dcs-flt-badge">${flt.flight_no}</span></td>
                <td><strong>${flt.route}</strong></td>
                <td><strong>${flt.pax}</strong></td>
                <td>${flt.vz} <small style="color:#94a3b8;">(${flt.men}м / ${flt.women}ж)</small></td>
                <td>${flt.rb}</td>
                <td>${flt.rm}</td>
                <td><strong>${flt.bag_pcs}</strong> шт / <strong>${flt.bag_weight}</strong> кг</td>
                <td>${flt.hb_weight} кг</td>
                <td>
                    ${isNew 
                        ? '<span class="dcs-status-tag new">🟢 Новый</span>' 
                        : '<span class="dcs-status-tag exist">🟡 В базе</span>'
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('dcsFoundCount').innerText = flights.length;
        document.getElementById('dcsNewCount').innerText = `${newCount} новых`;
        document.getElementById('dcsResultsSection').style.display = 'block';
        document.getElementById('btnDcsSaveSelected').style.display = 'inline-flex';

        updateDcsSelectedCount();
    }

    window.updateDcsSelectedCount = function() {
        const checked = document.querySelectorAll('.dcs-flight-cb:checked');
        const btnSave = document.getElementById('btnDcsSaveSelected');
        const countSpan = document.getElementById('dcsSelectedCount');
        
        countSpan.innerText = checked.length;
        btnSave.disabled = (checked.length === 0);
    };

    window.toggleAllDcsResults = function(checked) {
        document.querySelectorAll('.dcs-flight-cb').forEach(cb => {
            cb.checked = checked;
        });
        updateDcsSelectedCount();
    };

    window.selectOnlyNewDcsFlights = function() {
        document.querySelectorAll('.dcs-flight-cb').forEach(cb => {
            const idx = parseInt(cb.dataset.idx, 10);
            const flt = scannedFlights[idx];
            cb.checked = flt && !isFlightAlreadyInDb(flt);
        });
        updateDcsSelectedCount();
    };

    window.saveDcsSelectedFlights = async function() {
        const checkedBoxes = Array.from(document.querySelectorAll('.dcs-flight-cb:checked'));
        if (checkedBoxes.length === 0) {
            alert('Выберите хотя бы один рейс для загрузки.');
            return;
        }

        const selectedFlights = checkedBoxes.map(cb => scannedFlights[parseInt(cb.dataset.idx, 10)]);

        const btnSave = document.getElementById('btnDcsSaveSelected');
        btnSave.disabled = true;
        btnSave.innerHTML = `⏳ Сохранение ${selectedFlights.length} рейсов...`;

        try {
            const endpoint = (window.location.port === '8080' || window.location.protocol === 'file:') 
                ? 'http://localhost:8080/api/dcs_sync?action=save_to_database' 
                : 'lydia_dcs_sync.php?action=save_to_database';

            const resp = await fetch(endpoint, {
                method: 'POST',
                credentials: 'same-origin',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flights: selectedFlights })
            });

            const data = await resp.json();

            if (data.success) {
                // Мгновенно обновляем базу в оперативной памяти AeroBag
                if (typeof window.userFlights !== 'undefined' && Array.isArray(window.userFlights)) {
                    selectedFlights.forEach(flt => {
                        const item = {
                            id: flt.id || ('dcs_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)),
                            airline: flt.airline || 'N4',
                            flight_no: flt.flight_no,
                            date: flt.flight_date,
                            from: flt.departure_code,
                            to: flt.dest_code,
                            men: flt.vz || (flt.men + flt.women),
                            women: 0,
                            rb: flt.rb || 0,
                            rm: flt.rm || 0,
                            pax: flt.pax || ((flt.vz || 0) + (flt.rb || 0)),
                            bag_pcs: flt.bag_pcs || 0,
                            bag_weight: flt.bag_weight || 0,
                            hb_weight: flt.hb_weight || 0,
                            source: 'Lydia DCS',
                            active: true
                        };

                        const exIdx = window.userFlights.findIndex(u => 
                            String(u.flight_no).replace(/\D/g,'') === String(item.flight_no).replace(/\D/g,'') && 
                            u.date === item.date && 
                            u.from === item.from && 
                            u.to === item.to
                        );

                        if (exIdx !== -1) {
                            window.userFlights[exIdx] = Object.assign({}, window.userFlights[exIdx], item);
                        } else {
                            window.userFlights.push(item);
                        }
                    });

                    if (typeof window.saveUserFlights === 'function') window.saveUserFlights();
                    if (typeof window.populateAirportDropdowns === 'function') window.populateAirportDropdowns();
                    if (typeof window.updateActiveDateRangeAndCounts === 'function') window.updateActiveDateRangeAndCounts();
                    if (typeof window.renderFlightsTable === 'function') window.renderFlightsTable();
                    if (typeof window.renderUploadedFilesList === 'function') window.renderUploadedFilesList();
                    if (typeof window.populateAllFlightsDropdown === 'function') window.populateAllFlightsDropdown();
                }

                alert(`✅ ${data.message || 'Рейсы успешно импортированы в базу!'}`);
                closeDcsModal();
            } else {
                alert('Ошибка сохранения рейсов: ' + (data.error || 'Неизвестная ошибка'));
            }

        } catch (err) {
            console.error('Save DCS error:', err);
            alert('Ошибка отправки рейсов в базу: ' + err.message);
        } finally {
            btnSave.disabled = false;
            btnSave.innerHTML = `💾 Загрузить выбранные рейсы в базу (<span id="dcsSelectedCount">${checkedBoxes.length}</span>)`;
        }
    };

})();
