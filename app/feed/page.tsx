'use client';

import { useEffect, useState } from 'react';
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

export default function FeedPage() {
  const router = useRouter();
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
    } else {
      setUser(JSON.parse(userData));
    }
    fetchAllContent();
  }, [router]);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch semua konten secara paralel
      const [postsRes, booksRes, imagesRes] = await Promise.all([
        axios.get('/api/posts?page=1'),
        axios.get('/api/books?page=1'),
        axios.get('/api/upload/images?page=1'),
      ]);

      // Gabungkan semua konten dan tambahkan tipe
      const allItems = [
        ...postsRes.data.posts.map((item: any) => ({ ...item, contentType: 'post' })),
        ...booksRes.data.books.map((item: any) => ({ ...item, contentType: 'book' })),
        ...imagesRes.data.images.map((item: any) => ({ ...item, contentType: 'image' })),
      ];

      // Sort berdasarkan tanggal terbaru
      allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setFeedItems(allItems);
    } catch (err) {
      console.error('Error fetching content:', err);
      setError('Gagal memuat konten');
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchAllContent();
  };

  const renderFeedItem = (item: any) => {
    // Render Post (Puisi/Karya)
    if (item.contentType === 'post') {
      return (
        <PostCard
          key={item.id}
          post={item}
          onRefresh={fetchAllContent}
          onDelete={fetchAllContent}
        />
      );
    }

    // Render Book
    if (item.contentType === 'book') {
      return (
        <BookCard
          key={item.id}
          book={item}
          onRefresh={fetchAllContent}
          onDelete={fetchAllContent}
        />
      );
    }

    // Render Image
    if (item.contentType === 'image') {
      return (
        <ImageCard
          key={item.id}
          image={item}
          onRefresh={fetchAllContent}
          onDelete={fetchAllContent}
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
            {feedItems.map((item) => renderFeedItem(item))}
          </Box>
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
