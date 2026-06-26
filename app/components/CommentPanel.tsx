'use client';

import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MoreHorizontal, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface CommentPanelProps {
  comments: any[];
  setComments: (comments: any[]) => void;
  targetId: string;
  targetType: 'post' | 'book' | 'image';
  currentUser: any;
  token: string;
}

const ExpandableText = ({ text, className }: { text: string; className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > 150;
  
  return (
    <div className="mt-1">
      <p className={`${className || ''} ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-[10px] font-bold text-[#8b5a2b] hover:text-[#5c3e21] mt-1 transition-colors"
        >
          {isExpanded ? 'Sembunyikan' : '...lihat selengkapnya'}
        </button>
      )}
    </div>
  );
};

export default function CommentPanel({ 
  comments, setComments, targetId, targetType, currentUser, token 
}: CommentPanelProps) {
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  const getApiEndpoint = () => {
    switch (targetType) {
      case 'post': return `/api/posts/${targetId}/comments`;
      case 'book': return `/api/books/${targetId}/comments`;
      case 'image': return `/api/upload/images/${targetId}/comments`;
    }
  };

  const handleAddComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!currentUser || !token) {
      window.location.href = '/login';
      return;
    }
    
    const textToSubmit = parentId ? replyText : commentText;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        getApiEndpoint(),
        { text: textToSubmit, parentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      let addedComment;
      if (response.data.comment) {
        addedComment = response.data.comment;
      } else {
        // Fallback if API hasn't been fully updated to return 'comment'
        addedComment = {
          id: Date.now().toString(),
          content: textToSubmit,
          createdAt: new Date().toISOString(),
          parentId,
          author: {
            id: currentUser.id,
            fullName: currentUser.fullName,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        };
      }
      
      setComments([...comments, addedComment]);
      
      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
        setExpandedReplies(prev => ({ ...prev, [parentId]: true })); // Auto-expand replies
      } else {
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c: any) => c.id !== commentId && c.parentId !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;
    try {
      await axios.put(
        `/api/comments/${commentId}`,
        { content: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(comments.map((c: any) => 
        c.id === commentId ? { ...c, content: editCommentText } : c
      ));
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <div className="relative mt-14 mb-8 px-2 sm:px-4 drop-shadow-2xl">
      
      {/* Hanging Strings (Tali) */}
      <svg className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 z-0" viewBox="0 0 100 50">
        <path d="M50 5 L15 50 M50 5 L85 50" stroke="#8b0000" strokeWidth="2.5" fill="none" className="drop-shadow-sm" strokeLinecap="round" />
        <circle cx="50" cy="5" r="4" fill="#5c0000" />
        <circle cx="50" cy="5" r="2" fill="#8b0000" />
        {/* String knots on the roller */}
        <path d="M13 45 L17 50 M17 45 L13 50 M83 45 L87 50 M87 45 L83 50" stroke="#8b0000" strokeWidth="1.5" />
      </svg>

      {/* Top Roller (Mahogany Wood & Jade/Gold Caps) */}
      <div className="absolute top-0 left-0 right-0 h-6 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-y border-[#1a0500] z-20 mx-[-12px] sm:mx-[-16px]"
           style={{
             backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 8px), linear-gradient(to bottom, #2b0a04, #5c1608, #1a0500)'
           }}>
        {/* Jade End Caps */}
        <div className="absolute top-[-2px] bottom-[-2px] left-[-4px] w-4 bg-gradient-to-r from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
        <div className="absolute top-[-2px] bottom-[-2px] right-[-4px] w-4 bg-gradient-to-l from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
      </div>

      {/* Silk Brocade & Rice Paper */}
      <div 
        className="relative pt-8 pb-10 px-4 sm:px-6 z-10"
        style={{
          borderLeft: '14px solid #8b0000',
          borderRight: '14px solid #8b0000',
          backgroundColor: '#FFF8E7', // Lighter rice paper for Chinese scrolls
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
          `,
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(139, 0, 0, 0.1)'
        }}
      >
        {/* Decorative Inner Border (Gold) */}
        <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none border-x-2 border-[#d4af37] opacity-60"></div>

        {/* Comments List */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar-parchment pr-2 space-y-5">
          {comments?.length > 0 ? (
            comments.filter((c: any) => !c.parentId).map((comment: any) => {
              const authorName = comment.author?.username || comment.author?.fullName || 'Anonim';
              const isOwner = currentUser?.id === comment.author?.id;
              const isEditing = editingCommentId === comment.id;
              const replies = comments.filter((c: any) => c.parentId === comment.id);

              return (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3 group/comment relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-[#d9b97b] border-2 border-[#8b5a2b] shrink-0 shadow-md">
                      {comment.author?.avatar ? (
                        <img src={comment.author.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="flex items-center justify-center w-full h-full text-sm font-bold text-[#4a2e15]">
                          {authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-[#3e2723]">{authorName}</span>
                        
                        {isOwner && !isEditing && (
                          <div className="flex items-center gap-1.5 ml-2">
                            <button 
                              onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.content || comment.text); }}
                              className="p-1 text-[#8b5a2b] hover:text-[#5c3e21] transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="w-full bg-[#fdf5e6] border border-[#d9b97b] rounded-xl p-3 text-sm text-[#3e2723] placeholder-[#8c6b45] focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] shadow-inner min-h-[60px]"
                          />
                          <div className="flex gap-2 mt-2">
                            <button 
                              onClick={() => handleEditComment(comment.id)}
                              className="px-3 py-1.5 bg-[#8b5a2b] text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#6b4c2a] transition-colors shadow-md"
                            >
                              Simpan
                            </button>
                            <button 
                              onClick={() => setEditingCommentId(null)}
                              className="px-3 py-1.5 bg-[#d9b97b] text-[#3e2723] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#c4a062] transition-colors shadow-sm"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <ExpandableText text={comment.content || comment.text} className="text-sm text-[#5c3e21] leading-relaxed font-serif" />
                          <div className="flex items-center gap-4 mt-1.5">
                            <button 
                              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                              className="text-[11px] font-bold tracking-widest text-[#8b5a2b] hover:text-[#4a2e15] uppercase transition-colors"
                            >
                              Balas
                            </button>
                            {replies.length > 0 && (
                              <button 
                                onClick={() => toggleReplies(comment.id)}
                                className="text-[11px] font-bold tracking-widest text-[#a0522d] hover:text-[#8b0000] uppercase transition-colors flex items-center gap-1"
                              >
                                {expandedReplies[comment.id] ? (
                                  <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan</>
                                ) : (
                                  <><ChevronDown className="w-3.5 h-3.5" /> Lihat {replies.length} balasan</>
                                )}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Replies */}
                  {replies.length > 0 && expandedReplies[comment.id] && (
                    <div className="ml-12 space-y-3 mt-2 border-l-2 border-[#d9b97b]/50 pl-3">
                      {replies.map((reply: any) => {
                        const replyAuthorName = reply.author?.username || reply.author?.fullName || 'Anonim';
                        const isReplyOwner = currentUser?.id === reply.author?.id;
                        const isEditingReply = editingCommentId === reply.id;
                        
                        return (
                          <div key={reply.id} className="flex gap-2.5 group/reply relative">
                            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#d9b97b] border border-[#8b5a2b] shrink-0 shadow-sm">
                              {reply.author?.avatar ? (
                                <img src={reply.author.avatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full text-xs font-bold text-[#4a2e15]">
                                  {replyAuthorName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-[#3e2723]">{replyAuthorName}</span>
                                {isReplyOwner && !isEditingReply && (
                                  <div className="flex items-center gap-1.5 ml-2">
                                    <button 
                                      onClick={() => { setEditingCommentId(reply.id); setEditCommentText(reply.content || reply.text); }}
                                      className="p-1 text-[#8b5a2b] hover:text-[#5c3e21] transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                                      title="Hapus"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {isEditingReply ? (
                                <div className="mt-1">
                                  <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full bg-[#fdf5e6] border border-[#d9b97b] rounded-xl p-2 text-xs text-[#3e2723] placeholder-[#8c6b45] focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] shadow-inner min-h-[50px]" />
                                  <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleEditComment(reply.id)} className="px-2 py-1 bg-[#8b5a2b] text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-[#6b4c2a] transition-colors">Simpan</button>
                                    <button onClick={() => setEditingCommentId(null)} className="px-2 py-1 bg-[#d9b97b] text-[#3e2723] rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-[#c4a062] transition-colors">Batal</button>
                                  </div>
                                </div>
                              ) : (
                                <ExpandableText text={reply.content || reply.text} className="text-xs text-[#5c3e21] leading-relaxed font-serif" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reply Input Form */}
                  <AnimatePresence>
                    {replyingTo === comment.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="ml-12 mt-3"
                      >
                        <form onSubmit={(e) => handleAddComment(e, comment.id)} className="flex gap-2 relative">
                          <input
                            type="text"
                            placeholder="Tulis balasan dengan pena tinta..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            autoFocus
                            className="flex-1 bg-[#fdf5e6] border border-[#d9b97b] rounded-full px-4 py-2 text-xs text-[#3e2723] placeholder-[#8c6b45] focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] shadow-inner font-serif"
                          />
                          <button
                            type="submit"
                            disabled={loading || !replyText.trim()}
                            className="w-8 h-8 rounded-full bg-[#8b5a2b] hover:bg-[#6b4c2a] flex items-center justify-center text-white disabled:opacity-50 transition-colors shadow-md shrink-0 absolute right-1 top-0.5"
                          >
                            <Send className="w-3.5 h-3.5 -ml-0.5" />
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center opacity-60">
              <p className="text-sm font-bold text-[#8b5a2b] tracking-wider font-serif">Belum ada torehan pena.</p>
              <p className="text-xs text-[#5c3e21] mt-1">Jadilah yang pertama menulis di perkamen ini.</p>
            </div>
          )}
        </div>

        {/* Top-level Comment Input */}
        <form onSubmit={handleAddComment} className="flex gap-2 mt-6 relative border-t border-[#d9b97b] pt-4">
          <input
            type="text"
            placeholder="Goreskan pemikiranmu di sini..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-[#fdf5e6] border border-[#d9b97b] rounded-full px-5 py-3 text-sm text-[#3e2723] placeholder-[#8c6b45] focus:outline-none focus:ring-2 focus:ring-[#8b5a2b] shadow-inner font-serif"
          />
          <button
            type="submit"
            disabled={loading || !commentText.trim()}
            className="absolute right-1.5 top-5 bottom-1.5 px-4 rounded-full bg-[#8b5a2b] hover:bg-[#6b4c2a] flex items-center justify-center text-white disabled:opacity-50 transition-colors shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

      {/* Bottom Roller (Mahogany Wood & Jade Caps) */}
      <div className="absolute bottom-0 left-0 right-0 h-7 rounded-full shadow-[0_6px_8px_rgba(0,0,0,0.6)] border-y border-[#1a0500] z-20 mx-[-16px] sm:mx-[-20px]"
           style={{
             backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 8px), linear-gradient(to bottom, #2b0a04, #5c1608, #1a0500)'
           }}>
        {/* Jade End Caps */}
        <div className="absolute top-[-3px] bottom-[-3px] left-[-6px] w-6 bg-gradient-to-r from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
        <div className="absolute top-[-3px] bottom-[-3px] right-[-6px] w-6 bg-gradient-to-l from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
        
        {/* Bottom Tassels (Rumbai Merah) */}
        <div className="absolute top-full left-[15%] w-2 h-12 bg-gradient-to-b from-[#8b0000] to-transparent opacity-80" style={{ borderLeft: '1px dashed #5c0000', borderRight: '1px dashed #5c0000' }}></div>
        <div className="absolute top-full right-[15%] w-2 h-12 bg-gradient-to-b from-[#8b0000] to-transparent opacity-80" style={{ borderLeft: '1px dashed #5c0000', borderRight: '1px dashed #5c0000' }}></div>
      </div>

    </div>
  );
}
