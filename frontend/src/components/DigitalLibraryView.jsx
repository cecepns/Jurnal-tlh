import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Plus, FileText, Download, BookOpen, Presentation, Sparkles, 
  Eye, Trash2, Filter, UploadCloud, CheckCircle2, File, Image as ImageIcon,
  Loader2, X, ExternalLink
} from 'lucide-react';
import { SafeImage } from './SafeImage';
import { request } from '../utils/request';
import { API_ENDPOINTS, getUploadUrl } from '../utils/endpoints';
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
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

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

  const handleFileSelect = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const sizeStr = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    // Auto-detect type based on extension
    let detectedType = formData.type;
    if (['ppt', 'pptx'].includes(ext)) {
      detectedType = 'ppt_materi';
    } else if (['doc', 'docx'].includes(ext)) {
      detectedType = 'worksheet';
    } else if (['pdf'].includes(ext)) {
      detectedType = 'buku_bacaan';
    }

    // Auto-suggest clean title from file name if empty
    let suggestedTitle = formData.title;
    if (!suggestedTitle) {
      suggestedTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }

    setUploadingFile(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await request.post(API_ENDPOINTS.UPLOADS.UPLOAD_FILE, uploadData);
      if (res.success && res.data) {
        const fileUrl = res.data.url;
        setFormData(prev => ({
          ...prev,
          title: prev.title || suggestedTitle,
          type: detectedType,
          file_url: fileUrl,
          file_size: sizeStr,
          thumbnail_url: prev.thumbnail_url || (['png', 'jpg', 'jpeg', 'webp'].includes(ext) ? fileUrl : prev.thumbnail_url)
        }));
        setUploadedFileInfo({
          name: file.name,
          size: sizeStr,
          ext: ext.toUpperCase()
        });
        toast.success(`🎉 File "${file.name}" berhasil diunggah!`);
      } else {
        toast.error(res.message || 'Gagal mengunggah file');
      }
    } catch (err) {
      console.error('File upload error:', err);
      toast.error(err.response?.data?.message || 'Gagal mengunggah file ke server');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleThumbnailSelect = async (file) => {
    if (!file) return;
    setUploadingThumbnail(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    try {
      const res = await request.post(API_ENDPOINTS.UPLOADS.UPLOAD_FILE, uploadData);
      if (res.success && res.data) {
        setFormData(prev => ({ ...prev, thumbnail_url: res.data.url }));
        toast.success('Foto sampul berhasil diunggah!');
      }
    } catch (err) {
      toast.error('Gagal mengunggah foto sampul');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Judul bahan ajar wajib diisi!');
      return;
    }
    if (!formData.file_url) {
      toast.error('Silakan upload file dokumen/materi terlebih dahulu!');
      return;
    }

    try {
      const payload = {
        ...formData,
        thumbnail_url: formData.thumbnail_url || null
      };
      const res = await request.post(API_ENDPOINTS.LIBRARY.CREATE, payload);
      if (res.success) {
        toast.success(`🎉 Bahan ajar "${formData.title}" berhasil disimpan ke Library!`);
        setIsAddModalOpen(false);
        setUploadedFileInfo(null);
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
                    src={doc.thumbnail_url || (/\.(jpg|jpeg|png|webp|gif)$/i.test(doc.file_url || '') ? doc.file_url : null)}
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

      {/* Modal Document / PDF / PPT / Image Viewer */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title={activeDoc?.title || "Penampil Dokumen & Bahan Ajar"}
      >
        {activeDoc && (() => {
          const fileUrl = getUploadUrl(activeDoc.file_url);
          const isPdf = (activeDoc.file_url || '').toLowerCase().includes('.pdf');
          const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(activeDoc.file_url || '');
          const isPpt = /\.(ppt|pptx)$/i.test(activeDoc.file_url || '');
          const isDoc = /\.(doc|docx)$/i.test(activeDoc.file_url || '');

          return (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl">
                <div>
                  <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">{activeDoc.category} • {activeDoc.level}</span>
                  <h4 className="text-base font-black text-slate-900 mt-0.5">{activeDoc.title}</h4>
                </div>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition shrink-0"
                >
                  <Download className="w-4 h-4" /> Unduh / Download File
                </a>
              </div>

              {/* Multi-Format Preview Display */}
              {isImage ? (
                <div className="flex items-center justify-center p-4 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden">
                  <img
                    src={fileUrl}
                    alt={activeDoc.title}
                    className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl shadow-md"
                  />
                </div>
              ) : isPdf ? (
                <div className="aspect-[4/3] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
                  <iframe
                    src={fileUrl}
                    title={activeDoc.title}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                /* PPT or DOC Presentation Card */
                <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-dashed border-amber-300 rounded-3xl p-8 text-center space-y-5 shadow-inner">
                  <div className="w-20 h-20 bg-amber-500 text-white rounded-3xl shadow-lg flex items-center justify-center mx-auto text-4xl">
                    {isPpt ? '📊' : isDoc ? '📝' : '📂'}
                  </div>
                  <div className="space-y-1.5">
                    <span className="px-3.5 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-black uppercase tracking-wider">
                      {isPpt ? 'Slide Presentasi PPT / PPTX' : isDoc ? 'Lembar Kerja Dokumen DOC / DOCX' : 'Bahan Ajar Digital'}
                    </span>
                    <h4 className="text-xl font-black text-slate-900 pt-1">{activeDoc.title}</h4>
                    <p className="text-xs text-slate-600 font-medium">Ukuran File: {activeDoc.file_size || 'Bahan Materi'}</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <a
                      href={fileUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl shadow-lg transition text-sm"
                    >
                      <Download className="w-5 h-5" /> Download Materi ({isPpt ? 'PPT' : 'Dokumen'})
                    </a>
                    <a
                      href={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-2xl border border-slate-300 shadow-sm transition text-sm"
                    >
                      <ExternalLink className="w-4 h-4" /> Buka via Google Docs Viewer
                    </a>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-500 text-center font-medium">
                💡 Dokumen & materi ini tersimpan langsung di server (/uploads) dan dapat diulang-ulang dipelajari bersama anak.
              </p>
            </div>
          );
        })()}
      </Modal>

      {/* Modal Upload New Document */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload Bahan Ajar (PDF, PPT, DOC, PNG)"
      >
        <form onSubmit={handleSaveDoc} className="space-y-5">
          {/* GDrive Style File Dropzone */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-2">
              1. Pilih / Upload File Dokumen (Kayak GDrive) *
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {uploadingFile ? (
              <div className="border-2 border-dashed border-indigo-400 rounded-3xl p-8 text-center bg-indigo-50/60 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-base font-black text-slate-800">Sedang mengunggah file ke /uploads...</p>
                <p className="text-xs text-slate-500">Mendukung file besar hingga 200MB. Mohon tunggu beberapa saat.</p>
              </div>
            ) : formData.file_url ? (
              <div className="border-2 border-emerald-400 bg-emerald-50/70 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm ${
                    formData.type === 'ppt_materi' ? 'bg-amber-500' :
                    formData.type === 'worksheet' ? 'bg-blue-600' : 'bg-rose-600'
                  }`}>
                    {uploadedFileInfo?.ext || (formData.type === 'ppt_materi' ? 'PPT' : 'PDF')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-extrabold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>File Berhasil Diunggah & Siap Disimpan</span>
                    </div>
                    <p className="text-sm font-black text-slate-900 truncate mt-0.5">
                      {uploadedFileInfo?.name || formData.file_url.split('/').pop()}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">Ukuran: {formData.file_size}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, file_url: '' }));
                    setUploadedFileInfo(null);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-xl transition shrink-0"
                >
                  Ganti File
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-3xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center group ${
                  isDragging 
                    ? 'border-indigo-600 bg-indigo-50/80 scale-[1.01]' 
                    : 'border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50/80 hover:border-indigo-500'
                }`}
              >
                <div className="w-14 h-14 bg-indigo-100 group-hover:bg-indigo-200 text-indigo-700 rounded-2xl flex items-center justify-center mb-3 transition shadow-xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-base font-black text-slate-900">
                  Tarik & Lepas File ke Sini, atau <span className="text-indigo-600 underline">Klik untuk Pilih File</span>
                </p>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Mendukung: <span className="font-bold text-slate-700">PDF, PPT, PPTX, DOC, DOCX, PNG</span> (Maksimal 200MB)
                </p>
              </div>
            )}

            {/* Toggle manual link input */}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setShowManualUrl(!showManualUrl)}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 underline"
              >
                {showManualUrl ? 'Tutup input URL manual' : 'Atau input URL link www'}
              </button>
            </div>

            {showManualUrl && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="https://.../materi.pdf"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-medium"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">2. Judul Materi / Buku *</label>
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
                <option value="buku_bacaan">📖 Buku Bacaan PDF</option>
                <option value="worksheet">📝 Worksheet Latihan</option>
                <option value="ppt_materi">📊 Slide PPT Materi</option>
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

          {/* Thumbnail Image Picker / Upload */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Foto Sampul / Thumbnail (Opsional)</label>
            <input
              ref={thumbInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleThumbnailSelect(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex items-center gap-3">
              {formData.thumbnail_url ? (
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-slate-200 shadow-xs shrink-0">
                  <SafeImage src={formData.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: '' }))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-lg shadow-sm"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                disabled={uploadingThumbnail}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition"
              >
                {uploadingThumbnail ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-slate-500" />
                )}
                <span>{formData.thumbnail_url ? 'Ganti Foto Sampul' : 'Upload Foto Sampul (Gambar)'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={2}
              placeholder="Jelaskan isi buku atau latihan yang ada di dalam lembar kerja..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-600 font-medium text-sm"
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
              disabled={uploadingFile || !formData.file_url}
              className="px-6 py-2.5 text-sm font-extrabold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-md transition"
            >
              Simpan ke Library
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
