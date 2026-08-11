import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, ShieldCheck, Heart, BookOpen, GraduationCap, Users,
  Building, ArrowRight, CheckCircle2, Zap, PlayCircle, Menu, X
} from 'lucide-react';
import logo from '../assets/logo.png';

export function LandingPage() {
  const navigate = useNavigate();
  const { loginAsRole } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleQuickDemo = (roleKey) => {
    loginAsRole(roleKey);
    setIsMobileMenuOpen(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-teal-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="The Little Hijabi" className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-2xl shadow-sm ring-2 ring-teal-500/20" />
            <div className="min-w-0">
              <span className="text-lg sm:text-xl font-black text-teal-700 tracking-tight block leading-tight truncate">The Little Hijabi</span>
              <span className="hidden sm:block text-[11px] font-bold text-slate-500 tracking-wide uppercase truncate">Child Progress & Inclusivity Platform</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-extrabold text-slate-600 text-sm tracking-wide">
            <a href="#fitur" className="hover:text-teal-600 transition">Fitur Unggulan</a>
            <a href="#solusi" className="hover:text-teal-600 transition">Solusi Role</a>
            <a href="#statistik" className="hover:text-teal-600 transition">Statistik</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => handleQuickDemo('teacher')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-teal-600 text-teal-700 font-extrabold text-sm hover:bg-teal-50 transition shadow-xs"
            >
              <Zap className="w-4 h-4 text-teal-600" /> Demo Langsung
            </button>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 transition flex items-center gap-2"
            >
              Masuk / Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/login"
              className="px-3.5 py-2 rounded-xl bg-teal-600 text-white font-extrabold text-xs shadow-md flex items-center gap-1"
            >
              Masuk
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
                href="#fitur"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition"
              >
                ✨ Fitur Unggulan
              </a>
              <a
                href="#solusi"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition"
              >
                👥 Solusi Role
              </a>
              <a
                href="#statistik"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-teal-50 hover:text-teal-700 transition"
              >
                📊 Statistik Platform
              </a>
            </nav>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={() => handleQuickDemo('teacher')}
                className="w-full py-3 rounded-xl border-2 border-teal-600 text-teal-700 font-black text-sm flex items-center justify-center gap-2 bg-teal-50/50"
              >
                <Zap className="w-4 h-4 text-teal-600" /> Demo Langsung Guru
              </button>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2"
              >
                Masuk / Login Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-teal-100/50 via-emerald-50/30 to-transparent blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-sm font-bold shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Platform Pemantauan Anak & LMS Inklusif Berbasis AI #1</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight tracking-tight">
              Pantau Perkembangan Anak Lebih <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800">Mudah, Terstruktur & Inklusif</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              Menghubungkan Kepala Sekolah, Guru, Orang Tua, dan Anak dalam satu ekosistem digital cerdas. Dilengkapi Generator Laporan AI, Pembelajaran Bahasa Isyarat, dan Portfolio Rekam Jejak Digital.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-lg shadow-xl shadow-teal-600/30 hover:scale-[1.02] transition flex items-center justify-center gap-3"
              >
                Masuk ke Aplikasi <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={() => handleQuickDemo('parent')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 text-slate-800 font-bold text-lg shadow-md hover:border-teal-300 transition flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5 text-teal-600" /> Lihat Demo Orang Tua
              </button>
            </div>

            {/* Quick Role Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-slate-600">
              <span className="text-slate-400">Pilih Akses Peran:</span>
              <button onClick={() => handleQuickDemo('super_admin')} className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 shadow-sm transition">👑 Super Admin</button>
              <button onClick={() => handleQuickDemo('school_admin')} className="px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 shadow-sm transition">🏫 Admin Sekolah</button>
              <button onClick={() => handleQuickDemo('principal')} className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 shadow-sm transition">🎓 Kepala Sekolah</button>
              <button onClick={() => handleQuickDemo('teacher')} className="px-3 py-1.5 bg-white border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 shadow-sm transition">👩‍🏫 Guru</button>
              <button onClick={() => handleQuickDemo('parent')} className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 shadow-sm transition">👨‍👩‍👧 Orang Tua</button>
              <button onClick={() => handleQuickDemo('student')} className="px-3 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 shadow-sm transition">👧 Siswa</button>
            </div>
          </div>

          {/* Hero Banner Mockup */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            <div className="p-3 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-700 rounded-3xl shadow-2xl">
              <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="ml-2 text-sm font-bold text-slate-500">Dashboard The Little Hijabi v2.0</span>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full">System Live</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-teal-50/80 rounded-2xl border border-teal-100 space-y-2">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold">🤖</div>
                    <h3 className="font-extrabold text-slate-800 text-base">AI Report Generator</h3>
                    <p className="text-sm text-slate-600">Buat narasi perkembangan harian & bulanan otomatis dengan 1 klik.</p>
                  </div>
                  <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-100 space-y-2">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold">🤟</div>
                    <h3 className="font-extrabold text-slate-800 text-base">LMS Bahasa Isyarat</h3>
                    <p className="text-sm text-slate-600">Modul belajar inklusif interaktif dengan kuis & animasi anak.</p>
                  </div>
                  <div className="p-5 bg-indigo-50/80 rounded-2xl border border-indigo-100 space-y-2">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold">📸</div>
                    <h3 className="font-extrabold text-slate-800 text-base">Digital Portfolio</h3>
                    <p className="text-sm text-slate-600">Foto & galeri perkembangan anak tersimpan aman real-time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section id="statistik" className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-teal-700">50+</div>
              <div className="text-sm sm:text-base font-semibold text-slate-600">Sekolah Mitra SaaS</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">12,500+</div>
              <div className="text-sm sm:text-base font-semibold text-slate-600">Laporan Perkembangan AI</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-amber-500">99.4%</div>
              <div className="text-sm sm:text-base font-semibold text-slate-600">Kepuasan Orang Tua</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600">100%</div>
              <div className="text-sm sm:text-base font-semibold text-slate-600">Ramah Inklusivitas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest">FITUR UNGGULAN APLIKASI</h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900 leading-snug">
              Solusi Lengkap Manajemen PAUD, TK & Sekolah Inklusif
            </p>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Dirancang khusus untuk mempermudah guru dan memberikan transparansi penuh bagi orang tua.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                color: 'bg-teal-600',
                title: 'AI Narrative Generator',
                desc: 'Membantu guru menyusun narasi psikopedagogis perkembangan anak berdasarkan aspek kognitif, motorik, dan sosial emosional secara otomatis.'
              },
              {
                icon: BookOpen,
                color: 'bg-indigo-600',
                title: 'LMS Inklusif & Bahasa Isyarat',
                desc: 'Modul digital interaktif dengan kamus visual Bahasa Isyarat, cerita anak islami, dan kuis edukatif ramah disabilitas.'
              },
              {
                icon: Heart,
                color: 'bg-rose-500',
                title: 'Timeline & Portfolio Digital',
                desc: 'Dokumentasikan momen belajar anak dalam bentuk foto, catatan Ustadzah, dan rekaman capaian bulanan yang dapat diakses orang tua.'
              },
              {
                icon: Users,
                color: 'bg-emerald-600',
                title: 'Pesan & Komunikasi Guru-OrangTua',
                desc: 'Fitur interaksi langsung untuk diskusi perkembangan anak, pemberitahuan kegiatan sekolah, dan laporan harian.'
              },
              {
                icon: Building,
                color: 'bg-purple-600',
                title: 'Multi-Tenant SaaS Management',
                desc: 'Dukungan pengelolaan multi-sekolah untuk yayasan, pengaturan paket langganan, manajemen guru, dan siswa secara independen.'
              },
              {
                icon: ShieldCheck,
                color: 'bg-amber-500',
                title: 'Monitoring Kepala Sekolah',
                desc: 'Dashboard pengawasan terpusat bagi Kepala Sekolah untuk melakukan verifikasi, validasi, dan rilis laporan harian.'
              }
            ].map((feat, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4">
                <div className={`w-14 h-14 ${feat.color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
                  <feat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{feat.title}</h3>
                <p className="text-base text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Solutions Section */}
      <section id="solusi" className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-black text-teal-600 uppercase tracking-widest">AKSES BERDASARKAN PERAN</h2>
            <p className="text-3xl sm:text-4xl font-black text-slate-900">
              Pengalaman Terbaik untuk Setiap Pengguna
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-teal-200 shadow-md space-y-4">
              <span className="px-3.5 py-1.5 bg-teal-100 text-teal-800 font-extrabold text-sm rounded-full inline-block">Untuk Guru & Ustadzah</span>
              <h3 className="text-2xl font-bold text-slate-900">Hemat Waktu Administrasi</h3>
              <ul className="space-y-3 text-base text-slate-600">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" /> Input laporan harian 1x klik per kelas</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" /> AI bantu buat narasi deskriptif</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" /> Upload foto portfolio aktivitas</li>
              </ul>
              <button onClick={() => handleQuickDemo('teacher')} className="w-full py-3 mt-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition">Coba Akses Guru</button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-md space-y-4">
              <span className="px-3.5 py-1.5 bg-amber-100 text-amber-800 font-extrabold text-sm rounded-full inline-block">Untuk Orang Tua</span>
              <h3 className="text-2xl font-bold text-slate-900">Transparansi Perkembangan</h3>
              <ul className="space-y-3 text-base text-slate-600">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Pantau aktivitas anak real-time</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Galeri foto & catatan harian guru</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0" /> Modul belajar inklusif di rumah</li>
              </ul>
              <button onClick={() => handleQuickDemo('parent')} className="w-full py-3 mt-4 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition">Coba Akses Orang Tua</button>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-indigo-200 shadow-md space-y-4">
              <span className="px-3.5 py-1.5 bg-indigo-100 text-indigo-800 font-extrabold text-sm rounded-full inline-block">Untuk Sekolah & Kepsek</span>
              <h3 className="text-2xl font-bold text-slate-900">Pengawasan & Manajemen</h3>
              <ul className="space-y-3 text-base text-slate-600">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" /> Approval laporan terpusat</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" /> Kelola data guru, siswa & kelas</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" /> Laporan statistik perkembangan</li>
              </ul>
              <button onClick={() => handleQuickDemo('principal')} className="w-full py-3 mt-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition">Coba Akses Kepsek</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black">Siap Mentransformasi Sekolah & Pembelajaran Anak?</h2>
          <p className="text-lg sm:text-xl text-teal-100 font-medium">
            Bergabunglah dengan puluhan TK & Sekolah Inklusif yang telah menggunakan The Little Hijabi Platform.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-lg rounded-2xl shadow-xl transition"
            >
              Masuk Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <span className="text-lg font-extrabold text-white">The Little Hijabi</span>
              <p className="text-xs text-slate-500">© 2026 The Little Hijabi Platform. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
