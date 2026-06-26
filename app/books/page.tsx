'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Book, Download, Heart, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    if (!storedToken) {
      router.push('/login');
      return;
    }
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [page, token]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/books?page=${page}`);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (bookId: string) => {
    try {
      await axios.post(
        `/api/books/${bookId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBooks();
    } catch (error) {
      console.error('Error liking book:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] relative pb-32">
      {/* Dynamic Background Noise */}
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-screen z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      
      {/* Global Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-4">
            <Book className="w-8 h-8 text-blue-400" />
            Perpustakaan Digital
          </h1>
          <p className="text-white/40 mt-3 max-w-2xl text-sm font-medium leading-relaxed">
            Jelajahi berbagai mahakarya sastra dan bacaan digital dalam format PDF. Unduh dan nikmati kumpulan buku dari para seniman.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <div 
                  key={book._id}
                  className="group bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-48 bg-gradient-to-br from-white/5 to-transparent border-b border-white/5 relative flex items-center justify-center p-6 group-hover:from-white/10 transition-colors cursor-pointer" onClick={() => router.push(`/books/${book._id}`)}>
                    {/* Inner abstract decorative element */}
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
                    <div className="relative text-center z-10">
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{book.title}</h3>
                      <p className="text-sm font-bold tracking-wide text-white/40 uppercase">
                        oleh {book.author.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-sm text-white/60 line-clamp-3 min-h-[60px] mb-4 leading-relaxed">
                      {book.description}
                    </p>

                    <div className="flex items-center justify-between py-4 border-t border-white/5 mb-4">
                      <div className="text-sm font-bold tracking-widest text-white/30 uppercase">
                        {book.downloads} Unduhan
                      </div>
                      <div className="text-sm font-bold tracking-widest text-white/30 uppercase">
                        {(book.fileSize / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLike(book._id)}
                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white/50 hover:text-white transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                      <a
                        href={book.filePath}
                        download
                        className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-black font-bold text-sm tracking-wider uppercase rounded-2xl hover:bg-gray-200 transition-colors shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
                      >
                        <Download className="w-4 h-4" /> Unduh
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-sm font-bold tracking-wider text-white/50 uppercase">
                Halaman {page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-32 bg-[#0a0a0a]/40 backdrop-blur-[64px] border border-white/5 rounded-3xl">
            <Book className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white/80 mb-2 tracking-wide">Belum ada buku</h3>
            <p className="text-sm text-white/40 font-medium">Jadilah yang pertama mengunggah buku di platform ini.</p>
          </div>
        )}
      </main>
    </div>
  );
}
