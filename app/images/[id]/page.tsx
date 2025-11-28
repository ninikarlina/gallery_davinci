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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Image from 'next/image';

interface ImageData {
  id: string;
  title: string;
  caption?: string;
  imageUrl?: string;
  images?: Array<{
    id: string;
    imageUrl: string;
    order: number;
  }>;
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

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    setCurrentUser(user);
    setToken(authToken);
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchImage();
    }
  }, [params.id]);

  const fetchImage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/upload/images/${params.id}`);
      setImageData(response.data);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const hasLiked = response.data.likes?.some((like: any) => like.userId === user.id);
      setLiked(hasLiked);
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!token) return;

    try {
      await axios.post(
        `/api/upload/images/${imageData?.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      fetchImage();
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  const handleComment = async () => {
    if (!token || !commentText.trim()) return;

    try {
      await axios.post(
        `/api/upload/images/${imageData?.id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      fetchImage();
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

  if (!imageData) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Gambar tidak ditemukan</Typography>
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
            src={imageData.author.avatar}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, mr: 2, bgcolor: '#404040' }}
          >
            {imageData.author.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{imageData.author.fullName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              @{imageData.author.username} • {new Date(imageData.createdAt).toLocaleDateString('id-ID')}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          {imageData.title}
        </Typography>

        {/* Image Carousel */}
        {imageData.images && imageData.images.length > 0 ? (
          <Box sx={{ position: 'relative', mb: 3 }}>
            <Box sx={{ position: 'relative', width: '100%', height: 400, bgcolor: '#000' }}>
              <Image
                src={imageData.images[currentImageIndex]?.imageUrl}
                alt={`${imageData.title}-${currentImageIndex}`}
                fill
                style={{ objectFit: 'contain' }}
              />
            </Box>
            
            {/* Navigation Arrows */}
            {imageData.images.length > 1 && (
              <>
                <IconButton
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? imageData.images!.length - 1 : prev - 1))}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <IconButton
                  onClick={() => setCurrentImageIndex((prev) => (prev === imageData.images!.length - 1 ? 0 : prev + 1))}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
                
                {/* Image Counter */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#ffffff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.875rem',
                  }}
                >
                  {currentImageIndex + 1} / {imageData.images.length}
                </Box>
                
                {/* Dot Indicators */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 1,
                  }}
                >
                  {imageData.images.map((_, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: idx === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        ) : null}

        {imageData.caption && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
            {imageData.caption}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            startIcon={<FavoriteIcon />}
            onClick={handleLike}
            sx={{
              color: liked ? '#f44336' : 'white',
              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
            }}
          >
            {imageData.likes?.length || 0}
          </Button>
          <Button
            startIcon={<CommentIcon />}
            sx={{ color: 'white' }}
          >
            {imageData.comments?.length || 0}
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

        {imageData.comments?.map((comment: any) => (
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
