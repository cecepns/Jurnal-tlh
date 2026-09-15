import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, BookOpen, ArrowRight, CheckCircle2,
  Menu, X, LayoutDashboard
} from 'lucide-react';
import logo from '../assets/logo.png';

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const targetPath = isAuthenticated ? '/dashboard' : '/login';
  const navBtnText = isAuthenticated ? 'Buka Dashboard' : 'Masuk / Login';
  const ctaBtnText = isAuthenticated ? 'Buka Dashboard' : 'Masuk ke Aplikasi';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="The Little Hijabi" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-2xl shadow-sm ring-2 ring-teal-500/20" />
            <div className="min-w-0">
              <span className="text-lg sm:text-xl font-black text-teal-700 tracking-tight block leading-tight truncate">The Little Hijabi</span>
              <span className="hidden sm:block text-[11px] font-bold text-slate-500 tracking-wide uppercase truncate">LMS Inklusif & Jurnal Belajar Anak</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-extrabold text-slate-600 text-sm tracking-wide">
            <a href="#kurikulum" className="hover:text-teal-600 transition">Kurikulum</a>
            <a href="#lms-isyarat" className="hover:text-teal-600 transition">LMS Bahasa Isyarat</a>
            <a href="#lms-indonesia" className="hover:text-teal-600 transition">LMS Bahasa Indonesia</a>
            <a href="#kamus-library" className="hover:text-teal-600 transition">Kamus & Digital Library</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to={targetPath}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 transition flex items-center gap-2"
            >
              {isAuthenticated && <LayoutDashboard className="w-4 h-4" />}
              {navBtnText} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to={targetPath}
              className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
            >
              {isAuthenticated ? 'Dashboard' : 'Masuk'}
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6 text-teal-600" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-3 font-extrabold text-slate-700 text-base border-b border-slate-100 pb-4">
              <a
                href="#kurikulum"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition"
              >
                📚 Kurikulum Pembelajaran
              </a>
              <a
                href="#lms-isyarat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition"
              >
                🤟 LMS Bahasa Isyarat (Level 1-5)
              </a>
              <a
                href="#lms-indonesia"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition"
              >
                📖 LMS Bahasa Indonesia (Pra Membaca - Level 5)
              </a>
              <a
                href="#kamus-library"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition"
              >
                📂 Kamus Gambar & Digital Library
              </a>
            </nav>

            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                to={targetPath}
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2"
              >
                {ctaBtnText} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-100/50 via-emerald-50/30 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Platform Kurikulum Inklusif & Jurnal Perkembangan Anak</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Belajar Bahasa Isyarat & Literasi Anak <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800">Menyenangkan & Terstruktur</span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Dilengkapi Kurikulum Bertahap (Level 1-5 & Pra Membaca), Kamus Bahasa Isyarat Bergambar, Digital Library Buku & Worksheet PDF, serta Jurnal Perkembangan Siswa Terpadu.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to={targetPath}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg shadow-xl shadow-teal-600/30 hover:scale-[1.02] transition flex items-center justify-center gap-3"
              >
                {ctaBtnText} <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#kurikulum"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-lg shadow-md hover:border-teal-300 transition flex items-center justify-center gap-2"
              >
                <BookOpen className="w-5 h-5 text-teal-600" /> Pelajari Kurikulum
              </a>
            </div>
          </div>

          {/* Quick Pillar Cards */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-teal-200/80 shadow-md space-y-3 hover:-translate-y-1 transition">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-2xl">
                🤟
              </div>
              <h3 className="text-lg font-black text-slate-900">LMS Bahasa Isyarat</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Level 1 (Alfabet, Angka, Siapa Aku, Keluarga, Rumah, Hobi, Makanan) hingga Level 5.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-indigo-200/80 shadow-md space-y-3 hover:-translate-y-1 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xl">
                📖
              </div>
              <h3 className="text-lg font-black text-slate-900">LMS Bahasa Indonesia</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Tahap Pra Membaca (sensori fonik & vokal) hingga pemahaman teks Level 1 s.d. Level 5.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-emerald-200/80 shadow-md space-y-3 hover:-translate-y-1 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-black text-slate-900">Kamus Isyarat Bergambar</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Pencarian kosakata isyarat instan dalam format kartu gambar visual yang mudah dipahami.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-amber-200/80 shadow-md space-y-3 hover:-translate-y-1 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-2xl">
                📂
              </div>
              <h3 className="text-lg font-black text-slate-900">Digital Library & Buku</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Koleksi buku cerita PDF, worksheet lembar kerja printable, & slide PPT materi belajar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: KURIKULUM & LMS BAHASA ISYARAT */}
      <section id="lms-isyarat" className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-black uppercase tracking-wider">
              Kurikulum LMS Bahasa Isyarat (BISINDO)
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Jenjang Pembelajaran Isyarat Terstruktur
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Materi isyarat tematik yang dirancang khusus untuk memacu komunikasi ekspresif anak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl border-2 border-teal-500 bg-teal-50/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-black">Level 1 (Fondasi Dasar)</span>
                <span className="text-xs font-bold text-teal-700">7 Sub-Topik</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">Pengenalan Diri & Keseharian</h3>
              <ul className="space-y-2 text-sm text-slate-700 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Alfabet Isyarat (A - Z)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Angka Isyarat (0 - 10)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Siapa Aku (Identitas Diri)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Keluarga (Ayah, Ibu, dll)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Rumah Tinggal & Ruangan</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Hobi & Minat Anak</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" /> Makanan & Minuman Sehat</li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 hover:border-teal-300 transition">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black">Level 2</span>
              <h3 className="text-xl font-black text-slate-900">Ekspresi Emosi & Hewan</h3>
              <p className="text-sm text-slate-600">
                Isyarat dunia satwa (ayam, kucing, kelinci), warna-warni alam, dan ekspresi perasaan anak (senang, bersemangat).
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 hover:border-teal-300 transition">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black">Level 3</span>
              <h3 className="text-xl font-black text-slate-900">Komunikasi Sosial & Adab</h3>
              <p className="text-sm text-slate-600">
                Isyarat sapaan sopan santun (tolong, terima kasih, maaf, permisi) serta aktivitas di lingkungan sekolah.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 hover:border-teal-300 transition">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black">Level 4</span>
              <h3 className="text-xl font-black text-slate-900">Kalimat Sederhana</h3>
              <p className="text-sm text-slate-600">
                Menggabungkan subjek dan predikat dalam isyarat, serta tanya-jawab interaktif bersama ustadzah.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 hover:border-teal-300 transition">
              <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-black">Level 5</span>
              <h3 className="text-xl font-black text-slate-900">Storytelling Mandiri</h3>
              <p className="text-sm text-slate-600">
                Bercerita kisah pendek dan dongeng islami menggunakan kombinasi ekspresi dan isyarat yang fasih.
              </p>
            </div>

            <div className="p-6 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50 to-emerald-50 space-y-4 flex flex-col justify-between">
              <div>
                <span className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-black">Kamus Isyarat Visual</span>
                <h3 className="text-xl font-black text-slate-900 mt-2">Cari Kosakata Bergambar</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Ketik kata apa saja (contoh: Ayam, Ibu, Makan) langsung muncul kartu gambar isyaratnya!
                </p>
              </div>
              <Link
                to={isAuthenticated ? '/sign-dictionary' : '/login'}
                className="w-full py-2.5 bg-teal-600 text-white font-extrabold rounded-xl hover:bg-teal-700 transition text-sm flex items-center justify-center gap-2"
              >
                Akses Kamus Gambar <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: LMS BAHASA INDONESIA & DIGITAL LIBRARY */}
      <section id="lms-indonesia" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-black uppercase tracking-wider">
              LMS Bahasa Indonesia & Digital Library
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Dari Pra Membaca Hingga Literasi Mandiri
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Didukung buku bacaan cerita bergambar PDF, lembar kerja (worksheet), dan slide presentasi yang bisa diulang di rumah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-black">1. Pra Membaca</span>
              <h3 className="text-xl font-black text-slate-900">Sensori Fonik & Vokal</h3>
              <p className="text-sm text-slate-600">
                Pengenalan bunyi huruf vokal A, I, U, E, O dan mencocokkan lambang huruf besar/kecil dengan kartu visual.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-black">2. Level 1 - 2</span>
              <h3 className="text-xl font-black text-slate-900">Suku Kata & Kata Makna</h3>
              <p className="text-sm text-slate-600">
                Membaca kombinasi konsonan-vokal (BA-JU, BO-LA, BU-KU) serta suku kata tertutup dengan intonasi ceria.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4 shadow-sm">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-black">3. Level 3 - 5</span>
              <h3 className="text-xl font-black text-slate-900">Kalimat & Cerita Pendek</h3>
              <p className="text-sm text-slate-600">
                Membaca struktur kalimat lengkap, pemahaman narasi bergambar, dan menuliskan catatan kegiatan harian.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: DIGITAL LIBRARY PREVIEW */}
      <section id="kamus-library" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-800 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase text-amber-300">
                Perpustakaan Bahan Ajar
              </span>
              <h2 className="text-3xl sm:text-4xl font-black">Digital Library Buku Bacaan & Lembar Kerja PDF</h2>
              <p className="text-teal-100 text-base font-medium leading-relaxed">
                Orang tua dan ustadzah dapat mengakses, membaca, dan mencetak lembar kerja kapan saja agar anak bisa terus mengulang materi di rumah tanpa batasan.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold">📄 PDF Printable</span>
                <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold">📖 Buku Cerita Fabel</span>
                <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold">📊 Slide PPT Materi</span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                to={isAuthenticated ? '/library' : '/login'}
                className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-base sm:text-lg rounded-2xl shadow-xl transition inline-flex items-center gap-2"
              >
                Masuk ke Library <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <span className="text-lg font-extrabold text-white">The Little Hijabi</span>
              <p className="text-xs text-slate-500">Platform Pembelajaran Inklusif & Jurnal Anak Terpadu.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500">© 2026 The Little Hijabi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
