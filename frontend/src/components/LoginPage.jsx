import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, defaultDemoUsers } from '../context/AuthContext';
import { SafeImage } from './SafeImage';
import {
  Lock, Mail, ArrowRight, CheckCircle2,
  Building, GraduationCap, Heart, BookOpen, ShieldCheck, ArrowLeft, Eye, EyeOff, Award
} from 'lucide-react';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginAsRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'super_admin',
      roleName: 'Super Admin',
      name: 'Super Admin SaaS',
      email: 'superadmin@littlehijabi.com',
      avatar: defaultDemoUsers.super_admin.avatar_url,
      icon: ShieldCheck,
    },
    {
      role: 'school_admin',
      roleName: 'Admin Sekolah',
      name: 'Ustadzah Sarah',
      email: 'admin.tk@littlehijabi.com',
      avatar: defaultDemoUsers.school_admin.avatar_url,
      icon: Building,
    },
    {
      role: 'principal',
      roleName: 'Kepala Sekolah',
      name: 'Bunda Maryam, M.Pd',
      email: 'kepsek@littlehijabi.com',
      avatar: defaultDemoUsers.principal.avatar_url,
      icon: Award,
    },
    {
      role: 'teacher',
      roleName: 'Guru (Wali Kelas)',
      name: 'Bu Ani, S.Pd',
      email: 'guru.ani@littlehijabi.com',
      avatar: defaultDemoUsers.teacher.avatar_url,
      icon: BookOpen,
    },
    {
      role: 'parent',
      roleName: 'Orang Tua Siswa',
      name: 'Bapak Budi Santoso',
      email: 'ortu.budi@littlehijabi.com',
      avatar: defaultDemoUsers.parent.avatar_url,
      icon: Heart,
    },
    {
      role: 'student',
      roleName: 'Siswa / Anak',
      name: 'Aisyah Putri Humaira',
      email: 'aisyah@littlehijabi.com',
      avatar: defaultDemoUsers.student.avatar_url,
      icon: GraduationCap,
    }
  ];

  const handleSelectDemo = async (acc) => {
    setEmail(acc.email);
    setPassword('password123');
    setLoading(true);

    try {
      const loggedUser = await loginAsRole(acc.role);
      toast.success(`🎉 Selamat datang, ${loggedUser.name} (${acc.roleName})!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error('Gagal terhubung ke API backend login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Silakan isi email dan kata sandi!');
      return;
    }

    setLoading(true);
    try {
      const matched = demoAccounts.find(a => a.email.toLowerCase() === email.toLowerCase());
      const loggedUser = await loginWithApi({ email, password, role: matched?.role });
      toast.success(`🎉 Berhasil masuk sebagai ${loggedUser.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Gagal login via API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand Visual Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-200 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Landing Page
            </Link>

            <div className="flex items-center gap-3 pt-4">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain bg-white rounded-2xl p-1 shadow-md" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white leading-none">The Little Hijabi</h1>
                <p className="text-xs font-bold text-teal-200 mt-1">Child Progress & LMS Platform</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h2 className="text-2xl sm:text-3xl font-black leading-snug">
                Portal Masuk Pengguna Sistem
              </h2>
              <p className="text-base text-teal-100/90 leading-relaxed font-medium">
                Satu akun terintegrasi untuk Kepala Sekolah, Admin, Guru Wali Kelas, Orang Tua, dan Anak Siswa.
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-10 pt-8 border-t border-teal-600/50 mt-8">
            <div className="flex items-center gap-3 text-sm font-semibold text-teal-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Otentikasi Akun Resmi & Aman</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-teal-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Dukungan AI Generator & Multi-Role Menu</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form & Quick Demo Selector */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8 bg-white">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Masuk Akun</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Silakan masukkan email atau pilih login demo role di bawah</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@littlehijabi.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-1.5">Kata Sandi (Password)</label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base rounded-xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses Masuk...
                  </span>
                ) : (
                  <>Masuk ke Sistem <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Atau Coba Akses Instan per Role (1-Click Demo Login)
              </span>
            </div>

            {/* Quick Demo Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectDemo(acc)}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 rounded-2xl text-left transition group shadow-sm"
                  >
                    <SafeImage
                      src={acc.avatar}
                      alt={acc.name}
                      isAvatar={true}
                      fallbackText={acc.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-slate-900 group-hover:text-teal-700 truncate">{acc.roleName}</span>
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0" />
                      </div>
                      <span className="text-xs text-slate-500 block truncate">{acc.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-sm font-bold text-teal-700 hover:underline">
              ← Kembali ke Beranda Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
