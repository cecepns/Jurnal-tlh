-- ========================================================
-- Migration: Add video_url to dictionary_items
-- Date: 2026-09-15
-- Platform: The Little Hijabi
-- Description: Menambahkan kolom video_url untuk upload video MP4/WEBM
--              gerakan isyarat pada Kamus Isyarat Bergambar.
-- ========================================================

USE `the_little_hijabi`;

-- 1. Tambah kolom video_url jika belum ada
ALTER TABLE `dictionary_items`
ADD COLUMN IF NOT EXISTS `video_url` VARCHAR(255) NULL AFTER `illustration_url`;

-- Catatan:
-- Jika versi MySQL tidak mendukung syntax 'IF NOT EXISTS' pada ALTER TABLE,
-- jalankan perintah alternatif berikut:
-- ALTER TABLE `dictionary_items` ADD COLUMN `video_url` VARCHAR(255) NULL AFTER `illustration_url`;
