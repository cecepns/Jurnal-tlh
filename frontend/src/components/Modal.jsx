import React from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className={`w-full ${maxWidth} bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
