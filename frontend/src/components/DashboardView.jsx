import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { SafeImage } from './SafeImage';
import {
  Users, GraduationCap, BookOpen, Award, Sparkles, Building
} from 'lucide-react';

export function DashboardView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userRole = user?.role || 'teacher';

  const [stats, setStats] = useState({
    schools: 0,
    students: 0,
    teachers: 0,
    classes: 0
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const [schoolsRes, studentsRes, teachersRes, classesRes] = await Promise.all([
          request.get(API_ENDPOINTS.SCHOOLS.LIST).catch(() => ({ data: [] })),
          request.get(API_ENDPOINTS.STUDENTS.LIST).catch(() => ({ data: [] })),
          request.get(API_ENDPOINTS.USERS.LIST, { role: 'teacher' }).catch(() => ({ data: [] })),
          request.get(API_ENDPOINTS.CLASSES.LIST).catch(() => ({ data: [] }))
        ]);

        setStats({
          schools: Array.isArray(schoolsRes.data) ? schoolsRes.data.length : 3,
          students: Array.isArray(studentsRes.data) ? studentsRes.data.length : 38,
          teachers: Array.isArray(teachersRes.data) ? teachersRes.data.length : 6,
          classes: Array.isArray(classesRes.data) ? classesRes.data.length : 2
        });
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      }
    };
    fetchLiveStats();
  }, []);

  if (userRole === 'super_admin') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Super Admin SaaS Dashboard</h1>
            <p className="text-base text-slate-600 font-medium mt-1">Ringkasan seluruh sekolah & langganan platform The Little Hijabi</p>
          </div>
          <span className="px-4 py-2 bg-purple-100 text-purple-800 font-extrabold text-sm rounded-xl border border-purple-200">
            👑 Super Admin Active
          </span>
        </div>

        {/* Global SaaS Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: 'Total Sekolah SaaS', count: `${stats.schools} Sekolah`, icon: Building, color: 'bg-purple-600' },
            { title: 'Total Siswa Terdaftar', count: `${stats.students} Siswa`, icon: GraduationCap, color: 'bg-indigo-600' },
            { title: 'Total Guru Active', count: `${stats.teachers} Guru`, icon: BookOpen, color: 'bg-emerald-600' },
            { title: 'Pendapatan Subscriptions', count: 'Rp 48.500.000', icon: Award, color: 'bg-amber-500' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
              <div className={`w-14 h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center shadow-lg shrink-0`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-semibold">{stat.title}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stat.count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (userRole === 'school_admin') {
    return (
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Dashboard Admin Sekolah</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Ringkasan operasional data TK The Little Hijabi</p>
        </div>

        {/* School Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Total Siswa</div>
            <div className="text-3xl font-black text-teal-600 mt-2">38 Siswa</div>
            <div className="text-sm text-slate-600 mt-1 font-medium">TK A & TK B</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Total Guru</div>
            <div className="text-3xl font-black text-teal-600 mt-2">6 Ustadzah</div>
            <div className="text-sm text-slate-600 mt-1 font-medium">Wali & Pendamping</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Total Rombel Kelas</div>
            <div className="text-3xl font-black text-teal-600 mt-2">2 Kelas</div>
            <div className="text-sm text-slate-600 mt-1 font-medium">Al Fatih & Ar Razi</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-sm font-bold text-slate-500">Laporan Hari Ini</div>
            <div className="text-3xl font-black text-emerald-600 mt-2">100% Published</div>
            <div className="text-sm text-slate-600 mt-1 font-medium">Semua kelas terisi</div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'principal') {
    return (
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Monitoring Kepala Sekolah</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Approval & Pengawasan Laporan Perkembangan Siswa</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-extrabold text-slate-900 text-lg">Progres Laporan Harian Kelas Hari Ini</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-base font-bold mb-2">
                <span>TK A - Al Fatih (Bu Ani, S.Pd)</span>
                <span className="text-emerald-600 font-black">100% Published</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-base font-bold mb-2">
                <span>TK B - Ar Razi (Bu Siti, S.Pd)</span>
                <span className="text-teal-600 font-black">80% Draft Review</span>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (userRole === 'teacher') {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <span className="text-base font-extrabold text-teal-600 block">Selamat Pagi, Bu Ani, S.Pd 👋</span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Wali Kelas TK A - Al Fatih (18 Siswa)</h1>
            <p className="text-base text-slate-600 font-medium">Buat laporan harian & narasi perkembangan siswa dengan bantuan AI</p>
          </div>

          <button
            onClick={() => navigate('/daily-report')}
            className="px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white text-base font-black rounded-2xl shadow-xl shadow-teal-600/30 transition flex items-center gap-3 shrink-0"
          >
            <BookOpen className="w-5 h-5" /> + Buat Laporan Hari Ini
          </button>
        </div>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/ai-generator')}
            className="p-8 bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-3xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition space-y-4"
          >
            <div className="w-14 h-14 bg-teal-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 text-xl">✨ AI Narrative Report</h3>
            <p className="text-base text-slate-600 font-medium">Susun narasi deskriptif perkembangan anak otomatis dalam hitungan detik.</p>
          </div>

          <div
            onClick={() => navigate('/students')}
            className="p-8 bg-white border border-slate-200 rounded-3xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition space-y-4"
          >
            <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 text-xl">Daftar Siswa & Portfolio</h3>
            <p className="text-base text-slate-600 font-medium">Lihat rekam jejak digital & galeri foto 18 anak TK A.</p>
          </div>

          <div
            onClick={() => navigate('/daily-report')}
            className="p-8 bg-white border border-slate-200 rounded-3xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition space-y-4"
          >
            <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-black text-slate-900 text-xl">Upload Foto & Tag Siswa</h3>
            <p className="text-base text-slate-600 font-medium">Upload foto aktivitas sekali, otomatis terisi ke portfolio anak.</p>
          </div>
        </div>
      </div>
    );
  }

  // Parent View Dashboard
  return (
    <div className="space-y-8">
      {/* Student Profile Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <SafeImage
            src="https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=200"
            alt="Aisyah"
            isAvatar={true}
            fallbackText="Aisyah"
            className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-lg shrink-0"
          />
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-teal-100">
              <GraduationCap className="w-4 h-4" /> TK A - Al Fatih
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">Aisyah Putri Humaira</h1>
            <p className="text-sm font-semibold text-teal-100">Wali Kelas: Bu Ani, S.Pd (Ustadzah)</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/learning')}
          className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-base rounded-2xl shadow-lg transition flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" /> Buka LMS & Kuis Anak
        </button>
      </div>

      {/* Daily Activity Timeline */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="font-black text-slate-900 text-xl flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-teal-600" /> Aktivitas Terbaru Hari Ini
          </h2>
          <span className="px-3 py-1.5 text-sm font-bold bg-emerald-100 text-emerald-800 rounded-xl">
            Hari Ini
          </span>
        </div>

        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 text-lg">📚 Mengenal Hewan & Bahasa Isyarat</h3>
          <p className="text-base text-slate-700 leading-relaxed font-medium">
            Hari ini Aisyah belajar mengenal nama-nama hewan peliharaan dalam Bahasa Indonesia dan Bahasa Isyarat sederhana (Kucing, Kelinci, Burung). Aisyah sangat antusias dan berani maju di depan kelas!
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
            <SafeImage src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400" alt="Foto 1" className="w-full h-36 rounded-2xl object-cover border border-slate-200 shadow-sm" />
            <SafeImage src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400" alt="Foto 2" className="w-full h-36 rounded-2xl object-cover border border-slate-200 shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
