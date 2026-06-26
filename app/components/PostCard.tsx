'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText , ChevronDown, ChevronUp } from 'lucide-react';
import CommentPanel from './CommentPanel';

interface PostCardProps {
  post: any;
  onDelete?: () => void;
  onRefresh?: () => void;
}

export default function PostCard({ post, onDelete, onRefresh }: PostCardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [editLoading, setEditLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
            
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    setCurrentUser(user);
    setToken(authToken);
    const hasLiked = post.likes?.some((like: any) => like.userId === user.id) || false;
    setLiked(hasLiked);
  }, [post.likes]);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
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
      await axios.post(`/api/posts/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      setLiked(previousLiked);
      setLikes(previousLikes);
      console.error('Error liking post:', error);
    }
  };




  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus post?')) return;
    try {
      await axios.delete(`/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      alert('Title dan content harus diisi');
      return;
    }
    setEditLoading(true);
    try {
      await axios.put(
        `/api/posts/${post.id}`,
        { title: editTitle, content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialogOpen(false);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Gagal mengupdate post');
    } finally {
      setEditLoading(false);
    }
  };



  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const authorName = post.author?.fullName || post.author?.username || 'Anonim';
  const authorAvatar = post.author?.avatar;
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorId = post.author?.id;

  const MAX_CHARS = 250;
  const contentLines = (post.content || '').split('\n');
  const isLong = (post.content || '').length > MAX_CHARS || contentLines.length > 5;
  const hasMoreContent = isLong;
  
  let truncatedContent = post.content || '';
  if (isLong && !isExpanded) {
    if (contentLines.length > 5) {
      truncatedContent = contentLines.slice(0, 5).join('\n');
    }
    if (truncatedContent.length > MAX_CHARS) {
      truncatedContent = truncatedContent.substring(0, MAX_CHARS) + '...';
    } else if (contentLines.length > 5) {
      truncatedContent += '...';
    }
  }
  const displayContent = isExpanded ? post.content : truncatedContent;
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
                <span className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-full px-2 py-0.5 shadow-inner">
                  <FileText className="w-2.5 h-2.5 text-blue-400" />
                  <span className="text-xs font-bold tracking-widest text-blue-200/80 uppercase">Karya</span>
                </span>
              </div>
              <span className="text-xs font-bold tracking-wide text-white/30 uppercase">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Post Menu Button */}
          {currentUser?.id === post.authorId && (
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
                      onClick={() => { setIsMenuOpen(false); setEditTitle(post.title); setEditContent(post.content); setEditDialogOpen(true); }}
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
            {post.title}
          </h3>
          <p className="text-sm leading-[1.8] text-white/70 whitespace-pre-wrap italic">
            {displayContent}
          </p>

          {hasMoreContent && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm font-bold tracking-wide text-blue-400 hover:text-blue-300 uppercase transition-colors"
            >
              {isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya...'}
            </button>
          )}

          {post.image && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-white/10 shadow-lg max-h-[400px]">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

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

        </div>

        {/* Comments Dropdown */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-4 -mx-4 sm:mx-0"
            >
              <div className="pt-4 border-t border-white/10 sm:px-2">
                <CommentPanel 
                  comments={comments} 
                  setComments={setComments} 
                  targetId={post.id} 
                  targetType="post" 
                  currentUser={currentUser} 
                  token={token || ''} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Post Modal (Titanium Glass) */}
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
                <h2 className="text-sm font-bold tracking-wider text-white uppercase">Edit Karya</h2>
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
                  <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">Konten</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
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
