import React from 'react';

interface TrailerModalProps {
  isOpen: boolean;
  videoUrl: string | null;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, videoUrl, onClose }) => {
  if (!isOpen || !videoUrl) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <div className="flex justify-between items-center p-4 bg-zinc-900 border-b border-white/5">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span className="text-red-500">▶</span> Official Trailer
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`${videoUrl}?autoplay=1`}
            title="Trailer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};