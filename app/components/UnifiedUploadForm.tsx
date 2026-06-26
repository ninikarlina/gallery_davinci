'use client';

import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Book, 
  Image as ImageIcon, 
  UploadCloud, 
  X, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';

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

  const handleContentTypeChange = (newType: 'post' | 'book' | 'image') => {
    setContentType(newType);
    setTitle('');
    setContent('');
    setFile(null);
    setFiles([]);
    setPreviews([]);
    setError('');
    setSuccess('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      if (contentType === 'book') {
        const selectedFile = e.target.files[0];
        if (selectedFile.type !== 'application/pdf') {
          setError('Hanya file PDF yang diperbolehkan untuk buku');
          return;
        }
        setFile(selectedFile);
        setError('');
      } else if (contentType === 'image') {
        const selectedFiles = Array.from(e.target.files);
        const MAX_FILES = 15;
        
        const combinedFiles = [...files, ...selectedFiles];
        
        if (combinedFiles.length > MAX_FILES) {
          setError(`Maksimal ${MAX_FILES} foto. Anda sudah punya ${files.length} foto, hanya bisa tambah ${MAX_FILES - files.length} lagi.`);
          return;
        }
        
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
        await axios.post(
          '/api/posts',
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Puisi berhasil dibagikan!');
      } else if (contentType === 'book') {
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

      setTitle('');
      setContent('');
      setFile(null);
      setFiles([]);
      setPreviews([]);
      onUploadSuccess();
      
      // Auto clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const getTypeStyles = () => {
    switch (contentType) {
      case 'book': return {
        activeTab: 'bg-amber-500/20 border-amber-500/50 text-amber-400',
        activeIcon: 'text-amber-400',
        ring: 'focus:ring-amber-500/30',
        btn: 'bg-gradient-to-b from-amber-500/80 to-amber-600/80 hover:from-amber-400 hover:to-amber-500 border-amber-400/50 text-white shadow-lg',
        borderFocus: 'focus:border-amber-500/50',
      };
      case 'image': return {
        activeTab: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
        activeIcon: 'text-purple-400',
        ring: 'focus:ring-purple-500/30',
        btn: 'bg-gradient-to-b from-purple-500/80 to-purple-600/80 hover:from-purple-400 hover:to-purple-500 border-purple-400/50 text-white shadow-lg',
        borderFocus: 'focus:border-purple-500/50',
      };
      default: return {
        activeTab: 'bg-white/10 border-white/20 text-white',
        activeIcon: 'text-white',
        ring: 'focus:ring-white/20',
        btn: 'bg-white/10 hover:bg-white/20 border-white/20 text-white hover:text-white shadow-lg',
        borderFocus: 'focus:border-white/30',
      };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="w-full relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg overflow-hidden mb-12">
      <div className={`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 ${contentType === 'book' ? 'bg-amber-500' : contentType === 'image' ? 'bg-purple-500' : 'bg-white'}`} />
      
      {/* Tabs */}
      <div className="relative z-10 flex p-2 gap-2 bg-black/40 border-b border-white/5">
        {[
          { id: 'post', label: 'Puisi / Karya', icon: FileText },
          { id: 'book', label: 'Buku PDF', icon: Book },
          { id: 'image', label: 'Galeri Gambar', icon: ImageIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleContentTypeChange(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all duration-300 ${
              contentType === tab.id 
                ? styles.activeTab
                : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${contentType === tab.id ? styles.activeIcon : 'text-white/30'}`} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Alerts */}
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold tracking-wide shadow-inner"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold tracking-wide shadow-inner"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">
              Judul Karya
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Masukkan judul di sini..."
              className={`w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:ring-1 shadow-inner transition-all ${styles.borderFocus} ${styles.ring}`}
            />
          </div>

          {/* Content / Description Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">
              {contentType === 'post' ? 'Isi Puisi / Karya Tulis' : contentType === 'book' ? 'Deskripsi Buku' : 'Caption Gambar'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required={contentType === 'post'}
              rows={contentType === 'post' ? 8 : 4}
              placeholder={contentType === 'post' ? "Tuliskan keindahan sastra Anda..." : "Tambahkan deskripsi singkat..."}
              className={`w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:ring-1 shadow-inner transition-all custom-scrollbar resize-none ${styles.borderFocus} ${styles.ring}`}
            />
          </div>

          {/* File Upload Zone */}
          {(contentType === 'book' || contentType === 'image') && (
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">
                File Unggahan
              </label>
              
              <div className="relative group">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept={contentType === 'book' ? 'application/pdf' : 'image/*'}
                  multiple={contentType === 'image'}
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full min-h-[120px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 bg-black/40 hover:bg-white/5 
                  ${contentType === 'book' ? 'border-amber-500/20 hover:border-amber-500/50' : 'border-purple-500/20 hover:border-purple-500/50'}`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud className={`w-8 h-8 mb-3 opacity-50 group-hover:opacity-100 transition-opacity ${contentType === 'book' ? 'text-amber-400' : 'text-purple-400'}`} />
                    <p className="text-sm font-bold text-white/70 mb-1">
                      {contentType === 'book' 
                        ? (file ? file.name : 'Klik untuk memilih file PDF')
                        : (files.length > 0 ? `${files.length} gambar dipilih` : 'Klik untuk memilih Gambar')}
                    </p>
                    <p className="text-sm text-white/30 font-medium tracking-wide">
                      {contentType === 'book' ? 'Maksimal ukuran file 10MB' : 'Bisa pilih banyak gambar sekaligus (Maks 15)'}
                    </p>
                  </div>
                </label>
              </div>

              {/* PDF Preview Meta */}
              {contentType === 'book' && file && (
                <div className="flex items-center gap-2 pl-2">
                  <Book className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold tracking-widest text-amber-400/80 uppercase">
                    Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              {/* Image Previews */}
              {contentType === 'image' && previews.length > 0 && (
                <div className="mt-4 bg-black/40 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-white/50 tracking-widest uppercase">
                      Galeri ({previews.length}/15)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    <AnimatePresence>
                      {previews.map((preview, index) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          key={index}
                          className="relative aspect-square rounded-xl overflow-hidden group/preview border border-white/10 shadow-lg"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); removeFile(index); }}
                              className="w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110 shadow-xl"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-xs font-bold text-white">
                            {index + 1}
                          </div>
                        </motion.div>
                      ))}
                      {previews.length < 15 && (
                        <motion.label
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          htmlFor="file-upload"
                          className="relative aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer flex flex-col items-center justify-center transition-all group/add"
                        >
                          <Plus className="w-6 h-6 text-white/30 group-hover/add:text-purple-400 transition-colors mb-1" />
                          <span className="text-xs font-bold tracking-widest text-white/30 group-hover/add:text-purple-400 uppercase">Tambah</span>
                        </motion.label>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/5">
            <button
              type="submit"
              disabled={loading}
              className={`w-full relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 border ${styles.btn}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="">Memproses...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span className="">
                    Bagikan {contentType === 'post' ? 'Puisi' : contentType === 'book' ? 'Buku PDF' : 'Karya Gambar'}
                  </span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
