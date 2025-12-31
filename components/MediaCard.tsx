import React, { useState, useEffect } from 'react';
import { MediaItem, ItemType } from '../types';

interface MediaCardProps {
  item: MediaItem;
  rank: number;
  onDelete: (id: string) => void;
  onClick: (item: MediaItem) => void;
  onLike?: (item: MediaItem) => void;
  onDislike?: (item: MediaItem) => void;
  onComment?: (item: MediaItem) => void;
  isAdmin?: boolean;
  currentUserEmail?: string;
}

export const MediaCard: React.FC<MediaCardProps> = ({ 
  item, 
  rank, 
  onDelete, 
  onClick, 
  onLike, 
  onDislike, 
  onComment, 
  isAdmin,
  currentUserEmail
}) => {
  const generatedUrl = `https://picsum.photos/seed/${item.name.replace(/\s/g, '')}/300/450`;
  const [imgSrc, setImgSrc] = useState<string>(item.posterUrl || generatedUrl);

  useEffect(() => {
    setImgSrc(item.posterUrl || generatedUrl);
  }, [item.posterUrl, generatedUrl]);

  const handleImageError = () => {
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

  const likesCount = item.likedBy?.length || 0;
  const dislikesCount = item.dislikedBy?.length || 0;
  const commentsCount = item.comments?.length || 0;

  const isLiked = currentUserEmail && item.likedBy?.includes(currentUserEmail);
  const isDisliked = currentUserEmail && item.dislikedBy?.includes(currentUserEmail);

  return (
    <div 
      onClick={() => onClick(item)}
      className="group relative flex flex-row bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:bg-zinc-800/50 transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer h-40 md:h-auto"
    >
      <div className="absolute top-0 left-0 bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-lg w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-br-xl z-20 shadow-lg text-sm md:text-lg">#{rank}</div>

      {isAdmin && (
        <button onClick={handleDeleteClick} className="absolute top-2 right-2 z-30 p-1.5 md:p-2 bg-black/60 hover:bg-red-600 text-white/60 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md transform hover:scale-110" title="Delete Item">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
        </button>
      )}

      <div className="w-28 md:w-32 h-full flex-shrink-0 relative overflow-hidden bg-zinc-950 group/image">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
        <img src={imgSrc} alt={item.name} onError={handleImageError} referrerPolicy="no-referrer" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        {item.trailerUrl && (
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
            <button onClick={(e) => { e.stopPropagation(); onClick({ ...item, isPlayRequest: true } as any); }} className="w-10 h-10 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform" title="Watch Trailer">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" /></svg>
            </button>
          </div>
        )}
      </div>

      <div className="p-3 md:p-5 flex flex-col justify-between flex-grow min-w-0">
        <div>
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <h3 className="text-base md:text-xl font-bold text-white group-hover:text-purple-400 transition-colors truncate pr-4">{item.name}</h3>
            <span className="text-[10px] md:text-xs font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 md:px-2 md:py-1 rounded border border-zinc-700 whitespace-nowrap">{item.year}</span>
          </div>
          <div className="flex items-center gap-2 mb-2 md:mb-3">
            <span className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/50">{item.genre}</span>
          </div>
          {item.description && <p className="text-xs md:text-sm text-zinc-400 line-clamp-2 md:mt-2 italic">"{item.description}"</p>}
        </div>

        <div className="flex items-end justify-between mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/5">
          {/* Left: Ratings (IMDb + Rotten Tomatoes/Seasons) */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest">IMDb</span>
              <span className={`text-sm md:text-lg font-bold ${getRatingColor(item.imdbRating)}`}>{item.imdbRating}<span className="text-[10px] md:text-xs text-zinc-600">/10</span></span>
            </div>

            {/* --- RESTORED SEPARATOR AND SECONDARY STAT --- */}
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
                  <span className="text-[8px] md:text-[10px] text-zinc-500 uppercase tracking-widest">R. Tomatoes</span>
                  <span className="text-sm md:text-lg font-bold text-red-400">
                    {item.rottenTomatoes}
                  </span>
                </>
              )}
            </div>
            {/* ------------------------------------------- */}
          </div>

          {/* Right: Social Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* LIKE BUTTON */}
            <button 
              onClick={(e) => { e.stopPropagation(); onLike?.(item); }}
              className={`flex flex-col items-center justify-center w-8 md:w-10 p-1 rounded hover:bg-white/10 transition-colors group/btn ${isLiked ? 'text-green-400' : 'text-zinc-400 hover:text-green-400'}`}
              title="Like"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 group-active/btn:scale-90 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.483 0 .964.078 1.423.23l3.114 1.04c.459.152.94.23 1.423.23h3.718c.93 0 1.83-.243 2.65-.678a9.76 9.76 0 004.944-8.638" />
              </svg>
              <span className="text-[9px] font-mono mt-0.5">{likesCount}</span>
            </button>

            {/* DISLIKE BUTTON */}
            <button 
              onClick={(e) => { e.stopPropagation(); onDislike?.(item); }}
              className={`flex flex-col items-center justify-center w-8 md:w-10 p-1 rounded hover:bg-white/10 transition-colors group/btn ${isDisliked ? 'text-red-400' : 'text-zinc-400 hover:text-red-400'}`}
              title="Dislike"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill={isDisliked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 group-active/btn:scale-90 transition-transform mt-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 01-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.75 2.25 2.25 0 009.75 22a4.01 4.01 0 001.67-.323m-3.922-6.427h-2.25" />
              </svg>
              <span className="text-[9px] font-mono mt-0.5">{dislikesCount}</span>
            </button>

            {/* COMMENT BUTTON */}
            <button 
              onClick={(e) => { e.stopPropagation(); onComment?.(item); }}
              className="flex flex-col items-center justify-center w-8 md:w-10 p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-blue-400 transition-colors group/btn"
              title="Comments"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 group-active/btn:scale-90 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              <span className="text-[9px] font-mono mt-0.5">{commentsCount}</span>
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};