import React, { useState, useEffect } from 'react';
import { Search, Plus, FileText, Download, BookOpen, Presentation, Sparkles, Eye, Trash2, Filter } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function DigitalLibraryView() {
  const { user } = useAuth();
  const canManage = user?.role === 'teacher' || user?.role === 'super_admin' || user?.role === 'school_admin';

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal Viewer
  const [activeDoc, setActiveDoc] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Modal Upload / Add
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'buku_bacaan',
    category: 'Bahasa Indonesia',
    level: 'Pra Membaca',
    file_url: '',
    thumbnail_url: '',
    description: '',
    total_pages: 10,
    file_size: '2.5 MB'
  });

  // Debounce search effect (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchLibrary();
  }, [debouncedSearch, selectedType, selectedLevel]);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      let queryUrl = `${API_ENDPOINTS.LIBRARY.LIST}?search=${encodeURIComponent(debouncedSearch)}`;
      if (selectedType !== 'all') queryUrl += `&type=${selectedType}`;
      if (selectedLevel !== 'all') queryUrl += `&level=${selectedLevel}`;

      const res = await request.get(queryUrl);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      }
    } catch (err) {
      console.error('Error fetching library:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDoc = (doc) => {
    setActiveDoc(doc);
    setIsViewerOpen(true);
  };

  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Judul bahan ajar wajib diisi!');
      return;
    }

    try {
      const payload = {
        ...formData,
        file_url: formData.file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        thumbnail_url: formData.thumbnail_url || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'
      };
      const res = await request.post(API_ENDPOINTS.LIBRARY.CREATE, payload);
      if (res.success) {
        toast.success(`🎉 Bahan ajar "${formData.title}" berhasil diunggah ke Perpustakaan!`);
        setIsAddModalOpen(false);
        setFormData({
          title: '',
          type: 'buku_bacaan',
          category: 'Bahasa Indonesia',
          level: 'Pra Membaca',
          file_url: '',
          thumbnail_url: '',
          description: '',
          total_pages: 10,
          file_size: '2.5 MB'
        });
        fetchLibrary();
      }
    } catch (err) {
      toast.error('Gagal menambahkan dokumen');
    }
  };

  const handleDelete = (id, title, e) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-base">Hapus "{title}" dari Library?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300">Batal</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await request.delete(API_ENDPOINTS.LIBRARY.DELETE(id));
                toast.success('Bahan ajar berhasil dihapus.');
                fetchLibrary();
              } catch (err) {
                toast.error('Gagal menghapus materi');
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

  const typeLabels = {
    buku_bacaan: { label: 'Buku Bacaan PDF', color: 'bg-emerald-100 text-emerald-800', icon: BookOpen },
    worksheet: { label: 'Worksheet Latihan', color: 'bg-indigo-100 text-indigo-800', icon: FileText },
    ppt_materi: { label: 'Slide PPT Materi', color: 'bg-amber-100 text-amber-800', icon: Presentation }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-teal-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-indigo-950/70 border border-indigo-400/40 rounded-full text-xs font-black uppercase tracking-wider text-indigo-200">
              Perpustakaan Digital Terpadu
            </span>
            <span className="px-3 py-0.5 bg-amber-400 text-slate-900 text-xs font-black rounded-lg">
              📂 Buku, Worksheet & PPT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Digital Library & Lembar Kerja</h1>
          <p className="text-indigo-100 text-base font-medium max-w-2xl">
            Akses seluruh buku bacaan cerita PDF, lembar kerja (worksheet) latihan anak, dan slide PPT materi untuk belajar mandiri di rumah.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0 flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl shadow-lg transition"
          >
            <Plus className="w-5 h-5" /> + Upload Buku / PPT / Worksheet
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari buku cerita, worksheet latihan, atau slide PPT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-base border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          <div className="flex gap-3 shrink-0">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3.5 border border-slate-300 rounded-2xl bg-slate-50 font-bold text-slate-700 text-sm"
            >
              <option value="all">Semua Jenis File</option>
              <option value="buku_bacaan">📖 Buku Bacaan PDF</option>
              <option value="worksheet">📝 Worksheet Latihan</option>
              <option value="ppt_materi">📊 Slide PPT Materi</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3.5 border border-slate-300 rounded-2xl bg-slate-50 font-bold text-slate-700 text-sm"
            >
              <option value="all">Semua Level</option>
              <option value="Pra Membaca">Pra Membaca</option>
              <option value="Level 1">Level 1</option>
              <option value="Level 2">Level 2</option>
              <option value="Level 3">Level 3</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Documents */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-slate-200 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            📂
          </div>
          <h3 className="text-xl font-bold text-slate-800">Tidak ada dokumen ditemukan</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Coba ubah kata kunci pencarian atau filter tipe dokumen di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((doc) => {
            const typeInfo = typeLabels[doc.type] || typeLabels.buku_bacaan;
            const IconComp = typeInfo.icon;

            return (
              <div
                key={doc.id}
                onClick={() => handleOpenDoc(doc)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col group relative"
              >
                {/* Thumbnail Preview */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <SafeImage
                    src={doc.thumbnail_url}
                    alt={doc.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-black text-slate-800 shadow-sm">
                    <IconComp className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{typeInfo.label}</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-900/80 text-white px-2.5 py-0.5 rounded-lg text-xs font-bold">
                    {doc.level}
                  </div>

                  {canManage && (
                    <button
                      onClick={(e) => handleDelete(doc.id, doc.title, e)}
                      className="absolute bottom-3 right-3 p-2 bg-white/90 text-rose-600 rounded-xl shadow-md opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition"
                      title="Hapus Dokumen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider block">
                      {doc.category} • {doc.total_pages} Halaman
                    </span>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition mt-1 line-clamp-2">
                      {doc.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400">Ukuran: {doc.file_size || '2 MB'}</span>
                    <span className="text-indigo-600 flex items-center gap-1 group-hover:underline">
                      <Eye className="w-4 h-4" /> Buka & Baca
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Document / PDF Viewer */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={activeDoc?.title || "Penampil Dokumen / Buku PDF"}
      >
        {activeDoc && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-100 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">{activeDoc.category} • {activeDoc.level}</span>
                <h4 className="text-base font-black text-slate-900 mt-0.5">{activeDoc.title}</h4>
              </div>
              <a
                href={activeDoc.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
              >
                <Download className="w-4 h-4" /> Unduh / Print PDF
              </a>
            </div>

            {/* Embedded PDF / Viewer Frame */}
            <div className="aspect-[4/3] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
              <iframe
                src={activeDoc.file_url}
                title={activeDoc.title}
                className="w-full h-full"
              />
            </div>

            <p className="text-xs text-slate-500 text-center font-medium">
              💡 Dokumen ini dapat diulang-ulang dibaca kapan saja bersama anak di rumah untuk memperkuat daya ingat.
            </p>
          </div>
        )}
      </Modal>

      {/* Modal Upload New Document */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload Bahan Ajar (Buku / Worksheet / PPT)"
      >
        <form onSubmit={handleSaveDoc} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Judul Materi / Buku *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Buku Cerita Si Ayam & Merpati"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Tipe Dokumen</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="buku_bacaan">Buku Bacaan PDF</option>
                <option value="worksheet">Worksheet Latihan</option>
                <option value="ppt_materi">Slide PPT Materi</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="Pra Membaca">Pra Membaca</option>
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
                <option value="Level 5">Level 5</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kategori Kurikulum</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="Bahasa Isyarat">Bahasa Isyarat</option>
              <option value="Cerita Islami">Cerita Islami</option>
              <option value="Matematika Dini">Matematika Dini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">URL File PDF / Dokumen</label>
            <input
              type="text"
              placeholder="https://.../materi.pdf"
              value={formData.file_url}
              onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">URL Foto Sampul (Thumbnail)</label>
            <input
              type="text"
              placeholder="https://..."
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={3}
              placeholder="Jelaskan isi buku atau latihan yang ada di dalam lembar kerja..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
            >
              Simpan ke Library
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
