import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from './Modal';
import { SafeImage } from './SafeImage';
import toast from 'react-hot-toast';
import { Heart, Search, Phone, Mail, UserPlus } from 'lucide-react';

export function ParentsView() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    child_name: 'Aisyah Putri Humaira'
  });

  useEffect(() => {
    fetchParents();
  }, [search]);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, { role: 'parent', search });
      if (res.success) {
        setParents(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data orang tua');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Nama dan Email orang tua wajib diisi!');
      return;
    }

    try {
      const res = await request.post(API_ENDPOINTS.USERS.CREATE, { ...formData, role: 'parent' });
      if (res.success) {
        toast.success('🎉 Data Orang Tua Berhasil Ditambahkan!');
        setParents([res.data, ...parents]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', child_name: 'Aisyah Putri Humaira' });
      }
    } catch (err) {
      toast.error('Gagal menambah orang tua');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Data Orang Tua / Wali Siswa</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Daftar wali murid terdaftar TK The Little Hijabi</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 text-base font-black rounded-2xl shadow-lg transition shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          + Tambah Orang Tua Baru
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama orang tua atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
        <div className="text-base text-slate-600 font-bold">
          Total Wali: <span className="font-black text-amber-600">{parents.length} Orang</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parents.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <SafeImage
                src={p.avatar_url}
                alt={p.name}
                isAvatar={true}
                fallbackText={p.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-200 shrink-0"
              />
              <div>
                <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">Wali Murid Aisyah</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-sm text-slate-700 font-medium">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-amber-500" /> {p.email}</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-amber-500" /> {p.phone || '0812-3456-7890'}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Parent */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Data Orang Tua Baru"
      >
        <form onSubmit={handleCreateParent} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Lengkap Orang Tua / Wali *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Bapak Budi Santoso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Alamat Email *</label>
            <input
              type="email"
              required
              placeholder="ortu@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nomor WhatsApp / HP</label>
            <input
              type="text"
              placeholder="08123456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-black bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl shadow-md"
            >
              Simpan Data Wali
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
