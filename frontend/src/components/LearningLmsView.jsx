import React, { useState, useEffect } from 'react';
import { Play, Award, Sparkles, BookOpen, Star, Plus, Edit, Trash2, Video } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from './Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function LearningLmsView({ defaultTab = 'learning' }) {
  const { user } = useAuth();
  const canManage = user?.role === 'teacher' || user?.role === 'super_admin' || user?.role === 'school_admin';

  const [coursesList, setCoursesList] = useState([]);
  const [quizzesList, setQuizzesList] = useState([]);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab); // 'learning' or 'quizzes'

  const [quizAnswer, setQuizAnswer] = useState(null);
  const [xp, setXp] = useState(240);
  const [streak, setStreak] = useState(7);
  const [loading, setLoading] = useState(true);

  // Modal State for Course CRUD
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    category: 'Bahasa Isyarat',
    level: 'Level 1',
    description: '',
    thumbnail: '',
    video_url: ''
  });

  // Modal State for Quiz CRUD
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizFormData, setQuizFormData] = useState({
    question: '',
    optA: '',
    optB: '',
    optC: '',
    correctOpt: 'a',
    xp: 50
  });

  useEffect(() => {
    fetchCoursesAndQuizzes();
  }, []);

  const fetchCoursesAndQuizzes = async () => {
    setLoading(true);
    try {
      const [coursesRes, quizzesRes] = await Promise.all([
        request.get(API_ENDPOINTS.LMS.COURSES).catch(() => ({ success: false })),
        request.get(API_ENDPOINTS.LMS.QUIZZES).catch(() => ({ success: false }))
      ]);

      if (coursesRes.success && Array.isArray(coursesRes.data) && coursesRes.data.length > 0) {
        setCoursesList(coursesRes.data);
        setActiveCourseId(coursesRes.data[0].id);
      } else {
        const fallbackCourses = [
          {
            id: 1,
            title: 'Bahasa Isyarat Dasar Anak',
            category: 'Bahasa Isyarat',
            level: 'Level 1',
            thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400',
            description: 'Mengenal isyarat abjad, kata kerja, dan interaksi sehari-hari dengan materi video interaktif.',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          },
          {
            id: 2,
            title: 'Pengenalan Alfabet & Kata',
            category: 'Bahasa Indonesia',
            level: 'Level 1',
            thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
            description: 'Belajar mengeja dan menderet kata vokal sederhana dengan ceria.',
            video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
          }
        ];
        setCoursesList(fallbackCourses);
        setActiveCourseId(1);
      }

      if (quizzesRes.success && Array.isArray(quizzesRes.data)) {
        setQuizzesList(quizzesRes.data);
      }
    } catch (err) {
      console.error('Error fetching LMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentCourseObj = coursesList.find(c => c.id === activeCourseId) || coursesList[0] || {};

  const handleOpenAddCourse = () => {
    setSelectedCourse(null);
    setCourseFormData({
      title: '',
      category: 'Bahasa Isyarat',
      level: 'Level 1',
      description: '',
      thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course, e) => {
    e.stopPropagation();
    setSelectedCourse(course);
    setCourseFormData({
      title: course.title || '',
      category: course.category || 'Bahasa Isyarat',
      level: course.level || 'Level 1',
      description: course.description || '',
      thumbnail: course.thumbnail || course.thumbnail_url || '',
      video_url: course.video_url || ''
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseFormData.title) {
      toast.error('Judul modul wajib diisi!');
      return;
    }

    try {
      if (selectedCourse) {
        await request.put(API_ENDPOINTS.LMS.UPDATE_COURSE(selectedCourse.id), courseFormData);
        setCoursesList(prev => prev.map(c => c.id === selectedCourse.id ? { ...c, ...courseFormData } : c));
        toast.success(`🎉 Modul ${courseFormData.title} berhasil diperbarui!`);
      } else {
        const res = await request.post(API_ENDPOINTS.LMS.CREATE_COURSE, courseFormData);
        if (res.success) {
          setCoursesList([res.data, ...coursesList]);
          setActiveCourseId(res.data.id);
          toast.success('🎉 Modul materi baru berhasil ditambahkan!');
        }
      }
      setIsCourseModalOpen(false);
    } catch (err) {
      toast.error('Gagal menyimpan modul materi');
    }
  };

  const handleDeleteCourse = (id, title, e) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <p className="font-bold text-slate-800 text-base">Hapus modul {title}?</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => toast.dismiss(t.id)} className="px-3.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300">Batal</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await request.delete(API_ENDPOINTS.LMS.DELETE_COURSE(id));
                setCoursesList(prev => prev.filter(c => c.id !== id));
                toast.success(`Modul ${title} dihapus.`);
              } catch (err) {
                toast.error('Gagal menghapus modul');
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

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizAnswer) {
      toast.error('Pilih salah satu jawaban kuis!');
      return;
    }

    if (quizAnswer === 'a' || quizAnswer === 'Huruf A') {
      setXp(prev => prev + 50);
      toast.success('🎉 Jawaban Benar! Kamu mendapatkan +50 XP!');
    } else {
      toast.error('Jawaban kurang tepat. Coba perhatikan gerakan video lagi!');
    }
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!quizFormData.question || !quizFormData.optA || !quizFormData.optB) {
      toast.error('Pertanyaan dan Opsi Jawaban wajib diisi!');
      return;
    }

    const newQuizObj = {
      id: Date.now(),
      question: quizFormData.question,
      options: [
        { id: 'a', text: quizFormData.optA },
        { id: 'b', text: quizFormData.optB },
        { id: 'c', text: quizFormData.optC || 'Pilihan C' }
      ],
      xp: Number(quizFormData.xp) || 50
    };

    try {
      await request.post(API_ENDPOINTS.LMS.CREATE_QUIZ, newQuizObj);
      setQuizzesList([newQuizObj, ...quizzesList]);
      toast.success('🎉 Soal Kuis Interaktif Baru Berhasil Ditambahkan!');
      setIsQuizModalOpen(false);
      setQuizFormData({ question: '', optA: '', optB: '', optC: '', correctOpt: 'a', xp: 50 });
    } catch (err) {
      toast.error('Gagal menambahkan kuis');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-teal-900/60 border border-teal-400/30 rounded-full text-xs font-black uppercase tracking-wider text-teal-200">
              LMS Platform Belajar
            </span>
            {canManage && (
              <span className="px-3 py-0.5 bg-amber-400 text-slate-900 text-xs font-black rounded-lg">
                ✍️ Mode Pengelola Materi
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Modul Bahasa Isyarat & Kuis Interaktif</h1>
          <p className="text-teal-100 text-base font-medium">Media pembelajaran interaktif khusus anak-anak & ustadzah pendamping</p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shrink-0">
          <div className="text-center px-4 border-r border-white/20">
            <div className="text-xs uppercase font-extrabold text-amber-300">Total XP</div>
            <div className="text-xl font-black flex items-center justify-center gap-1.5 mt-0.5">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300" /> {xp}
            </div>
          </div>
          <div className="text-center px-4">
            <div className="text-xs uppercase font-extrabold text-amber-300">Streak Belajar</div>
            <div className="text-xl font-black mt-0.5">🔥 {streak} Hari</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation: Modul Bahasa Isyarat vs Kuis & Games */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
          <button
            onClick={() => setActiveTab('learning')}
            className={`flex items-center justify-center gap-2 px-5 py-3 font-black text-sm sm:text-base rounded-2xl transition ${
              activeTab === 'learning'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-5 h-5 shrink-0" /> Modul & Video
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center justify-center gap-2 px-5 py-3 font-black text-sm sm:text-base rounded-2xl transition ${
              activeTab === 'quizzes'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Award className="w-5 h-5 shrink-0" /> Kuis Interaktif
          </button>
        </div>

        {canManage && (
          <div className="shrink-0">
            {activeTab === 'learning' ? (
              <button
                onClick={handleOpenAddCourse}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white text-sm font-black rounded-2xl shadow-md transition"
              >
                <Plus className="w-4 h-4" /> + Tambah Modul Materi
              </button>
            ) : (
              <button
                onClick={() => setIsQuizModalOpen(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-purple-700 hover:bg-purple-800 text-white text-sm font-black rounded-2xl shadow-md transition"
              >
                <Plus className="w-4 h-4" /> + Buat Kuis Interaktif
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB CONTENT 1: MODUL & VIDEO PEMBELAJARAN */}
      {activeTab === 'learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Catalog List */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-teal-600" /> Daftar Modul
              </span>
              <span className="text-xs font-bold text-slate-500">{coursesList.length} Modul</span>
            </h2>

            <div className="space-y-4">
              {coursesList.map((course) => (
                <div
                  key={course.id}
                  onClick={() => setActiveCourseId(course.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition duration-200 relative group ${
                    activeCourseId === course.id
                      ? 'bg-teal-50/90 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex gap-4">
                    <SafeImage
                      src={course.thumbnail || course.thumbnail_url}
                      alt={course.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 pr-8">
                      <span className="text-xs font-extrabold uppercase text-teal-800 bg-teal-100/90 px-2.5 py-0.5 rounded-md">
                        {course.category}
                      </span>
                      <h3 className="font-black text-slate-900 text-base truncate mt-1.5">{course.title}</h3>
                      <p className="text-sm text-slate-600 line-clamp-2 mt-1 font-medium">{course.description}</p>
                    </div>
                  </div>

                  {canManage && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleOpenEditCourse(course, e)}
                        className="p-1.5 bg-white text-teal-700 hover:bg-teal-100 rounded-lg shadow-sm border border-slate-200"
                        title="Edit Modul"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCourse(course.id, course.title, e)}
                        className="p-1.5 bg-white text-rose-600 hover:bg-rose-100 rounded-lg shadow-sm border border-slate-200"
                        title="Hapus Modul"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Video Player & Detail Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-black text-teal-600 uppercase tracking-wider">{currentCourseObj.category}</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{currentCourseObj.title}</h2>
                </div>
                <span className="px-3.5 py-1.5 text-xs font-black bg-amber-100 text-amber-800 rounded-full flex items-center gap-1.5 border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> Badge Reward
                </span>
              </div>

              {/* Video Player Frame */}
              <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden flex items-center justify-center border border-slate-800 shadow-lg">
                <iframe
                  src={currentCourseObj.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                  title={currentCourseObj.title}
                  className="w-full h-full rounded-3xl"
                  allowFullScreen
                />
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-base">Deskripsi Modul Pembelajaran:</h4>
                <p className="text-slate-600 text-sm font-medium leading-relaxed">{currentCourseObj.description}</p>
              </div>
            </div>
          </div>
          {/* TAB CONTENT 2: KUIS & GAMES INTERAKTIF */}
          {activeTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">Kuis & Challenge Isyarat Interaktif</h2>
                    <p className="text-slate-600 text-sm font-medium mt-1">Uji pemahaman anak dengan kuis menyenangkan bertabur XP bonus</p>
                  </div>
                  <span className="px-4 py-2 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-xl border border-purple-200 shrink-0">
                    🎮 Total Kuis: {quizzesList.length > 0 ? quizzesList.length : 1}
                  </span>
                </div>

                {/* Dynamic Quizzes List */}
                <div className="space-y-6 max-w-3xl mx-auto">
                  {(quizzesList.length > 0 ? quizzesList : [
                    {
                      id: 1,
                      question: 'Gerakan mengepalkan tangan dengan ibu jari tegak di samping melambangkan isyarat huruf apa?',
                      options: [
                        { id: 'a', text: 'Huruf A' },
                        { id: 'b', text: 'Huruf B' },
                        { id: 'c', text: 'Huruf C' }
                      ],
                      xp: 50
                    }
                  ]).map((q, idx) => (
                    <div key={q.id || idx} className="p-5 sm:p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600 shrink-0" /> Kuis Soal #{idx + 1} (+{q.xp || 50} XP)
                        </h3>
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                          Tantangan Harian
                        </span>
                      </div>

                      <p className="text-base sm:text-lg font-extrabold text-slate-800 leading-snug">
                        {q.question}
                      </p>

                      <form onSubmit={handleQuizSubmit} className="space-y-3">
                        {(q.options || [
                          { id: 'a', text: 'Opsi A' },
                          { id: 'b', text: 'Opsi B' }
                        ]).map((opt, oIdx) => (
                          <label
                            key={opt.id || oIdx}
                            className={`flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer text-sm sm:text-base font-bold transition ${
                              quizAnswer === `${q.id}-${opt.id || opt.text}`
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                                : 'bg-white text-slate-800 border-slate-200 hover:bg-purple-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz-${q.id}`}
                              value={`${q.id}-${opt.id || opt.text}`}
                              checked={quizAnswer === `${q.id}-${opt.id || opt.text}`}
                              onChange={() => setQuizAnswer(`${q.id}-${opt.id || opt.text}`)}
                              className="hidden"
                            />
                            <span>{opt.text}</span>
                          </label>
                        ))}

                        <button
                          type="submit"
                          className="w-full py-3.5 mt-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-base rounded-2xl shadow-lg shadow-purple-600/30 transition"
                        >
                          Jawab & Klaim XP
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Course */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={selectedCourse ? "Edit Modul Pembelajaran" : "Tambah Modul Pembelajaran Baru"}
      >
        <form onSubmit={handleSaveCourse} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Judul Modul Pembelajaran *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Isyarat Kata Kerja Sehari-hari"
              value={courseFormData.title}
              onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Kategori Materi</label>
            <select
              value={courseFormData.category}
              onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl bg-white font-bold text-slate-800"
            >
              <option value="Bahasa Isyarat">Bahasa Isyarat</option>
              <option value="Bahasa Indonesia">Bahasa Indonesia</option>
              <option value="Story Telling">Story Telling</option>
              <option value="Life Skill">Life Skill</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">URL Video Embed (YouTube / MP4)</label>
            <input
              type="text"
              placeholder="https://www.youtube.com/embed/xxxx"
              value={courseFormData.video_url}
              onChange={(e) => setCourseFormData({ ...courseFormData, video_url: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Deskripsi Singkat</label>
            <textarea
              rows={3}
              placeholder="Penjelasan materi untuk anak dan panduan pendampingan orang tua..."
              value={courseFormData.description}
              onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCourseModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-md"
            >
              Simpan Modul Materi
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Add Quiz */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title="Buat Kuis Interaktif Baru"
      >
        <form onSubmit={handleSaveQuiz} className="space-y-5">
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Pertanyaan Kuis *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Isyarat tangan mengepal melambangkan huruf..."
              value={quizFormData.question}
              onChange={(e) => setQuizFormData({ ...quizFormData, question: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Opsi Jawaban A *</label>
            <input
              type="text"
              required
              placeholder="Huruf A"
              value={quizFormData.optA}
              onChange={(e) => setQuizFormData({ ...quizFormData, optA: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Opsi Jawaban B *</label>
            <input
              type="text"
              required
              placeholder="Huruf B"
              value={quizFormData.optB}
              onChange={(e) => setQuizFormData({ ...quizFormData, optB: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">Opsi Jawaban C</label>
            <input
              type="text"
              placeholder="Huruf C"
              value={quizFormData.optC}
              onChange={(e) => setQuizFormData({ ...quizFormData, optC: e.target.value })}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuizModalOpen(false)}
              className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-extrabold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md"
            >
              Simpan Kuis Interaktif
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

