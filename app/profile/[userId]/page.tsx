'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { Edit, PhotoCamera, Delete, Add, MoreVert as MoreVertIcon, Article as ArticleIcon, MenuBook as BookIcon, Image as ImageIcon } from '@mui/icons-material';
import axios from 'axios';
import UnifiedUploadForm from '@/app/components/UnifiedUploadForm';

// Edit Dialog Imports
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

// ContentCard component to render different types of content
function ContentCard({ content, isOwnContent, onDelete, onRefresh }: {
  content: any;
  isOwnContent: boolean;
  onDelete: () => void;
  onRefresh: () => void;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Edit form states
  const [editTitle, setEditTitle] = useState(content.title || '');
  const [editContent, setEditContent] = useState(content.content || '');
  const [editDescription, setEditDescription] = useState(content.description || '');
  const [editCaption, setEditCaption] = useState(content.caption || '');

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const handleDelete = async () => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${content.contentType === 'post' ? 'postingan' : content.contentType === 'book' ? 'buku' : 'gambar'} ini?`)) return;

    try {
      let endpoint = '';
      if (content.contentType === 'post') endpoint = `/api/posts/${content.id}`;
      else if (content.contentType === 'book') endpoint = `/api/books/${content.id}`;
      else if (content.contentType === 'image') endpoint = `/api/upload/images/${content.id}`;

      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      onDelete();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const handleEdit = async () => {
    setEditLoading(true);
    try {
      let endpoint = '';
      let data = {};

      if (content.contentType === 'post') {
        endpoint = `/api/posts/${content.id}`;
        data = { title: editTitle, content: editContent };
      } else if (content.contentType === 'book') {
        endpoint = `/api/books/${content.id}`;
        data = { title: editTitle, description: editDescription };
      } else if (content.contentType === 'image') {
        endpoint = `/api/upload/images/${content.id}`;
        data = { title: editTitle, caption: editCaption };
      }

      await axios.put(endpoint, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEditDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error updating content:', error);
      alert('Gagal mengupdate konten');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setEditTitle(content.title);
    setEditContent(content.content || '');
    setEditDescription(content.description || '');
    setEditCaption(content.caption || '');
    setEditDialogOpen(true);
  };

  // Function to get first 10 lines of content for posts
  const getPreviewContent = () => {
    if (content.contentType !== 'post' || !content.content) return content.content;
    const lines = content.content.split('\n');
    if (lines.length <= 10) return content.content;
    return lines.slice(0, 10).join('\n');
  };

  // Function to get first 10 lines of description for books
  const getPreviewDescription = () => {
    if (content.contentType !== 'book' || !content.description) return content.description;
    const lines = content.description.split('\n');
    if (lines.length <= 10) return content.description;
    return lines.slice(0, 10).join('\n');
  };

  // Function to get first 10 lines of caption for images
  const getPreviewCaption = () => {
    if (content.contentType !== 'image' || !content.caption) return content.caption;
    const lines = content.caption.split('\n');
    if (lines.length <= 10) return content.caption;
    return lines.slice(0, 10).join('\n');
  };

  const contentLines = content.content ? content.content.split('\n') : [];
  const hasMoreContent = content.contentType === 'post' && contentLines.length > 10;
  const displayContent = isExpanded ? content.content : getPreviewContent();

  const descriptionLines = content.description ? content.description.split('\n') : [];
  const hasMoreDescription = content.contentType === 'book' && descriptionLines.length > 10;
  const displayDescription = isExpanded ? content.description : getPreviewDescription();

  const captionLines = content.caption ? content.caption.split('\n') : [];
  const hasMoreCaption = content.contentType === 'image' && captionLines.length > 10;
  const displayCaption = isExpanded ? content.caption : getPreviewCaption();

  // Render Post
  if (content.contentType === 'post') {
    return (
      <>
        <Card sx={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
          <CardContent>
            {/* Header with Chip and Menu */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Chip
                icon={<ArticleIcon />}
                label="Karya Sastra"
                size="small"
                sx={{ backgroundColor: '#333333', color: '#ffffff' }}
              />
              {isOwnContent && (
                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  size="small"
                  sx={{ color: '#b0b0b0', '&:hover': { backgroundColor: '#333333' } }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Title */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff' }}>
              {content.title}
            </Typography>

            {/* Content */}
            <Typography
              variant="body1"
              sx={{
                color: '#e0e0e0',
                whiteSpace: 'pre-wrap',
                fontStyle: 'italic',
                lineHeight: 1.8,
                mb: hasMoreContent ? 1 : 2,
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

            {/* Date */}
            <Typography variant="caption" sx={{ color: '#808080', display: 'block' }}>
              {new Date(content.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          </CardContent>
        </Card>

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
              <Edit fontSize="small" sx={{ color: '#5599ff' }} />
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
              <Delete fontSize="small" sx={{ color: '#ff5555' }} />
            </ListItemIcon>
            <ListItemText>Hapus</ListItemText>
          </MenuItem>
        </Menu>

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
      </>
    );
  }

  // Render Book
  if (content.contentType === 'book') {
    return (
      <>
        <Card sx={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
          <CardContent>
            {/* Header with Chip and Menu */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Chip
                icon={<BookIcon />}
                label="Buku PDF"
                size="small"
                sx={{ backgroundColor: '#333333', color: '#ffffff' }}
              />
              {isOwnContent && (
                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  size="small"
                  sx={{ color: '#b0b0b0', '&:hover': { backgroundColor: '#333333' } }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Title */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff' }}>
              {content.title}
            </Typography>

            {/* Description */}
            {content.description && (
              <>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#b0b0b0', 
                    mb: hasMoreDescription ? 1 : 2,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {displayDescription}
                </Typography>
                
                {/* Read More Button */}
                {hasMoreDescription && (
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

            {/* PDF Buttons */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button
                variant="outlined"
                href={content.pdfUrl}
                target="_blank"
                sx={{
                  borderColor: '#404040',
                  color: '#fff',
                  '&:hover': { borderColor: '#505050', bgcolor: '#1a1a1a' },
                }}
              >
                📄 Buka PDF
              </Button>
            </Box>

            {/* Date */}
            <Typography variant="caption" sx={{ color: '#808080', display: 'block' }}>
              {new Date(content.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          </CardContent>
        </Card>

        {/* Menu for Edit/Delete */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{
            sx: {
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              '& .MuiMenuItem-root:hover': {
                backgroundColor: '#333333',
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleOpenEdit();
            }}
          >
            <ListItemIcon>
              <Edit sx={{ color: '#5599ff' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleDelete();
            }}
          >
            <ListItemIcon>
              <Delete sx={{ color: '#ff5555' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Hapus</ListItemText>
          </MenuItem>
        </Menu>

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
              <Typography variant="h6">Edit Buku</Typography>
              <IconButton onClick={() => setEditDialogOpen(false)} size="small" sx={{ color: '#b0b0b0' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Judul Buku"
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
              label="Deskripsi"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              margin="normal"
              multiline
              rows={4}
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
      </>
    );
  }

  // Render Image
  if (content.contentType === 'image') {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const imageItems = content.images || [];
    
    // Swipe gesture states
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const imageRef = useRef<HTMLDivElement>(null);

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
      const minSwipeDistance = 50;

      if (Math.abs(swipeDistance) > minSwipeDistance) {
        if (swipeDistance > 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      }

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
      <>
        <Card sx={{ backgroundColor: '#1e1e1e', color: '#ffffff' }}>
          <CardContent>
            {/* Header with Chip and Menu */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
              <Chip
                icon={<ImageIcon />}
                label="Gambar"
                size="small"
                sx={{ backgroundColor: '#333333', color: '#ffffff' }}
              />
              {isOwnContent && (
                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  size="small"
                  sx={{ color: '#b0b0b0', '&:hover': { backgroundColor: '#333333' } }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* Title */}
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#ffffff' }}>
              {content.title}
            </Typography>

            {/* Caption */}
            {content.caption && (
              <>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#b0b0b0', 
                    mb: hasMoreCaption ? 1 : 2,
                    whiteSpace: 'pre-wrap',
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
                  touchAction: 'pan-y pinch-zoom',
                }}
              >
                <Box
                  component="img"
                  src={imageItems[currentImageIndex]?.imageUrl}
                  alt={`${content.title}-${currentImageIndex}`}
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
                      ‹
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
                      ›
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
                <Typography variant="body2" sx={{ color: '#808080' }}>
                  Tidak ada gambar
                </Typography>
              </Box>
            )}

            {/* Date */}
            <Typography variant="caption" sx={{ color: '#808080', display: 'block' }}>
              {new Date(content.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          </CardContent>
        </Card>

        {/* Menu for Edit/Delete */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          PaperProps={{
            sx: {
              backgroundColor: '#2a2a2a',
              color: '#ffffff',
              '& .MuiMenuItem-root:hover': {
                backgroundColor: '#333333',
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleOpenEdit();
            }}
          >
            <ListItemIcon>
              <Edit sx={{ color: '#5599ff' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null);
              handleDelete();
            }}
          >
            <ListItemIcon>
              <Delete sx={{ color: '#ff5555' }} fontSize="small" />
            </ListItemIcon>
            <ListItemText>Hapus</ListItemText>
          </MenuItem>
        </Menu>

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
      </>
    );
  }

  return null;
}

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
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
  });

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    // Set client-side data
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    setToken(localStorage.getItem('token'));
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${userId}`);
      setUser(response.data.user);
      
      // Merge all content types with contentType tag
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
      setError('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!token) {
      setError('Silakan login terlebih dahulu');
      return;
    }

    try {
      const response = await axios.put(
        `/api/users/${userId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data.user);
      setIsEditing(false);
      setError('');

      // Update localStorage
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

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      setError('');

      const response = await axios.post(
        `/api/users/${userId}/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUser(response.data.user);
      
      // Update localStorage
      const updatedUser = { ...currentUser, avatar: response.data.user.avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.response?.data?.error || 'Gagal mengunggah foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!token || !user?.avatar) return;

    if (!confirm('Apakah Anda yakin ingin menghapus foto profil?')) return;

    try {
      setUploadingAvatar(true);
      setError('');

      const response = await axios.delete(
        `/api/users/${userId}/avatar`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(response.data.user);
      
      // Update localStorage
      const updatedUser = { ...currentUser, avatar: null };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      console.error('Error deleting avatar:', err);
      setError(err.response?.data?.error || 'Gagal menghapus foto profil');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    setAllContent(allContent.filter(c => c.id !== contentId));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Pengguna tidak ditemukan</Alert>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Profile Header Section */}
      <Paper sx={{ 
        p: { xs: 1.5, sm: 3, md: 4 }, 
        bgcolor: '#1e1e1e', 
        mb: 3,
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {/* Profile Layout: Avatar Left, Info Table Right */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'row', sm: 'row' },
          gap: { xs: 1.5, sm: 3, md: 4 },
          mb: { xs: 2, sm: 3 },
          alignItems: 'flex-start',
          width: '100%',
        }}>
          {/* Left: Avatar */}
          <Box sx={{ 
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 0.5, sm: 1 },
          }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.avatar ? user.avatar : undefined}
                sx={{
                  width: { xs: 70, sm: 100, md: 120 },
                  height: { xs: 70, sm: 100, md: 120 },
                  fontSize: { xs: 28, sm: 40, md: 48 },
                  bgcolor: '#404040',
                  border: { xs: '2px solid #333333', sm: '3px solid #333333' },
                }}
              >
                {!user.avatar && user.fullName.charAt(0).toUpperCase()}
              </Avatar>
              
              {uploadingAvatar && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>

            {isOwnProfile && (
              <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                <IconButton
                  component="label"
                  disabled={uploadingAvatar}
                  size="small"
                  sx={{
                    bgcolor: '#404040',
                    color: '#ffffff',
                    width: { xs: 28, sm: 36 },
                    height: { xs: 28, sm: 36 },
                    p: 0,
                    '&:hover': { bgcolor: '#505050' },
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    },
                  }}
                >
                  <PhotoCamera fontSize="small" />
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleAvatarUpload}
                  />
                </IconButton>

                {user.avatar && (
                  <IconButton
                    onClick={handleDeleteAvatar}
                    disabled={uploadingAvatar}
                    size="small"
                    sx={{
                      bgcolor: '#404040',
                      color: '#ffffff',
                      width: { xs: 28, sm: 36 },
                      height: { xs: 28, sm: 36 },
                      p: 0,
                      '&:hover': { bgcolor: '#505050' },
                      '& .MuiSvgIcon-root': {
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            )}
          </Box>

          {/* Right: User Info Table */}
          <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {!isEditing ? (
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  tableLayout: 'fixed',
                  '& td': {
                    padding: { xs: '6px 2px', sm: '10px 8px' },
                    borderBottom: '1px solid #333333',
                    fontSize: { xs: '0.7rem', sm: '0.875rem', md: '1rem' },
                    wordBreak: 'break-word',
                    overflow: 'hidden',
                  },
                  '& tr:last-child td': {
                    borderBottom: 'none',
                  },
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ color: '#b0b0b0', width: '35%', fontWeight: 500 }}>Nama</td>
                    <td style={{ color: '#ffffff', fontWeight: 'bold', width: '65%' }}>
                      <Box sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {user.fullName}
                      </Box>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#b0b0b0', fontWeight: 500 }}>Username</td>
                    <td style={{ color: '#ffffff' }}>
                      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        @{user.username}
                      </Box>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ color: '#b0b0b0', fontWeight: 500 }}>Email</td>
                    <td style={{ color: '#ffffff' }}>
                      <Box sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {user.email}
                      </Box>
                    </td>
                  </tr>
                  {user.bio && (
                    <tr>
                      <td style={{ color: '#b0b0b0', fontWeight: 500, verticalAlign: 'top' }}>Bio</td>
                      <td style={{ 
                        color: '#ffffff', 
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}>
                        {user.bio}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td style={{ color: '#b0b0b0', fontWeight: 500 }}>Konten</td>
                    <td style={{ color: '#ffffff' }}>{allContent.length} item</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#b0b0b0', fontWeight: 500, verticalAlign: 'top' }}>Bergabung</td>
                    <td style={{ color: '#ffffff', wordBreak: 'break-word' }}>
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                </tbody>
              </Box>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="Nama Lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  size="small"
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                  }}
                  InputLabelProps={{ 
                    style: { color: '#b0b0b0', fontSize: '0.875rem' } 
                  }}
                  InputProps={{
                    style: { color: '#fff', backgroundColor: '#2a2a2a' },
                  }}
                />
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  size="small"
                  sx={{ 
                    mb: 2,
                    '& .MuiInputBase-input': {
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    },
                  }}
                  InputLabelProps={{ 
                    style: { color: '#b0b0b0', fontSize: '0.875rem' } 
                  }}
                  InputProps={{
                    style: { color: '#fff', backgroundColor: '#2a2a2a' },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Edit Profile Button/Actions */}
        {isOwnProfile && (
          <Box sx={{ mt: { xs: 1.5, sm: 2 }, width: '100%' }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit fontSize="small" />}
                onClick={() => setIsEditing(true)}
                fullWidth
                sx={{
                  borderColor: '#404040',
                  color: '#fff',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  py: { xs: 0.75, sm: 1 },
                  '&:hover': { borderColor: '#505050', bgcolor: '#1a1a1a' },
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0.5, sm: 1 },
                  },
                }}
              >
                Edit Profil
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
                <Button
                  variant="contained"
                  onClick={handleUpdateProfile}
                  sx={{
                    flex: 1,
                    bgcolor: '#fff',
                    color: '#000',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 0.75, sm: 1 },
                    '&:hover': { bgcolor: '#e0e0e0' },
                  }}
                >
                  Simpan
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      fullName: user.fullName,
                      bio: user.bio || '',
                    });
                  }}
                  sx={{
                    flex: 1,
                    borderColor: '#404040',
                    color: '#fff',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    py: { xs: 0.75, sm: 1 },
                    '&:hover': { borderColor: '#505050', bgcolor: '#1a1a1a' },
                  }}
                >
                  Batal
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Artworks Grid Section */}
      <Paper sx={{ 
        p: { xs: 1.5, sm: 3, md: 4 }, 
        bgcolor: '#1e1e1e',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        {/* Content Section Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 1, sm: 0 },
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#fff',
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Konten ({allContent.length})
          </Typography>
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<Add fontSize="small" />}
              onClick={() => setShowCreatePost(!showCreatePost)}
              sx={{
                bgcolor: '#fff',
                color: '#000',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                py: { xs: 0.5, sm: 0.75 },
                px: { xs: 1.5, sm: 2 },
                minWidth: { xs: 'auto', sm: 'auto' },
                '&:hover': { bgcolor: '#e0e0e0' },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0.5, sm: 1 },
                },
              }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                {showCreatePost ? 'Tutup' : 'Buat Konten'}
              </Box>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                {showCreatePost ? 'Tutup' : 'Buat'}
              </Box>
            </Button>
          )}
        </Box>

        {/* Create Content Form */}
        {isOwnProfile && showCreatePost && (
          <Box sx={{ mb: 3 }}>
            <UnifiedUploadForm 
              onUploadSuccess={() => {
                setShowCreatePost(false);
                fetchUserProfile();
              }} 
            />
          </Box>
        )}

        <Divider sx={{ borderColor: '#333333', my: 3 }} />
        
        {allContent.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#b0b0b0', textAlign: 'center', py: 4 }}>
            Belum ada konten
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {allContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                isOwnContent={isOwnProfile}
                onDelete={() => handleDeleteContent(content.id)}
                onRefresh={fetchUserProfile}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
}
