'use client';

import { useState, useEffect, useRef } from 'react';
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
  Image as ImageIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

interface ImageCardProps {
  image: any;
  onDelete?: () => void;
  onRefresh?: () => void;
}

export default function ImageCard({ image, onDelete, onRefresh }: ImageCardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);

  const [likes, setLikes] = useState(image.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(image.title || '');
  const [editCaption, setEditCaption] = useState(image.caption || '');
  const [editLoading, setEditLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [commentMenuAnchor, setCommentMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Swipe gesture states
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const imageRef = useRef<HTMLDivElement>(null);

  const imageItems = image.images || [];

  useEffect(() => {
    // Only run on client side
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const authToken = localStorage.getItem('token');
    setCurrentUser(user);
    setToken(authToken);

    // Check if current user has liked this image
    const hasLiked = image.likes?.some((like: any) => like.userId === user.id) || false;
    setLiked(hasLiked);
  }, [image.likes]);

  const handleLike = async () => {
    try {
      await axios.post(`/api/upload/images/${image.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
      onRefresh?.();
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        `/api/upload/images/${image.id}/comments`,
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
    if (!confirm('Yakin ingin menghapus gambar ini?')) return;

    try {
      await axios.delete(`/api/upload/images/${image.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      alert('Title harus diisi');
      return;
    }

    setEditLoading(true);
    try {
      await axios.put(
        `/api/upload/images/${image.id}`,
        { title: editTitle, caption: editCaption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditDialogOpen(false);
      onRefresh?.();
    } catch (error) {
      console.error('Error updating image:', error);
      alert('Gagal mengupdate gambar');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditTitle(image.title);
    setEditCaption(image.caption || '');
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
      alert('Gagal menghapus komentar');
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
      alert('Gagal mengubah komentar');
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

  const authorName = image.author?.fullName || image.author?.username || 'Anonim';
  const authorAvatar = image.author?.avatar;
  const authorInitial = authorName.charAt(0).toUpperCase();
  const authorId = image.author?.id;

  // Function to get first 10 lines of caption
  const getPreviewCaption = () => {
    if (!image.caption) return '';
    const lines = image.caption.split('\n');
    if (lines.length <= 10) return image.caption;
    return lines.slice(0, 10).join('\n');
  };

  const captionLines = image.caption ? image.caption.split('\n') : [];
  const hasMoreCaption = captionLines.length > 10;
  const displayCaption = isExpanded ? image.caption : getPreviewCaption();

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum swipe distance in pixels

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next image
        handleNextImage();
      } else {
        // Swipe right - previous image
        handlePrevImage();
      }
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imageItems.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === imageItems.length - 1 ? 0 : prev + 1));
  };

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
              {formatDate(image.createdAt)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<ImageIcon />}
              label="Gambar"
              size="small"
              sx={{ backgroundColor: '#333333', color: '#ffffff' }}
            />
            {currentUser?.id === image.authorId && (
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
                const comment = image.comments?.find((c: any) => c.id === activeCommentId);
                if (comment) {
                  startEditComment(activeCommentId, comment.content);
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

        {/* Title & Caption */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          {image.title}
        </Typography>
        {image.caption && (
          <>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#b0b0b0', 
                mb: hasMoreCaption ? 1 : 2,
                whiteSpace: 'pre-wrap',
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {displayCaption}
            </Typography>
            
            {/* Read More Button */}
            {hasMoreCaption && (
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
          </>
        )}

        {/* Image Carousel */}
        {imageItems.length > 0 ? (
          <Box 
            ref={imageRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{ 
              position: 'relative', 
              mb: 2,
              width: '100%',
              height: { xs: 300, sm: 400, md: 500 },
              backgroundColor: '#000000',
              borderRadius: 2,
              overflow: 'hidden',
              touchAction: 'pan-y pinch-zoom', // Allow vertical scroll but enable horizontal swipe
            }}
          >
            <CardMedia
              component="img"
              image={imageItems[currentImageIndex]?.imageUrl}
              alt={`${image.title}-${currentImageIndex}`}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                WebkitUserDrag: 'none',
              }}
            />
            
            {/* Navigation Arrows */}
            {imageItems.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: 'absolute',
                    left: { xs: 4, sm: 8 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#ffffff',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    zIndex: 2,
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: 'absolute',
                    right: { xs: 4, sm: 8 },
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: '#ffffff',
                    width: { xs: 32, sm: 40 },
                    height: { xs: 32, sm: 40 },
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    zIndex: 2,
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
                
                {/* Image Counter */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: { xs: 4, sm: 8 },
                    right: { xs: 4, sm: 8 },
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: '#ffffff',
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.25, sm: 0.5 },
                    borderRadius: 1,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    fontWeight: 'bold',
                    zIndex: 2,
                  }}
                >
                  {currentImageIndex + 1} / {imageItems.length}
                </Box>
                
                {/* Dot Indicators */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: { xs: 4, sm: 8 },
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: { xs: 0.5, sm: 1 },
                    zIndex: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    px: 1,
                    py: 0.5,
                    borderRadius: 2,
                  }}
                >
                  {imageItems.map((_: any, idx: number) => (
                    <Box
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      sx={{
                        width: { xs: 6, sm: 8 },
                        height: { xs: 6, sm: 8 },
                        borderRadius: '50%',
                        backgroundColor: idx === currentImageIndex ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          backgroundColor: '#ffffff',
                          transform: 'scale(1.2)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ 
            height: { xs: 300, sm: 400, md: 500 },
            backgroundColor: '#000000',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}>
            <Typography variant="body2" sx={{ color: '#808080', textAlign: 'center' }}>
              Tidak ada gambar
            </Typography>
          </Box>
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
            {image.comments?.length || 0}
          </Button>
        </Box>

        {/* Comments Section */}
        <Collapse in={showComments}>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #333333' }}>
            {/* Comments List */}
            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
              {image.comments && image.comments.length > 0 ? (
                image.comments.map((comment: any, idx: number) => {
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
                            {comment.content}
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
            <Typography variant="h6">Edit Gambar</Typography>
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
            label="Caption (opsional)"
            value={editCaption}
            onChange={(e) => setEditCaption(e.target.value)}
            margin="normal"
            multiline
            rows={3}
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
