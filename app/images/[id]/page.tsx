'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ImageCard from '@/app/components/ImageCard';

interface ImageData {
  id: string;
  title: string;
  caption?: string;
  imageUrl?: string;
  images?: Array<{
    id: string;
    imageUrl: string;
    order: number;
  }>;
  createdAt: string;
  author: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  likes: any[];
  comments: any[];
}

export default function ImageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchImage();
    }
  }, [params.id]);

  const fetchImage = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/upload/images/${params.id}`);
      setImageData(response.data);
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl">
          Gambar tidak ditemukan atau telah dihapus.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative pb-32">
      <div 
        className="fixed inset-0 opacity-[0.03] pointer-events-none mix-blend-screen z-0"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-6 sm:pt-10">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-wider uppercase">Kembali</span>
        </button>

        <div className="bg-[#0a0a0a]/80 backdrop-blur-[64px] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)]">
          <ImageCard 
            image={imageData} 
            onRefresh={fetchImage} 
            onDelete={() => router.push('/feed')} 
          />
        </div>
      </main>
    </div>
  );
}
