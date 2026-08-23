import React, { useState, useEffect } from 'react';
import { BookOpen, Award, CheckCircle2, ChevronRight, Sparkles, Layers, ArrowRight, Plus, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function CurriculumView() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === 'teacher' || user?.role === 'super_admin' || user?.role === 'school_admin' || user?.role === 'principal';

  const [curriculumData, setCurriculumData] = useState(null);
  const [activeTrack, setActiveTrack] = useState('isyarat'); // 'isyarat' or 'bahasa_indonesia'
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    track: 'isyarat',
    level: 'Level 1',
    name: '',
    order_no: 1,
    topics: [{ title: '', desc: '' }]
  });

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.CURRICULUM.GET);
      if (res.success && res.data) {
        setCurriculumData(res.data);
      }
    } catch (err) {
      console.error('Error fetching curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      track: activeTrack,
      level: activeTrack === 'isyarat' ? 'Level 1' : 'Pra Membaca',
      name: '',
      order_no: (curriculumData?.[activeTrack]?.levels?.length || 0) + 1,
      topics: [{ title: '', desc: '' }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (lvl) => {
    setEditingItem(lvl);
    setFormData({
      track: lvl.track || activeTrack,
      level: lvl.level || 'Level 1',
      name: lvl.name || '',
      order_no: lvl.order_no || 1,
      topics: Array.isArray(lvl.topics) && lvl.topics.length > 0
        ? lvl.topics.map(t => ({ title: t.title || '', desc: t.desc || '' }))
        : [{ title: '', desc: '' }]
    });
    setIsModalOpen(true);
  };

  const handleAddTopicRow = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, { title: '', desc: '' }]
    }));
  };

  const handleRemoveTopicRow = (index) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const handleTopicChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.topics];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, topics: updated };
    });
  };

  const handleSaveCurriculum = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Judul capaian level wajib diisi!');
      return;
    }

    const cleanTopics = formData.topics.filter(t => t.title.trim() !== '');
    if (cleanTopics.length === 0) {
      toast.error('Minimal tambahkan 1 sub-topik materi!');
      return;
    }

    const payload = {
      ...formData,
      topics: cleanTopics
    };

    try {
      if (editingItem) {
        await request.put(API_ENDPOINTS.CURRICULUM.UPDATE(editingItem.id), payload);
        toast.success(`🎉 Kurikulum ${formData.level} berhasil diperbarui!`);
      } else {
        await request.post(API_ENDPOINTS.CURRICULUM.CREATE, payload);
        toast.success(`🎉 Jenjang ${formData.level} baru berhasil ditambahkan!`);
      }
      setIsModalOpen(false);
      fetchCurriculum();
    } catch (err) {
      toast.error('Gagal menyimpan kurikulum');
    }
  };

  const handleDelete = (lvl) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-base">Hapus jenjang "{lvl.level} - {lvl.name}"?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300">
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await request.delete(API_ENDPOINTS.CURRICULUM.DELETE(lvl.id));
                toast.success(`Jenjang ${lvl.level} berhasil dihapus.`);
                fetchCurriculum();
              } catch (err) {
                toast.error('Gagal menghapus kurikulum');
              }
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ));
  };

  const currentTrackData = curriculumData?.[activeTrack] || {
    title: activeTrack === 'isyarat' ? 'Kurikulum LMS Bahasa Isyarat Inklusif' : 'Kurikulum LMS Bahasa Indonesia',
    levels: []
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-teal-950/80 border border-teal-400/40 rounded-full text-xs font-black uppercase tracking-wider text-teal-200">
              Standar Kurikulum Inklusif
            </span>
            {canManage && (
              <span className="px-3 py-0.5 bg-amber-400 text-slate-900 text-xs font-black rounded-lg">
                ✍️ Mode Pengelola Kurikulum
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Struktur Kurikulum & Capaian Belajar</h1>
          <p className="text-teal-100 text-base font-medium max-w-2xl">
            Panduan silabus bertahap The Little Hijabi mulai dari Pra Membaca & Isyarat Dasar hingga Level 5 untuk kemandirian literasi anak.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          {canManage && (
            <button
              onClick={handleOpenAdd}
              className="px-5 py-3 bg-amber-400 text-slate-900 hover:bg-amber-300 font-black text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> + Tambah Level Silabus
            </button>
          )}
          <button
            onClick={() => navigate('/sign-dictionary')}
            className="px-5 py-3 bg-white text-teal-900 hover:bg-slate-100 font-extrabold text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2"
          >
            🤟 Buka Kamus Isyarat
          </button>
        </div>
      </div>

      {/* Track Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActiveTrack('isyarat')}
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 font-black text-base rounded-2xl transition ${
              activeTrack === 'isyarat'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🤟</span> Kurikulum LMS Bahasa Isyarat (BISINDO)
          </button>

          <button
            onClick={() => setActiveTrack('bahasa_indonesia')}
            className={`flex items-center justify-center gap-2.5 px-6 py-3.5 font-black text-base rounded-2xl transition ${
              activeTrack === 'bahasa_indonesia'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>📖</span> Kurikulum LMS Bahasa Indonesia (Pra Membaca - Level 5)
          </button>
        </div>

        {canManage && (
          <button
            onClick={handleOpenAdd}
            className="sm:hidden flex items-center justify-center gap-2 px-5 py-3 bg-teal-700 text-white font-bold text-sm rounded-2xl shadow"
          >
            <Plus className="w-4 h-4" /> + Tambah Level Baru
          </button>
        )}
      </div>

      {/* Levels Roadmap List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600" />
            <span>{currentTrackData.title}</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {currentTrackData.levels?.length || 0} Jenjang Level Belajar
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {currentTrackData.levels?.map((lvl, index) => (
              <div
                key={lvl.id || index}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm hover:shadow-md transition space-y-6 relative group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center border border-teal-200 shrink-0">
                      #{index + 1}
                    </div>
                    <div>
                      <span className="px-3 py-0.5 bg-teal-100 text-teal-800 rounded-md text-xs font-black uppercase">
                        {lvl.level}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">{lvl.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(lvl)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 text-teal-700 text-xs font-bold rounded-xl transition border border-slate-200"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit Silabus
                        </button>
                        <button
                          onClick={() => handleDelete(lvl)}
                          className="p-1.5 bg-slate-100 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl transition border border-slate-200"
                          title="Hapus Level"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => navigate(activeTrack === 'isyarat' ? '/learning?category=isyarat' : '/learning?category=indonesia')}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-teal-700 hover:text-teal-900 ml-2"
                    >
                      Buka Modul <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Sub-Topics List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lvl.topics?.map((topic, tIdx) => (
                    <div
                      key={tIdx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 hover:bg-teal-50/50 hover:border-teal-300 transition"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{topic.title}</h4>
                          <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{topic.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Curriculum Level */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Edit Kurikulum: ${editingItem.level}` : "Tambah Jenjang Kurikulum Baru"}
      >
        <form onSubmit={handleSaveCurriculum} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kategori Track Kurikulum</label>
              <select
                value={formData.track}
                onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="isyarat">🤟 LMS Bahasa Isyarat</option>
                <option value="bahasa_indonesia">📖 LMS Bahasa Indonesia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Nama Level *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Level 1, Level 2, Pra Membaca"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl font-bold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Judul Capaian Pembelajaran Level *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Fondasi Isyarat Dasar & Pengenalan Diri"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl font-medium focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Dynamic Topics List in Form */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-slate-800">Daftar Sub-Topik Materi Belajar *</label>
              <button
                type="button"
                onClick={handleAddTopicRow}
                className="text-xs font-black text-teal-700 hover:text-teal-900 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200"
              >
                + Tambah Sub-Topik
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {formData.topics.map((t, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Sub-Topik #{idx + 1}</span>
                    {formData.topics.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTopicRow(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Hapus baris"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Judul topik (contoh: Alfabet Isyarat A-Z)"
                    value={t.title}
                    onChange={(e) => handleTopicChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-bold"
                  />
                  <textarea
                    rows={2}
                    placeholder="Deskripsi singkat capaian topik..."
                    value={t.desc}
                    onChange={(e) => handleTopicChange(idx, 'desc', e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              ))}
            </div>
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
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
            >
              Simpan Kurikulum
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
