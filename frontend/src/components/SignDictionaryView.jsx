import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, BookOpen, Volume2, Eye, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
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
  const [formData, setFormData] = useState({
    word: '',
    category: 'alfabet',
    level: 'Level 1',
    image_url: '',
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

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.word) {
      toast.error('Kata / kosakata isyarat wajib diisi!');
      return;
    }

    try {
      const payload = {
        ...formData,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=500',
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [formData.word.toLowerCase()]
      };
      const res = await request.post(API_ENDPOINTS.DICTIONARY.CREATE, payload);
      if (res.success) {
        toast.success(`🎉 Kata isyarat "${formData.word}" berhasil ditambahkan ke Kamus Gambar!`);
        setIsAddModalOpen(false);
        setFormData({ word: '', category: 'alfabet', level: 'Level 1', image_url: '', description: '', tags: '' });
        fetchDictionary();
      }
    } catch (err) {
      toast.error('Gagal menambahkan kata isyarat');
    }
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
          {dictionaryList.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenDetail(item)}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-200 cursor-pointer flex flex-col group"
            >
              {/* Image Illustration Frame */}
              <div className="relative aspect-square bg-slate-100 overflow-hidden">
                <SafeImage
                  src={item.image_url || item.illustration_url}
                  alt={item.word}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-teal-800 shadow-sm border border-white/50">
                  {item.level || 'Level 1'}
                </div>
                <div className="absolute top-3 right-3 bg-teal-600 text-white p-2 rounded-xl shadow-md opacity-0 group-hover:opacity-100 transition">
                  <Eye className="w-4 h-4" />
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
                  <span>Lihat Gerakan Isyarat</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Gerakan Isyarat Bergambar */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Panduan Isyarat: ${selectedItem?.word || ''}`}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="rounded-3xl overflow-hidden border border-slate-200 aspect-video bg-slate-50 flex items-center justify-center">
              <SafeImage
                src={selectedItem.image_url || selectedItem.illustration_url}
                alt={selectedItem.word}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg text-xs font-black uppercase">
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

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Add Kata Isyarat Baru */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Kosakata Isyarat Bergambar Baru"
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

          <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">URL Gambar / Foto Gerakan Isyarat</label>
            <input
              type="text"
              placeholder="https://..."
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Deskripsi / Panduan Gerakan Tangan</label>
            <textarea
              rows={3}
              placeholder="Jelaskan bentuk jari, tangan, dan posisi gerakan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-600 font-medium"
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
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
            >
              Simpan ke Kamus
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
