import React, { useState, useEffect } from 'react';
import { Play, Award, Sparkles, BookOpen, Star } from 'lucide-react';
import { SafeImage } from './SafeImage';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';

export function LearningLmsView({ userRole }) {
  const [coursesList, setCoursesList] = useState([]);
  const [activeCourse, setActiveCourse] = useState(1);
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [xp, setXp] = useState(240);
  const [streak, setStreak] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.LMS.COURSES);
      if (res.success && Array.isArray(res.data)) {
        setCoursesList(res.data);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fallbackCourses = [
    {
      id: 1,
      title: 'Bahasa Isyarat Dasar Anak',
      category: 'Bahasa Isyarat',
      level: 'Level 1',
      lessonsCount: 5,
      thumbnail: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400',
      description: 'Mengenal isyarat abjad, kata kerja, dan interaksi sehari-hari dengan materi video interaktif.',
      lessons: [
        { id: 1, title: 'Lesson 1: Isyarat Huruf A - E', duration: '5 min' },
        { id: 2, title: 'Lesson 2: Isyarat Kata MAKAN & MINUM', duration: '6 min' },
      ]
    },
    {
      id: 2,
      title: 'Pengenalan Alfabet & Kata',
      category: 'Bahasa Indonesia',
      level: 'Level 1',
      lessonsCount: 4,
      thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      description: 'Belajar mengeja dan menderet kata vokal sederhana dengan ceria.',
      lessons: [
        { id: 3, title: 'Lesson 1: Huruf Vokal A I U E O', duration: '4 min' }
      ]
    }
  ];

  const displayCourses = coursesList.length > 0 ? coursesList : fallbackCourses;
  const currentCourseObj = displayCourses.find(c => c.id === activeCourse) || displayCourses[0];

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!quizAnswer) {
      toast.error('Pilih salah satu jawaban kuis!');
      return;
    }

    if (quizAnswer === 'a') {
      setXp(prev => prev + 50);
      toast.success('🎉 Jawaban Benar! Kamu mendapatkan +50 XP!');
    } else {
      toast.error('Jawaban kurang tepat. Coba perhatikan gerakan video lagi!');
    }
  };

  return (
    <div className="space-y-8">
      {/* Gamification Top Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 text-white p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="px-3.5 py-1 bg-teal-900/60 border border-teal-400/30 rounded-full text-xs font-black uppercase tracking-wider text-teal-200">
            Platform Belajar Interaktif
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">Bahasa Indonesia & Bahasa Isyarat</h1>
          <p className="text-teal-100 text-base font-medium">Modul khusus anak-anak & pendampingan orang tua</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Catalog List */}
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" /> Modul Pembelajaran
          </h2>

          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => setActiveCourse(course.id)}
                className={`p-5 rounded-3xl border cursor-pointer transition duration-200 ${
                  activeCourse === course.id
                    ? 'bg-teal-50/90 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex gap-4">
                  <SafeImage src={course.thumbnail} alt={course.title} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-extrabold uppercase text-teal-800 bg-teal-100/90 px-2.5 py-0.5 rounded-md">
                      {course.category}
                    </span>
                    <h3 className="font-black text-slate-900 text-base truncate mt-1.5">{course.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mt-1 font-medium">{course.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player & Quiz Area */}
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
              <div className="text-center p-6 space-y-4">
                <div className="w-20 h-20 bg-teal-600 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-teal-600/40 cursor-pointer hover:scale-105 transition">
                  <Play className="w-10 h-10 fill-current ml-1" />
                </div>
                <div className="text-white font-extrabold text-lg">Media Pembelajaran Bahasa Isyarat</div>
                <div className="text-slate-300 text-sm font-medium">Video peragaan isyarat abjad A - E untuk anak</div>
              </div>
            </div>

            {/* Interactive Quiz Box */}
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-600" /> Kuis Pemahaman Isyarat (+50 XP)
                </h3>
                <span className="text-sm font-bold text-slate-500">Soal 1 dari 1</span>
              </div>

              <p className="text-base font-extrabold text-slate-800">
                Gerakan mengepalkan tangan dengan ibu jari tegak di samping melambangkan isyarat huruf apa?
              </p>

              <form onSubmit={handleQuizSubmit} className="space-y-3">
                {[
                  { id: 'a', text: 'Huruf A' },
                  { id: 'b', text: 'Huruf B' },
                  { id: 'c', text: 'Huruf C' }
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer text-base font-bold transition ${
                      quizAnswer === opt.id
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="quiz"
                      value={opt.id}
                      checked={quizAnswer === opt.id}
                      onChange={() => setQuizAnswer(opt.id)}
                      className="hidden"
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}

                <button
                  type="submit"
                  className="w-full py-3.5 mt-3 bg-teal-600 hover:bg-teal-700 text-white font-black text-base rounded-2xl shadow-lg shadow-teal-600/30 transition"
                >
                  Jawab & Klaim XP
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
