'use client';

import { useEffect, useState } from 'react';
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
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Box
                  component="img"
                  src={imageItems[currentImageIndex]?.imageUrl}
                  alt={`${content.title}-${currentImageIndex}`}
                  sx={{
                    width: '100%',
                    maxHeight: 500,
                    objectFit: 'contain',
                    borderRadius: 2,
                    backgroundColor: '#000000',
                  }}
                />
                
                {/* Navigation Arrows */}
                {imageItems.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? imageItems.length - 1 : prev - 1))}
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
                      ‹
                    </IconButton>
                    <IconButton
                      onClick={() => setCurrentImageIndex((prev) => (prev === imageItems.length - 1 ? 0 : prev + 1))}
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
                      ›
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
                      {currentImageIndex + 1} / {imageItems.length}
                    </Box>
                  </>
                )}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#808080', mb: 2 }}>
                Tidak ada gambar
              </Typography>
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
    setCurrentUser(JSON.parse(localStorage.getItem('user') || '{}'));
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Profile Header Section */}
      <Paper sx={{ p: 4, bgcolor: '#1e1e1e', mb: 3 }}>
        {/* Avatar Section */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={user.avatar ? user.avatar : undefined}
              sx={{
                width: 120,
                height: 120,
                fontSize: 48,
                bgcolor: '#404040',
                mb: 2,
              }}
            >
              {!user.avatar && user.fullName.charAt(0).toUpperCase()}
            </Avatar>
            
            {isOwnProfile && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                <IconButton
                  component="label"
                  disabled={uploadingAvatar}
                  sx={{
                    bgcolor: '#404040',
                    '&:hover': { bgcolor: '#505050' },
                  }}
                >
                  <PhotoCamera />
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
                    sx={{
                      bgcolor: '#404040',
                      '&:hover': { bgcolor: '#505050' },
                    }}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            )}

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

          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
            {user.fullName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#b0b0b0' }}>
            @{user.username}
          </Typography>
        </Box>

        {/* Edit Profile Section */}
        {isOwnProfile && (
          <Box sx={{ mb: 4 }}>
            {!isEditing ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                fullWidth
                sx={{
                  borderColor: '#404040',
                  color: '#fff',
                  '&:hover': { borderColor: '#505050', bgcolor: '#1a1a1a' },
                }}
              >
                Edit Profil
              </Button>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="Nama Lengkap"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  sx={{ mb: 2 }}
                  InputLabelProps={{ style: { color: '#b0b0b0' } }}
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
                  sx={{ mb: 2 }}
                  InputLabelProps={{ style: { color: '#b0b0b0' } }}
                  InputProps={{
                    style: { color: '#fff', backgroundColor: '#2a2a2a' },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleUpdateProfile}
                    sx={{
                      flex: 1,
                      bgcolor: '#fff',
                      color: '#000',
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
                      '&:hover': { borderColor: '#505050', bgcolor: '#1a1a1a' },
                    }}
                  >
                    Batal
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Bio */}
        {!isEditing && user.bio && (
          <Box sx={{ mb: 0 }}>
            <Typography variant="body1" sx={{ color: '#fff', whiteSpace: 'pre-wrap' }}>
              {user.bio}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Artworks Grid Section */}
      <Paper sx={{ p: 4, bgcolor: '#1e1e1e' }}>
        {/* Content Section Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#fff' }}>
            Konten ({allContent.length})
          </Typography>
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowCreatePost(!showCreatePost)}
              sx={{
                bgcolor: '#fff',
                color: '#000',
                '&:hover': { bgcolor: '#e0e0e0' },
              }}
            >
              {showCreatePost ? 'Tutup' : 'Buat Konten'}
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
