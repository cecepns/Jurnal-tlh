import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ currentPage, totalPages, onPageChange, limit, onLimitChange }) {
  if (totalPages <= 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-2 text-base text-slate-700 font-semibold">
      {/* Limit Selector */}
      <div className="flex items-center gap-2">
        <span>Tampilkan</span>
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>per halaman</span>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </button>

        <span className="px-4 py-2 bg-teal-50 text-teal-800 font-black text-sm rounded-xl border border-teal-200">
          Halaman {currentPage} dari {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 font-bold text-sm"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
