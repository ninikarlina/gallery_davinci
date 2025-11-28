'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  CircularProgress,
  Divider,
  TextField,
  Button,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  Comment as CommentIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Book {
  id: string;
  title: string;
  description?: string;
  pdfUrl: string;
  downloads: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  likes: any[];
  comments: any[];
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    setCurrentUser(user);
    setToken(authToken);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchBook();
    }
  }, [params.id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/books/${params.id}`);
      setBook(response.data);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const hasLiked = response.data.likes?.some((like: any) => like.userId === user.id);
      setLiked(hasLiked);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!token) return;

    try {
      await axios.post(
        `/api/books/${book?.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      fetchBook();
    } catch (error) {
      console.error('Error liking book:', error);
    }
  };

  const handleComment = async () => {
    if (!token || !commentText.trim()) return;

    try {
      await axios.post(
        `/api/books/${book?.id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      fetchBook();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!book) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Buku tidak ditemukan</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
        <ArrowBackIcon />
      </IconButton>

      <Paper sx={{ p: 3, bgcolor: '#1e1e1e', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={book.author.avatar}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, mr: 2, bgcolor: '#404040' }}
          >
            {book.author.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{book.author.fullName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              @{book.author.username} • {new Date(book.createdAt).toLocaleDateString('id-ID')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <DescriptionIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#90caf9' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {book.title}
          </Typography>
        </Box>

        {book.description && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
            {book.description}
          </Typography>
        )}

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => window.open(book.pdfUrl, '_blank')}
          sx={{ mb: 3 }}
        >
          Buka PDF
        </Button>

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
          {book.downloads} unduhan
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            startIcon={<FavoriteIcon />}
            onClick={handleLike}
            sx={{
              color: liked ? '#f44336' : 'white',
              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
            }}
          >
            {book.likes?.length || 0}
          </Button>
          <Button
            startIcon={<CommentIcon />}
            sx={{ color: 'white' }}
          >
            {book.comments?.length || 0}
          </Button>
        </Box>

        <Divider sx={{ my: 3, bgcolor: 'rgba(255,255,255,0.12)' }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          Komentar
        </Typography>

        {currentUser && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Tulis komentar..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: '#404040' },
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              Kirim
            </Button>
          </Box>
        )}

        {book.comments?.map((comment: any) => (
          <Box key={comment.id} sx={{ mb: 2, p: 2, bgcolor: '#121212', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar
                src={comment.author.avatar}
                sx={{ width: 32, height: 32, mr: 1, bgcolor: '#404040' }}
              >
                {comment.author.fullName.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {comment.author.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2">{comment.content}</Typography>
          </Box>
        ))}
      </Paper>
    </Container>
  );
}
