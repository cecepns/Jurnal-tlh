-- ========================================================
-- Cumulative Migration File: The Little Hijabi
-- Added: dictionary_items & library_items
-- Date: 2026-08-23
-- ========================================================

USE `the_little_hijabi`;

-- 1. Table: dictionary_items (Kamus Isyarat Bergambar)
CREATE TABLE IF NOT EXISTS `dictionary_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `word` VARCHAR(100) NOT NULL,
  `category` ENUM('alfabet', 'angka', 'siapa_aku', 'keluarga', 'rumah_tinggal', 'hobi', 'makanan_minuman', 'hewan', 'umum') DEFAULT 'umum',
  `level` VARCHAR(50) DEFAULT 'Level 1',
  `image_url` VARCHAR(255) NOT NULL,
  `illustration_url` VARCHAR(255),
  `description` TEXT,
  `tags` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: library_items (Buku, Worksheet, PPT, PDF)
CREATE TABLE IF NOT EXISTS `library_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `type` ENUM('buku_bacaan', 'worksheet', 'ppt_materi', 'pewarnaan') DEFAULT 'buku_bacaan',
  `category` VARCHAR(100) DEFAULT 'Bahasa Indonesia',
  `level` VARCHAR(50) DEFAULT 'Level 1',
  `file_url` VARCHAR(255) NOT NULL,
  `thumbnail_url` VARCHAR(255),
  `description` TEXT,
  `total_pages` INT DEFAULT 1,
  `file_size` VARCHAR(50) DEFAULT '2.0 MB',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Seed Sample Data
INSERT INTO `dictionary_items` (`id`, `word`, `category`, `level`, `image_url`, `illustration_url`, `description`, `tags`) 
VALUES
(1, 'Ayam', 'hewan', 'Level 1', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500', 'Ibu jari dan jari telunjuk membentuk paruh di depan mulut, lalu dibuka-tutup menyerupai paruh ayam berkokok.', '["hewan", "unggas", "ayam", "level 1"]'),
(2, 'Huruf A', 'alfabet', 'Level 1', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500', 'Tangan mengepal ke depan dengan posisi ibu jari tegak menempel di sisi samping jari telunjuk.', '["alfabet", "huruf", "a", "level 1"]'),
(3, 'Huruf B', 'alfabet', 'Level 1', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500', 'Keempat jari tegak lurus merapat ke atas, sedangkan ibu jari terlipat di depan telapak tangan.', '["alfabet", "huruf", "b", "level 1"]'),
(4, 'Angka 1', 'angka', 'Level 1', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'Jari telunjuk tegak lurus mengarah ke atas, empat jari lainnya terlipat rapat.', '["angka", "nomor", "1", "satu", "level 1"]'),
(5, 'Angka 2', 'angka', 'Level 1', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'Jari telunjuk dan jari tengah tegak membentuk huruf V (simbol damai/dua).', '["angka", "nomor", "2", "dua", "level 1"]')
ON DUPLICATE KEY UPDATE `word` = VALUES(`word`);

INSERT INTO `library_items` (`id`, `title`, `type`, `category`, `level`, `file_url`, `thumbnail_url`, `description`, `total_pages`, `file_size`) 
VALUES
(1, 'Buku Cerita Bergambar: Kisah Si Ayam & Burung Merpati', 'buku_bacaan', 'Bahasa Indonesia', 'Pra Membaca', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', 'Buku cerita fabel ramah anak lengkap dengan ilustrasi warna-warni untuk melatih daya imajinasi dan kosakata awal.', 16, '2.4 MB'),
(2, 'Worksheet Latihan Isyarat: Alfabet A - Z & Menghubungkan Garis', 'worksheet', 'Bahasa Isyarat', 'Level 1', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500', 'Lembar kerja printable yang dapat dicetak untuk latihan anak menebalkan garis isyarat dan mencocokkan bentuk tangan.', 8, '1.8 MB'),
(3, 'Slide Presentasi (PPT): Mengenal Anggota Tubuh & Isyarat Siapa Aku', 'ppt_materi', 'Bahasa Isyarat', 'Level 1', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500', 'Panduan presentasi interaktif ustadzah/guru di kelas dan materi ulang belajar orang tua di rumah.', 12, '4.1 MB')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
