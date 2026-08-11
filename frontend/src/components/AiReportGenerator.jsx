import React, { useState } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { Sparkles, Check, RefreshCw, BookOpen } from 'lucide-react';

export function AiReportGenerator() {
  const [studentName, setStudentName] = useState('Aisyah Putri Humaira');
  const [teacherNotes, setTeacherNotes] = useState(
    'Aisyah sangat aktif mengikuti kegiatan. Sudah mulai lancar memeragakan Bahasa Isyarat abjad A-E. Sangat suka mewarnai gambar hewan. Masih perlu sedikit dorongan agar mau berbagi mainan dengan teman.'
  );
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!teacherNotes) {
      toast.error('Masukkan poin catatan perkembangan terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.AI.GENERATE_REPORT, {
        student_name: studentName,
        teacher_notes: teacherNotes
      });

      if (res.success) {
        setAiResult(res.data.narrative);
        setSuggestions(res.data.suggestions || []);
        toast.success('✨ Narasi laporan AI berhasil dibuat!');
      }
    } catch (err) {
      toast.error('Gagal memproses AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDraft = () => {
    toast.success('Laporan perkembangan disimpan sebagai Draft untuk ditinjau Kepala Sekolah!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black mb-1">
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            Fitur AI Asisten Guru
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">✨ AI Report Narrative Generator</h1>
          <p className="text-teal-100 text-base font-medium max-w-2xl leading-relaxed">
            Tuliskan beberapa poin ringkas aktivitas siswa. AI akan menyusun narasi perkembangan deskriptif yang profesional, penuh motivasi, dan hangat untuk orang tua.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            Catatan Ringkas Guru
          </h2>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Pilih Siswa Target *</label>
            <select
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-slate-50 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="Aisyah Putri Humaira">Aisyah Putri Humaira (TK A)</option>
              <option value="Ahmad Zaki Al-Faris">Ahmad Zaki Al-Faris (TK A)</option>
              <option value="Siti Zahra Medina">Siti Zahra Medina (TK A)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Catatan Kasar Aktivitas *</label>
            <textarea
              rows={6}
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Contoh: Anak antusias melukis, sudah hapal gerakan isyarat makan, tapi perlu pendampingan saat merapikan mainan..."
              className="w-full p-4 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 leading-relaxed font-medium"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black text-base rounded-2xl shadow-xl shadow-teal-600/30 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Meracik Narasi AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" />
                Generate dengan AI Sekarang
              </>
            )}
          </button>
        </div>

        {/* AI Output Result Card */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-sm font-black uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Hasil Narasi AI
              </span>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">Siap Review</span>
            </div>

            {aiResult ? (
              <div className="space-y-5">
                <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 text-base text-slate-100 leading-relaxed font-medium">
                  "{aiResult}"
                </div>

                {suggestions.length > 0 && (
                  <div className="bg-teal-950/80 p-5 rounded-2xl border border-teal-800/80 space-y-2">
                    <div className="text-sm font-black text-teal-300">💡 Rekomendasi Tindak Lanjut Orang Tua:</div>
                    <ul className="text-sm text-teal-100 space-y-1.5 list-disc list-inside font-medium">
                      {suggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <Sparkles className="w-12 h-12 mx-auto text-slate-700" />
                <p className="text-base font-bold text-slate-300">Klik "Generate dengan AI" untuk menyusun narasi otomatis.</p>
              </div>
            )}
          </div>

          {aiResult && (
            <div className="pt-4 border-t border-slate-800 flex gap-3">
              <button
                onClick={handleGenerate}
                className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-sm font-bold text-slate-200 rounded-xl transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button
                onClick={handleSaveToDraft}
                className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-500 text-sm font-black text-white rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Simpan Laporan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
