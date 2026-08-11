import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { MessageSquare, Send, User, Search, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SafeImage } from './SafeImage';

export function MessagingView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  // Parent selection state for Teachers
  const [parentsList, setParentsList] = useState([]);
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentSearch, setParentSearch] = useState('');

  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    if (isTeacher) {
      fetchParents();
    }
    fetchMessages();
  }, [selectedParent]);

  const fetchParents = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, { role: 'parent' });
      if (res.success && res.data) {
        setParentsList(res.data);
        if (!selectedParent && res.data.length > 0) {
          setSelectedParent(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load parents list for chat:', err);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await request.get(`${API_ENDPOINTS.MESSAGES.LIST}?limit=50`);
      if (res.success) {
        setMessages(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat pesan');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = user?.name || (isTeacher ? 'Ustadzah Bu Ani' : 'Bapak Budi (Orang Tua)');
    const receiverId = isTeacher && selectedParent ? selectedParent.id : 4; // Default Teacher ID

    try {
      const res = await request.post(API_ENDPOINTS.MESSAGES.SEND, {
        sender: senderName,
        sender_id: user?.id || 1,
        receiver_id: receiverId,
        message: inputText,
        text: inputText
      });
      if (res.success) {
        setMessages([...messages, res.data]);
        setInputText('');
      }
    } catch (err) {
      toast.error('Gagal mengirim pesan');
    }
  };

  const filteredParents = parentsList.filter(p => p.name.toLowerCase().includes(parentSearch.toLowerCase()) || p.email.toLowerCase().includes(parentSearch.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pesan & Diskusi Orang Tua & Guru</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            {isTeacher
              ? `Komunikasi dengan ${selectedParent ? selectedParent.name : 'Orang Tua Wali Murid'}`
              : 'Interaksi langsung dengan Ustadzah Wali Kelas'}
          </p>
        </div>
        <span className="px-3.5 py-1.5 bg-teal-100 text-teal-800 font-extrabold text-xs rounded-xl border border-teal-200 shrink-0">
          Max 50 Pesan Terakhir
        </span>
      </div>

      {/* Main Chat Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[550px]">
        {/* Sidebar Selector Orang Tua (Khusus Role Guru) */}
        {isTeacher && (
          <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/50 flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Orang Tua..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-semibold"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[480px]">
              <div className="px-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                Daftar Orang Tua ({filteredParents.length})
              </div>
              {filteredParents.map((p) => {
                const isSelected = selectedParent?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParent(p)}
                    className={`p-3 rounded-2xl cursor-pointer transition flex items-center gap-3 border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200/80 hover:bg-teal-50'
                    }`}
                  >
                    <SafeImage
                      src={p.avatar_url}
                      alt={p.name}
                      isAvatar={true}
                      fallbackText={p.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className={`font-extrabold text-xs truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {p.name}
                      </div>
                      <div className={`text-[11px] font-medium truncate ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                        {p.email}
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className={`${isTeacher ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col justify-between h-full`}>
          {/* Messages Feed */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30 max-h-[460px]">
            {messages.map((msg) => {
              const senderStr = msg.sender || msg.sender_name || 'Pengguna';
              const isMe = senderStr.toLowerCase().includes((user?.name || '').toLowerCase().split(' ')[0]) ||
                           (isTeacher && (senderStr.includes('Ustadzah') || senderStr.includes('Guru') || senderStr.includes('Ani')));
              return (
                <div key={msg.id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-md p-4 rounded-2xl space-y-1 shadow-xs ${
                    isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}>
                    <div className="text-xs font-bold opacity-80">{senderStr} • {msg.timestamp || msg.created_at || 'Baru saja'}</div>
                    <p className="text-base leading-relaxed font-medium">{msg.text || msg.message}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
            <input
              type="text"
              placeholder={
                isTeacher
                  ? `Kirim pesan balasan untuk ${selectedParent?.name || 'Orang Tua'}...`
                  : "Tulis pesan ke Ustadzah Wali Kelas..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" /> Kirim
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
