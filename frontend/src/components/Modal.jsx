import React from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/60 backdrop-blur-sm">
      <div className={`w-full ${maxWidth} bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]`}>
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 gap-3">
          <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition font-bold text-base sm:text-lg shrink-0"
            aria-label="Tutup Modal"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
