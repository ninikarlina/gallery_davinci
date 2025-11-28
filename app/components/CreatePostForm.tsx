'use client';

import { useState, useRef, ChangeEvent } from 'react';
import axios from 'axios';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'puisi',
    image: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Silakan login terlebih dahulu');
        return;
      }

      await axios.post('/api/posts', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFormData({ title: '', content: '', type: 'puisi', image: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      onPostCreated?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal membuat post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Buat Karya Sastra Baru</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Judul</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Judul karya sastra"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Jenis</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <option value="puisi">Puisi</option>
              <option value="pantun">Pantun</option>
              <option value="cerpen">Cerpen</option>
              <option value="artikel">Artikel</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Konten</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Tulis karya sastramu di sini..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Gambar (Opsional)</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          {formData.image && (
            <img src={formData.image} alt="preview" className="mt-2 h-40 object-cover rounded" />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Memposting...' : 'Posting'}
        </button>
      </form>
    </div>
  );
}
