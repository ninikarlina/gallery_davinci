'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Book, Download, ExternalLink , ChevronDown, ChevronUp } from 'lucide-react';
import CommentPanel from './CommentPanel';

interface BookCardProps {
  book: any;
  onDelete?: () => void;
  onRefresh?: () => void;
}

export default function BookCard({ book, onDelete, onRefresh }: BookCardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [likes, setLikes] = useState(book.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState(book.comments || []);
  const [showComments, setShowComments] = useState(false);
      const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title || '');
  const [editDescription, setEditDescription] = useState(book.description || '');
  const [editLoading, setEditLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
            
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    setCurrentUser(user);
    setToken(authToken);
    const hasLiked = book.likes?.some((like: any) => like.userId === user.id) || false;
    setLiked(hasLiked);
  }, [book.likes]);

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
      await axios.post(`/api/books/${book.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      setLiked(previousLiked);
      setLikes(previousLikes);
      console.error('Error liking book:', error);
    }
  };




  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus buku ini?')) return;
    try {
      await axios.delete(`/api/books/${book.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.();
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      alert('Title dan description harus diisi');
      return;
    }
    setEditLoading(true);
    try {
      await axios.put(
        `/api/books/${book.id}`,
        { title: editTitle, description: editDescription },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialogOpen(false);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating book:', error);
      alert('Gagal mengupdate buku');
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

  const authorName = book.author?.fullName || book.author?.username || 'Anonim';
  const authorAvatar = book.author?.avatar;
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorId = book.author?.id;

  const MAX_CHARS = 250;
  const descriptionLines = (book.description || '').split('\n');
  const isLong = (book.description || '').length > MAX_CHARS || descriptionLines.length > 5;
  const hasMoreDescription = isLong;
  
  let truncatedDescription = book.description || '';
  if (isLong && !isExpanded) {
    if (descriptionLines.length > 5) {
      truncatedDescription = descriptionLines.slice(0, 5).join('\n');
    }
    if (truncatedDescription.length > MAX_CHARS) {
      truncatedDescription = truncatedDescription.substring(0, MAX_CHARS) + '...';
    } else if (descriptionLines.length > 5) {
      truncatedDescription += '...';
    }
  }
  const displayDescription = isExpanded ? book.description : truncatedDescription;
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
                <span className="flex items-center gap-1 bg-amber-900/30 border border-amber-500/20 rounded-full px-2 py-0.5 shadow-inner">
                  <Book className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-xs font-bold tracking-widest text-amber-200/90 uppercase">Buku PDF</span>
                </span>
              </div>
              <span className="text-xs font-bold tracking-wide text-white/30 uppercase">
                {formatDate(book.createdAt)}
              </span>
            </div>
          </div>

          {/* Book Menu Button */}
          {currentUser?.id === book.authorId && (
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
                      onClick={() => { setIsMenuOpen(false); setEditTitle(book.title); setEditDescription(book.description); setEditDialogOpen(true); }}
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
            {book.title}
          </h3>
          {book.description && (
            <>
              <p className="text-sm leading-[1.8] text-white/60 whitespace-pre-wrap italic">
                {displayDescription}
              </p>
              {hasMoreDescription && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-2 text-sm font-bold tracking-wide text-amber-400 hover:text-amber-300 uppercase transition-colors"
                >
                  {isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya...'}
                </button>
              )}
            </>
          )}

          {/* PDF Download/Open Cards */}
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <a 
              href={book.pdfUrl}
              download
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-xs font-bold tracking-wide text-white/80 hover:text-white transition-all uppercase shadow-md active:scale-95 group"
            >
              <Download className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
              Download PDF
            </a>
            <a 
              href={book.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-b from-amber-500/80 to-amber-600/80 hover:from-amber-400 hover:to-amber-500 border border-amber-400/50 rounded-lg text-xs font-bold tracking-wide text-white uppercase shadow-md transition-all active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Buka PDF
            </a>
            <span className="text-xs font-bold tracking-widest text-white/30 uppercase ml-2">
              {(book.fileSize / 1024 / 1024).toFixed(2)} MB
            </span>
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
                  targetId={book.id} 
                  targetType="book" 
                  currentUser={currentUser} 
                  token={token || ''} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Book Modal (Titanium Glass) */}
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
                <h2 className="text-sm font-bold tracking-wider text-white uppercase">Edit Buku PDF</h2>
                <button onClick={() => setEditDialogOpen(false)} className="text-white/40 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative z-10 p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">Judul Buku</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">Deskripsi</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
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
