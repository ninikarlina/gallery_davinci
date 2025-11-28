'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
  TextField,
  Chip,
  Divider,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ChatBubbleOutline as CommentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Article as ArticleIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';

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
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || '');
  const [editContent, setEditContent] = useState(post.content || '');
  const [editLoading, setEditLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [commentMenuAnchor, setCommentMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    setCurrentUser(user);
    setToken(authToken);

    // Check if current user has liked this post
    const hasLiked = post.likes?.some((like: any) => like.userId === user.id) || false;
    setLiked(hasLiked);
  }, [post.likes]);

  const handleLike = async () => {
    try {
      await axios.post(`/api/posts/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
      onRefresh?.();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `/api/posts/${post.id}/comments`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      onRefresh?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
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

  const handleOpenEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditDialogOpen(true);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Hapus komentar ini?')) return;

    try {
      await axios.delete(`/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editCommentText.trim()) return;

    try {
      await axios.put(
        `/api/comments/${commentId}`,
        { content: editCommentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditCommentText('');
      onRefresh?.();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const startEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentContent);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const handleCommentMenuOpen = (event: React.MouseEvent<HTMLElement>, commentId: string) => {
    setCommentMenuAnchor(event.currentTarget);
    setActiveCommentId(commentId);
  };

  const handleCommentMenuClose = () => {
    setCommentMenuAnchor(null);
    setActiveCommentId(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const authorName = post.author?.fullName || post.author?.username || 'Anonim';
  const authorAvatar = post.author?.avatar;
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorId = post.author?.id;

  // Function to get first 10 lines of content
  const getPreviewContent = () => {
    const lines = post.content.split('\n');
    if (lines.length <= 10) return post.content;
    return lines.slice(0, 10).join('\n');
  };

  const contentLines = post.content.split('\n');
  const hasMoreContent = contentLines.length > 10;
  const displayContent = isExpanded ? post.content : getPreviewContent();

  return (
    <Card sx={{ backgroundColor: '#1e1e1e', color: '#ffffff', mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={authorAvatar || undefined}
            sx={{ 
              bgcolor: '#404040', 
              mr: 2,
              cursor: authorId ? 'pointer' : 'default',
            }}
            onClick={() => authorId && router.push(`/profile/${authorId}`)}
          >
            {!authorAvatar && authorInitial}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 'bold',
                cursor: authorId ? 'pointer' : 'default',
                '&:hover': authorId ? { textDecoration: 'underline' } : {},
              }}
              onClick={() => authorId && router.push(`/profile/${authorId}`)}
            >
              {authorName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#b0b0b0' }}>
              {formatDate(post.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<ArticleIcon />}
              label="Karya Sastra"
              size="small"
              sx={{ backgroundColor: '#333333', color: '#ffffff' }}
            />
            {currentUser?.id === post.authorId && (
              <IconButton
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                size="small"
                sx={{ color: '#b0b0b0', '&:hover': { backgroundColor: '#333333' } }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Menu for Edit/Delete */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{
            sx: {
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleOpenEdit();
            }}
            sx={{ '&:hover': { backgroundColor: '#333333' } }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: '#5599ff' }} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleDelete();
            }}
            sx={{ '&:hover': { backgroundColor: '#333333' } }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: '#ff5555' }} />
            </ListItemIcon>
            <ListItemText>Hapus</ListItemText>
          </MenuItem>
        </Menu>

        {/* Menu for Comment Edit/Delete */}
        <Menu
          anchorEl={commentMenuAnchor}
          open={Boolean(commentMenuAnchor)}
          onClose={handleCommentMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              minWidth: 120,
            },
          }}
        >
          <MenuItem
            onClick={() => {
              if (activeCommentId) {
                const comment = post.comments?.find((c: any) => c.id === activeCommentId);
                if (comment) {
                  startEditComment(activeCommentId, comment.content || comment.text);
                }
              }
              handleCommentMenuClose();
            }}
            sx={{ '&:hover': { backgroundColor: '#333333' } }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" sx={{ color: '#5599ff' }} />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (activeCommentId) {
                handleDeleteComment(activeCommentId);
              }
              handleCommentMenuClose();
            }}
            sx={{ '&:hover': { backgroundColor: '#333333' } }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: '#ff5555' }} />
            </ListItemIcon>
            <ListItemText>Hapus</ListItemText>
          </MenuItem>
        </Menu>

        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {post.title}
        </Typography>

        {/* Content */}
        <Typography
          variant="body1"
          sx={{
            color: '#e0e0e0',
            whiteSpace: 'pre-wrap',
            mb: hasMoreContent ? 1 : 2,
            fontStyle: 'italic',
            lineHeight: 1.8,
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {displayContent}
        </Typography>

        {/* Read More Button */}
        {hasMoreContent && (
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="small"
            sx={{
              color: '#5599ff',
              textTransform: 'none',
              mb: 2,
              '&:hover': { backgroundColor: '#333333' },
            }}
          >
            {isExpanded ? 'Sembunyikan' : 'Baca Selengkapnya'}
          </Button>
        )}

        {/* Image (if exists) */}
        {post.image && (
          <CardMedia
            component="img"
            image={post.image}
            alt={post.title}
            sx={{
              borderRadius: 2,
              maxHeight: 400,
              objectFit: 'cover',
              mb: 2,
            }}
          />
        )}

        <Divider sx={{ borderColor: '#333333', my: 2 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            onClick={handleLike}
            sx={{
              color: liked ? '#ff5555' : '#b0b0b0',
              '&:hover': { backgroundColor: '#333333' },
            }}
          >
            {likes}
          </Button>
          <Button
            startIcon={<CommentIcon />}
            onClick={() => setShowComments(!showComments)}
            sx={{
              color: '#b0b0b0',
              '&:hover': { backgroundColor: '#333333' },
            }}
          >
            {post.comments?.length || 0}
          </Button>
        </Box>

        {/* Comments Section */}
        <Collapse in={showComments}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #333333' }}>
            {/* Comments List */}
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment: any, idx: number) => {
                  const commentAuthorName = comment.author?.username || comment.author?.fullName || 'Anonim';
                  const commentAuthorAvatar = comment.author?.avatar;
                  const commentAuthorInitial = commentAuthorName.charAt(0).toUpperCase();
                  const commentAuthorId = comment.author?.id;
                  const isCommentOwner = currentUser?.id === commentAuthorId;
                  const isEditing = editingCommentId === comment.id;
                  
                  return (
                    <Box
                      key={idx}
                      sx={{
                        backgroundColor: '#2a2a2a',
                        p: 2,
                        borderRadius: 1,
                        mb: 1,
                        display: 'flex',
                        gap: 1.5,
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      <Avatar 
                        src={commentAuthorAvatar || undefined}
                        sx={{ 
                          width: 32,
                          height: 32,
                          fontSize: 14,
                          bgcolor: '#404040',
                          cursor: commentAuthorId ? 'pointer' : 'default',
                        }}
                        onClick={() => commentAuthorId && router.push(`/profile/${commentAuthorId}`)}
                      >
                        {!commentAuthorAvatar && commentAuthorInitial}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              color: '#ffffff', 
                              fontWeight: 'bold',
                              cursor: commentAuthorId ? 'pointer' : 'default',
                              display: 'inline-block',
                              '&:hover': commentAuthorId ? { textDecoration: 'underline' } : {},
                            }}
                            onClick={() => commentAuthorId && router.push(`/profile/${commentAuthorId}`)}
                          >
                            {commentAuthorName}
                          </Typography>
                          {isCommentOwner && !isEditing && (
                            <IconButton
                              size="small"
                              onClick={(e) => handleCommentMenuOpen(e, comment.id)}
                              sx={{ color: '#b0b0b0', p: 0.5 }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                        
                        {isEditing ? (
                          <Box sx={{ mt: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              multiline
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              sx={{
                                mb: 1,
                                '& .MuiOutlinedInput-root': {
                                  color: '#ffffff',
                                  backgroundColor: '#333333',
                                  '& fieldset': { borderColor: '#404040' },
                                },
                              }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleEditComment(comment.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Simpan
                              </Button>
                              <Button
                                size="small"
                                onClick={cancelEditComment}
                                sx={{ textTransform: 'none', color: '#b0b0b0' }}
                              >
                                Batal
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: '#e0e0e0', mt: 0.5 }}>
                            {comment.content || comment.text}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" sx={{ color: '#808080', textAlign: 'center', py: 2 }}>
                  Belum ada komentar
                </Typography>
              )}
            </Box>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tulis komentar..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#ffffff',
                      backgroundColor: '#2a2a2a',
                      '& fieldset': { borderColor: '#404040' },
                      '&:hover fieldset': { borderColor: '#b0b0b0' },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !commentText.trim()}
                  endIcon={<SendIcon />}
                  sx={{
                    backgroundColor: '#000000',
                    border: '1px solid #404040',
                    '&:hover': { backgroundColor: '#333333' },
                    '&:disabled': { backgroundColor: '#1a1a1a', color: '#666666' },
                  }}
                >
                  Kirim
                </Button>
              </Box>
            </form>
          </Box>
        </Collapse>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #333333' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Edit Post</Typography>
            <IconButton onClick={() => setEditDialogOpen(false)} size="small" sx={{ color: '#b0b0b0' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Judul"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': { borderColor: '#404040' },
                '&:hover fieldset': { borderColor: '#b0b0b0' },
              },
              '& .MuiInputLabel-root': { color: '#b0b0b0' },
            }}
          />
          <TextField
            fullWidth
            label="Konten"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            margin="normal"
            multiline
            rows={6}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': { borderColor: '#404040' },
                '&:hover fieldset': { borderColor: '#b0b0b0' },
              },
              '& .MuiInputLabel-root': { color: '#b0b0b0' },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #333333', p: 2 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: '#b0b0b0' }}
          >
            Batal
          </Button>
          <Button
            onClick={handleEdit}
            variant="contained"
            disabled={editLoading}
            sx={{
              backgroundColor: '#5599ff',
              '&:hover': { backgroundColor: '#4488ee' },
            }}
          >
            {editLoading ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
