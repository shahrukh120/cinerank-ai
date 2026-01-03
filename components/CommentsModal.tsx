import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, Comment } from '../types';

interface CommentsModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
  onAddComment: (itemId: string, text: string) => Promise<void>;
  // --- NEW: Add Delete Prop ---
  onDeleteComment?: (itemId: string, comment: Comment) => Promise<void>;
  currentUserEmail?: string;
  isAdmin?: boolean;
}

const formatTimeAgo = (timestamp: number) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(); 
};

export const CommentsModal: React.FC<CommentsModalProps> = ({ 
  isOpen, 
  item, 
  onClose, 
  onAddComment,
  onDeleteComment, // <--- Destructure new prop
  currentUserEmail,
  isAdmin // <--- Destructure new prop
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isOpen, item?.comments]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await onAddComment(item.id, newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  const handleDelete = async (comment: Comment) => {
    if (confirm("Admin: Are you sure you want to delete this comment?")) {
        await onDeleteComment?.(item.id, comment);
    }
  };

  const comments = item.comments || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span className="text-blue-400">💬</span> Comments
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
          {comments.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 italic flex flex-col items-center gap-2">
              <span className="text-2xl">💭</span>
              <span>No comments yet.</span>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`group relative flex gap-3 ${comment.userId === currentUserEmail ? 'flex-row-reverse' : ''}`}>
                
                <div className="flex-shrink-0">
                   <img 
                     src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`} 
                     alt={comment.userName}
                     className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
                     onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null; 
                        target.src = `https://ui-avatars.com/api/?name=${comment.userName}&background=random`;
                     }}
                   />
                </div>

                <div className={`flex flex-col max-w-[80%] ${comment.userId === currentUserEmail ? 'items-end' : 'items-start'}`}>
                    <div className={`relative rounded-2xl p-3 shadow-md ${comment.userId === currentUserEmail ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                        <p className="text-xs opacity-70 mb-1 font-bold flex justify-between gap-4">
                            {comment.userName.split(' ')[0]} 
                        </p>
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{comment.text}</p>
                    </div>
                    
                    <span className="text-[10px] text-zinc-500 mt-1 px-1 flex items-center gap-2">
                        {formatTimeAgo(comment.timestamp)}
                        
                        {/* --- DELETE BUTTON (ADMIN ONLY) --- */}
                        {isAdmin && (
                            <button 
                                onClick={() => handleDelete(comment)}
                                className="text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Admin: Delete Comment"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                    <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </span>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-black/40 border-t border-white/5 flex gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={currentUserEmail ? "Write a comment..." : "Login to comment"}
            disabled={!currentUserEmail || isSubmitting}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 placeholder-zinc-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={!currentUserEmail || !newComment.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-full p-2.5 transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};