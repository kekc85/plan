-- ==========================================================
-- СХЕМА БАЗЫ ДАННЫХ MYSQL ДЛЯ ПРИЛОЖЕНИЯ AEROPLAN W&B
-- Хостинг: Beget (https://cp.beget.com/main)
-- Кодировка: UTF8MB4
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. Таблица пользователей (Администраторы и Диспетчеры)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(64) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `salt` VARCHAR(64) NOT NULL,
    `full_name` VARCHAR(128) NOT NULL,
    `role` VARCHAR(32) NOT NULL DEFAULT 'dispatcher',
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Таблица суточных смен
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_shifts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `date_interval` VARCHAR(64) NOT NULL,
    `dispatcher_name` VARCHAR(128) NOT NULL,
    `started_at` VARCHAR(64) NOT NULL,
    `closed_at` VARCHAR(64) NULL,
    `status` VARCHAR(32) NOT NULL DEFAULT 'active',
    `created_at` VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Таблица рейсов смены
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_flights` (
    `id` VARCHAR(64) PRIMARY KEY,
    `shift_id` INT NULL,
    `flight_number` VARCHAR(32) NOT NULL,
    `flight_date` VARCHAR(16) NULL,
    `route_city` VARCHAR(128) NULL,
    `route_airports` VARCHAR(64) NULL,
    `departure_time` VARCHAR(16) NULL,
    `release_time` VARCHAR(16) NULL,
    `ac_num` VARCHAR(32) NULL,
    `ac_config` VARCHAR(32) NULL,
    `pax` VARCHAR(32) NULL,
    `crew` VARCHAR(32) NULL,
    `fuel_block` VARCHAR(32) NULL,
    `fuel_trip` VARCHAR(32) NULL,
    `fuel_taxi` VARCHAR(32) NULL,
    `dow` VARCHAR(32) NULL,
    `doi` VARCHAR(32) NULL,
    `galley` VARCHAR(16) DEFAULT 'D',
    `mtow` VARCHAR(32) NULL,
    `lir_sent` TINYINT(1) DEFAULT 0,
    `cargo` VARCHAR(32) NULL,
    `mail` VARCHAR(32) NULL,
    `baggage` VARCHAR(255) NULL,
    `szv_sent` TINYINT(1) DEFAULT 0,
    `ldm_sent` TINYINT(1) DEFAULT 0,
    `astra_times_sent` TINYINT(1) DEFAULT 0,
    `status` VARCHAR(32) DEFAULT 'pending',
    `notes` TEXT NULL,
    `sort_order` INT DEFAULT 0,
    `updated_at` VARCHAR(64) NULL,
    `updated_by` VARCHAR(128) NULL,
    INDEX `idx_shift` (`shift_id`),
    INDEX `idx_flight_date` (`flight_number`, `flight_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Таблица журнала сдачи-приёмки дежурства по смене
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_handover_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `shift_id` INT NULL,
    `handed_over_by` VARCHAR(128) NOT NULL,
    `accepted_by` VARCHAR(128) NOT NULL,
    `handover_time` VARCHAR(64) NOT NULL,
    `active_flights_count` INT NOT NULL DEFAULT 0,
    `transferred_flights_summary` TEXT NULL,
    `notes` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Начальные учётные записи (пароли: admin123 / dispatch123)
-- ----------------------------------------------------------
INSERT INTO `plan_users` (`username`, `password_hash`, `salt`, `full_name`, `role`, `is_active`, `created_at`)
VALUES 
('admin', 'c13c72b22ecbe64b22c71da4910cf9ebfafe23bb1d9db52c7be0e653139360fe', 'c4bf61c1bbddcb2002feef2e25fdfc1a', 'Администратор системы', 'admin', 1, '2026-08-25T15:00:00+03:00'),
('dispatcher', '84c47863ca6f62b714faecaa44c68832a82087a17726b28dd29f27fa837ee50e', '495913e6484e5549df9c403362a937a0', 'Диспетчер по центровке', 'dispatcher', 1, '2026-08-25T15:00:00+03:00')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

SET FOREIGN_KEY_CHECKS = 1;
