import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { SafeImage } from './SafeImage';
import toast from 'react-hot-toast';
import { BookOpen, CheckCircle, Search } from 'lucide-react';

export function DailyReportsView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchReports();
  }, [search, statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.DAILY_REPORTS.LIST, { search, status: statusFilter });
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan harian');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReport = async (id, theme) => {
    try {
      const res = await request.put(API_ENDPOINTS.DAILY_REPORTS.APPROVE(id));
      if (res.success) {
        toast.success(`🎉 Laporan "${theme}" berhasil disetujui & dipublikasikan ke Orang Tua!`);
        setReports(reports.map(r => r.id === id ? { ...r, status: 'published' } : r));
      }
    } catch (err) {
      toast.error('Gagal menyetujui laporan');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Monitoring & Approval Laporan Harian (Kepala Sekolah)</h1>
        <p className="text-base text-slate-600 font-medium mt-1">Verifikasi dan publikasikan catatan harian kelas buatan ustadzah</p>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tema atau isi laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-56 px-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft Review Kepsek</option>
          <option value="published">Published (Dipublikasi)</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-lg">Memuat data laporan...</div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200">
            <BookOpen className="w-16 h-16 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-lg">Tidak ada laporan harian ditemukan.</p>
          </div>
        ) : (
          reports.map((rep) => (
            <div key={rep.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-md border border-teal-200">
                    {rep.class_name} • {rep.teacher_name}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">📚 {rep.theme}</h3>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">Subtema: {rep.subtheme} | Tanggal: {rep.report_date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-4 py-1.5 text-xs font-black rounded-xl border ${
                    rep.status === 'published' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                  }`}>
                    {rep.status === 'published' ? '✓ Published' : '⏳ Review Kepsek'}
                  </span>

                  {rep.status === 'draft' && (
                    <button
                      onClick={() => handleApproveReport(rep.id, rep.theme)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Publish
                    </button>
                  )}
                </div>
              </div>

              <p className="text-base text-slate-700 leading-relaxed font-medium">
                {rep.summary}
              </p>

              {rep.attachments && rep.attachments.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  {rep.attachments.map((att) => (
                    <SafeImage key={att.id} src={att.file_url} alt={att.file_name} className="w-full h-36 rounded-2xl object-cover border border-slate-200 shadow-xs" />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
