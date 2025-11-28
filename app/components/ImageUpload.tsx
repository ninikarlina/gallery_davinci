'use client';

import { useState, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import { FaImage } from 'react-icons/fa';

interface ImageUploadProps {
  onUploadSuccess?: () => void;
}

export default function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_FILES = 15;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // Combine with existing files
    const combinedFiles = [...files, ...selectedFiles];

    if (combinedFiles.length > MAX_FILES) {
      setError(`Maksimal ${MAX_FILES} foto yang dapat diupload. Anda sudah punya ${files.length} foto, hanya bisa tambah ${MAX_FILES - files.length} lagi.`);
      return;
    }

    // Validate all new files
    for (const file of selectedFiles) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Hanya file gambar (JPEG, PNG, GIF, WebP) yang diperbolehkan');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`File ${file.name} terlalu besar. Maksimal 5MB per file`);
        return;
      }
    }

    // Create previews for new files
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
    
    // Reset input value to allow selecting same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length === 0) return;

    // Create a mock event to reuse handleFileChange logic
    const mockEvent = {
      target: {
        files: droppedFiles,
      },
    } as any;

    handleFileChange(mockEvent);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Silakan pilih minimal 1 file gambar');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login terlebih dahulu');
        return;
      }

      const uploadFormData = new FormData();
      files.forEach((file) => {
        uploadFormData.append('files', file);
      });
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);

      await axios.post('/api/upload/images', uploadFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData({ title: '', description: '' });
      setFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal upload gambar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FaImage className="text-blue-600" /> Upload Gambar
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">Judul Gambar</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Masukkan judul gambar"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Deskripsi singkat gambar Anda"
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">
            File Gambar (Maksimal {MAX_FILES} foto)
          </label>
          <div 
            className={`border-2 border-dashed rounded-lg p-4 text-center transition ${
              isDragging 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-purple-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex flex-col items-center"
            >
              <svg
                className="w-12 h-12 text-gray-400 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="text-sm text-gray-600">
                Klik untuk pilih foto atau drag & drop
              </span>
              <span className="text-xs text-gray-500 mt-1">
                Bisa pilih banyak foto sekaligus (PNG, JPG, GIF, WebP - max 5MB/file)
              </span>
            </label>
          </div>
          {files.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              {files.length} file dipilih ({(files.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(2)} KB total)
            </p>
          )}
        </div>

        {previews.length > 0 && (
          <div>
            <p className="text-gray-700 font-medium mb-2">Preview ({previews.length} foto)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={preview} 
                    alt={`preview-${index}`} 
                    className="h-32 w-full object-cover rounded-lg" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                    title="Hapus foto"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
              
              {/* Add More Button */}
              {previews.length < MAX_FILES && (
                <div className="relative">
                  <label
                    htmlFor="file-upload-more"
                    className="h-32 w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition"
                  >
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-xs text-gray-500 mt-1">Tambah Foto</span>
                  </label>
                  <input
                    type="file"
                    id="file-upload-more"
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Klik tanda × untuk menghapus foto. Total: {previews.length}/{MAX_FILES} foto
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Mengupload...' : 'Upload Gambar'}
        </button>
      </form>
    </div>
  );
}
