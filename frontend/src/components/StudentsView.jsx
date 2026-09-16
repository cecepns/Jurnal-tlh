import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { SafeImage } from '../components/SafeImage';
import { Pagination } from '../components/Pagination';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import {
  Search,
  GraduationCap,
  Eye,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  Upload,
  User,
  Calendar,
  MapPin,
  School,
  FileText,
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  full_name: '',
  nickname: '',
  nisn: '',
  gender: 'P',
  class_id: '',
  birth_place: '',
  birth_date: '',
  avatar_url: '',
  notes: '',
  status: 'active'
};

export function StudentsView() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fetch classes for dropdown
  const fetchClasses = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.CLASSES.LIST);
      if (res.success && Array.isArray(res.data)) {
        setClasses(res.data);
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  // Fetch students with pagination and search
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search.trim()
      };
      if (selectedClassId) {
        params.class_id = selectedClassId;
      }

      const res = await request.get(API_ENDPOINTS.STUDENTS.LIST, params);
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalStudents(res.pagination.total || res.data.length);
        } else {
          setTotalStudents(res.data.length);
        }
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Gagal mengambil data siswa dari server');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchClasses();
  }, []);

  // Debounced search & filter listener
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedClassId, page, limit]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingStudentId(null);
    setFormData({
      ...INITIAL_FORM_STATE,
      class_id: classes[0]?.id ? String(classes[0].id) : '1',
      nisn: `00${Date.now().toString().slice(-8)}`
    });
    setIsFormModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (student) => {
    setIsEditing(true);
    setEditingStudentId(student.id);
    setFormData({
      full_name: student.full_name || '',
      nickname: student.nickname || '',
      nisn: student.nisn || '',
      gender: student.gender || 'P',
      class_id: student.class_id ? String(student.class_id) : (classes[0]?.id ? String(classes[0].id) : '1'),
      birth_place: student.birth_place || '',
      birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
      avatar_url: student.avatar_url || '',
      notes: student.notes || '',
      status: student.status || 'active'
    });
    setIsFormModalOpen(true);
  };

  // Handle avatar image upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);

      const res = await request.post(API_ENDPOINTS.UPLOADS.UPLOAD_FILE, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success && res.data) {
        const url = res.data.url || `/uploads/${res.data.filename}`;
        setFormData((prev) => ({ ...prev, avatar_url: url }));
        toast.success('Foto profil berhasil diunggah!');
      } else {
        toast.error('Gagal mengunggah foto');
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
      toast.error('Gagal mengunggah foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Submit Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      toast.error('Nama lengkap siswa wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        full_name: formData.full_name.trim(),
        nickname: formData.nickname.trim() || formData.full_name.trim().split(' ')[0],
        class_id: formData.class_id ? parseInt(formData.class_id) : null
      };

      if (isEditing) {
        const res = await request.put(API_ENDPOINTS.STUDENTS.UPDATE(editingStudentId), payload);
        if (res.success) {
          toast.success(`🎉 Data ${payload.full_name} berhasil diperbarui!`);
          setIsFormModalOpen(false);
          fetchStudents();
        }
      } else {
        const res = await request.post(API_ENDPOINTS.STUDENTS.CREATE, payload);
        if (res.success) {
          toast.success('🎉 Siswa baru berhasil ditambahkan!');
          setIsFormModalOpen(false);
          setFormData(INITIAL_FORM_STATE);
          fetchStudents();
        }
      }
    } catch (err) {
      console.error('Submit student error:', err);
      toast.error(isEditing ? 'Gagal memperbarui data siswa' : 'Gagal menambahkan siswa baru');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete student with confirm toast dialog
  const handleDeleteStudent = (student) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-2">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 font-black">
            !
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">Hapus Data Siswa?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Apakah Anda yakin ingin menghapus data <span className="font-bold text-rose-600">{student.full_name}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await request.delete(API_ENDPOINTS.STUDENTS.DELETE(student.id));
                if (res.success) {
                  toast.success(`Siswa ${student.full_name} berhasil dihapus.`);
                  fetchStudents();
                } else {
                  toast.error(res.message || 'Gagal menghapus siswa');
                }
              } catch (err) {
                console.error('Delete student error:', err);
                toast.error('Gagal menghapus data siswa');
              }
            }}
            className="px-4 py-1.5 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      position: 'top-center'
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Data & Digital Journey Siswa
            </h1>
          </div>
          <p className="text-sm sm:text-base text-slate-600 font-medium mt-1 pl-12.5">
            Manajemen data siswa, rombongan belajar, serta rekam portofolio & perkembangan anak
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-sm sm:text-base font-black rounded-2xl shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Siswa Baru</span>
        </button>
      </div>

      {/* Control Bar: Search, Class Filter, View Toggle */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-80 md:w-96">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, panggilan, NISN..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-12 pr-4 py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Class Filter */}
          <div className="relative w-full sm:w-56">
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">Semua Rombel / Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <Filter className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* View Toggle & Summary Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-sm font-bold text-slate-600">
            Total: <span className="font-black text-teal-700">{totalStudents} Siswa</span>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              title="Tampilan Grid Kartu"
              className={`p-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Kartu</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Tampilan Tabel Data"
              className={`p-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
          <span className="text-slate-700 font-extrabold text-base">Memuat data siswa dari server...</span>
          <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
        </div>
      ) : students.length === 0 ? (
        /* Empty State */
        <div className="text-center p-16 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto text-teal-600">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-800">Tidak ada data siswa ditemukan</h3>
            <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
              {search || selectedClassId
                ? 'Tidak ada siswa yang cocok dengan filter pencarian Anda. Silakan coba kata kunci lain.'
                : 'Belum ada data siswa di sekolah ini. Tambahkan siswa pertama sekarang.'}
            </p>
          </div>
          {(search || selectedClassId) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedClassId('');
              }}
              className="px-4 py-2 text-sm font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition"
            >
              Reset Filter Pencarian
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((st) => (
            <div
              key={st.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm hover:shadow-xl hover:border-teal-400/80 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Subtle top decoration accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 rounded-t-3xl" />

              <div className="space-y-4 pt-1">
                {/* Header Profile Info */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <SafeImage
                      src={st.avatar_url}
                      alt={st.full_name}
                      isAvatar={true}
                      fallbackText={st.nickname || st.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                        st.status === 'graduated'
                          ? 'bg-purple-500'
                          : st.status === 'transferred'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      title={`Status: ${st.status || 'Aktif'}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        NISN: {st.nisn || '-'}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          st.gender === 'L'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}
                      >
                        {st.gender === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}
                      </span>
                    </div>

                    <h3
                      className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-teal-700 transition-colors mt-0.5"
                      title={st.full_name}
                    >
                      {st.full_name}
                    </h3>

                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="inline-block text-[11px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200/70 px-2.5 py-0.5 rounded-lg">
                        {st.class_name || 'TK A - Al Fatih'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges / Stats Section */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total XP</span>
                    <span className="font-black text-amber-600 text-sm flex items-center gap-1">
                      ⭐ {st.xp || 100} <span className="text-[10px] text-amber-500">XP</span>
                    </span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tingkat</span>
                    <span className="font-black text-teal-700 text-sm">
                      Level {st.level || 1}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Detail, Edit, Delete */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    setSelectedStudent(st);
                    setIsDetailModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200/80 hover:border-teal-600 font-extrabold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Buka Digital Journey</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenEditModal(st)}
                    className="py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>Edit Data</span>
                  </button>

                  <button
                    onClick={() => handleDeleteStudent(st)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-black uppercase tracking-wider">
                  <th className="py-4 px-6">Foto & Nama Siswa</th>
                  <th className="py-4 px-6">NISN & Gender</th>
                  <th className="py-4 px-6">Kelas / Rombel</th>
                  <th className="py-4 px-6">Status & XP</th>
                  <th className="py-4 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Student Info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <SafeImage
                          src={st.avatar_url}
                          alt={st.full_name}
                          isAvatar={true}
                          fallbackText={st.nickname || st.full_name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-teal-100 shadow-xs shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-base group-hover:text-teal-700 transition-colors">
                            {st.full_name}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            Panggilan: {st.nickname || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* NISN & Gender */}
                    <td className="py-4 px-6">
                      <div className="text-sm font-extrabold text-slate-800">{st.nisn || '-'}</div>
                      <span
                        className={`inline-block text-[11px] font-extrabold px-2 py-0.5 rounded-md mt-1 ${
                          st.gender === 'L'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}
                      >
                        {st.gender === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}
                      </span>
                    </td>

                    {/* Class */}
                    <td className="py-4 px-6">
                      <span className="inline-block text-xs font-black text-teal-800 bg-teal-50 border border-teal-200/70 px-3 py-1 rounded-xl">
                        {st.class_name || 'TK A - Al Fatih'}
                      </span>
                    </td>

                    {/* Status & XP */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-600 text-xs bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                          ⭐ {st.xp || 100} XP
                        </span>
                        <span className="text-xs font-bold text-teal-700">
                          Lv.{st.level || 1}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(st);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition flex items-center gap-1"
                          title="Buka Digital Journey"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Journey</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(st)}
                          className="px-3 py-1.5 text-xs font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1"
                          title="Edit Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteStudent(st)}
                          className="px-3 py-1.5 text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition flex items-center gap-1"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm px-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
        />
      </div>

      {/* Modal: Create & Edit Student */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => !submitting && setIsFormModalOpen(false)}
        title={isEditing ? `Edit Data Siswa: ${formData.full_name || ''}` : 'Tambah Siswa Baru'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload / Preview */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <SafeImage
                src={formData.avatar_url}
                alt="Foto Profil Siswa"
                isAvatar={true}
                fallbackText={formData.nickname || formData.full_name || 'Foto'}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-500 shadow-md"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Foto Profil Siswa
              </label>
              <p className="text-xs text-slate-500">
                Format JPG, PNG, atau WebP (Maksimal 5MB)
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <label className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{formData.avatar_url ? 'Ganti Foto' : 'Unggah Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar || submitting}
                    className="hidden"
                  />
                </label>
                {formData.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar_url: '' })}
                    className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Full Name & Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Aisyah Putri Humaira"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Nama Panggilan
              </label>
              <input
                type="text"
                placeholder="Contoh: Aisyah"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-white"
              />
            </div>
          </div>

          {/* NISN & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                NISN (Nomor Induk Siswa Nasional)
              </label>
              <input
                type="text"
                placeholder="Contoh: 0081234567"
                value={formData.nisn}
                onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Jenis Kelamin *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'L' })}
                  className={`py-3 px-4 rounded-2xl border text-sm font-extrabold transition flex items-center justify-center gap-2 ${
                    formData.gender === 'L'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  👦 Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'P' })}
                  className={`py-3 px-4 rounded-2xl border text-sm font-extrabold transition flex items-center justify-center gap-2 ${
                    formData.gender === 'P'
                      ? 'bg-pink-50 border-pink-500 text-pink-800 ring-2 ring-pink-500/20'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  👧 Perempuan
                </button>
              </div>
            </div>
          </div>

          {/* Class & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Rombongan Belajar / Kelas *
              </label>
              <select
                value={formData.class_id}
                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold text-slate-800 bg-white"
              >
                {classes.length > 0 ? (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <option value="1">TK A - Al Fatih</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Status Keaktifan
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold text-slate-800 bg-white"
              >
                <option value="active">🟢 Siswa Aktif</option>
                <option value="graduated">🎓 Lulus / Alumni</option>
                <option value="transferred">✈️ Pindah Sekolah</option>
              </select>
            </div>
          </div>

          {/* Birth Place & Birth Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Tempat Lahir
              </label>
              <input
                type="text"
                placeholder="Contoh: Bandung"
                value={formData.birth_place}
                onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                className="w-full px-4 py-3 text-sm sm:text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Notes / Special Learning Needs */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
              Catatan Khusus / Kebutuhan Belajar Anak
            </label>
            <textarea
              rows={3}
              placeholder="Catatan kebiasaan, preferensi komunikasi isyarat, alergi, atau capaian awal anak..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 text-sm border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setIsFormModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="px-6 py-2.5 text-sm font-black bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md shadow-teal-600/30 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditing ? 'Simpan Perubahan' : 'Tambah Siswa'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Student Detail / Digital Learning Journey */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Digital Learning Journey: ${selectedStudent.full_name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Header Profile Box */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-3xl border border-teal-200/80 shadow-xs">
              <SafeImage
                src={selectedStudent.avatar_url}
                alt={selectedStudent.full_name}
                isAvatar={true}
                fallbackText={selectedStudent.nickname || selectedStudent.full_name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
              />

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="font-black text-slate-900 text-lg sm:text-xl">
                    {selectedStudent.full_name}
                  </h4>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg ${
                      selectedStudent.gender === 'L'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-pink-100 text-pink-800'
                    }`}
                  >
                    {selectedStudent.gender === 'L' ? '👦 Laki-laki' : '👧 Perempuan'}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-600">
                  NISN: <span className="font-extrabold text-slate-800">{selectedStudent.nisn || '-'}</span> | Rombel:{' '}
                  <span className="font-extrabold text-teal-800">{selectedStudent.class_name || 'TK A'}</span>
                </p>

                {(selectedStudent.birth_place || selectedStudent.birth_date) && (
                  <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {selectedStudent.birth_place ? `${selectedStudent.birth_place}, ` : ''}
                      {selectedStudent.birth_date ? selectedStudent.birth_date.split('T')[0] : '-'}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Badges & Gamification Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/70">
                <span className="text-[11px] font-extrabold text-amber-700 uppercase tracking-wider block">
                  Total XP Belajar
                </span>
                <span className="font-black text-amber-900 text-lg sm:text-xl flex items-center gap-1.5 mt-0.5">
                  ⭐ {selectedStudent.xp || 100} XP
                </span>
              </div>

              <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200/70">
                <span className="text-[11px] font-extrabold text-teal-700 uppercase tracking-wider block">
                  Tingkat Prestasi
                </span>
                <span className="font-black text-teal-900 text-lg sm:text-xl mt-0.5 block">
                  Level {selectedStudent.level || 1}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-purple-50/70 p-4 rounded-2xl border border-purple-200/70">
                <span className="text-[11px] font-extrabold text-purple-700 uppercase tracking-wider block">
                  Status Siswa
                </span>
                <span className="font-black text-purple-900 text-sm sm:text-base mt-0.5 block capitalize">
                  {selectedStudent.status === 'graduated'
                    ? '🎓 Lulus'
                    : selectedStudent.status === 'transferred'
                    ? '✈️ Pindah'
                    : '🟢 Aktif'}
                </span>
              </div>
            </div>

            {/* Teacher's Notes */}
            <div className="border-t border-slate-200 pt-4 space-y-2">
              <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Catatan Guru & Kebutuhan Belajar:</span>
              </h5>
              <div className="text-sm font-medium text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
                {selectedStudent.notes || (
                  <span className="italic text-slate-400">Belum ada catatan khusus untuk siswa ini.</span>
                )}
              </div>
            </div>

            {/* Quick Actions in Detail Modal */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleOpenEditModal(selectedStudent);
                }}
                className="px-4 py-2 text-xs font-extrabold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl transition flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Data Siswa</span>
              </button>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
