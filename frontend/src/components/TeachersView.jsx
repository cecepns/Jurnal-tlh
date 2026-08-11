import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { SafeImage } from '../components/SafeImage';
import toast from 'react-hot-toast';
import { Search, UserPlus, Phone, Trash2 } from 'lucide-react';

export function TeachersView() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher'
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchTeachers();
  }, [page, limit, debouncedSearch]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, {
        page,
        limit,
        search: debouncedSearch,
        role: 'teacher'
      });
      if (res.success) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      toast.error('Gagal mengambil data guru.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Mohon isi nama dan email!');
      return;
    }

    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone || '08123456789',
      role: 'teacher',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    };

    setUsers([newUser, ...users]);
    toast.success('Guru baru berhasil ditambahkan!');
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', role: 'teacher' });
  };

  const handleDeleteTeacher = (name) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-base">Hapus data guru {name}?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              setUsers(users.filter(u => u.name !== name));
              toast.success(`Data guru ${name} berhasil dihapus.`);
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
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Kelola Data Guru</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Daftar ustadzah dan pengajar TK The Little Hijabi</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-base font-black rounded-2xl shadow-lg shadow-teal-600/30 transition shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          + Tambah Guru Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau email guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
          />
        </div>
        <div className="text-base text-slate-600 font-bold">
          Total Guru: <span className="font-black text-teal-700">{users.length} Ustadzah</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-lg">Memuat data guru...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <UserPlus className="w-16 h-16 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-lg">Tidak ada data guru ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold text-sm uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Guru</th>
                  <th className="py-4 px-6">Kontak</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <SafeImage
                          src={teacher.avatar_url}
                          alt={teacher.name}
                          isAvatar={true}
                          fallbackText={teacher.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-base">{teacher.name}</div>
                          <div className="text-sm text-slate-500 font-medium">{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Phone className="w-4 h-4 text-teal-600" />
                        {teacher.phone || '08123456789'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3.5 py-1.5 text-xs font-extrabold bg-teal-100 text-teal-800 rounded-xl border border-teal-200">
                        Wali Kelas
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteTeacher(teacher.name)}
                        className="text-sm text-rose-600 hover:text-rose-800 font-extrabold px-3 py-1.5 rounded-xl hover:bg-rose-50 transition inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="border-t border-slate-200 px-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={setLimit}
          />
        </div>
      </div>

      {/* Modal Create Teacher */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Guru Baru"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Ustadzah Siti Fatimah, S.Pd"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Alamat Email *</label>
            <input
              type="email"
              required
              placeholder="guru@littlehijabi.sch.id"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nomor WhatsApp / HP</label>
            <input
              type="text"
              placeholder="08123456789"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
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
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
            >
              Simpan Data Guru
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
