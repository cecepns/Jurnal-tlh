-- ========================================================
-- Migration: Add Curriculums Table for Dynamic Management
-- Date: 2026-08-23
-- Platform: The Little Hijabi
-- ========================================================

USE `the_little_hijabi`;

-- 1. Create Table: curriculums
CREATE TABLE IF NOT EXISTS `curriculums` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `track` ENUM('isyarat', 'bahasa_indonesia') NOT NULL DEFAULT 'isyarat',
  `level` VARCHAR(50) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `order_no` INT DEFAULT 1,
  `topics` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Seed Initial Curriculums Data
INSERT INTO `curriculums` (`id`, `track`, `level`, `name`, `order_no`, `topics`) VALUES
(1, 'isyarat', 'Level 1', 'Fondasi Isyarat Dasar & Pengenalan Diri', 1, '[
  {"title": "Alfabet Isyarat (A - Z)", "desc": "Pengenalan visual 26 huruf isyarat BISINDO dengan gerakan tangan mandiri."},
  {"title": "Angka Isyarat (0 - 10+)", "desc": "Menghitung dan memperagakan bentuk bilangan 0 sampai 10."},
  {"title": "Siapa Aku (Identitas Diri)", "desc": "Isyarat nama diri, jenis kelamin (laki-laki/perempuan), dan perasaan ceria."},
  {"title": "Keluarga Tercinta", "desc": "Isyarat Ayah, Ibu, Kakak, Adik, Kakek, dan Nenek."},
  {"title": "Rumah Tinggal", "desc": "Ruangan di rumah, pintu, jendela, tempat tidur, dan kebersihan rumah."},
  {"title": "Hobi & Kegemaran", "desc": "Menggambar, bernyanyi, bermain bola, membaca buku, dan bersepeda."},
  {"title": "Makanan & Minuman", "desc": "Isyarat makan, minum, nasi, susu, air, buah-buahan, dan sayuran segar."}
]'),
(2, 'isyarat', 'Level 2', 'Ekspresi Emosi & Lingkungan Sekitar', 2, '[
  {"title": "Dunia Binatang & Satwa", "desc": "Kucing, ayam, kelinci, burung, ikan, dan suara/gerakan khasnya."},
  {"title": "Warna-Warni Alam", "desc": "Merah, hijau, kuning, biru, putih, dan hitam."},
  {"title": "Ekspresi Perasaan", "desc": "Senang, sedih, bersemangat, mengantuk, dan bersyukur."}
]'),
(3, 'isyarat', 'Level 3', 'Komunikasi Sosial & Aktivitas Harian', 3, '[
  {"title": "Sapaan & Adab Sopan Santun", "desc": "Tolong, terima kasih, maaf, permisi, dan salam islami."},
  {"title": "Aktivitas di Sekolah", "desc": "Belajar, bermain bersama teman, mendengarkan ustadzah, dan merapikan mainan."}
]'),
(4, 'isyarat', 'Level 4', 'Keterampilan Kalimat Sederhana', 4, '[
  {"title": "Menyusun Frasa Isyarat", "desc": "Menggabungkan subjek dan predikat: Saya Makan, Ibu Membaca."},
  {"title": "Tanya Jawab Isyarat", "desc": "Siapa, Apa, Di mana, Kapan, dan Mengapa."}
]'),
(5, 'isyarat', 'Level 5', 'Storytelling & Percakapan Tematik Mandiri', 5, '[
  {"title": "Bercerita dengan Isyarat", "desc": "Menceritakan kembali kisah pendek dan dongeng islami dengan ekspresi penuh."},
  {"title": "Presentasi Minat Bakat", "desc": "Menjelaskan karya seni dan cita-cita menggunakan kombinasi isyarat fasih."}
]'),
(6, 'bahasa_indonesia', 'Pra Membaca', 'Sensori Fonik & Pengenalan Huruf Vokal', 1, '[
  {"title": "Pengenalan Bunyi Huruf (Fonik)", "desc": "Mengenal bunyi vokal A, I, U, E, O dengan intonasi ceria."},
  {"title": "Mencocokkan Gambar & Lambang Huruf", "desc": "Membedakan bentuk huruf besar dan huruf kecil melalui kartu visual."},
  {"title": "Mendengarkan Cerita Bergambar", "desc": "Melatih fokus mendengarkan dan menyebutkan objek utama dalam buku cerita."}
]'),
(7, 'bahasa_indonesia', 'Level 1', 'Membaca Suku Kata Terbuka', 2, '[
  {"title": "Kombinasi Konsonan-Vokal (KV)", "desc": "Membaca BA, BI, BU, BE, BO; CA, CI, CU, CE, CO."},
  {"title": "Membaca 2 Suku Kata Makna", "desc": "KATA: BUKU, BOLA, MATA, SAPI, MEJA."}
]'),
(8, 'bahasa_indonesia', 'Level 2', 'Membaca Suku Kata Tertutup & Difthong', 3, '[
  {"title": "Konsonan Akhir (KVK)", "desc": "Membaca KUCING, AYAM, MAKAN, MINUM, POHON."},
  {"title": "Gabungan Huruf Vokal (AI, AU, OI)", "desc": "Membaca TUPAI, PULAU, KERBAU."}
]'),
(9, 'bahasa_indonesia', 'Level 3', 'Membaca Kalimat Pendek & Pemahaman', 4, '[
  {"title": "Membaca Struktur Kalimat S-P-O", "desc": "Aisyah membaca buku cerita. Budi makan buah apel."},
  {"title": "Menjawab Pertanyaan Bacaan Sederhana", "desc": "Menjawab apa yang sedang dilakukan tokoh dalam teks pendek."}
]'),
(10, 'bahasa_indonesia', 'Level 4', 'Membaca Cerita Paragraf & Menulis Kreatif', 5, '[
  {"title": "Membaca Teks Narasi 3-4 Kalimat", "desc": "Membaca lancar dengan intonasi jeda titik dan koma."},
  {"title": "Menyusun Kalimat Sendiri", "desc": "Menuliskan pengalaman bermain hari ini dengan ejaan yang benar."}
]'),
(11, 'bahasa_indonesia', 'Level 5', 'Literasi Kritis & Pemahaman Tematik', 6, '[
  {"title": "Analisis Karakter & Pesan Moral", "desc": "Menyimpulkan pesan kebaikan dan adab dari buku bacaan."},
  {"title": "Membaca Mandiri & Diskusi Buku", "desc": "Membaca buku cerita pilihan sendiri dan menceritakannya di depan kelas."}
]')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `topics` = VALUES(`topics`);
