'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCardProps {
  image: any;
  onDelete?: () => void;
  onRefresh?: () => void;
}

export default function ImageCard({ image, onDelete, onRefresh }: ImageCardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [likes, setLikes] = useState(image.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(image.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(image.title || '');
  const [editCaption, setEditCaption] = useState(image.caption || '');
  const [editLoading, setEditLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const imageItems = image.images || [];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    setCurrentUser(user);
    setToken(authToken);
    const hasLiked = image.likes?.some((like: any) => like.userId === user.id) || false;
    setLiked(hasLiked);
  }, [image.likes]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
        setActiveCommentMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async () => {
    if (!currentUser || !token) {
      window.location.href = '/login';
      return;
    }
    const previousLiked = liked;
    const previousLikes = likes;
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    try {
      await axios.post(`/api/upload/images/${image.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      setLiked(previousLiked);
      setLikes(previousLikes);
      console.error('Error liking image:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !token) {
      window.location.href = '/login';
      return;
    }
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/upload/images/${image.id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newComment = {
        id: response.data.comment?.id || Date.now().toString(),
        content: commentText,
        createdAt: new Date().toISOString(),
        author: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
      };
      setComments([...comments, newComment]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus gambar ini?')) return;
    try {
      await axios.delete(`/api/upload/images/${image.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      alert('Title harus diisi');
      return;
    }
    setEditLoading(true);
    try {
      await axios.put(
        `/api/upload/images/${image.id}`,
        { title: editTitle, caption: editCaption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialogOpen(false);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Gagal mengupdate gambar');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;
    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c: any) => c.id !== commentId));
      onRefresh?.();
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
      onRefresh?.();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const authorName = image.author?.fullName || image.author?.username || 'Anonim';
  const authorAvatar = image.author?.avatar;
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorId = image.author?.id;

  const captionLines = image.caption ? image.caption.split('\n') : [];
  const hasMoreCaption = captionLines.length > 10;
  const displayCaption = isExpanded ? image.caption : (hasMoreCaption ? captionLines.slice(0, 10).join('\n') : image.caption);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.touches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    if (imageItems.length > 1) {
      setDragOffset(diff * 0.5);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (!touchStartX.current || !touchEndX.current) {
      setDragOffset(0);
      return;
    }
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) handleNextImage();
      else handlePrevImage();
    }
    setDragOffset(0);
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imageItems.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === imageItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="relative pb-8 pt-4 border-b border-white/10 shadow-lg group/post">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div 
              onClick={() => authorId && router.push(`/profile/${authorId}`)}
              className={`w-10 h-10 rounded-full overflow-hidden bg-black border border-white/10 shadow-inner flex items-center justify-center shrink-0 ${authorId ? 'cursor-pointer hover:border-white/30 transition-colors' : ''}`}
            >
              {authorAvatar ? (
                <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white/50">{authorInitial}</span>
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span 
                  onClick={() => authorId && router.push(`/profile/${authorId}`)}
                  className={`text-sm font-bold text-white/90 ${authorId ? 'cursor-pointer hover:underline' : ''}`}
                >
                  {authorName}
                </span>
                <span className="flex items-center gap-1 bg-purple-900/30 border border-purple-500/20 rounded-full px-2 py-0.5 shadow-inner">
                  <Camera className="w-2.5 h-2.5 text-purple-400" />
                  <span className="text-xs font-bold tracking-widest text-purple-200/90 uppercase">Gambar</span>
                </span>
              </div>
              <span className="text-xs font-bold tracking-wide text-white/30 uppercase">
                {formatDate(image.createdAt)}
              </span>
            </div>
          </div>

          {/* Menu Button */}
          {currentUser?.id === image.authorId && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-32 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden z-20"
                  >
                    <button 
                      onClick={() => { setIsMenuOpen(false); setEditTitle(image.title); setEditCaption(image.caption || ''); setEditDialogOpen(true); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-colors uppercase border-b border-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" /> Edit
                    </button>
                    <button 
                      onClick={() => { setIsMenuOpen(false); handleDelete(); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold tracking-widest text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors uppercase"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pl-[52px]">
          <h3 className="text-lg font-bold tracking-tight text-white mb-2">
            {image.title}
          </h3>
          {image.caption && (
            <>
              <p className="text-sm leading-[1.8] text-white/60 whitespace-pre-wrap italic">
                {displayCaption}
              </p>
              {hasMoreCaption && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-sm font-bold tracking-wide text-purple-400 hover:text-purple-300 uppercase transition-colors"
                >
                  {isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya...'}
                </button>
              )}
            </>
          )}

          {/* Image Carousel */}
          <div className="mt-5">
            {imageItems.length > 0 ? (
              <div 
                ref={imageRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-black border border-white/10 rounded-2xl overflow-hidden shadow-lg"
                style={{ touchAction: 'pan-y pinch-zoom' }}
              >
                <img
                  src={imageItems[currentImageIndex]?.imageUrl}
                  alt={`${image.title}-${currentImageIndex}`}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  style={{
                    transform: `translateX(${dragOffset}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'transform',
                  }}
                  draggable={false}
                />
                
                {imageItems.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors z-10 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 transition-colors z-10 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <div className="absolute bottom-3 right-4 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold tracking-widest text-white/90 border border-white/10 shadow-lg z-10">
                      {currentImageIndex + 1} / {imageItems.length}
                    </div>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 backdrop-blur-sm px-2 py-1.5 rounded-full z-10 border border-white/5">
                      {imageItems.map((_: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white scale-125 shadow-lg' : 'bg-white/40 hover:bg-white/60'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[300px] sm:h-[400px] bg-black border border-white/10 rounded-2xl flex items-center justify-center shadow-inner">
                <p className="text-sm font-bold tracking-widest text-white/30 uppercase">Tidak ada gambar</p>
              </div>
            )}
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center gap-6 mt-6">
            <button 
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-bold tracking-widest transition-colors ${liked ? 'text-red-500' : 'text-white/40 hover:text-white/80'}`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
              <span className="">{likes}</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm font-bold tracking-widest text-white/40 hover:text-white/80 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="">{comments?.length || 0}</span>
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="pt-4 border-t border-white/5 space-y-4">
                  
                  {/* Comments List */}
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {comments?.length > 0 ? (
                      comments.map((comment: any) => {
                        const commentAuthorName = comment.author?.username || comment.author?.fullName || 'Anonim';
                        const commentAuthorId = comment.author?.id;
                        const isCommentOwner = currentUser?.id === commentAuthorId;
                        const isEditing = editingCommentId === comment.id;

                        return (
                          <div key={comment.id} className="flex gap-3 group/comment relative">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-black border border-white/10 shrink-0">
                              {comment.author?.avatar ? (
                                <img src={comment.author.avatar} alt="avatar" className="w-full h-full object-cover" />
                              ) : (
                                <span className="flex items-center justify-center w-full h-full text-sm font-bold text-white/50">
                                  {commentAuthorName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-bold text-white/80">{commentAuthorName}</span>
                                
                                {/* Comment Actions */}
                                {isCommentOwner && !isEditing && (
                                  <div className="relative" ref={activeCommentMenuId === comment.id ? menuRef : null}>
                                    <button 
                                      onClick={() => setActiveCommentMenuId(activeCommentMenuId === comment.id ? null : comment.id)}
                                      className="p-1 text-white/20 hover:text-white transition-colors opacity-0 group-hover/comment:opacity-100 focus:opacity-100"
                                    >
                                      <MoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <AnimatePresence>
                                      {activeCommentMenuId === comment.id && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.95 }}
                                          className="absolute right-0 top-6 w-24 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-20"
                                        >
                                          <button 
                                            onClick={() => { setActiveCommentMenuId(null); setEditingCommentId(comment.id); setEditCommentText(comment.content || comment.text); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                          >
                                            Edit
                                          </button>
                                          <button 
                                            onClick={() => { setActiveCommentMenuId(null); handleDeleteComment(comment.id); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                          >
                                            Hapus
                                          </button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                )}
                              </div>

                              {isEditing ? (
                                <div className="mt-1">
                                  <textarea
                                    value={editCommentText}
                                    onChange={(e) => setEditCommentText(e.target.value)}
                                    className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner min-h-[60px]"
                                  />
                                  <div className="flex gap-2 mt-2">
                                    <button 
                                      onClick={() => handleEditComment(comment.id)}
                                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-colors"
                                    >
                                      Simpan
                                    </button>
                                    <button 
                                      onClick={() => setEditingCommentId(null)}
                                      className="px-3 py-1.5 bg-white/5 text-white/50 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-white/60 mt-0.5 leading-relaxed">{comment.content || comment.text}</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-white/30 text-center py-4 font-medium tracking-widest uppercase">Belum ada komentar</p>
                    )}
                  </div>

                  {/* Add Comment Input */}
                  <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      placeholder="Tulis komentar..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={loading || !commentText.trim()}
                      className="w-9 h-9 rounded-full bg-gradient-to-b from-white/15 to-white/5 border border-white/10 flex items-center justify-center text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                    >
                      <Send className="w-3.5 h-3.5 -ml-0.5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Image Modal (Titanium Glass) */}
      <AnimatePresence>
        {editDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditDialogOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg overflow-hidden flex flex-col"
            >

              <div className="relative z-10 flex justify-between items-center p-6 border-b border-white/10 shadow-lg">
                <h2 className="text-sm font-bold tracking-wider text-white uppercase">Edit Gambar</h2>
                <button onClick={() => setEditDialogOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10 p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">Judul</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">Caption (opsional)</label>
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                    className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner custom-scrollbar resize-none"
                  />
                </div>
              </div>

              <div className="relative z-10 p-6 border-t border-white/10 shadow-lg flex justify-end gap-3 bg-white/[0.02]">
                <button
                  onClick={() => setEditDialogOpen(false)}
                  className="px-5 py-2.5 text-sm font-bold tracking-wider text-white/50 hover:text-white uppercase transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleEdit}
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-gradient-to-b from-blue-500/80 to-blue-600/80 hover:from-blue-400 hover:to-blue-500 border border-blue-400/50 rounded-xl text-sm font-bold tracking-wider text-white uppercase shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {editLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
