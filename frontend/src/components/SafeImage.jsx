import React, { useState } from 'react';
import { User, ImageOff } from 'lucide-react';
import { getUploadUrl } from '../utils/endpoints';

export function SafeImage({ src, alt, className = '', isAvatar = false, fallbackText = '' }) {
  const [error, setError] = useState(false);

  const resolvedSrc = getUploadUrl(src);

  if (error || !src) {
    if (isAvatar) {
      const initial = (fallbackText || alt || 'U').charAt(0).toUpperCase();
      return (
        <div className={`flex items-center justify-center bg-teal-100 text-teal-800 font-black text-sm rounded-full shrink-0 border border-teal-200 select-none ${className}`}>
          {initial ? initial : <User className="w-1/2 h-1/2 text-teal-600" />}
        </div>
      );
    }
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 text-slate-400 rounded-xl shrink-0 border border-slate-200 p-2 select-none ${className}`}>
        <ImageOff className="w-6 h-6 text-slate-400 mb-1" />
        <span className="text-[10px] font-bold text-slate-400">Gambar</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || 'Image'}
      className={className}
      onError={() => setError(true)}
    />
  );
}
