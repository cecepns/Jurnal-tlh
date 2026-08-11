import React, { useState, useEffect } from 'react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import toast from 'react-hot-toast';
import { MessageSquare, Send, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MessagingView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.MESSAGES.LIST);
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

    try {
      const res = await request.post(API_ENDPOINTS.MESSAGES.SEND, {
        sender: user?.name || 'Orang Tua',
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Pesan & Diskusi Perkembangan</h1>
          <p className="text-sm text-slate-600 font-medium mt-1">Interaksi langsung antara Orang Tua & Wali Kelas Bu Ani, S.Pd</p>
        </div>
        <span className="px-3.5 py-1.5 bg-teal-100 text-teal-800 font-extrabold text-xs rounded-xl border border-teal-200">Online</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
        {/* Chat Messages Box */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isMe = msg.sender.includes(user?.name?.split(' ')[0] || 'Budi') || msg.sender.includes('Budi');
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-4 rounded-2xl space-y-1 shadow-xs ${
                  isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}>
                  <div className="text-xs font-bold opacity-80">{msg.sender} • {msg.timestamp}</div>
                  <p className="text-base leading-relaxed font-medium">{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
          <input
            type="text"
            placeholder="Tulis pesan ke Ustadzah Wali Kelas..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-3 text-base border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-medium"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-2xl shadow-md transition flex items-center gap-2 shrink-0"
          >
            <Send className="w-4 h-4" /> Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
