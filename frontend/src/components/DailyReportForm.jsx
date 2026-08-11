import React, { useState } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { SafeImage } from './SafeImage';
import toast from 'react-hot-toast';
import { BookOpen, Camera, Tag, CheckCircle } from 'lucide-react';

export function DailyReportForm() {
  const [theme, setTheme] = useState('Mengenal Hewan & Bahasa Isyarat');
  const [subtheme, setSubtheme] = useState('Hewan Peliharaan (Kucing & Kelinci)');
  const [summary, setSummary] = useState(
    'Hari ini anak-anak belajar mengenal nama-nama hewan peliharaan dalam Bahasa Indonesia dan gerakan Bahasa Isyarat sederhana. Semua anak sangat antusias mewarnai gambar dan menirukan gerakan isyarat bersama.'
  );
  const [selectedActivities, setSelectedActivities] = useState(['Bahasa Indonesia', 'Bahasa Isyarat', 'Art Project']);
  const [taggedStudents, setTaggedStudents] = useState([1, 2, 3]);
  const [loading, setLoading] = useState(false);

  const activitiesOptions = [
    'Bahasa Indonesia', 'Bahasa Isyarat', 'Explore Qur\'an',
    'Story Telling', 'Life Skill', 'Art Project', 'Motorik Kasar', 'Sosial Emosional'
  ];

  const studentsList = [
    { id: 1, name: 'Aisyah Putri Humaira', avatar: 'https://images.unsplash.com/photo-1595454223600-91fbddbbf163?w=100' },
    { id: 2, name: 'Ahmad Zaki Al-Faris', avatar: 'https://images.unsplash.com/photo-1519238263530-99afd11df2ea?w=100' },
    { id: 3, name: 'Siti Zahra Medina', avatar: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=100' },
    { id: 4, name: 'Budi Pratama', avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=100' }
  ];

  const toggleActivity = (act) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter(a => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const toggleTagStudent = (id) => {
    if (taggedStudents.includes(id)) {
      setTaggedStudents(taggedStudents.filter(s => s !== id));
    } else {
      setTaggedStudents([...taggedStudents, id]);
    }
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!theme || !summary) {
      toast.error('Tema dan ringkasan kegiatan wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.DAILY_REPORTS.CREATE, {
        class_id: 1,
        theme,
        subtheme,
        summary,
        activities_list: selectedActivities,
        tagged_student_ids: taggedStudents,
        status: 'published'
      });

      if (res.success) {
        toast.success('🎉 Laporan Harian Kelas Berhasil Dipublikasikan ke Orang Tua!');
      }
    } catch (err) {
      toast.error('Gagal menyimpan laporan.');
    } finally {
      setLoading(false);
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await request.post(API_ENDPOINTS.UPLOADS.UPLOAD_FILE, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (res.success && res.data) {
          setUploadedFiles(prev => [...prev, { file_url: res.data.url, file_name: res.data.originalname }]);
          toast.success(`Foto ${res.data.originalname} berhasil diunggah!`);
        }
      } catch (err) {
        toast.error('Gagal mengunggah foto');
      }
    }
    setUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">+ Buat Catatan Harian Kelas</h1>
          <p className="text-base text-slate-600 font-medium mt-1">Buat 1 laporan harian untuk seluruh kelas & tandai siswa pada foto</p>
        </div>
        <span className="px-4 py-2 bg-teal-100 text-teal-800 rounded-xl font-extrabold text-sm border border-teal-200 shrink-0">
          Kelas: TK A - Al Fatih
        </span>
      </div>

      <form onSubmit={handleSubmitReport} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        {/* Informasi Utama */}
        <div className="space-y-5">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" /> 1. Tema & Subtema Pembelajaran
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Tema Utama *</label>
              <input
                type="text"
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Contoh: Mengenal Hewan"
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Subtema</label>
              <input
                type="text"
                value={subtheme}
                onChange={(e) => setSubtheme(e.target.value)}
                placeholder="Contoh: Hewan Peliharaan"
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Kategori Kegiatan Chips */}
        <div className="space-y-3">
          <label className="block text-sm font-extrabold text-slate-800">2. Pilih Kategori Kegiatan Hari Ini</label>
          <div className="flex flex-wrap gap-2.5">
            {activitiesOptions.map((act) => {
              const isSelected = selectedActivities.includes(act);
              return (
                <button
                  type="button"
                  key={act}
                  onClick={() => toggleActivity(act)}
                  className={`px-4 py-2 rounded-2xl text-sm font-bold transition border ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {act} {isSelected && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ringkasan */}
        <div>
          <label className="block text-sm font-extrabold text-slate-800 mb-1.5">3. Ringkasan Kegiatan Pembelajaran *</label>
          <textarea
            rows={4}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-4 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed font-medium"
          />
        </div>

        {/* Upload Dokumentasi Media */}
        <div className="space-y-3">
          <label className="block text-sm font-extrabold text-slate-800">4. Dokumentasi Foto / Video Kegiatan (/uploads API)</label>
          <label className="border-2 border-dashed border-teal-300 rounded-3xl p-6 text-center bg-teal-50/40 hover:bg-teal-50/80 transition cursor-pointer flex flex-col items-center justify-center">
            <Camera className="w-10 h-10 text-teal-600 mb-2" />
            <p className="text-base font-extrabold text-slate-800">
              {uploading ? 'Mengunggah file ke /uploads...' : 'Pilih / Upload Foto Kegiatan'}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Format: JPG, PNG, WEBP, MP4 (Maksimal 10MB)</p>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
                  <SafeImage src={file.file_url} alt={file.file_name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-slate-900/70 text-white text-[10px] truncate p-1 text-center font-bold">
                    {file.file_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tag Siswa */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <Tag className="w-5 h-5 text-teal-600" /> 5. Tag Siswa dalam Foto & Laporan Ini
            </label>
            <span className="text-xs text-teal-700 font-extrabold bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
              Foto otomatis masuk ke Portfolio {taggedStudents.length} siswa ter-tag
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {studentsList.map((st) => {
              const isTagged = taggedStudents.includes(st.id);
              return (
                <div
                  key={st.id}
                  onClick={() => toggleTagStudent(st.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-3 transition ${
                    isTagged
                      ? 'bg-teal-50 border-teal-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 opacity-60'
                  }`}
                >
                  <SafeImage
                    src={st.avatar}
                    alt={st.name}
                    isAvatar={true}
                    fallbackText={st.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <span className="text-sm font-bold text-slate-900 truncate">{st.name.split(' ')[0]}</span>
                  {isTagged && <CheckCircle className="w-4 h-4 text-teal-600 ml-auto shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-base font-black rounded-2xl shadow-xl shadow-teal-600/30 transition flex items-center justify-center gap-3"
          >
            <CheckCircle className="w-5 h-5" /> Publikasikan Laporan ke Orang Tua
          </button>
        </div>
      </form>
    </div>
  );
}
