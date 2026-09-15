-- SQL Export for The Little Hijabi Database
-- Platform Sekolah, Perkembangan Anak & Pembelajaran Multi-Tenant SaaS

CREATE DATABASE IF NOT EXISTS `the_little_hijabi` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `the_little_hijabi`;

-- Disable foreign key checks for schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Schools Table (Multi-tenant)
DROP TABLE IF EXISTS `schools`;
CREATE TABLE `schools` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(50) UNIQUE NOT NULL,
  `address` TEXT,
  `phone` VARCHAR(50),
  `email` VARCHAR(100),
  `logo_url` VARCHAR(255),
  `subscription_plan` ENUM('basic', 'standard', 'pro') DEFAULT 'standard',
  `status` ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Users Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50),
  `role` ENUM('super_admin', 'school_admin', 'principal', 'teacher', 'parent', 'student') NOT NULL,
  `avatar_url` VARCHAR(255),
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
);

-- 3. Academic Years Table
DROP TABLE IF EXISTS `academic_years`;
CREATE TABLE `academic_years` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL,
  `year_name` VARCHAR(50) NOT NULL, -- e.g. "2026/2027"
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE
);

-- 4. Classes Table
DROP TABLE IF EXISTS `classes`;
CREATE TABLE `classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL,
  `academic_year_id` INT NOT NULL,
  `name` VARCHAR(100) NOT NULL, -- e.g. "TK A", "TK B"
  `level` VARCHAR(50) NOT NULL, -- e.g. "TK A"
  `homeroom_teacher_id` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`homeroom_teacher_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- 5. Students Table
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL,
  `class_id` INT NULL,
  `user_id` INT NULL, -- optional student login user account
  `nisn` VARCHAR(50),
  `full_name` VARCHAR(191) NOT NULL,
  `nickname` VARCHAR(50),
  `gender` ENUM('L', 'P') NOT NULL,
  `birth_place` VARCHAR(100),
  `birth_date` DATE,
  `avatar_url` VARCHAR(255),
  `notes` TEXT,
  `status` ENUM('active', 'graduated', 'transferred') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

-- 6. Student Parent Mapping
DROP TABLE IF EXISTS `student_parents`;
CREATE TABLE `student_parents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `parent_user_id` INT NOT NULL,
  `relationship` VARCHAR(50) DEFAULT 'Orang Tua',
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 7. Daily Reports Table
DROP TABLE IF EXISTS `daily_reports`;
CREATE TABLE `daily_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL,
  `class_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `report_date` DATE NOT NULL,
  `theme` VARCHAR(191) NOT NULL,
  `subtheme` VARCHAR(191),
  `summary` TEXT NOT NULL,
  `activities_list` JSON, -- Array of activities e.g. ["Bahasa", "Bahasa Isyarat", "Art Project"]
  `status` ENUM('draft', 'published') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`class_id`) REFERENCES `classes`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 8. Daily Report Attachments (Photos/Videos/Docs)
DROP TABLE IF EXISTS `daily_report_attachments`;
CREATE TABLE `daily_report_attachments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `daily_report_id` INT NOT NULL,
  `file_url` VARCHAR(255) NOT NULL,
  `file_type` ENUM('image', 'video', 'document') DEFAULT 'image',
  `file_name` VARCHAR(191),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`daily_report_id`) REFERENCES `daily_reports`(`id`) ON DELETE CASCADE
);

-- 9. Daily Report Student Tagging (Auto feeds into Portfolio)
DROP TABLE IF EXISTS `daily_report_student_tags`;
CREATE TABLE `daily_report_student_tags` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `daily_report_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `attachment_id` INT NULL, -- if tag is specific to a photo
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`daily_report_id`) REFERENCES `daily_reports`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`attachment_id`) REFERENCES `daily_report_attachments`(`id`) ON DELETE CASCADE
);

-- 10. Student Developments (Monthly/Periodic Progress)
DROP TABLE IF EXISTS `student_developments`;
CREATE TABLE `student_developments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `teacher_id` INT NOT NULL,
  `period_month` VARCHAR(20) NOT NULL, -- e.g. "Agustus 2026"
  `bahasa_rating` INT DEFAULT 4,
  `bahasa_notes` TEXT,
  `isyarat_rating` INT DEFAULT 4,
  `isyarat_notes` TEXT,
  `sosial_rating` INT DEFAULT 5,
  `sosial_notes` TEXT,
  `motorik_rating` INT DEFAULT 4,
  `motorik_notes` TEXT,
  `kreativitas_rating` INT DEFAULT 5,
  `kreativitas_notes` TEXT,
  `overall_teacher_notes` TEXT,
  `parent_advice` TEXT,
  `ai_generated_narrative` TEXT,
  `status` ENUM('draft', 'submitted', 'reviewed', 'approved', 'published') DEFAULT 'published',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`teacher_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 11. Learning Courses (LMS)
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `category` ENUM('bahasa_indonesia', 'bahasa_isyarat', 'story_telling', 'life_skill', 'art') NOT NULL,
  `level` VARCHAR(50) DEFAULT 'Level 1',
  `description` TEXT,
  `thumbnail_url` VARCHAR(255),
  `total_lessons` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Lessons Table
DROP TABLE IF EXISTS `lessons`;
CREATE TABLE `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `chapter_name` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `content_type` ENUM('video', 'image', 'text', 'pdf', 'quiz') DEFAULT 'video',
  `video_url` VARCHAR(255),
  `content_body` TEXT,
  `order_no` INT DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);

-- 13. Quizzes Table
DROP TABLE IF EXISTS `quizzes`;
CREATE TABLE `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NULL,
  `title` VARCHAR(191) NOT NULL,
  `passing_score` INT DEFAULT 70,
  `xp_reward` INT DEFAULT 50,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Quiz Questions Table
DROP TABLE IF EXISTS `quiz_questions`;
CREATE TABLE `quiz_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `media_url` VARCHAR(255),
  `media_type` ENUM('none', 'image', 'video') DEFAULT 'none',
  `question_type` ENUM('multiple_choice', 'true_false') DEFAULT 'multiple_choice',
  `options_json` JSON NOT NULL, -- [{"id": "a", "text": "Makan", "is_correct": true}, ...]
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
);

-- 15. Student Gamification & Progress
DROP TABLE IF EXISTS `student_progress`;
CREATE TABLE `student_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `xp` INT DEFAULT 120,
  `level` INT DEFAULT 2,
  `streak_days` INT DEFAULT 5,
  `badges_json` JSON, -- ["Rajin Belajar", "Master Isyarat"]
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
);

-- 16. Messages Table (Teacher <-> Parent)
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `school_id` INT NOT NULL,
  `sender_id` INT NOT NULL,
  `receiver_id` INT NOT NULL,
  `student_id` INT NULL,
  `message` TEXT NOT NULL,
  `attachment_url` VARCHAR(255),
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- 18. Dictionary Items (Kamus Isyarat Bergambar)
DROP TABLE IF EXISTS `dictionary_items`;
CREATE TABLE `dictionary_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `word` VARCHAR(100) NOT NULL,
  `category` ENUM('alfabet', 'angka', 'siapa_aku', 'keluarga', 'rumah_tinggal', 'hobi', 'makanan_minuman', 'hewan', 'umum') DEFAULT 'umum',
  `level` VARCHAR(50) DEFAULT 'Level 1',
  `image_url` VARCHAR(255) NOT NULL,
  `illustration_url` VARCHAR(255),
  `video_url` VARCHAR(255) NULL,
  `description` TEXT,
  `tags` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Digital Library Items (Buku, Worksheet, PPT, PDF)
DROP TABLE IF EXISTS `library_items`;
CREATE TABLE `library_items` (
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

-- 20. Curriculums Table (Kurikulum Dinamis)
DROP TABLE IF EXISTS `curriculums`;
CREATE TABLE `curriculums` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `track` ENUM('isyarat', 'bahasa_indonesia') NOT NULL DEFAULT 'isyarat',
  `level` VARCHAR(50) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `order_no` INT DEFAULT 1,
  `topics` JSON NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- SEED DATA FOR DEMO & TESTING
-- ========================================================

-- Schools
INSERT INTO `schools` (`id`, `name`, `code`, `address`, `phone`, `email`, `subscription_plan`, `status`) VALUES
(1, 'TK The Little Hijabi Islamic School', 'TLH-JAKARTA', 'Jl. Utama Pendidikan No. 8, Jakarta', '0812-3456-7890', 'info@littlehijabi.sch.id', 'pro', 'active');

-- Users (All roles available for testing)
-- Default Password for all accounts: password123 (bcrypt hash: $2a$10$Ew.qX8zZgZ88K0y8xL.N/O0U8.K9l6a3E0W/F5G.Q6I.h/r8j5i2e -> plain password123 check supported)
INSERT INTO `users` (`id`, `school_id`, `name`, `email`, `password`, `phone`, `role`, `avatar_url`) VALUES
(1, NULL, 'Super Admin Platform', 'superadmin@littlehijabi.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0811111111', 'super_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(2, 1, 'Ustadzah Sarah (Admin Sekolah)', 'admin.tk@littlehijabi.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0822222222', 'school_admin', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'),
(3, 1, 'Bunda Maryam, M.Pd (Kepala Sekolah)', 'kepsek@littlehijabi.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0833333333', 'principal', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
(4, 1, 'Bu Ani (Wali Kelas TK A)', 'guru.ani@littlehijabi.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0844444444', 'teacher', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'),
(5, 1, 'Bapak Budi (Orang Tua Aisyah)', 'ortu.budi@littlehijabi.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0855555555', 'parent', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(6, 1, 'Aisyah Putri Humaira', 'aisyah@littlehijabi.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0866666666', 'student', 'https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=150');

-- Academic Year
INSERT INTO `academic_years` (`id`, `school_id`, `year_name`, `is_active`) VALUES
(1, 1, '2026/2027', 1);

-- Classes
INSERT INTO `classes` (`id`, `school_id`, `academic_year_id`, `name`, `level`, `homeroom_teacher_id`) VALUES
(1, 1, 1, 'TK A - Al Fatih', 'TK A', 4),
(2, 1, 1, 'TK B - Ar Razi', 'TK B', 4);

-- Students
INSERT INTO `students` (`id`, `school_id`, `class_id`, `nisn`, `full_name`, `nickname`, `gender`, `birth_date`, `avatar_url`, `notes`) VALUES
(1, 1, 1, '0012345678', 'Aisyah Putri Humaira', 'Aisyah', 'P', '2021-04-12', 'https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=200', 'Anak sangat aktif dan suka menggambar.'),
(2, 1, 1, '0012345679', 'Ahmad Zaki Al-Faris', 'Ahmad', 'L', '2021-08-05', 'https://images.unsplash.com/photo-1519238263530-99afd11df2ea?w=200', 'Suka bermain balok dan bercerita.'),
(3, 1, 1, '0012345680', 'Siti Zahra Medina', 'Siti', 'P', '2021-01-20', 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=200', 'Tekun saat belajar Bahasa Isyarat.'),
(4, 1, 1, '0012345681', 'Budi Pratama', 'Budi', 'L', '2021-11-15', 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200', 'Suka berolahraga dan motorik kasar.');

-- Student Parent Relations
INSERT INTO `student_parents` (`student_id`, `parent_user_id`, `relationship`) VALUES
(1, 5, 'Ayah'),
(2, 6, 'Ibu');

-- Daily Report
INSERT INTO `daily_reports` (`id`, `school_id`, `class_id`, `teacher_id`, `report_date`, `theme`, `subtheme`, `summary`, `activities_list`, `status`) VALUES
(1, 1, 1, 4, '2026-08-09', 'Mengenal Hewan & Bahasa Isyarat', 'Hewan Peliharaan', 'Hari ini anak-anak belajar mengenal nama-nama hewan peliharaan dalam Bahasa Indonesia dan Bahasa Isyarat sederhana (Kucing, Kelinci, Burung). Semua anak antusias dan gembira.', '["Bahasa Indonesia", "Bahasa Isyarat", "Art Project", "Story Telling"]', 'published');

-- Daily Report Attachments
INSERT INTO `daily_report_attachments` (`id`, `daily_report_id`, `file_url`, `file_type`, `file_name`) VALUES
(1, 1, 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600', 'image', 'Dokumentasi Belajar 1.jpg'),
(2, 1, 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600', 'image', 'Karya Menggambar.jpg');

-- Student Developments
INSERT INTO `student_developments` (`id`, `school_id`, `student_id`, `teacher_id`, `period_month`, `bahasa_rating`, `isyarat_rating`, `sosial_rating`, `motorik_rating`, `kreativitas_rating`, `overall_teacher_notes`, `ai_generated_narrative`, `status`) VALUES
(1, 1, 1, 4, 'Agustus 2026', 4, 5, 4, 5, 5, 'Aisyah sangat ceria, komunikatif, dan aktif memperagakan moves Bahasa Isyarat.', 'Aisyah menunjukkan perkembangan luar biasa bulan ini! Ia mampu memahami instruksi verbal dan memperagakan Isyarat abjad A-E secara mandiri dengan rasa percaya diri tinggi.', 'published'),
(2, 1, 2, 4, 'Agustus 2026', 4, 3, 4, 4, 4, 'Ahmad aktif dalam kegiatan kelompok dan motorik kasar.', 'Ahmad berkembang dengan sangat baik, terutama pada aspek motorik dan interaksi sosial dengan teman sebaya.', 'published');

-- Tagging Students in Daily Report
INSERT INTO `daily_report_student_tags` (`daily_report_id`, `student_id`, `attachment_id`) VALUES
(1, 1, 1),
(1, 2, 1),
(1, 3, 2);

-- Courses (LMS)
INSERT INTO `courses` (`id`, `title`, `category`, `level`, `description`, `thumbnail_url`, `total_lessons`) VALUES
(1, 'Bahasa Isyarat Dasar Anak', 'bahasa_isyarat', 'Level 1', 'Belajar kata-kata sehari-hari dan abjad dalam Bahasa Isyarat secara menyenangkan.', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400', 5),
(2, 'Pengenalan Alfabet & Kata', 'bahasa_indonesia', 'Level 1', 'Belajar mengenal hurufvokal, konsonan, dan pembentukan kata sederhana.', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400', 4);

-- Lessons
INSERT INTO `lessons` (`id`, `course_id`, `chapter_name`, `title`, `content_type`, `video_url`, `content_body`, `order_no`) VALUES
(1, 1, 'Chapter 1: Abjad & Angka', 'Isyarat Huruf A - E', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Perhatikan gerakan tangan untuk menirukan bentuk isyarat A, B, C, D, E.', 1),
(2, 1, 'Chapter 1: Abjad & Angka', 'Isyarat Kata Sehari-hari (Makan & Minum)', 'video', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Gerakan tangan menyentuh bibir menandakan kata MAKAN.', 2);

-- Quizzes
INSERT INTO `quizzes` (`id`, `lesson_id`, `title`, `passing_score`, `xp_reward`) VALUES
(1, 1, 'Quiz Kuis Bahasa Isyarat Huruf A-E', 70, 50);

-- Quiz Questions
INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `media_url`, `media_type`, `question_type`, `options_json`) VALUES
(1, 1, 'Gerakan dengan mengepalkan tangan dan ibu jari di samping melambangkan huruf?', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300', 'image', 'multiple_choice', '[{"id": "a", "text": "Huruf A", "is_correct": true}, {"id": "b", "text": "Huruf B", "is_correct": false}, {"id": "c", "text": "Huruf C", "is_correct": false}]');

-- Student Gamification Progress
INSERT INTO `student_progress` (`student_id`, `xp`, `level`, `streak_days`, `badges_json`) VALUES
(1, 240, 3, 7, '["Rajin Belajar 7 Hari", "Bintang Bahasa Isyarat", "Kreator Muda"]'),
(2, 150, 2, 4, '["Rajin Belajar", "Penyayang Teman"]');

-- Notifications
INSERT INTO `notifications` (`user_id`, `title`, `message`, `type`) VALUES
(5, 'Laporan Kegiatan Baru', 'Ustadzah Ani telah menambahkan laporan kegiatan harian Aisyah untuk tema: Mengenal Hewan.', 'info'),
(5, 'Materi Baru Tersedia', 'Worksheet Bahasa Isyarat baru telah diunggah untuk kelas TK A.', 'success');

-- Dictionary Items (Kamus Isyarat Bergambar)
INSERT INTO `dictionary_items` (`id`, `word`, `category`, `level`, `image_url`, `illustration_url`, `description`, `tags`) VALUES
(1, 'Ayam', 'hewan', 'Level 1', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500', 'Ibu jari dan jari telunjuk membentuk paruh di depan mulut, lalu dibuka-tutup menyerupai paruh ayam berkokok.', '["hewan", "unggas", "ayam", "level 1"]'),
(2, 'Huruf A', 'alfabet', 'Level 1', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500', 'Tangan mengepal ke depan dengan posisi ibu jari tegak menempel di sisi samping jari telunjuk.', '["alfabet", "huruf", "a", "level 1"]'),
(3, 'Huruf B', 'alfabet', 'Level 1', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500', 'Keempat jari tegak lurus merapat ke atas, sedangkan ibu jari terlipat di depan telapak tangan.', '["alfabet", "huruf", "b", "level 1"]'),
(4, 'Angka 1', 'angka', 'Level 1', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'Jari telunjuk tegak lurus mengarah ke atas, empat jari lainnya terlipat rapat.', '["angka", "nomor", "1", "satu", "level 1"]'),
(5, 'Angka 2', 'angka', 'Level 1', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'Jari telunjuk dan jari tengah tegak membentuk huruf V (simbol damai/dua).', '["angka", "nomor", "2", "dua", "level 1"]'),
(6, 'Ayah', 'keluarga', 'Level 1', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500', 'Ibu jari tangan kanan terbuka menempel di dahi, lalu digerakkan perlahan ke depan.', '["keluarga", "ayah", "bapak", "level 1", "siapa aku"]'),
(7, 'Ibu', 'keluarga', 'Level 1', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500', 'Ibu jari tangan kanan menempel lembut di dagu/pipi bawah, menyimbolkan kehangatan seorang ibu.', '["keluarga", "ibu", "mama", "bunda", "level 1", "siapa aku"]'),
(8, 'Rumah', 'rumah_tinggal', 'Level 1', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=500', 'Ujung-ujung jari kedua tangan dipertemukan membentuk segitiga atap rumah di depan dada.', '["rumah", "tempat tinggal", "atap", "level 1"]'),
(9, 'Makan', 'makanan_minuman', 'Level 1', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500', 'Ujung semua jari menguncup mengarah ke mulut, digerakkan mendekati bibir 2-3 kali.', '["makanan", "makan", "makanan minuman", "level 1"]'),
(10, 'Minum', 'makanan_minuman', 'Level 1', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500', 'Tangan membentuk huruf C seperti memegang cangkir, lalu diangkat dan dimiringkan ke mulut.', '["minum", "air", "makanan minuman", "level 1"]');

-- Digital Library Items (Buku, Worksheet, PPT, PDF)
INSERT INTO `library_items` (`id`, `title`, `type`, `category`, `level`, `file_url`, `thumbnail_url`, `description`, `total_pages`, `file_size`) VALUES
(1, 'Buku Cerita Bergambar: Kisah Si Ayam & Burung Merpati', 'buku_bacaan', 'Bahasa Indonesia', 'Pra Membaca', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', 'Buku cerita fabel ramah anak lengkap dengan ilustrasi warna-warni untuk melatih daya imajinasi dan kosakata awal.', 16, '2.4 MB'),
(2, 'Worksheet Latihan Isyarat: Alfabet A - Z & Menghubungkan Garis', 'worksheet', 'Bahasa Isyarat', 'Level 1', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500', 'Lembar kerja printable yang dapat dicetak untuk latihan anak menebalkan garis isyarat dan mencocokkan bentuk tangan.', 8, '1.8 MB'),
(3, 'Slide Presentasi (PPT): Mengenal Anggota Tubuh & Isyarat Siapa Aku', 'ppt_materi', 'Bahasa Isyarat', 'Level 1', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500', 'Panduan presentasi interaktif ustadzah/guru di kelas dan materi ulang belajar orang tua di rumah.', 12, '4.1 MB'),
(4, 'Worksheet Berhitung Angka 1-10 Ramah Isyarat', 'worksheet', 'Bahasa Isyarat', 'Level 1', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500', 'Aktivitas mewarnai angka, menghitung jumlah benda, dan meniru gerakan isyarat angka 1 sampai 10.', 10, '1.5 MB'),
(5, 'Buku Pintar Membaca Kata Sederhana Bergambar', 'buku_bacaan', 'Bahasa Indonesia', 'Level 1', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500', 'Panduan membaca dua suku kata (BA-JU, BO-LA, BU-KU) disertai gambar riang.', 20, '3.2 MB');
