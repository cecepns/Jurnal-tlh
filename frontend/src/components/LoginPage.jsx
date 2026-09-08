import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock, Mail, ArrowRight, CheckCircle2,
  ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';

export function LoginPage() {
  const navigate = useNavigate();
  const { loginWithApi } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Silakan isi email dan kata sandi!');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await loginWithApi({ email, password });
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
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
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

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8 bg-white">
          <div>
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Masuk Akun</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                Silakan masukkan email dan kata sandi akun Anda untuk melanjutkan
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-extrabold text-slate-700 mb-1.5">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@littlehijabi.com"
                    required
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
                    required
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
                className="w-full py-3.5 px-6 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-base rounded-xl shadow-lg shadow-teal-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
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

            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 space-y-1">
              <p className="font-bold text-slate-700">Informasi Akses:</p>
              <p>Akun pengguna didaftarkan oleh Administrator Sekolah atau Pengelola Sistem The Little Hijabi.</p>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link to="/" className="text-sm font-bold text-teal-700 hover:underline">
              ← Kembali ke Beranda Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
