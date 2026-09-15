import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, Sparkles, BookOpen, Volume2, Eye, Filter, CheckCircle2, 
  ArrowRight, UploadCloud, Video, Play, Loader2, X, Image as ImageIcon, Film,
  Pencil, Trash2
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { request } from '../utils/request';
import { API_ENDPOINTS, getUploadUrl } from '../utils/endpoints';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function SignDictionaryView() {
  const { user } = useAuth();
  const canManage = user?.role === 'teacher' || user?.role === 'super_admin' || user?.role === 'school_admin';

  const [dictionaryList, setDictionaryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal Detail Item
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Modal Add Item
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadedMediaInfo, setUploadedMediaInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualLink, setShowManualLink] = useState(false);
  const mediaInputRef = useRef(null);

  const [formData, setFormData] = useState({
    word: '',
    category: 'alfabet',
    level: 'Level 1',
    image_url: '',
    video_url: '',
    description: '',
    tags: ''
  });

  // Modal Edit Item
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingEditMedia, setUploadingEditMedia] = useState(false);
  const [uploadedEditMediaInfo, setUploadedEditMediaInfo] = useState(null);
  const [isEditDragging, setIsEditDragging] = useState(false);
  const [showEditManualLink, setShowEditManualLink] = useState(false);
  const editMediaInputRef = useRef(null);

  const [editFormData, setEditFormData] = useState({
    word: '',
    category: 'alfabet',
    level: 'Level 1',
    image_url: '',
    video_url: '',
    description: '',
    tags: ''
  });

  // Debounce search effect (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Dictionary Data
  useEffect(() => {
    fetchDictionary();
  }, [debouncedSearch, selectedCategory, selectedLevel]);

  const fetchDictionary = async () => {
    setLoading(true);
    try {
      let queryUrl = `${API_ENDPOINTS.DICTIONARY.LIST}?search=${encodeURIComponent(debouncedSearch)}`;
      if (selectedCategory !== 'all') queryUrl += `&category=${selectedCategory}`;
      if (selectedLevel !== 'all') queryUrl += `&level=${selectedLevel}`;

      const res = await request.get(queryUrl);
      if (res.success && Array.isArray(res.data)) {
        setDictionaryList(res.data);
      }
    } catch (err) {
      console.error('Error fetching dictionary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (item) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleMediaSelect = async (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm)$/i.test(file.name);
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setUploadingMedia(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await request.post(API_ENDPOINTS.UPLOADS.UPLOAD_FILE, uploadData);
      if (res.success && res.data) {
        const fileUrl = res.data.url;
        setFormData(prev => ({
          ...prev,
          image_url: fileUrl,
          video_url: isVideo ? fileUrl : (prev.video_url || '')
        }));
        setUploadedMediaInfo({
          name: file.name,
          size: sizeStr,
          type: isVideo ? 'video' : 'image',
          url: fileUrl
        });
        toast.success(`🎉 ${isVideo ? 'Video MP4 isyarat' : 'Foto gerakan'} berhasil diunggah!`);
      } else {
        toast.error(res.message || 'Gagal mengunggah file media');
      }
    } catch (err) {
      console.error('Media upload error:', err);
      toast.error(err.response?.data?.message || 'Gagal mengunggah file media ke server');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.word) {
      toast.error('Kata / kosakata isyarat wajib diisi!');
      return;
    }
    if (!formData.image_url && !formData.video_url) {
      toast.error('Silakan upload foto gerakan atau video isyarat terlebih dahulu!');
      return;
    }

    try {
      const payload = {
        ...formData,
        image_url: formData.image_url || formData.video_url || null,
        video_url: formData.video_url || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [formData.word.toLowerCase()]
      };
      const res = await request.post(API_ENDPOINTS.DICTIONARY.CREATE, payload);
      if (res.success) {
        toast.success(`🎉 Kata isyarat "${formData.word}" berhasil disimpan ke Kamus Isyarat!`);
        setIsAddModalOpen(false);
        setUploadedMediaInfo(null);
        setFormData({ word: '', category: 'alfabet', level: 'Level 1', image_url: '', video_url: '', description: '', tags: '' });
        fetchDictionary();
      }
    } catch (err) {
      toast.error('Gagal menambahkan kata isyarat');
    }
  };

  const handleOpenEdit = (item, e) => {
    if (e) e.stopPropagation();
    setEditingItem(item);
    setEditFormData({
      word: item.word || '',
      category: item.category || 'alfabet',
      level: item.level || 'Level 1',
      image_url: item.image_url || '',
      video_url: item.video_url || '',
      description: item.description || '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
    });
    setUploadedEditMediaInfo(null);
    setShowEditManualLink(false);
    setIsEditModalOpen(true);
  };

  const handleEditMediaSelect = async (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm)$/i.test(file.name);
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    setUploadingEditMedia(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await request.post(API_ENDPOINTS.UPLOADS.UPLOAD_FILE, uploadData);
      if (res.success && res.data) {
        const fileUrl = res.data.url;
        setEditFormData(prev => ({
          ...prev,
          image_url: fileUrl,
          video_url: isVideo ? fileUrl : (prev.video_url || '')
        }));
        setUploadedEditMediaInfo({
          name: file.name,
          size: sizeStr,
          type: isVideo ? 'video' : 'image',
          url: fileUrl
        });
        toast.success(`🎉 ${isVideo ? 'Video MP4 isyarat baru' : 'Foto gerakan baru'} berhasil diunggah!`);
      } else {
        toast.error(res.message || 'Gagal mengunggah file media');
      }
    } catch (err) {
      console.error('Media upload error:', err);
      toast.error(err.response?.data?.message || 'Gagal mengunggah file media ke server');
    } finally {
      setUploadingEditMedia(false);
    }
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    if (!editFormData.word) {
      toast.error('Kata / kosakata isyarat wajib diisi!');
      return;
    }
    if (!editFormData.image_url && !editFormData.video_url) {
      toast.error('Silakan upload foto gerakan atau video isyarat terlebih dahulu!');
      return;
    }

    try {
      const payload = {
        ...editFormData,
        image_url: editFormData.image_url || editFormData.video_url || null,
        video_url: editFormData.video_url || null,
        tags: editFormData.tags ? editFormData.tags.split(',').map(t => t.trim()) : [editFormData.word.toLowerCase()]
      };
      const res = await request.put(API_ENDPOINTS.DICTIONARY.UPDATE(editingItem.id), payload);
      if (res.success) {
        toast.success(`🎉 Kata isyarat "${editFormData.word}" berhasil diperbarui!`);
        setIsEditModalOpen(false);
        setEditingItem(null);
        if (selectedItem?.id === editingItem.id) {
          setSelectedItem(prev => ({ ...prev, ...payload }));
        }
        fetchDictionary();
      } else {
        toast.error(res.message || 'Gagal memperbarui kata isyarat');
      }
    } catch (err) {
      toast.error('Gagal memperbarui kata isyarat');
    }
  };

  const handleDelete = (item, e) => {
    if (e) e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <div className="flex items-center gap-2 text-rose-600 font-bold">
          <Trash2 className="w-5 h-5 shrink-0" />
          <span>Hapus Kata Isyarat?</span>
        </div>
        <p className="text-xs text-slate-600 font-medium">
          Apakah Anda yakin ingin menghapus <strong>"{item.word}"</strong> dari Kamus Isyarat?
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 transition"
          >
            Batal
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const res = await request.delete(API_ENDPOINTS.DICTIONARY.DELETE(item.id));
                if (res.success) {
                  toast.success(`Kata "${item.word}" berhasil dihapus.`);
                  if (selectedItem?.id === item.id) {
                    setIsDetailModalOpen(false);
                  }
                  fetchDictionary();
                } else {
                  toast.error(res.message || 'Gagal menghapus');
                }
              } catch (err) {
                toast.error('Gagal menghapus kata isyarat');
              }
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const categories = [
    { id: 'all', label: 'Semua Kosakata' },
    { id: 'alfabet', label: '🔤 Alfabet Isyarat (A-Z)' },
    { id: 'angka', label: '🔢 Angka Isyarat (0-10)' },
    { id: 'siapa_aku', label: '🙋‍♂️ Siapa Aku' },
    { id: 'keluarga', label: '👨‍👩‍👧 Keluarga' },
    { id: 'rumah_tinggal', label: '🏠 Rumah Tinggal' },
    { id: 'hobi', label: '🎨 Hobi' },
    { id: 'makanan_minuman', label: '🍎 Makanan & Minuman' },
    { id: 'hewan', label: '🐔 Hewan (Ayam, dll)' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-emerald-900/70 border border-emerald-400/40 rounded-full text-xs font-black uppercase tracking-wider text-emerald-200">
              Kamus Visual Isyarat
            </span>
            <span className="px-3 py-0.5 bg-amber-400 text-slate-900 text-xs font-black rounded-lg">
              ✨ Format Gambar Visual
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Kamus Bahasa Isyarat Bergambar</h1>
          <p className="text-teal-100 text-base font-medium max-w-2xl">
            Cari kata atau tema isyarat langsung dengan ilustrasi kartu bergambar yang jelas dan mudah ditirukan anak.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0 flex items-center gap-2 px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black rounded-2xl shadow-lg transition"
          >
            <Plus className="w-5 h-5" /> + Tambah Kata Isyarat
          </button>
        )}
      </div>

      {/* Search Bar & Filters Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kata isyarat... (contoh: Ayam, Ibu, Huruf A, Makan, Rumah)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div className="flex gap-3 shrink-0">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-3.5 border border-slate-300 rounded-2xl bg-slate-50 font-bold text-slate-700 text-sm"
            >
              <option value="all">Semua Level</option>
              <option value="Level 1">Level 1 (Dasar)</option>
              <option value="Level 2">Level 2 (Lanjutan)</option>
              <option value="Level 3">Level 3</option>
            </select>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dictionary Visual Grid Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : dictionaryList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            🔍
          </div>
          <h3 className="text-xl font-bold text-slate-800">Kata Isyarat "{searchTerm}" Belum Ditemukan</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Coba gunakan kata kunci lain seperti "Ayam", "Ayah", "Huruf A", atau pilih kategori di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dictionaryList.map((item) => {
              const isVideo = !!(item.video_url || /\.(mp4|webm)$/i.test(item.image_url || '') || /\.(mp4|webm)$/i.test(item.illustration_url || ''));
              const mediaUrl = getUploadUrl(item.video_url || item.image_url || item.illustration_url);

              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenDetail(item)}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col group"
                >
                  {/* Media Illustration Frame */}
                  <div className="relative aspect-square bg-slate-900 overflow-hidden">
                    {isVideo ? (
                      <>
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-300"
                          muted
                          playsInline
                          preload="metadata"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-teal-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute top-3 left-3 bg-teal-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-teal-200 shadow-sm border border-teal-700/50 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-teal-300" />
                          <span>Video Isyarat</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <SafeImage
                          src={item.image_url || item.illustration_url}
                          alt={item.word}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-teal-800 shadow-sm border border-white/50">
                          {item.level || 'Level 1'}
                        </div>
                      </>
                    )}

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      {canManage ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(item, e)}
                            className="p-2 bg-white/95 text-amber-600 hover:bg-amber-500 hover:text-white rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition"
                            title="Edit Kata Isyarat"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(item, e)}
                            className="p-2 bg-white/95 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition"
                            title="Hapus Kata Isyarat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="bg-teal-600 text-white p-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition">
                          <Eye className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-xs font-extrabold text-teal-600 uppercase tracking-wider block">
                        {item.category?.replace('_', ' ')}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition mt-0.5">
                        {item.word}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 mt-1.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                      <span>{isVideo ? 'Putar Video Gerakan' : 'Lihat Gerakan Isyarat'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Modal Detail Gerakan Isyarat Bergambar */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Panduan Isyarat: ${selectedItem?.word || ''}`}
      >
        {selectedItem && (() => {
          const isVideo = !!(selectedItem.video_url || /\.(mp4|webm)$/i.test(selectedItem.image_url || '') || /\.(mp4|webm)$/i.test(selectedItem.illustration_url || ''));
          const mediaUrl = getUploadUrl(selectedItem.video_url || selectedItem.image_url || selectedItem.illustration_url);

          return (
            <div className="space-y-6">
              {isVideo ? (
                <div className="rounded-3xl overflow-hidden border border-slate-800 aspect-video bg-black flex items-center justify-center shadow-lg relative">
                  <video
                    controls
                    autoPlay
                    playsInline
                    src={mediaUrl}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-3xl overflow-hidden border border-slate-200 aspect-video bg-slate-50 flex items-center justify-center">
                  <SafeImage
                    src={mediaUrl}
                    alt={selectedItem.word}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg text-xs font-black uppercase flex items-center gap-1.5">
                    {isVideo && <Video className="w-3.5 h-3.5" />}
                    {selectedItem.category} • {selectedItem.level}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">The Little Hijabi BISINDO</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{selectedItem.word}</h3>
                <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-black text-teal-900 uppercase tracking-wider">💡 Cara Memperagakan Gerakan:</h4>
                  <p className="text-sm font-medium text-teal-950 leading-relaxed">{selectedItem.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDetailModalOpen(false);
                        handleOpenEdit(selectedItem);
                      }}
                      className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <Pencil className="w-4 h-4" /> Edit Kata
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedItem)}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-xl border border-rose-200 transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                ) : <div />}

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Tutup Panduan
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal Add Kata Isyarat Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Kosakata Isyarat (Foto / Video MP4)"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kata / Kosakata *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Ayam, Kucing, Ayah, Huruf C"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="alfabet">Alfabet Isyarat</option>
                <option value="angka">Angka Isyarat</option>
                <option value="siapa_aku">Siapa Aku</option>
                <option value="keluarga">Keluarga</option>
                <option value="rumah_tinggal">Rumah Tinggal</option>
                <option value="hobi">Hobi</option>
                <option value="makanan_minuman">Makanan & Minuman</option>
                <option value="hewan">Hewan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
                <option value="Level 5">Level 5</option>
              </select>
            </div>
          </div>

          {/* Direct File & Video MP4 Uploader */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
              Upload File Foto atau Video Gerakan Isyarat (MP4) *
            </label>

            <input
              ref={mediaInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,.mp4,.webm"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleMediaSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {uploadingMedia ? (
              <div className="border-2 border-dashed border-teal-400 rounded-3xl p-8 text-center bg-teal-50/60 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="text-base font-black text-slate-800">Sedang mengunggah file media ke /uploads...</p>
                <p className="text-xs text-slate-500">Mendukung video MP4 hingga 200MB. Mohon tunggu beberapa saat.</p>
              </div>
            ) : (formData.video_url || formData.image_url) ? (
              <div className="border-2 border-teal-400 bg-teal-50/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-teal-800 font-extrabold text-xs min-w-0 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">{formData.video_url ? 'Video MP4 Gerakan Siap Disimpan' : 'Foto Gerakan Siap Disimpan'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image_url: '', video_url: '' }));
                      setUploadedMediaInfo(null);
                    }}
                    className="px-3 py-1 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition shrink-0"
                  >
                    Ganti File
                  </button>
                </div>

                {/* Preview media */}
                <div className="rounded-2xl overflow-hidden border border-teal-200 bg-slate-900 max-h-48 flex items-center justify-center">
                  {formData.video_url || /\.(mp4|webm)$/i.test(formData.image_url) ? (
                    <video
                      controls
                      src={getUploadUrl(formData.video_url || formData.image_url)}
                      className="w-full max-h-48 object-contain"
                    />
                  ) : (
                    <img
                      src={getUploadUrl(formData.image_url)}
                      alt="Preview"
                      className="w-full max-h-48 object-cover"
                    />
                  )}
                </div>
                {uploadedMediaInfo && (
                  <p className="text-xs text-slate-500 font-medium">
                    File: <span className="font-bold text-slate-700">{uploadedMediaInfo.name}</span> ({uploadedMediaInfo.size})
                  </p>
                )}
              </div>
            ) : (
              <div
                onClick={() => mediaInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleMediaSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-3xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center group ${
                  isDragging 
                    ? 'border-teal-600 bg-teal-50/80 scale-[1.01]' 
                    : 'border-teal-300 bg-teal-50/40 hover:bg-teal-50/80 hover:border-teal-500'
                }`}
              >
                <div className="w-14 h-14 bg-teal-100 group-hover:bg-teal-200 text-teal-700 rounded-2xl flex items-center justify-center mb-3 transition shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-black text-slate-900">
                  Tarik & Lepas File ke Sini, atau <span className="text-teal-600 underline">Klik untuk Pilih File</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Mendukung: <span className="font-bold text-slate-700">Video MP4, WEBM</span> atau <span className="font-bold text-slate-700">Foto JPG, PNG, WEBP</span> (Maksimal 200MB)
                </p>
              </div>
            )}

            {/* Manual Link Input Toggle */}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setShowManualLink(!showManualLink)}
                className="text-xs font-bold text-slate-500 hover:text-teal-600 underline"
              >
                {showManualLink ? 'Tutup input URL manual' : 'Atau input URL link langsung'}
              </button>
            </div>

            {showManualLink && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="URL Gambar: https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 font-medium"
                />
                <input
                  type="text"
                  placeholder="URL Video MP4: https://.../video.mp4"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 font-medium"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Deskripsi / Panduan Gerakan Tangan</label>
            <textarea
              rows={2}
              placeholder="Jelaskan bentuk jari, tangan, dan posisi gerakan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-600 font-medium text-sm"
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
              disabled={uploadingMedia || (!formData.image_url && !formData.video_url)}
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
            >
              Simpan ke Kamus
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Kata Isyarat */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Kata Isyarat: ${editingItem?.word || ''}`}
      >
        <form onSubmit={handleUpdateItem} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kata / Kosakata *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Ayam, Kucing, Ayah, Huruf C"
              value={editFormData.word}
              onChange={(e) => setEditFormData({ ...editFormData, word: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kategori</label>
              <select
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="alfabet">Alfabet Isyarat</option>
                <option value="angka">Angka Isyarat</option>
                <option value="siapa_aku">Siapa Aku</option>
                <option value="keluarga">Keluarga</option>
                <option value="rumah_tinggal">Rumah Tinggal</option>
                <option value="hobi">Hobi</option>
                <option value="makanan_minuman">Makanan & Minuman</option>
                <option value="hewan">Hewan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Level</label>
              <select
                value={editFormData.level}
                onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
              >
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
                <option value="Level 5">Level 5</option>
              </select>
            </div>
          </div>

          {/* Media Uploader in Edit */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
              File Foto atau Video Gerakan Isyarat (MP4) *
            </label>

            <input
              ref={editMediaInputRef}
              type="file"
              accept="image/*,video/mp4,video/webm,.mp4,.webm"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleEditMediaSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {uploadingEditMedia ? (
              <div className="border-2 border-dashed border-teal-400 rounded-3xl p-8 text-center bg-teal-50/60 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <p className="text-base font-black text-slate-800">Sedang mengunggah file media baru...</p>
                <p className="text-xs text-slate-500">Mendukung video MP4 hingga 200MB.</p>
              </div>
            ) : (editFormData.video_url || editFormData.image_url) ? (
              <div className="border-2 border-teal-400 bg-teal-50/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-teal-800 font-extrabold text-xs min-w-0 flex-1">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="truncate">{editFormData.video_url ? 'Video MP4 Gerakan Tersedia' : 'Foto Gerakan Tersedia'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => editMediaInputRef.current?.click()}
                    className="px-3 py-1 text-xs font-bold text-teal-700 bg-teal-100 hover:bg-teal-200 rounded-xl transition shrink-0"
                  >
                    Ganti Media
                  </button>
                </div>

                {/* Preview media */}
                <div className="rounded-2xl overflow-hidden border border-teal-200 bg-slate-900 max-h-48 flex items-center justify-center">
                  {editFormData.video_url || /\.(mp4|webm)$/i.test(editFormData.image_url) ? (
                    <video
                      controls
                      src={getUploadUrl(editFormData.video_url || editFormData.image_url)}
                      className="w-full max-h-48 object-contain"
                    />
                  ) : (
                    <img
                      src={getUploadUrl(editFormData.image_url)}
                      alt="Preview"
                      className="w-full max-h-48 object-cover"
                    />
                  )}
                </div>
                {uploadedEditMediaInfo && (
                  <p className="text-xs text-slate-500 font-medium">
                    File Baru: <span className="font-bold text-slate-700">{uploadedEditMediaInfo.name}</span> ({uploadedEditMediaInfo.size})
                  </p>
                )}
              </div>
            ) : (
              <div
                onClick={() => editMediaInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsEditDragging(true); }}
                onDragLeave={() => setIsEditDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsEditDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleEditMediaSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-3xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center group ${
                  isEditDragging 
                    ? 'border-teal-600 bg-teal-50/80 scale-[1.01]' 
                    : 'border-teal-300 bg-teal-50/40 hover:bg-teal-50/80 hover:border-teal-500'
                }`}
              >
                <div className="w-14 h-14 bg-teal-100 group-hover:bg-teal-200 text-teal-700 rounded-2xl flex items-center justify-center mb-3 transition shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-black text-slate-900">
                  Tarik & Lepas File Baru ke Sini, atau <span className="text-teal-600 underline">Klik untuk Pilih File</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Mendukung: <span className="font-bold text-slate-700">Video MP4, WEBM</span> atau <span className="font-bold text-slate-700">Foto JPG, PNG, WEBP</span>
                </p>
              </div>
            )}

            {/* Manual Link Input Toggle in Edit */}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setShowEditManualLink(!showEditManualLink)}
                className="text-xs font-bold text-slate-500 hover:text-teal-600 underline"
              >
                {showEditManualLink ? 'Tutup input URL manual' : 'Atau ubah URL link langsung'}
              </button>
            </div>

            {showEditManualLink && (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="URL Gambar: https://..."
                  value={editFormData.image_url}
                  onChange={(e) => setEditFormData({ ...editFormData, image_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 font-medium"
                />
                <input
                  type="text"
                  placeholder="URL Video MP4: https://.../video.mp4"
                  value={editFormData.video_url}
                  onChange={(e) => setEditFormData({ ...editFormData, video_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 font-medium"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Deskripsi / Panduan Gerakan Tangan</label>
            <textarea
              rows={2}
              placeholder="Jelaskan bentuk jari, tangan, dan posisi gerakan..."
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-600 font-medium text-sm"
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
              disabled={uploadingEditMedia || (!editFormData.image_url && !editFormData.video_url)}
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
