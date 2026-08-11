import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from './Modal';
import toast from 'react-hot-toast';
import { Search, Building, Plus, Phone, Mail, CheckCircle2, AlertCircle, Edit, Trash2 } from 'lucide-react';

export function SchoolsView() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    subscription_plan: 'Standard Growth'
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    subscription_plan: 'Standard Growth',
    status: 'active'
  });

  const handleOpenEditModal = (sch) => {
    setSelectedSchool(sch);
    setEditFormData({
      id: sch.id,
      name: sch.name || '',
      code: sch.code || '',
      address: sch.address || '',
      phone: sch.phone || '',
      email: sch.email || '',
      subscription_plan: sch.subscription_plan || 'Standard Growth',
      status: sch.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateSchool = async (e) => {
    e.preventDefault();
    if (!editFormData.name || !editFormData.email) {
      toast.error('Nama dan Email sekolah wajib diisi!');
      return;
    }

    try {
      const res = await request.put(API_ENDPOINTS.SCHOOLS.UPDATE(editFormData.id), editFormData);
      if (res.success) {
        toast.success(`🎉 Data sekolah ${editFormData.name} berhasil diperbarui!`);
        setSchools(schools.map(s => s.id === editFormData.id ? { ...s, ...editFormData } : s));
        setIsEditModalOpen(false);
      }
    } catch (err) {
      toast.error('Gagal memperbarui data sekolah');
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [search, statusFilter]);

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.SCHOOLS.LIST, { search, status: statusFilter });
      if (res.success) {
        setSchools(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data sekolah SaaS');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Nama dan Email sekolah wajib diisi!');
      return;
    }

    try {
      const res = await request.post(API_ENDPOINTS.SCHOOLS.CREATE, formData);
      if (res.success) {
        toast.success('🎉 Sekolah SaaS Baru Berhasil Ditambahkan!');
        setSchools([res.data, ...schools]);
        setIsModalOpen(false);
        setFormData({ name: '', code: '', address: '', phone: '', email: '', subscription_plan: 'Standard Growth' });
      }
    } catch (err) {
      toast.error('Gagal menambahkan sekolah baru');
    }
  };

  const handleDeleteSchool = async (id, name) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-base">Hapus langganan sekolah {name}?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await request.delete(API_ENDPOINTS.SCHOOLS.DELETE(id));
                setSchools(schools.filter(s => s.id !== id));
                toast.success(`Sekolah ${name} berhasil dihapus.`);
              } catch (err) {
                toast.error('Gagal menghapus sekolah');
              }
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white shadow-sm"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Kelola Sekolah SaaS (Super Admin)</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Daftar seluruh sekolah mitra & status paket langganan aktif</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-base font-black rounded-2xl shadow-lg shadow-purple-600/30 transition shrink-0"
        >
          <Plus className="w-5 h-5" />
          + Tambah Sekolah SaaS Baru
        </button>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500">Total Sekolah Mitra</div>
          <div className="text-3xl font-black text-purple-700 mt-2">{schools.length} Sekolah</div>
          <div className="text-sm text-slate-600 font-medium mt-1">Terdaftar aktif di platform</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500">Paket Enterprise Pro</div>
          <div className="text-3xl font-black text-teal-600 mt-2">
            {schools.filter(s => s.subscription_plan === 'Enterprise Pro').length} Sekolah
          </div>
          <div className="text-sm text-slate-600 font-medium mt-1">Rp 15.000.000 / thn</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="text-sm font-bold text-slate-500">Total Estimasi Revenue</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">Rp 28.500.000</div>
          <div className="text-sm text-slate-600 font-medium mt-1">Tahun Ajaran 2026</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau kode sekolah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-56 px-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif (Active)</option>
          <option value="inactive">Non-Aktif (Inactive)</option>
        </select>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-lg">Memuat data sekolah...</div>
        ) : schools.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Building className="w-16 h-16 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-lg">Tidak ada sekolah ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold text-sm uppercase tracking-wider">
                  <th className="py-4 px-6">Nama & Kode Sekolah</th>
                  <th className="py-4 px-6">Kontak</th>
                  <th className="py-4 px-6">Paket Subscription</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {schools.map((sch) => (
                  <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-lg border border-purple-200 shrink-0">
                          {sch.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-base">{sch.name}</div>
                          <div className="text-xs text-purple-700 font-bold uppercase tracking-wider mt-0.5">{sch.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-purple-600" /> {sch.email}</div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-purple-600" /> {sch.phone}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3.5 py-1.5 text-xs font-black bg-purple-50 text-purple-800 rounded-xl border border-purple-200">
                        {sch.subscription_plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl ${
                        sch.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {sch.status === 'active' ? '● Aktif' : '○ Non-Aktif'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(sch)}
                          className="text-sm text-purple-600 hover:text-purple-800 font-extrabold px-3 py-1.5 rounded-xl hover:bg-purple-50 transition inline-flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSchool(sch.id, sch.name)}
                          className="text-sm text-rose-600 hover:text-rose-800 font-extrabold px-3 py-1.5 rounded-xl hover:bg-rose-50 transition inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add School */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Sekolah SaaS Baru"
      >
        <form onSubmit={handleCreateSchool} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Sekolah / Yayasan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: TK Islam Bintang Kejora"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kode Unik Sekolah</label>
            <input
              type="text"
              placeholder="Contoh: TBK-JAKARTA"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Email Resmi Sekolah *</label>
            <input
              type="email"
              required
              placeholder="admin@sekolah.sch.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Pilih Paket Langganan SaaS</label>
            <select
              value={formData.subscription_plan}
              onChange={(e) => setFormData({ ...formData, subscription_plan: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="Starter Basic">Starter Basic (Rp 5.000.000 / thn)</option>
              <option value="Standard Growth">Standard Growth (Rp 8.500.000 / thn)</option>
              <option value="Enterprise Pro">Enterprise Pro (Rp 15.000.000 / thn)</option>
            </select>
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
              className="px-6 py-2.5 text-sm font-extrabold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md"
            >
              Simpan Sekolah SaaS
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit School */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Sekolah SaaS: ${selectedSchool?.name || ''}`}
      >
        <form onSubmit={handleUpdateSchool} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Sekolah / Yayasan *</label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kode Unik Sekolah</label>
            <input
              type="text"
              value={editFormData.code}
              onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Email Resmi Sekolah *</label>
            <input
              type="email"
              required
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nomor Telepon Kontak</label>
            <input
              type="text"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Paket Langganan SaaS</label>
            <select
              value={editFormData.subscription_plan}
              onChange={(e) => setEditFormData({ ...editFormData, subscription_plan: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="Starter Basic">Starter Basic (Rp 5.000.000 / thn)</option>
              <option value="Standard Growth">Standard Growth (Rp 8.500.000 / thn)</option>
              <option value="Enterprise Pro">Enterprise Pro (Rp 15.000.000 / thn)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Status Langganan</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="active">Aktif (Active)</option>
              <option value="inactive">Non-Aktif (Inactive)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
