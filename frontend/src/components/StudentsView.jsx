import React, { useState, useEffect } from 'react';
import { Modal } from '../components/Modal';
import { SafeImage } from '../components/SafeImage';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Search, GraduationCap, Eye, Loader2 } from 'lucide-react';

export function StudentsView() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    gender: 'P'
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.STUDENTS.LIST, { search });
      if (res.success && Array.isArray(res.data)) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Gagal mengambil data siswa dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!formData.full_name) {
      toast.error('Nama lengkap wajib diisi!');
      return;
    }

    try {
      const res = await request.post(API_ENDPOINTS.STUDENTS.CREATE, {
        full_name: formData.full_name,
        nickname: formData.nickname || formData.full_name.split(' ')[0],
        gender: formData.gender,
        class_id: 1
      });

      if (res.success) {
        toast.success('🎉 Siswa baru berhasil ditambahkan!');
        setIsAddModalOpen(false);
        setFormData({ full_name: '', nickname: '', gender: 'P' });
        fetchStudents();
      }
    } catch (err) {
      toast.error('Gagal menambah siswa baru ke server');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Digital Learning Journey Siswa</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Rekam jejak perkembangan, foto, dan portfolio anak</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-base font-black rounded-2xl shadow-lg shadow-teal-600/30 transition flex items-center gap-2 shrink-0"
        >
          <GraduationCap className="w-5 h-5" /> + Tambah Siswa Baru
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
          />
        </div>
        <div className="text-base text-slate-600 font-bold">
          Total Siswa: <span className="font-black text-teal-700">{students.length} Anak</span>
        </div>
      </div>

      {/* Loading & Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
          <span className="text-slate-600 font-bold">Memuat data siswa dari server...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 text-slate-500 font-bold">
          Tidak ada data siswa yang ditemukan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {students.map((st) => (
            <div key={st.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5 hover:shadow-xl hover:border-teal-300 transition-all duration-200">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <SafeImage
                    src={st.avatar_url}
                    alt={st.full_name}
                    isAvatar={true}
                    fallbackText={st.nickname}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-200 shadow-sm shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug break-words" title={st.full_name}>
                      {st.full_name}
                    </h3>
                    <span className="inline-flex items-center mt-1.5 text-xs font-black text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200/80">
                      {st.class_name || 'TK A - Al Fatih'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-600 border-t border-slate-100 pt-3.5 font-bold">
                  <span className="text-slate-500">Total XP: <strong className="text-amber-600 font-black text-sm">{st.xp || 100} XP</strong></span>
                  <span className="font-black text-teal-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">Level {st.level || 1}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedStudent(st);
                  setIsModalOpen(true);
                }}
                className="w-full py-3 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white border border-teal-200/80 hover:border-teal-600 font-extrabold text-sm rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-xs group"
              >
                <Eye className="w-4 h-4 text-teal-600 group-hover:text-white transition" />
                <span>Buka Digital Journey</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Digital Learning Journey: ${selectedStudent.full_name}`}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-teal-50 p-5 rounded-2xl border border-teal-200">
              <SafeImage
                src={selectedStudent.avatar_url}
                alt={selectedStudent.full_name}
                isAvatar={true}
                fallbackText={selectedStudent.nickname}
                className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div>
                <h4 className="font-black text-slate-900 text-lg">{selectedStudent.full_name}</h4>
                <div className="text-sm font-semibold text-slate-600 mt-0.5">NISN: {selectedStudent.nisn || '-'} | Kelas: {selectedStudent.class_name || 'TK A'}</div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-4">
              <h5 className="font-black text-slate-900 text-sm uppercase tracking-wider text-teal-700">Histori Foto Portfolio Siswa:</h5>
              <div className="grid grid-cols-2 gap-3">
                <SafeImage src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400" alt="Portfolio 1" className="w-full h-32 rounded-xl object-cover border border-slate-200 shadow-xs" />
                <SafeImage src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400" alt="Portfolio 2" className="w-full h-32 rounded-xl object-cover border border-slate-200 shadow-xs" />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Data Siswa Baru"
      >
        <form onSubmit={handleCreateStudent} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Lengkap Siswa *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Aisyah Putri Humaira"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Panggilan</label>
            <input
              type="text"
              placeholder="Contoh: Aisyah"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
            >
              Simpan Siswa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
