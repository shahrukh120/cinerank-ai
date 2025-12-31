import React from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-br from-zinc-900 to-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-6 md:p-8">
        
        {/* Decorative Blur */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
             <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to CineRank.ai</h2>
          <p className="text-zinc-400 text-sm">The community-driven library for hidden gems.</p>
        </div>

        <div className="space-y-4 mb-8">
            {/* Tip 1 */}
            <div className="flex gap-4 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Login to Contribute</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">You must be logged in to <span className="text-white">Add Titles</span>, <span className="text-white">Like</span>, or <span className="text-white">Comment</span>.</p>
                </div>
            </div>

            {/* Tip 2 */}
            <div className="flex gap-4 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="bg-purple-500/20 text-purple-400 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Add Hidden Gems</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Found a great movie or anime? Add it to the list! You'll get credit on the <span className="text-yellow-400">Leaderboard</span>.</p>
                </div>
            </div>

            {/* Tip 3 */}
             <div className="flex gap-4 items-start bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="bg-red-500/20 text-red-400 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg>
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">Watch Trailers</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Hover over any poster (or click the play icon on mobile) to watch the trailer instantly.</p>
                </div>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
        >
            Got it, Let's Explore! 🚀
        </button>

      </div>
    </div>
  );
};