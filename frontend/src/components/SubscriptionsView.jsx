import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from './Modal';
import toast from 'react-hot-toast';
import { Award, CheckCircle2, Edit } from 'lucide-react';

export function SubscriptionsView() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    max_students: 50,
    featuresStr: ''
  });

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

  const handleOpenEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      max_students: plan.max_students,
      featuresStr: plan.features ? plan.features.join('\n') : ''
    });
    setIsModalOpen(true);
  };

  const handleSavePlan = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Nama dan Harga Paket wajib diisi!');
      return;
    }

    const updatedFeatures = formData.featuresStr
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    setPlans(prev => prev.map(p => p.id === selectedPlan.id ? {
      ...p,
      name: formData.name,
      price: formData.price,
      max_students: Number(formData.max_students),
      features: updatedFeatures.length > 0 ? updatedFeatures : p.features
    } : p));

    toast.success(`🎉 Paket ${formData.name} berhasil diperbarui!`);
    setIsModalOpen(false);
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
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-black">
                  <Award className="w-4 h-4" /> {plan.name}
                </div>
                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-xl transition"
                  title="Edit Paket"
                >
                  <Edit className="w-5 h-5" />
                </button>
              </div>
              <div className="text-3xl font-black text-slate-900">{plan.price}</div>
              <p className="text-sm font-semibold text-slate-500">Kapasitas Maksimal: {plan.max_students} Siswa</p>

              <div className="border-t border-slate-200 pt-4 space-y-3">
                <div className="text-xs font-black text-purple-700 uppercase tracking-wider">Fitur Termasuk:</div>
                {plan.features?.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-base text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(plan)}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-base rounded-2xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" /> Edit Paket Harga
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Edit Subscription Plan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit Paket ${selectedPlan?.name || ''}`}
      >
        <form onSubmit={handleSavePlan} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Paket *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Harga Paket (Teks) *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rp 8.500.000 / tahun"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kapasitas Maksimal Siswa</label>
            <input
              type="number"
              value={formData.max_students}
              onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Fitur Termasuk (1 fitur per baris)</label>
            <textarea
              rows={4}
              value={formData.featuresStr}
              onChange={(e) => setFormData({ ...formData, featuresStr: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
              placeholder="Dashboard Admin&#10;Laporan Harian Siswa"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

