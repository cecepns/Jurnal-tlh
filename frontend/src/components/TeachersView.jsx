import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { SafeImage } from '../components/SafeImage';
import toast from 'react-hot-toast';
import { Search, UserPlus, Phone, Trash2, Edit } from 'lucide-react';

export function TeachersView() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    school_id: ''
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    id: null,
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    school_id: ''
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchUsers();
    if (isSuperAdmin) {
      fetchSchools();
    }
  }, [page, limit, debouncedSearch, roleFilter]);

  const fetchSchools = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SCHOOLS.LIST);
      if (res.success) {
        setSchools(res.data);
      }
    } catch (err) {
      console.error('Failed to load schools list', err);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: debouncedSearch
      };
      if (roleFilter) {
        params.role = roleFilter;
      } else if (!isSuperAdmin) {
        params.role = 'teacher';
      }

      const res = await request.get(API_ENDPOINTS.USERS.LIST, params);
      if (res.success) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages);
        }
      }
    } catch (err) {
      toast.error('Gagal mengambil data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Mohon isi nama dan email!');
      return;
    }

    try {
      const res = await request.post(API_ENDPOINTS.USERS.CREATE, formData);
      if (res.success) {
        toast.success(`🎉 ${formData.role === 'school_admin' ? 'Admin Sekolah' : 'Guru'} berhasil ditambahkan!`);
        setUsers([res.data, ...users]);
        setIsModalOpen(false);
        setFormData({ name: '', email: '', phone: '', role: 'teacher', school_id: '' });
      }
    } catch (err) {
      toast.error('Gagal menambahkan akun baru.');
    }
  };

  const handleOpenEdit = (u) => {
    setSelectedUser(u);
    setEditFormData({
      id: u.id,
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || 'teacher',
      school_id: u.school_id || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (e) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => u.id === editFormData.id ? { ...u, ...editFormData } : u));
    toast.success(`🎉 Data ${editFormData.name} berhasil diperbarui!`);
    setIsEditModalOpen(false);
  };

  const handleDeleteUser = (name, id) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-base">Hapus akun {name}?</p>
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
              setUsers(users.filter(u => u.id !== id && u.name !== name));
              toast.success(`Akun ${name} berhasil dihapus.`);
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
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isSuperAdmin ? 'Kelola Admin Sekolah & Ustadzah Guru' : 'Kelola Data Guru'}
          </h1>
          <p className="text-base text-slate-600 font-medium mt-1">
            {isSuperAdmin
              ? 'Daftar seluruh akun Admin Sekolah & Guru TK mitra SaaS'
              : 'Daftar ustadzah dan pengajar TK The Little Hijabi'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-base font-black rounded-2xl shadow-lg shadow-teal-600/30 transition shrink-0"
        >
          <UserPlus className="w-5 h-5" />
          + {isSuperAdmin ? 'Tambah Admin / Guru' : 'Tambah Guru Baru'}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          {isSuperAdmin && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800"
            >
              <option value="">Semua Role (Admin & Guru)</option>
              <option value="school_admin">Admin Sekolah</option>
              <option value="teacher">Ustadzah / Guru</option>
              <option value="principal">Kepala Sekolah</option>
            </select>
          )}
        </div>

        <div className="text-base text-slate-600 font-bold shrink-0">
          Total Terdaftar: <span className="font-black text-teal-700">{users.length} Akun</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-lg">Memuat data pengguna...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <UserPlus className="w-16 h-16 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-lg">Tidak ada akun ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-base border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-extrabold text-sm uppercase tracking-wider">
                  <th className="py-4 px-6">Nama Pengguna</th>
                  <th className="py-4 px-6">Kontak</th>
                  <th className="py-4 px-6">Role / Hak Akses</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <SafeImage
                          src={u.avatar_url}
                          alt={u.name}
                          isAvatar={true}
                          fallbackText={u.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow-xs shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-base">{u.name}</div>
                          <div className="text-sm text-slate-500 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <Phone className="w-4 h-4 text-teal-600" />
                        {u.phone || '08123456789'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl border ${
                        u.role === 'school_admin'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : u.role === 'super_admin'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-teal-100 text-teal-800 border-teal-200'
                      }`}>
                        {u.role === 'school_admin'
                          ? '🏫 Admin Sekolah'
                          : u.role === 'super_admin'
                          ? '👑 Super Admin'
                          : u.role === 'principal'
                          ? '🎓 Kepala Sekolah'
                          : '👩‍🏫 Ustadzah / Guru'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="text-sm text-teal-600 hover:text-teal-800 font-extrabold px-3 py-1.5 rounded-xl hover:bg-teal-50 transition inline-flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.name, u.id)}
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

      {/* Modal Create User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isSuperAdmin ? "Tambah Admin Sekolah / Guru Baru" : "Tambah Guru Baru"}
      >
        <form onSubmit={handleCreateUser} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Pilih Role Pengguna *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="teacher">👩‍🏫 Guru / Ustadzah Wali Kelas</option>
              <option value="school_admin">🏫 Admin Sekolah (Manage TK)</option>
              {isSuperAdmin && <option value="principal">🎓 Kepala Sekolah</option>}
            </select>
          </div>

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
              placeholder="admin@littlehijabi.sch.id"
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

          {isSuperAdmin && schools.length > 0 && (
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Pilih Sekolah Mitra</label>
              <select
                value={formData.school_id}
                onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="">Semua Sekolah / Default</option>
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          )}

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
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
            >
              Simpan Pengguna
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit User */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Pengguna: ${selectedUser?.name || ''}`}
      >
        <form onSubmit={handleUpdateUser} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Role Pengguna</label>
            <select
              value={editFormData.role}
              onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="teacher">👩‍🏫 Guru / Ustadzah Wali Kelas</option>
              <option value="school_admin">🏫 Admin Sekolah (Manage TK)</option>
              <option value="principal">🎓 Kepala Sekolah</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              required
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Alamat Email *</label>
            <input
              type="email"
              required
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nomor WhatsApp / HP</label>
            <input
              type="text"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
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
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

