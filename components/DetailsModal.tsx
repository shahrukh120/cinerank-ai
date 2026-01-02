import React from 'react';
import { MediaItem, ItemType } from '../types';
import { calculateCineRank } from '../cineRank'; 

interface DetailsModalProps {
  item: MediaItem | null;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  const generatedUrl = `https://picsum.photos/seed/${item.name.replace(/\s/g, '')}/500/750`;
  const imgSrc = item.posterUrl || generatedUrl;

  // --- 1. CALCULATE SCORES ---
  const cineRankScore = calculateCineRank(item);
  
  const ratings = Object.values(item.starRatings || {});
  
  // FIX: Explicitly typed 'a' and 'b' as numbers to satisfy TypeScript
const avgRating =
  ratings.length > 0
    ? (
        (ratings as number[]).reduce((a, b) => a + b, 0) / ratings.length
      ).toFixed(1)
    : 'N/A';

  const totalVotes = (item.likedBy?.length || 0) + (item.dislikedBy?.length || 0) + ratings.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] animate-fade-in-up">
        
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/50 text-white/70 hover:text-white rounded-full backdrop-blur-sm transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-black">
          <img 
            src={imgSrc} 
            alt={item.name} 
            className="w-full h-full object-cover opacity-90"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = generatedUrl;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        <div className="w-full md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{item.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="px-2 py-1 rounded bg-purple-600/20 text-purple-300 font-semibold border border-purple-500/20">
                {item.genre}
              </span>
              <span className="text-zinc-400 font-mono">
                {item.runPeriod || item.year}
              </span>
              {item.type === ItemType.Anime && (
                 <span className="text-zinc-400">• {item.totalSeasons} Seasons</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-950/50 rounded-xl border border-white/5">
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-bold">CineRank Score</div>
              <div className="text-2xl font-black text-green-400 flex items-center gap-1">
                {totalVotes === 0 ? 'NR' : cineRankScore}
                <span className="text-sm font-normal text-zinc-600">%</span>
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-bold">
                Community Rating
              </div>
              <div className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                 <span>{avgRating}</span>
                 <span className="text-sm font-normal text-zinc-600">/ 5</span>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wide">Synopsis</h3>
            <p className="text-zinc-400 leading-relaxed">
              {item.description || "No description available."}
            </p>
          </div>

          <div className="mt-auto">
            <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
              Where to Watch
            </h3>
            
            {item.streamingOptions && item.streamingOptions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {item.streamingOptions.map((option, idx) => (
                  <a 
                    key={idx}
                    href={option.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-purple-500 transition-all group"
                  >
                    <span className="text-zinc-200 font-medium group-hover:text-white">{option.platform}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-zinc-500 group-hover:text-purple-400 transform group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-zinc-950/30 border border-dashed border-zinc-800 rounded-lg text-center text-zinc-500 text-sm">
                No streaming links available for this title.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};