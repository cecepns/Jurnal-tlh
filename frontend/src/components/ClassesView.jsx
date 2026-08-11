import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from './Modal';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Users, UserCheck, Search } from 'lucide-react';

export function ClassesView() {
  const [classesList, setClassesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    level: 'TK A',
    teacher_name: 'Bu Ani, S.Pd',
    room: 'Gedung A R.101'
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.CLASSES.LIST);
      if (res.success) {
        setClassesList(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Nama kelas wajib diisi!');
      return;
    }

    try {
      const res = await request.post(API_ENDPOINTS.CLASSES.CREATE, formData);
      if (res.success) {
        toast.success('🎉 Kelas Rombel Baru Berhasil Ditambahkan!');
        setClassesList([res.data, ...classesList]);
        setIsModalOpen(false);
        setFormData({ name: '', level: 'TK A', teacher_name: 'Bu Ani, S.Pd', room: 'Gedung A R.101' });
      }
    } catch (err) {
      toast.error('Gagal membuat kelas');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Kelola Kelas & Rombel</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Daftar kelas rombel belajar di TK The Little Hijabi</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-base font-black rounded-2xl shadow-lg shadow-teal-600/30 transition shrink-0"
        >
          <Plus className="w-5 h-5" />
          + Tambah Kelas Baru
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classesList.map((cls) => (
          <div key={cls.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{cls.name}</h3>
                  <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">{cls.level}</span>
                </div>
              </div>
              <span className="px-3.5 py-1 text-sm font-black bg-emerald-100 text-emerald-800 rounded-xl">
                {cls.total_students} Siswa
              </span>
            </div>

            <div className="space-y-2 text-base text-slate-700 font-medium">
              <div className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-teal-600" /> Wali Kelas: <strong className="text-slate-900">{cls.teacher_name}</strong></div>
              <div className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-teal-600" /> Ruangan: <span className="text-slate-600">{cls.room || 'Gedung A'}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add Class */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Kelas Rombel Baru"
      >
        <form onSubmit={handleCreateClass} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Kelas Rombel *</label>
            <input
              type="text"
              required
              placeholder="Contoh: TK A - Al Fatih"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Tingkat Kelas</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="TK A">TK A (Usia 4-5 Tahun)</option>
              <option value="TK B">TK B (Usia 5-6 Tahun)</option>
              <option value="PAUD Inklusif">PAUD Inklusif</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Wali Kelas Utama</label>
            <input
              type="text"
              placeholder="Bu Ani, S.Pd"
              value={formData.teacher_name}
              onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
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
              Simpan Kelas
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
