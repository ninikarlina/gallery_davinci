'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Pagination,
} from '@mui/material';
import { Download as DownloadIcon, Favorite as FavoriteIcon } from '@mui/icons-material';

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    if (!storedToken) {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [page, token]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/books?page=${page}`);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (bookId: string) => {
    try {
      await axios.post(
        `/api/books/${bookId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBooks();
    } catch (error) {
      console.error('Error liking book:', error);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 4, color: '#ffffff' }}>
            📚 Perpustakaan Digital
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#ffffff' }} />
            </Box>
          ) : books.length > 0 ? (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {books.map((book) => (
                  <Grid item xs={12} sm={6} md={4} key={book._id}>
                    <Card
                      sx={{
                        backgroundColor: '#1e1e1e',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          boxShadow: '0 8px 24px rgba(255,255,255,0.1)',
                          transform: 'translateY(-4px)',
                          transition: 'all 0.3s ease',
                        },
                      }}
                    >
                      <CardMedia
                        sx={{
                          backgroundColor: 'linear-gradient(135deg, #333333 0%, #1a1a1a 100%)',
                          height: 160,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        <Box sx={{ textAlign: 'center', p: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {book.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
                            📝 {book.author.fullName}
                          </Typography>
                        </Box>
                      </CardMedia>

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 2, minHeight: 48 }}>
                          {book.description}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px solid #333333' }}>
                          <Typography variant="caption" sx={{ color: '#808080' }}>
                            📊 {book.downloads} downloads
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#808080' }}>
                            💾 {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleLike(book._id)}
                            sx={{
                              flex: 1,
                              color: '#ff6b6b',
                              '&:hover': { backgroundColor: 'rgba(255, 107, 107, 0.1)' },
                            }}
                          >
                            <FavoriteIcon sx={{ mr: 0.5 }} />
                            {book.likes?.length || 0}
                          </IconButton>
                          <Button
                            component="a"
                            href={book.filePath}
                            download
                            variant="contained"
                            size="small"
                            endIcon={<DownloadIcon />}
                            sx={{
                              flex: 1,
                              backgroundColor: '#000000',
                              color: '#ffffff',
                              '&:hover': { backgroundColor: '#333333' },
                            }}
                          >
                            Download
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={10}
                  page={page}
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#ffffff',
                      '&.Mui-selected': {
                        backgroundColor: '#000000',
                      },
                    },
                  }}
                />
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ textAlign: 'center', color: '#b0b0b0', py: 8 }}>
              Belum ada buku. Jadilah yang pertama upload!
            </Typography>
          )}
      </Container>
    </Box>
  );
}
