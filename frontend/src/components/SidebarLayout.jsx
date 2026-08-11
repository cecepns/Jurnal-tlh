import React, { useState } from 'react';
import { useLocation, useNavigate, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from './SafeImage';
import {
  LayoutDashboard, Users, GraduationCap, Heart, BookOpen,
  Award, MessageSquare, Bell, LogOut, Menu, X, Sparkles, Building, ChevronRight
} from 'lucide-react';
import logo from '../assets/logo.png';

export function SidebarLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentRole = user?.role || 'teacher';

  const roleMenus = {
    super_admin: [
      { path: '/dashboard', label: 'Dashboard Platform', icon: LayoutDashboard },
      { path: '/schools', label: 'Kelola Sekolah SaaS', icon: Building },
      { path: '/teachers', label: 'Kelola Admin & Guru', icon: Users },
      { path: '/subscriptions', label: 'Paket & Subscription', icon: Award },
    ],
    school_admin: [
      { path: '/dashboard', label: 'Dashboard Sekolah', icon: LayoutDashboard },
      { path: '/teachers', label: 'Kelola Data Guru', icon: Users },
      { path: '/students', label: 'Kelola Data Siswa', icon: GraduationCap },
      { path: '/parents', label: 'Data Orang Tua', icon: Heart },
      { path: '/classes', label: 'Kelola Kelas Rombel', icon: BookOpen },
    ],
    principal: [
      { path: '/dashboard', label: 'Monitoring Kepsek', icon: LayoutDashboard },
      { path: '/daily-reports', label: 'Monitoring Laporan', icon: BookOpen },
      { path: '/development', label: 'Laporan Perkembangan', icon: Heart },
    ],
    teacher: [
      { path: '/dashboard', label: 'Dashboard Guru', icon: LayoutDashboard },
      { path: '/daily-report', label: '+ Buat Laporan Harian', icon: BookOpen },
      { path: '/ai-generator', label: '✨ AI Report Generator', icon: Sparkles },
      { path: '/learning', label: 'Modul Bahasa Isyarat', icon: BookOpen },
      { path: '/quizzes', label: 'Kuis & Games Interaktif', icon: Award },
      { path: '/students', label: 'Daftar Siswa & Portfolio', icon: GraduationCap },
      { path: '/development', label: 'Perkembangan Bulanan', icon: Heart },
    ],
    parent: [
      { path: '/dashboard', label: 'Timeline Anak Hari Ini', icon: LayoutDashboard },
      { path: '/development', label: 'Laporan Perkembangan', icon: Heart },
      { path: '/messaging', label: 'Pesan & Tanya Ustadzah', icon: MessageSquare },
    ],
    student: [
      { path: '/dashboard', label: 'Aktivitas Belajar Saya', icon: LayoutDashboard },
      { path: '/learning', label: 'Modul Bahasa Isyarat', icon: BookOpen },
      { path: '/quizzes', label: 'Kuis & Games Interaktif', icon: Award },
    ]
  };

  const roleLabels = {
    super_admin: '👑 Super Admin Platform',
    school_admin: '🏫 Admin Sekolah',
    principal: '🎓 Kepala Sekolah',
    teacher: '👩‍🏫 Guru Wali Kelas',
    parent: '👨‍👩‍👧 Orang Tua Siswa',
    student: '👧 Siswa'
  };

  const navItems = roleMenus[currentRole] || roleMenus['teacher'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 font-sans">
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out shadow-lg lg:shadow-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex-1 flex flex-col min-h-0 overflow-y-auto">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between gap-3 pb-6 border-b border-slate-200">
            <Link to="/dashboard" className="flex items-center gap-3">
              <img src={logo} alt="The Little Hijabi" className="w-11 h-11 object-contain rounded-2xl shadow-sm ring-2 ring-teal-500/20" />
              <div>
                <h1 className="font-black text-lg text-teal-700 leading-tight tracking-tight">The Little Hijabi</h1>
                <span className="text-xs font-bold text-slate-400 block mt-0.5">Child Progress Platform</span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Active Role Info Badge */}
          <div className="mt-5 p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider block">Role Akses Aktif</span>
              <span className="text-sm font-black text-teal-700 block mt-0.5">{roleLabels[currentRole] || currentRole}</span>
            </div>
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5 flex-1">
            <div className="px-2 pb-2 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-left">Navigasi Utama</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200
                    ${isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                  `}
                >
                  <div className="flex items-center gap-3 text-left flex-1 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="text-left truncate">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white/80 shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <SafeImage
              src={user?.avatar_url}
              alt={user?.name}
              isAvatar={true}
              fallbackText={user?.name}
              className="w-11 h-11 rounded-xl border-2 border-teal-200 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-extrabold text-slate-900 truncate">{user?.name || 'User Demo'}</h4>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'user@littlehijabi.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-sm rounded-xl transition shadow-sm"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 focus:outline-none border border-slate-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 hidden sm:block">
                TK The Little Hijabi • Tahun Ajaran 2026/2027
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition border border-slate-200">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </header>

        {/* Dynamic Page Content via React Router Outlet */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
