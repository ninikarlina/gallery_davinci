'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FaHeart } from 'react-icons/fa';

export default function GalleryPage() {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchImages();
  }, [page, router, token]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/upload/images?page=${page}`);
      setImages(response.data.images);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (imageId: string) => {
    try {
      await axios.post(
        `/api/upload/images/${imageId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchImages();
    } catch (error) {
      console.error('Error liking image:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Galeri Gambar</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-600">Memuat galeri...</div>
        ) : images.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {images.map((image) => (
                <div
                  key={image._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="relative overflow-hidden bg-gray-200 h-48">
                    <img
                      src={image.filePath}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                      {image.title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2">
                      oleh <span className="font-semibold">{image.uploader.username}</span>
                    </p>

                    {image.description && (
                      <p className="text-gray-700 text-xs mb-3 line-clamp-2">
                        {image.description}
                      </p>
                    )}

                    <button
                      onClick={() => handleLike(image._id)}
                      className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded transition font-semibold"
                    >
                      <FaHeart /> {image.likes.length}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                ← Sebelumnya
              </button>
              <span className="px-4 py-2 text-gray-700 font-semibold">Halaman {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Selanjutnya →
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            Galeri masih kosong. Jadilah yang pertama upload gambar!
          </div>
        )}
      </main>
    </div>
  );
}
