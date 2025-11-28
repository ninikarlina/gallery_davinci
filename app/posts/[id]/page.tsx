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
} from '@mui/icons-material';
import axios from 'axios';

interface Post {
  id: string;
  title: string;
  content: string;
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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
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
      fetchPost();
    }
  }, [params.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts/${params.id}`);
      setPost(response.data.post);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const hasLiked = response.data.post.likes?.some((like: any) => like.userId === user.id);
      setLiked(hasLiked);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!token) return;

    try {
      await axios.post(
        `/api/posts/${post?.id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      fetchPost();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async () => {
    if (!token || !commentText.trim()) return;

    try {
      await axios.post(
        `/api/posts/${post?.id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      fetchPost();
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

  if (!post) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Post tidak ditemukan</Typography>
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
            src={post.author.avatar}
            sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, mr: 2, bgcolor: '#404040' }}
          >
            {post.author.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>{post.author.fullName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              @{post.author.username} • {new Date(post.createdAt).toLocaleDateString('id-ID')}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          {post.title}
        </Typography>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {post.content}
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
            {post.likes?.length || 0}
          </Button>
          <Button
            startIcon={<CommentIcon />}
            sx={{ color: 'white' }}
          >
            {post.comments?.length || 0}
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

        {post.comments?.map((comment: any) => (
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
