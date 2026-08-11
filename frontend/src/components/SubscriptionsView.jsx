import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Award, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export function SubscriptionsView() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.SUBSCRIPTIONS.LIST);
      if (res.success) {
        setPlans(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data paket langganan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Kelola Paket & Subscription (Super Admin)</h1>
        <p className="text-base text-slate-600 font-medium mt-1">Daftar paket harga langganan SaaS platform The Little Hijabi</p>
      </div>

      {/* Subscription Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-3xl border-2 border-purple-200 p-8 shadow-lg flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-black">
                <Award className="w-4 h-4" /> {plan.name}
              </div>
              <div className="text-3xl font-black text-slate-900">{plan.price}</div>
              <p className="text-sm font-semibold text-slate-500">Kapasitas Maksimal: {plan.max_students} Siswa</p>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="text-xs font-black text-purple-700 uppercase tracking-wider">Fitur Termasuk:</div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-base text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => toast.success(`Membuka pengaturan paket ${plan.name}`)}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-base rounded-2xl shadow-md transition"
              >
                Kelola Paket Harga
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
