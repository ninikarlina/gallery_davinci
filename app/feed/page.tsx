'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import UnifiedUploadForm from '@/app/components/UnifiedUploadForm';
import PostCard from '@/app/components/PostCard';
import BookCard from '@/app/components/BookCard';
import ImageCard from '@/app/components/ImageCard';
import {
  Container,
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';

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
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  useEffect(() => {
    if (mounted && user) {
      fetchAllContent(1, true);
    }
  }, [mounted, user]);

  // Infinite scroll observer
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
      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError('');
      
      // Fetch semua konten secara paralel dengan pagination
      const [postsRes, booksRes, imagesRes] = await Promise.all([
        axios.get(`/api/posts?page=${pageNum}&limit=10`),
        axios.get(`/api/books?page=${pageNum}&limit=5`),
        axios.get(`/api/upload/images?page=${pageNum}&limit=5`),
      ]);

      // Gabungkan semua konten dan tambahkan tipe
      const newItems = [
        ...postsRes.data.posts.map((item: any) => ({ ...item, contentType: 'post' })),
        ...booksRes.data.books.map((item: any) => ({ ...item, contentType: 'book' })),
        ...imagesRes.data.images.map((item: any) => ({ ...item, contentType: 'image' })),
      ];

      // Sort berdasarkan tanggal terbaru
      newItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Ambil 20 item pertama untuk batch ini
      const limitedItems = newItems.slice(0, ITEMS_PER_PAGE);
      
      if (isInitial) {
        setFeedItems(limitedItems);
      } else {
        setFeedItems(prev => [...prev, ...limitedItems]);
      }

      // Check apakah masih ada data
      const totalFetched = postsRes.data.posts.length + booksRes.data.books.length + imagesRes.data.images.length;
      setHasMore(totalFetched >= ITEMS_PER_PAGE);
      
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Gagal memuat konten');
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
    // Render Post (Puisi/Karya)
    if (item.contentType === 'post') {
      return (
        <PostCard
          key={item.id}
          post={item}
          onRefresh={handleRefresh}
          onDelete={handleRefresh}
        />
      );
    }

    // Render Book
    if (item.contentType === 'book') {
      return (
        <BookCard
          key={item.id}
          book={item}
          onRefresh={handleRefresh}
          onDelete={handleRefresh}
        />
      );
    }

    // Render Image
    if (item.contentType === 'image') {
      return (
        <ImageCard
          key={item.id}
          image={item}
          onRefresh={handleRefresh}
          onDelete={handleRefresh}
        />
      );
    }

    return null;
  };

  if (!mounted) {
    return null;
  }

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh' }}>
      <Container 
        maxWidth="md" 
        sx={{ 
          py: { xs: 2, sm: 4 },
          px: { xs: 1.5, sm: 3 },
        }}
      >
        
        <UnifiedUploadForm onUploadSuccess={handlePostCreated} />

        {error && (
          <Alert severity="error" sx={{ mt: 3, mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#ffffff' }} />
          </Box>
        ) : feedItems.length > 0 ? (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
              {feedItems.map((item) => renderFeedItem(item))}
            </Box>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} style={{ height: '20px', margin: '20px 0' }}>
              {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: '#ffffff' }} />
                </Box>
              )}
            </div>

            {!hasMore && feedItems.length > 0 && (
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'center', 
                  color: '#808080', 
                  py: 4 
                }}
              >
                Tidak ada konten lagi
              </Typography>
            )}
          </>
        ) : (
          <Paper sx={{ backgroundColor: '#1e1e1e', p: 6, textAlign: 'center', borderRadius: 2, mt: 3 }}>
            <Typography variant="h6" sx={{ color: '#b0b0b0', mb: 2 }}>
              Belum ada konten
            </Typography>
            <Typography variant="body2" sx={{ color: '#808080' }}>
              Mulai bagikan puisi, buku, atau gambar Anda!
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
