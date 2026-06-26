'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, AlertCircle, Edit2, Camera, Trash2, Calendar, LayoutGrid, Type, AtSign, Mail, 
  CheckCircle2, Plus, PenTool, Book, Image as ImageIcon
} from 'lucide-react';

import UnifiedUploadForm from '@/app/components/UnifiedUploadForm';
import PostCard from '@/app/components/PostCard';
import BookCard from '@/app/components/BookCard';
import ImageCard from '@/app/components/ImageCard';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
}

interface ContentItem {
  id: string;
  title: string;
  content?: string;
  description?: string;
  caption?: string;
  pdfUrl?: string;
  imageUrl?: string;
  createdAt: string;
  author?: any;
  comments?: any[];
  likes?: any[];
  contentType: 'post' | 'book' | 'image';
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ fullName: '', bio: '' });

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setCurrentUser(JSON.parse(userData));
    setToken(localStorage.getItem('token'));
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${userId}`);
      setUser(response.data.user);
      
      const posts = (response.data.posts || []).map((p: any) => ({ ...p, contentType: 'post' as const }));
      const books = (response.data.books || []).map((b: any) => ({ ...b, contentType: 'book' as const }));
      const images = (response.data.images || []).map((i: any) => ({ ...i, contentType: 'image' as const }));
      
      const merged = [...posts, ...books, ...images];
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setAllContent(merged);
      setFormData({
        fullName: response.data.user.fullName,
        bio: response.data.user.bio || '',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Gagal memuat profil pengguna');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleUpdateProfile = async () => {
    if (!token) return;
    try {
      const response = await axios.put(`/api/users/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setIsEditing(false);
      setError('');
      showSuccess('Profil berhasil diperbarui!');
      
      const updatedUser = { ...currentUser, ...response.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Gagal memperbarui profil');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      setError('');
      const response = await axios.post(`/api/users/${userId}/avatar`, uploadData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setUser(response.data.user);
      showSuccess('Foto profil diperbarui!');
      
      const updatedUser = { ...currentUser, avatar: response.data.user.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengunggah foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!token || !user?.avatar) return;
    if (!confirm('Hapus foto profil?')) return;
    try {
      setUploadingAvatar(true);
      const response = await axios.delete(`/api/users/${userId}/avatar`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      showSuccess('Foto profil dihapus!');
      
      const updatedUser = { ...currentUser, avatar: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal menghapus foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6" />
          <p className="font-medium">Pengguna tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative pb-32">
      {/* Background Noise & Glow */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-screen z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-white/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-6 sm:pt-10">
        
        {/* Alerts */}
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-3 backdrop-blur-md"
            >
              <AlertCircle className="w-5 h-5 shrink-0" /> <p>{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium flex items-center gap-3 backdrop-blur-md"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" /> <p>{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-[64px] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden relative mb-8">
          
          <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3 mx-auto sm:mx-0">
              <div className="relative group/avatar w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#1e1e1e] border-4 border-[#050505] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white/50">{user.fullName.charAt(0).toUpperCase()}</span>
                )}
                
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {isOwnProfile && !uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10 backdrop-blur-sm">
                    <label className="cursor-pointer p-2 hover:bg-white/20 rounded-full transition-colors text-white">
                      <Camera className="w-5 h-5" />
                      <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                    {user.avatar && (
                      <button onClick={handleDeleteAvatar} className="p-2 hover:bg-red-500/50 rounded-full transition-colors text-white">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 w-full space-y-5">
              {!isEditing ? (
                <>
                  <div className="space-y-3">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">{user.fullName}</h1>
                      <div className="flex items-center gap-2 text-white/50 text-sm mt-1">
                        <AtSign className="w-3.5 h-3.5" /> <span>{user.username}</span>
                      </div>
                    </div>
                    
                    {user.bio && (
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white/80 leading-relaxed shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                        {user.bio}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold tracking-widest text-white/30 uppercase mt-4">
                      <div className="flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5" /> {allContent.length} Karya</div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold tracking-wider text-white uppercase transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Profil
                    </button>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">Nama Lengkap</label>
                    <div className="relative">
                      <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-[#050505]/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      className="w-full bg-[#050505]/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 transition-colors custom-scrollbar resize-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 py-3 bg-white text-black border border-white rounded-xl text-sm font-bold tracking-wider uppercase transition-transform active:scale-95"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => { setIsEditing(false); setFormData({ fullName: user.fullName, bio: user.bio || '' }); }}
                      className="flex-1 py-3 bg-transparent text-white border border-white/20 rounded-xl text-sm font-bold tracking-wider uppercase hover:bg-white/5 transition-colors active:scale-95"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white">Galeri Karya</h2>
            <span className="px-3 py-1 bg-white/10 text-white/70 text-sm font-bold rounded-full border border-white/5">{allContent.length}</span>
          </div>
          
          {isOwnProfile && (
            <button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold tracking-wide uppercase transition-all duration-300 shadow-lg ${showCreatePost ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'}`}
            >
              {showCreatePost ? <AlertCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span className="hidden sm:inline">{showCreatePost ? 'Tutup Form' : 'Tambah Karya'}</span>
              <span className="sm:hidden">{showCreatePost ? 'Tutup' : 'Tambah'}</span>
            </button>
          )}
        </div>

        {/* Create Content Form Dropdown */}
        <AnimatePresence>
          {showCreatePost && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="origin-top"
            >
              <UnifiedUploadForm 
                onUploadSuccess={() => {
                  setShowCreatePost(false);
                  fetchUserProfile();
                }} 
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Grid/List */}
        <div className="space-y-6">
          {allContent.length === 0 ? (
            <div className="text-center py-20 bg-[#0a0a0a]/40 backdrop-blur-[64px] border border-white/5 rounded-3xl">
              <div className="flex justify-center gap-4 mb-6 opacity-30">
                <PenTool className="w-6 h-6" />
                <Book className="w-6 h-6" />
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white/80 mb-2 tracking-wide">Belum ada karya</h3>
              <p className="text-sm text-white/40 font-medium">{isOwnProfile ? 'Mulai bagikan karya terbaikmu di sini.' : 'Pengguna ini belum membagikan apa pun.'}</p>
            </div>
          ) : (
            allContent.map((content) => (
              <div key={content.id} className="bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 shadow-xl">
                {content.contentType === 'post' && <PostCard post={content} onDelete={fetchUserProfile} onRefresh={fetchUserProfile} />}
                {content.contentType === 'book' && <BookCard book={content} onDelete={fetchUserProfile} onRefresh={fetchUserProfile} />}
                {content.contentType === 'image' && <ImageCard image={content} onDelete={fetchUserProfile} onRefresh={fetchUserProfile} />}
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
