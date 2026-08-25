#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Графический интерфейс (GUI) для парсера AviaBit на Tkinter.
Позволяет визуально выбирать даты, запускать выгрузку в один клик и открывать созданный Excel-файл.
"""

import os
import sys
import threading
from datetime import datetime, timedelta
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, simpledialog
from tkcalendar import DateEntry

# Импорт логики из parser.py
from parser import run_parse, parse_date_arg, parse_time_arg, ALLOWED_DEPARTURES


class AviabitParserGUI(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Суточный план Диспетчера - AviaBit Parser (Nordwind + Икар)")
        self.geometry("640 x 580".replace(" ", ""))
        self.minsize(560, 520)

        # Установка иконки приложения
        icon_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app_icon.ico")
        if os.path.exists(icon_path):
            try:
                self.iconbitmap(icon_path)
            except Exception:
                pass

        # Центрирование окна
        self.center_window(640, 580)

        # Цветовая палитра
        self.bg_color = "#f3f4f6"
        self.card_bg = "#ffffff"
        self.accent_color = "#1f4e78"
        self.accent_hover = "#143350"
        self.text_color = "#111827"
        self.configure(bg=self.bg_color)

        self.setup_styles()
        self.create_widgets()

    def center_window(self, width, height):
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = max(0, int((screen_width - width) / 2))
        y = max(0, int((screen_height - height) / 2))
        self.geometry(f"{width}x{height}+{x}+{y}")

    def setup_styles(self):
        style = ttk.Style(self)
        style.theme_use("clam")

        style.configure("TLabel", background=self.bg_color, foreground=self.text_color, font=("Segoe UI", 10))
        style.configure("Card.TFrame", background=self.card_bg)
        style.configure("Header.TLabel", background=self.accent_color, foreground="#ffffff", font=("Segoe UI", 13, "bold"))
        style.configure("SubHeader.TLabel", background=self.card_bg, foreground="#374151", font=("Segoe UI", 10, "bold"))

    def create_widgets(self):
        # 1. Шапка (Header)
        header_frame = tk.Frame(self, bg=self.accent_color, height=60)
        header_frame.pack(fill="x", side="top")

        title_lbl = tk.Label(
            header_frame,
            text="✈️ СУТОЧНЫЙ ПЛАН ДИСПЕТЧЕРА AVIABIT -> EXCEL",
            bg=self.accent_color,
            fg="#ffffff",
            font=("Segoe UI", 12, "bold"),
            pady=14
        )
        title_lbl.pack()

        # Основной контейнер
        main_container = tk.Frame(self, bg=self.bg_color, padx=16, pady=12)
        main_container.pack(fill="both", expand=True)

        # 2. Карточка настроек (Период дат)
        card_dates = tk.Frame(main_container, bg=self.card_bg, bd=1, relief="solid", highlightthickness=0)
        card_dates.pack(fill="x", pady=(0, 10), ipady=8, ipadx=10)

        lbl_section1 = tk.Label(card_dates, text="📅 Период выгрузки рейсов", bg=self.card_bg, fg="#1f4e78", font=("Segoe UI", 10, "bold"))
        lbl_section1.pack(anchor="w", padx=10, pady=(6, 8))

        dates_grid = tk.Frame(card_dates, bg=self.card_bg)
        dates_grid.pack(fill="x", padx=10)

        # Начало периода
        tk.Label(dates_grid, text="Начало периода (МСК):", bg=self.card_bg, fg="#374151", font=("Segoe UI", 9, "bold")).grid(row=0, column=0, sticky="w", pady=4)
        self.entry_start = DateEntry(
            dates_grid,
            width=11,
            background="#1f4e78",
            foreground="white",
            headersbackground="#1f4e78",
            headersforeground="white",
            selectbackground="#0284c7",
            selectforeground="white",
            borderwidth=1,
            font=("Segoe UI", 9),
            date_pattern="dd.mm.yyyy",
            locale="ru_RU"
        )
        self.entry_start.set_date(datetime.now())
        self.entry_start.grid(row=0, column=1, padx=(4, 10), pady=4)

        tk.Label(dates_grid, text="Время:", bg=self.card_bg, fg="#4b5563", font=("Segoe UI", 9)).grid(row=0, column=2, sticky="w", pady=4)
        self.entry_start_time = tk.Entry(dates_grid, font=("Segoe UI", 9), width=6, justify="center")
        self.entry_start_time.insert(0, "00:00")
        self.entry_start_time.grid(row=0, column=3, padx=(4, 0), pady=4)

        # Окончание периода
        tk.Label(dates_grid, text="Окончание периода (МСК):", bg=self.card_bg, fg="#374151", font=("Segoe UI", 9, "bold")).grid(row=1, column=0, sticky="w", pady=4)
        self.entry_end = DateEntry(
            dates_grid,
            width=11,
            background="#1f4e78",
            foreground="white",
            headersbackground="#1f4e78",
            headersforeground="white",
            selectbackground="#0284c7",
            selectforeground="white",
            borderwidth=1,
            font=("Segoe UI", 9),
            date_pattern="dd.mm.yyyy",
            locale="ru_RU"
        )
        self.entry_end.set_date(datetime.now() + timedelta(days=1))
        self.entry_end.grid(row=1, column=1, padx=(4, 10), pady=4)

        tk.Label(dates_grid, text="Время:", bg=self.card_bg, fg="#4b5563", font=("Segoe UI", 9)).grid(row=1, column=2, sticky="w", pady=4)
        self.entry_end_time = tk.Entry(dates_grid, font=("Segoe UI", 9), width=6, justify="center")
        self.entry_end_time.insert(0, "23:59")
        self.entry_end_time.grid(row=1, column=3, padx=(4, 0), pady=4)

        # Авто-выделение текста для полей времени и даты (без блокировки стрелочки календаря)
        self.entry_start.bind("<FocusIn>", lambda e: self.entry_start.after(10, lambda: self.entry_start.selection_range(0, tk.END)))
        self.entry_end.bind("<FocusIn>", lambda e: self.entry_end.after(10, lambda: self.entry_end.selection_range(0, tk.END)))

        self._enable_auto_select(self.entry_start_time)
        self._enable_auto_select(self.entry_end_time)

        # Авто-маска форматирования для ввода времени (ЧЧ:ММ)
        self._attach_time_mask(self.entry_start_time)
        self._attach_time_mask(self.entry_end_time)

        # Быстрые кнопки пресетов
        preset_frame = tk.Frame(card_dates, bg=self.card_bg)
        preset_frame.pack(fill="x", padx=10, pady=(8, 4))

        tk.Label(preset_frame, text="Быстрый выбор:", bg=self.card_bg, fg="#6b7280", font=("Segoe UI", 8)).pack(side="left", padx=(0, 6))

        btn_today = tk.Button(preset_frame, text="Сегодня", font=("Segoe UI", 8), bg="#e5e7eb", relief="flat", padx=6, pady=2, command=self.set_preset_today)
        btn_today.pack(side="left", padx=3)

        btn_tomorrow = tk.Button(preset_frame, text="+1 День", font=("Segoe UI", 8), bg="#e5e7eb", relief="flat", padx=6, pady=2, command=self.set_preset_tomorrow)
        btn_tomorrow.pack(side="left", padx=3)

        btn_3days = tk.Button(preset_frame, text="3 Дня", font=("Segoe UI", 8), bg="#e5e7eb", relief="flat", padx=6, pady=2, command=self.set_preset_3days)
        btn_3days.pack(side="left", padx=3)

        btn_week = tk.Button(preset_frame, text="7 Дней", font=("Segoe UI", 8), bg="#e5e7eb", relief="flat", padx=6, pady=2, command=self.set_preset_week)
        btn_week.pack(side="left", padx=3)

        # 3. Карточка параметров фильтра
        card_params = tk.Frame(main_container, bg=self.card_bg, bd=1, relief="solid", highlightthickness=0)
        card_params.pack(fill="x", pady=(0, 10), ipady=6, ipadx=10)

        params_lbl = tk.Label(
            card_params,
            text=f"⚙️ Фильтр: WBGarantiya | Коды: IATA | Аэропортов в фильтре: {len(ALLOWED_DEPARTURES)}",
            bg=self.card_bg,
            fg="#4b5563",
            font=("Segoe UI", 9)
        )
        params_lbl.pack(anchor="w", padx=10, pady=4)

        airports_preview = ", ".join(sorted(list(ALLOWED_DEPARTURES)))
        airports_lbl = tk.Label(
            card_params,
            text=f"Аэропорты: {airports_preview}",
            bg=self.card_bg,
            fg="#6b7280",
            font=("Segoe UI", 8),
            wraplength=580,
            justify="left"
        )
        airports_lbl.pack(anchor="w", padx=10, pady=(0, 4))

        # 4. Кнопка запуска
        self.btn_run = tk.Button(
            main_container,
            text="🚀 СФОРМИРОВАТЬ EXCEL ТАБЛИЦУ",
            bg="#0284c7",
            fg="#ffffff",
            activebackground="#0369a1",
            activeforeground="#ffffff",
            font=("Segoe UI", 11, "bold"),
            relief="flat",
            pady=10,
            cursor="hand2",
            command=self.start_export
        )
        self.btn_run.pack(fill="x", pady=(0, 10))

        # 5. Логи выполнения
        log_frame = tk.Frame(main_container, bg=self.card_bg, bd=1, relief="solid")
        log_frame.pack(fill="both", expand=True, pady=(0, 6))

        self.txt_log = tk.Text(log_frame, bg="#1e293b", fg="#f8fafc", font=("Consolas", 9), wrap="word", relief="flat")
        scrollbar = tk.Scrollbar(log_frame, command=self.txt_log.yview)
        self.txt_log.configure(yscrollcommand=scrollbar.set)

        scrollbar.pack(side="right", fill="y")
        self.txt_log.pack(side="left", fill="both", expand=True)

        self.log("[ИНФО] Готов к работе. Выберите даты и нажмите кнопку запуска.")

        # Нижняя панель действий
        self.last_saved_file = None
        self.bottom_frame = tk.Frame(main_container, bg=self.bg_color)
        self.bottom_frame.pack(fill="x")

        self.btn_open_file = tk.Button(
            self.bottom_frame,
            text="📊 Открыть Excel",
            font=("Segoe UI", 9, "bold"),
            bg="#10b981",
            fg="#ffffff",
            relief="flat",
            state="disabled",
            command=self.open_excel_file
        )
        self.btn_open_file.pack(side="left", padx=(0, 6), pady=2)

        self.btn_open_folder = tk.Button(
            self.bottom_frame,
            text="📁 Открыть папку",
            font=("Segoe UI", 9),
            bg="#e5e7eb",
            fg="#1f2937",
            relief="flat",
            state="disabled",
            command=self.open_folder
        )
        self.btn_open_folder.pack(side="left", pady=2)

    def _enable_auto_select(self, widget):
        """Автоматическое выделение всего текста при фокусе и клике для мгновенной замены ввода."""
        def _select(event=None):
            try:
                widget.after(10, lambda: widget.selection_range(0, tk.END))
            except Exception:
                pass
        widget.bind("<FocusIn>", _select)
        widget.bind("<Button-1>", _select)

    def _attach_time_mask(self, entry):
        """Авто-маска времени: автоматическая расстановка двоеточия (ЧЧ:ММ)."""
        def _on_key(event):
            if event.keysym in ("Left", "Right", "Up", "Down", "Home", "End", "Tab", "Shift_L", "Shift_R", "Control_L", "Control_R", "BackSpace", "Delete"):
                return
            cur = entry.get()
            digits = "".join(c for c in cur if c.isdigit())[:4]
            if len(digits) >= 3:
                formatted = f"{digits[:2]}:{digits[2:]}"
            elif len(digits) == 2 and not cur.endswith(":"):
                formatted = f"{digits}:"
            else:
                formatted = digits
            if formatted != cur:
                entry.delete(0, tk.END)
                entry.insert(0, formatted)
                entry.icursor(tk.END)

        def _on_focus_out(event):
            cur = entry.get().strip()
            digits = "".join(c for c in cur if c.isdigit())
            if len(digits) == 4:
                entry.delete(0, tk.END)
                entry.insert(0, f"{digits[:2]}:{digits[2:]}")
            elif len(digits) == 2:
                entry.delete(0, tk.END)
                entry.insert(0, f"{digits}:00")

        entry.bind("<KeyRelease>", _on_key)
        entry.bind("<FocusOut>", _on_focus_out)

    def log(self, text):
        self.txt_log.insert(tk.END, text + "\n")
        self.txt_log.see(tk.END)
        self.update_idletasks()

    def set_preset_today(self):
        now = datetime.now()
        self.entry_start.set_date(now)
        self.entry_end.set_date(now)
        self.entry_start_time.delete(0, tk.END)
        self.entry_start_time.insert(0, "00:00")
        self.entry_end_time.delete(0, tk.END)
        self.entry_end_time.insert(0, "23:59")

    def set_preset_tomorrow(self):
        now = datetime.now()
        self.entry_start.set_date(now)
        self.entry_end.set_date(now + timedelta(days=1))
        self.entry_start_time.delete(0, tk.END)
        self.entry_start_time.insert(0, "00:00")
        self.entry_end_time.delete(0, tk.END)
        self.entry_end_time.insert(0, "23:59")

    def set_preset_3days(self):
        now = datetime.now()
        self.entry_start.set_date(now)
        self.entry_end.set_date(now + timedelta(days=2))
        self.entry_start_time.delete(0, tk.END)
        self.entry_start_time.insert(0, "00:00")
        self.entry_end_time.delete(0, tk.END)
        self.entry_end_time.insert(0, "23:59")

    def set_preset_week(self):
        now = datetime.now()
        self.entry_start.set_date(now)
        self.entry_end.set_date(now + timedelta(days=6))
        self.entry_start_time.delete(0, tk.END)
        self.entry_start_time.insert(0, "00:00")
        self.entry_end_time.delete(0, tk.END)
        self.entry_end_time.insert(0, "23:59")

    def start_export(self):
        start_val = self.entry_start.get().strip()
        end_val = self.entry_end.get().strip()
        start_time_val = self.entry_start_time.get().strip()
        end_time_val = self.entry_end_time.get().strip()

        try:
            start_date = parse_date_arg(start_val)
            end_date = parse_date_arg(end_val)
            s_h, s_m = parse_time_arg(start_time_val, 0, 0)
            e_h, e_m = parse_time_arg(end_time_val, 23, 59)
            
            start_dt_chk = datetime(start_date.year, start_date.month, start_date.day, s_h, s_m)
            end_dt_chk = datetime(end_date.year, end_date.month, end_date.day, e_h, e_m)
            if end_dt_chk < start_dt_chk:
                messagebox.showerror("Ошибка", "Дата и время окончания не могут быть раньше даты и времени начала!")
                return
        except ValueError as e:
            messagebox.showerror("Ошибка даты/времени", str(e))
            return

        start_str = start_date.strftime("%d.%m.%Y")
        end_str = end_date.strftime("%d.%m.%Y")

        if s_h == 0 and s_m == 0 and e_h == 23 and e_m == 59:
            default_filename = f"Суточный_план_Диспетчера_{start_str}_{end_str}.xlsx"
        else:
            s_t = f"{s_h:02d}-{s_m:02d}"
            e_t = f"{e_h:02d}-{e_m:02d}"
            default_filename = f"Суточный_план_Диспетчера_{start_str}_{s_t}_{end_str}_{e_t}.xlsx"

        # Диалог выбора папки и имени файла для сохранения
        chosen_path = filedialog.asksaveasfilename(
            title="Выберите место для сохранения Excel таблицы",
            defaultextension=".xlsx",
            initialfile=default_filename,
            filetypes=[("Файлы Excel (*.xlsx)", "*.xlsx"), ("Все файлы (*.*)", "*.*")],
            parent=self
        )

        if not chosen_path:
            # Пользователь отменил диалог
            return

        self.btn_run.config(state="disabled", text="⏳ ВЫГРУЗКА ДАННЫХ...", bg="#94a3b8")
        self.btn_open_file.config(state="disabled")
        self.btn_open_folder.config(state="disabled")

        threading.Thread(
            target=self._worker_thread,
            args=(start_date, end_date, chosen_path, start_time_val, end_time_val),
            daemon=True
        ).start()

    def prompt_code_gui(self, client_name: str, sending_info: str) -> str:
        """Показ диалогового окна запроса 2FA кода из письма в основном UI потоке."""
        result = {"code": None}
        done_event = threading.Event()

        def _ask():
            prompt_text = (
                f"Для входа на сервер [{client_name}] требуется подтверждение.\n\n"
                f"Код выслан на: {sending_info}\n\n"
                f"Введите 4-значный код из письма:"
            )
            code = simpledialog.askstring(
                f"Подтверждение 2FA — {client_name}",
                prompt_text,
                parent=self
            )
            result["code"] = code
            done_event.set()

        self.after(0, _ask)
        done_event.wait()
        return result["code"]

    def _worker_thread(self, start_date: datetime, end_date: datetime, output_filename: str, start_time_str: str, end_time_str: str):
        start_str = start_date.strftime("%d.%m.%Y")
        end_str = end_date.strftime("%d.%m.%Y")

        self.log("=" * 55)
        self.log(f"[*] Начало выгрузки: {start_str} {start_time_str} — {end_str} {end_time_str} (МСК)")
        self.log("[*] Запрос данных с порталов Nordwind и Икар...")

        try:
            success, msg, count, saved_file = run_parse(
                start_date,
                end_date,
                output_filename,
                prompt_code_callback=self.prompt_code_gui,
                start_time_str=start_time_str,
                end_time_str=end_time_str
            )

            if success:
                self.last_saved_file = saved_file or output_filename
                self.log(f"[+] {msg}")
                self.log("=" * 55)
                self.after(0, self._on_success, count, self.last_saved_file)
            else:
                self.log(f"[-] Ошибка: {msg}")
                self.log("=" * 55)
                self.after(0, self._on_error, msg)
        except Exception as e:
            err_text = f"Непредвиденная ошибка: {e}"
            self.log(f"[-] {err_text}")
            self.log("=" * 55)
            self.after(0, self._on_error, err_text)

    def _on_success(self, count, filepath):
        self.btn_run.config(state="normal", text="🚀 СФОРМИРОВАТЬ EXCEL ТАБЛИЦУ", bg="#0284c7")
        self.btn_open_file.config(state="normal")
        self.btn_open_folder.config(state="normal")
        messagebox.showinfo("Успешно!", f"Выгружено рейсов: {count}\n\nФайл сохранен:\n{filepath}")

    def _on_error(self, msg):
        self.btn_run.config(state="normal", text="🚀 СФОРМИРОВАТЬ EXCEL ТАБЛИЦУ", bg="#0284c7")
        messagebox.showerror("Ошибка выгрузки", msg)

    def open_excel_file(self):
        if self.last_saved_file and os.path.exists(self.last_saved_file):
            os.startfile(self.last_saved_file)

    def open_folder(self):
        if self.last_saved_file:
            folder = os.path.dirname(self.last_saved_file)
            os.startfile(folder)
        else:
            os.startfile(os.path.dirname(os.path.abspath(__file__)))


if __name__ == "__main__":
    app = AviabitParserGUI()
    app.mainloop()
