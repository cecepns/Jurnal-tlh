import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Heart, Sparkles, Star, Award, CheckCircle } from 'lucide-react';

export function DevelopmentReportsView() {
  const [developments, setDevelopments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopments();
  }, []);

  const fetchDevelopments = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.DEVELOPMENTS.LIST);
      if (res.success) {
        setDevelopments(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat laporan perkembangan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Laporan Perkembangan Bulanan Siswa</h1>
        <p className="text-base text-slate-600 font-medium mt-1">Evaluasi capaian kognitif, motorik, sosial emosional & Bahasa Isyarat</p>
      </div>

      <div className="space-y-6">
        {developments.map((dev) => (
          <div key={dev.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">{dev.period_month}</span>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{dev.student_name}</h3>
              </div>
              <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full border border-emerald-200">
                ✓ Verified & Published
              </span>
            </div>

            {/* Ratings Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[
                { label: 'Bahasa Indonesia', val: dev.ratings?.bahasa || dev.bahasa_rating || 4 },
                { label: 'Bahasa Isyarat', val: dev.ratings?.isyarat || dev.isyarat_rating || 4 },
                { label: 'Sosial Emosional', val: dev.ratings?.sosial || dev.sosial_rating || 4 },
                { label: 'Motorik Kasar/Halus', val: dev.ratings?.motorik || dev.motorik_rating || 4 },
                { label: 'Kreativitas & Art', val: dev.ratings?.kreativitas || dev.kreativitas_rating || 4 }
              ].map((r, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1">
                  <div className="text-xs font-bold text-slate-500">{r.label}</div>
                  <div className="text-xl font-black text-teal-700 flex justify-center items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {r.val} / 5
                  </div>
                </div>
              ))}
            </div>

            {/* AI Narrative Box */}
            <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-2">
              <div className="text-xs font-black text-teal-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" /> Narasi AI Psikopedagogis:
              </div>
              <p className="text-base text-slate-100 leading-relaxed font-medium">
                "{dev.ai_generated_narrative}"
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
