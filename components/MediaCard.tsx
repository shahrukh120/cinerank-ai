import React, { useState, useEffect } from 'react';
import { MediaItem, ItemType } from '../types';

interface MediaCardProps {
  item: MediaItem;
  rank: number;
  onDelete: (id: string) => void;
  onClick: (item: MediaItem) => void;
  isAdmin?: boolean;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, rank, onDelete, onClick, isAdmin }) => {
  // Default aesthetic generator
  const generatedUrl = `https://picsum.photos/seed/${item.name.replace(/\s/g, '')}/300/450`;
  
  // Use fetched posterUrl if available, otherwise generated
  const [imgSrc, setImgSrc] = useState<string>(item.posterUrl || generatedUrl);

  // If the item prop changes (e.g. newly added item), update the source
  useEffect(() => {
    setImgSrc(item.posterUrl || generatedUrl);
  }, [item.posterUrl, generatedUrl]);

  const handleImageError = () => {
    // Fallback to the aesthetic placeholder if the Google-fetched URL is broken/protected
    if (imgSrc !== generatedUrl) {
        setImgSrc(generatedUrl);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return 'text-green-400';
    if (rating >= 7.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  return (
    <div 
      onClick={() => onClick(item)}
      // CHANGE 1: 'flex-row' ensures image is ALWAYS on the left, even on mobile
      className="group relative flex flex-row bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:bg-zinc-800/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer h-40 md:h-auto"
    >
      
      {/* Rank Badge */}
      <div className="absolute top-0 left-0 bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-lg w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-br-xl z-20 shadow-lg text-sm md:text-lg">
        #{rank}
      </div>

      {/* Delete Button - ONLY VISIBLE TO ADMIN */}
      {isAdmin && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 z-30 p-1.5 md:p-2 bg-black/60 hover:bg-red-600 text-white/60 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md transform hover:scale-110"
          title="Delete Item"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      )}

      {/* Image Section */}
      {/* CHANGE 2: w-28 sets a fixed width for mobile so it looks like a thumbnail */}
      <div className="w-28 md:w-32 h-full flex-shrink-0 relative overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        <img 
          src={imgSrc} 
          alt={item.name} 
          onError={handleImageError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Content Section */}
      {/* CHANGE 3: Reduced padding (p-3) for mobile to save space */}
      <div className="p-3 md:p-5 flex flex-col justify-between flex-grow min-w-0">
        <div>
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <h3 className="text-base md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors truncate pr-4">
              {item.name}
            </h3>
            <span className="text-[10px] md:text-xs font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-zinc-700 whitespace-nowrap">
              {item.year}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <span className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/50">
              {item.genre}
            </span>
          </div>
          
          {/* Clamp description to 2 lines so it doesn't overflow */}
          {item.description && (
             <p className="text-xs md:text-sm text-zinc-400 line-clamp-2 md:mt-2 italic">
               "{item.description}"
             </p>
          )}
        </div>

        {/* Stats Footer */}
        <div className="flex items-center gap-3 md:gap-4 mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest">IMDb</span>
            <span className={`text-sm md:text-lg font-bold ${getRatingColor(item.imdbRating)}`}>
              {item.imdbRating}<span className="text-[10px] md:text-xs text-zinc-600">/10</span>
            </span>
          </div>

          <div className="w-px h-6 md:h-8 bg-zinc-800"></div>

          <div className="flex flex-col">
            {item.type === ItemType.Anime ? (
              <>
                <span className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest">Seasons</span>
                <span className="text-sm md:text-lg font-bold text-blue-400">
                  {item.totalSeasons}
                </span>
              </>
            ) : (
              <>
                <span className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest">Rotten Tomatoes</span>
                <span className="text-sm md:text-lg font-bold text-red-400">
                  {item.rottenTomatoes}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};