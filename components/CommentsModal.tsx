import React, { useState, useRef, useEffect } from 'react';
import { Comment, MediaItem } from '../types';

interface CommentsModalProps {
  isOpen: boolean;
  item: MediaItem | null;
  onClose: () => void;
  onAddComment: (itemId: string, text: string) => Promise<void>;
  currentUserEmail?: string;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ 
  isOpen, 
  item, 
  onClose, 
  onAddComment,
  currentUserEmail 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when modal opens or comments change
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

  const comments = item.comments || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
          <h3 className="text-white font-bold flex items-center gap-2">
            <span className="text-blue-400">💬</span> Comments: {item.name}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-zinc-500 py-10 italic">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`flex gap-3 ${comment.userId === currentUserEmail ? 'flex-row-reverse' : ''}`}>
                <div className="flex-shrink-0">
                   <img 
                     src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=random`} 
                     alt={comment.userName}
                     className="w-8 h-8 rounded-full border border-zinc-700"
                   />
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3 ${comment.userId === currentUserEmail ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                  <p className="text-xs opacity-50 mb-1 font-bold">{comment.userName}</p>
                  <p className="text-sm leading-relaxed break-words">{comment.text}</p>
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
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-4 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!currentUserEmail || !newComment.trim() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-full p-2 transition-colors"
          >
            {isSubmitting ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};