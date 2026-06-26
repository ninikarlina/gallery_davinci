'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Sparkles, Image as ImageIcon, Book, PenTool } from 'lucide-react';

import UnifiedUploadForm from '@/app/components/UnifiedUploadForm';
import PostCard from '@/app/components/PostCard';
import BookCard from '@/app/components/BookCard';
import ImageCard from '@/app/components/ImageCard';

const ITEMS_PER_PAGE = 20;

export default function FeedPage() {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchAllContent(1, true);
  }, [router]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreContent();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, loadingMore, page]);

  const fetchAllContent = async (pageNum: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);
      setError('');

      const [postsRes, booksRes, imagesRes] = await Promise.all([
        axios.get(`/api/posts?page=${pageNum}&limit=10`),
        axios.get(`/api/books?page=${pageNum}&limit=5`),
        axios.get(`/api/upload/images?page=${pageNum}&limit=5`),
      ]);

      const newItems = [
        ...postsRes.data.posts.map((item: any) => ({ ...item, contentType: 'post' })),
        ...booksRes.data.books.map((item: any) => ({ ...item, contentType: 'book' })),
        ...imagesRes.data.images.map((item: any) => ({ ...item, contentType: 'image' })),
      ];

      newItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const limitedItems = newItems.slice(0, ITEMS_PER_PAGE);

      if (isInitial) setFeedItems(limitedItems);
      else setFeedItems(prev => [...prev, ...limitedItems]);

      const totalFetched = postsRes.data.posts.length + booksRes.data.books.length + imagesRes.data.images.length;
      setHasMore(totalFetched >= ITEMS_PER_PAGE);

    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Gagal memuat konten. Periksa koneksi internet Anda.');
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreContent = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAllContent(nextPage, false);
  }, [page]);

  const handlePostCreated = () => {
    setPage(1);
    setHasMore(true);
    fetchAllContent(1, true);
  };

  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchAllContent(1, true);
  };

  const renderFeedItem = (item: any) => {
    if (item.contentType === 'post') {
      return <PostCard key={item.id} post={item} onDelete={handleRefresh} />;
    }
    if (item.contentType === 'book') {
      return <BookCard key={item.id} book={item} onDelete={handleRefresh} />;
    }
    if (item.contentType === 'image') {
      return <ImageCard key={item.id} image={item} onDelete={handleRefresh} />;
    }
    return null;
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-32">
      {/* Global Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />

      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-6 sm:pt-10">

        {user ? (
          <UnifiedUploadForm onUploadSuccess={handlePostCreated} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 relative bg-[#0a0a0a]/60 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 sm:p-10 text-center overflow-hidden shadow-2xl"
          >
            {/* Inner Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
              Selamat Datang di Gallery DaVinci
            </h2>
            <p className="text-sm font-medium text-white/50 mb-8 max-w-md mx-auto leading-relaxed">
              Bergabunglah dengan komunitas seniman digital. Bagikan puisi, buku bacaan, dan karya visual Anda ke dunia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push('/login')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-white text-black text-sm font-semibold tracking-wider hover:scale-105 transition-transform active:scale-95"
              >
                Masuk
              </button>
              <button
                onClick={() => router.push('/register')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-[#050505] text-white text-sm font-semibold tracking-wider border border-white/20 hover:bg-white/10 transition-colors active:scale-95"
              >
                Daftar
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 backdrop-blur-md"
            >
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        ) : feedItems.length > 0 ? (
          <div className="flex flex-col gap-6 sm:gap-8">
            {feedItems.map((item) => renderFeedItem(item))}

            <div ref={observerTarget} className="h-20 w-full flex items-center justify-center">
              {loadingMore && <Loader2 className="w-6 h-6 text-white/40 animate-spin" />}
            </div>

            {!hasMore && feedItems.length > 0 && (
              <div className="py-10 text-center">
                <div className="w-12 h-[1px] bg-white/20 mx-auto mb-4" />
                <p className="text-xs font-bold tracking-widest uppercase text-white/30">
                  AKHIR DARI GALERI
                </p>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#0a0a0a]/40 backdrop-blur-[64px] border border-white/5 rounded-3xl"
          >
            <div className="flex justify-center gap-4 mb-6 opacity-30">
              <PenTool className="w-6 h-6" />
              <Book className="w-6 h-6" />
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white/80 mb-2 tracking-wide">Belum ada karya</h3>
            <p className="text-sm text-white/40 font-medium">Jadilah yang pertama mengabadikan mahakarya di sini.</p>
          </motion.div>
        )}

      </main>
    </div>
  );
}
