'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Article as ArticleIcon,
  Book as BookIcon,
  Image as ImageIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface UnifiedUploadFormProps {
  onUploadSuccess: () => void;
}

export default function UnifiedUploadForm({ onUploadSuccess }: UnifiedUploadFormProps) {
  const [contentType, setContentType] = useState<'post' | 'book' | 'image'>('post');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleContentTypeChange = (_event: React.MouseEvent<HTMLElement>, newType: 'post' | 'book' | 'image' | null) => {
    if (newType !== null) {
      setContentType(newType);
      setTitle('');
      setContent('');
      setFile(null);
      setFiles([]);
      setPreviews([]);
      setError('');
      setSuccess('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (contentType === 'book') {
        // Book: single PDF file
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== 'application/pdf') {
          setError('Hanya file PDF yang diperbolehkan untuk buku');
          return;
        }
        setFile(selectedFile);
        setError('');
      } else if (contentType === 'image') {
        // Image: multiple files
        const selectedFiles = Array.from(e.target.files);
        const MAX_FILES = 15;
        
        // Combine with existing files
        const combinedFiles = [...files, ...selectedFiles];
        
        if (combinedFiles.length > MAX_FILES) {
          setError(`Maksimal ${MAX_FILES} foto. Anda sudah punya ${files.length} foto, hanya bisa tambah ${MAX_FILES - files.length} lagi.`);
          return;
        }
        
        // Validate all files
        for (const file of selectedFiles) {
          if (!file.type.startsWith('image/')) {
            setError('Hanya file gambar yang diperbolehkan');
            return;
          }
          if (file.size > 5 * 1024 * 1024) {
            setError(`File ${file.name} terlalu besar. Maksimal 5MB per file`);
            return;
          }
        }
        
        // Create previews
        const newPreviews: string[] = [];
        let loadedCount = 0;
        
        selectedFiles.forEach((file, index) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newPreviews[index] = reader.result as string;
            loadedCount++;
            
            if (loadedCount === selectedFiles.length) {
              setPreviews(prev => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        });
        
        setFiles(combinedFiles);
        setError('');
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Anda harus login terlebih dahulu');
      return;
    }

    try {
      setLoading(true);

      if (contentType === 'post') {
        // Upload post/puisi
        await axios.post(
          '/api/posts',
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Puisi berhasil dibagikan!');
      } else if (contentType === 'book') {
        // Upload book (single PDF)
        if (!file) {
          setError('Pilih file PDF terlebih dahulu');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('description', content);

        await axios.post('/api/books', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Buku berhasil diupload!');
      } else if (contentType === 'image') {
        // Upload images (multiple files)
        if (files.length === 0) {
          setError('Pilih minimal 1 foto terlebih dahulu');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', file);
        });
        formData.append('title', title);
        formData.append('description', content);

        await axios.post('/api/upload/images', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Gambar berhasil diupload!');
      }

      // Reset form
      setTitle('');
      setContent('');
      setFile(null);
      setFiles([]);
      setPreviews([]);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ 
      p: { xs: 2, sm: 3 }, 
      backgroundColor: '#1e1e1e', 
      borderRadius: 2,
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <ToggleButtonGroup
        value={contentType}
        exclusive
        onChange={handleContentTypeChange}
        fullWidth
        sx={{ 
          mb: 3,
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
        }}
      >
        <ToggleButton
          value="post"
          sx={{
            color: '#b0b0b0',
            borderColor: '#404040',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            flex: { xs: '1 1 100%', sm: '1 1 auto' },
            '&.Mui-selected': {
              backgroundColor: '#333333',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#404040' },
            },
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mr: { xs: 0.5, sm: 1 },
            },
          }}
        >
          <ArticleIcon /> 
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Puisi/Karya</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Puisi</Box>
        </ToggleButton>
        <ToggleButton
          value="book"
          sx={{
            color: '#b0b0b0',
            borderColor: '#404040',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            flex: { xs: '1 1 50%', sm: '1 1 auto' },
            '&.Mui-selected': {
              backgroundColor: '#333333',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#404040' },
            },
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mr: { xs: 0.5, sm: 1 },
            },
          }}
        >
          <BookIcon /> 
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Buku PDF</Box>
          <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Buku</Box>
        </ToggleButton>
        <ToggleButton
          value="image"
          sx={{
            color: '#b0b0b0',
            borderColor: '#404040',
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            px: { xs: 1, sm: 2 },
            py: { xs: 0.75, sm: 1 },
            flex: { xs: '1 1 50%', sm: '1 1 auto' },
            '&.Mui-selected': {
              backgroundColor: '#333333',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#404040' },
            },
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '1rem', sm: '1.25rem' },
              mr: { xs: 0.5, sm: 1 },
            },
          }}
        >
          <ImageIcon /> Gambar
        </ToggleButton>
      </ToggleButtonGroup>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Judul"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{
            mb: 2,
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
          label={
            contentType === 'post'
              ? 'Isi Puisi/Karya'
              : contentType === 'book'
              ? 'Deskripsi Buku'
              : 'Caption Gambar'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={contentType === 'post' ? 6 : 3}
          required={contentType === 'post'}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              color: '#ffffff',
              '& fieldset': { borderColor: '#404040' },
              '&:hover fieldset': { borderColor: '#b0b0b0' },
            },
            '& .MuiInputLabel-root': { color: '#b0b0b0' },
          }}
        />

        {(contentType === 'book' || contentType === 'image') && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={{
                borderColor: '#404040',
                color: '#ffffff',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.75, sm: 1 },
                textAlign: 'left',
                justifyContent: 'flex-start',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                '&:hover': { borderColor: '#ffffff', backgroundColor: '#333333' },
                '& .MuiButton-startIcon': {
                  mr: { xs: 0.5, sm: 1 },
                },
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block',
                  width: '100%',
                }}
              >
                {contentType === 'book'
                  ? (file ? file.name : 'Pilih PDF')
                  : (files.length > 0 ? `${files.length} foto dipilih` : 'Pilih Gambar')
                }
              </Box>
              <input
                type="file"
                hidden
                accept={contentType === 'book' ? 'application/pdf' : 'image/*'}
                multiple={contentType === 'image'}
                onChange={handleFileChange}
              />
            </Button>
            {file && contentType === 'book' && (
              <Typography variant="caption" sx={{ ml: 2, color: '#b0b0b0' }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            )}
            
            {/* Preview untuk multiple images */}
            {contentType === 'image' && previews.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ color: '#b0b0b0', mb: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Preview ({previews.length} foto)
                </Typography>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: 'repeat(auto-fill, minmax(70px, 1fr))',
                    sm: 'repeat(auto-fill, minmax(100px, 1fr))' 
                  }, 
                  gap: { xs: 0.5, sm: 1 },
                }}>
                  {previews.map((preview, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        borderRadius: 1,
                        overflow: 'hidden',
                        '&:hover .delete-btn': { opacity: 1 },
                      }}
                    >
                      <Box
                        component="img"
                        src={preview}
                        alt={`preview-${index}`}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <Button
                        className="delete-btn"
                        onClick={() => removeFile(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          minWidth: 'auto',
                          width: { xs: 20, sm: 24 },
                          height: { xs: 20, sm: 24 },
                          padding: 0,
                          borderRadius: '50%',
                          fontSize: { xs: '1rem', sm: '1.25rem' },
                          backgroundColor: 'rgba(220, 38, 38, 0.9)',
                          color: 'white',
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          '&:hover': { backgroundColor: 'rgba(185, 28, 28, 1)' },
                        }}
                      >
                        ×
                      </Button>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: { xs: 2, sm: 4 },
                          left: { xs: 2, sm: 4 },
                          backgroundColor: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                        }}
                      >
                        {index + 1}
                      </Box>
                    </Box>
                  ))}
                  
                  {/* Add More Button */}
                  {previews.length < 15 && (
                    <Box
                      component="label"
                      sx={{
                        position: 'relative',
                        paddingTop: '100%',
                        border: '2px dashed #404040',
                        borderRadius: 1,
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                        '&:hover': { borderColor: '#ffffff' },
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#b0b0b0',
                        }}
                      >
                        <Typography variant="h5" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>+</Typography>
                        <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}>Tambah</Typography>
                      </Box>
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                      />
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: '#808080', mt: 1, display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                  Total: {previews.length}/15 foto
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '1px solid #404040',
            '&:hover': { backgroundColor: '#333333' },
            '&:disabled': { backgroundColor: '#1a1a1a', color: '#666666' },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: '#ffffff' }} />
          ) : (
            `Bagikan ${contentType === 'post' ? 'Puisi' : contentType === 'book' ? 'Buku' : 'Gambar'}`
          )}
        </Button>
      </form>
    </Paper>
  );
}
