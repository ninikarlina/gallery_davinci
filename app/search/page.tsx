'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, User, FileText, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const [query, setQuery] = useState(q);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(q);
    if (q && q.trim()) {
      doSearch(q);
    } else {
      setUsers([]);
      setPosts([]);
    }
  }, [q]);

  const doSearch = async (term: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/search?q=${encodeURIComponent(term)}`);
      setUsers(res.data.users || []);
      setPosts(res.data.posts || []);
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      <main className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-8 sm:pt-12">
        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="mb-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/40 group-focus-within:text-white transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Cari username atau judul karya..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(0,0,0,0.4)]"
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
              </div>
            )}
          </div>
        </form>

        {!loading && query && users.length === 0 && posts.length === 0 && (
          <div className="text-center py-20 bg-[#0a0a0a]/40 backdrop-blur-[64px] border border-white/5 rounded-3xl">
            <Search className="w-10 h-10 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white/80 mb-2 tracking-wide">Pencarian Tidak Ditemukan</h3>
            <p className="text-sm text-white/40 font-medium">Coba gunakan kata kunci lain.</p>
          </div>
        )}

        {/* Users Results */}
        {users.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm font-bold tracking-wider uppercase text-white/40 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Pengguna
            </h2>
            <div className="space-y-3">
              {users.map((u) => (
                <div 
                  key={u.id}
                  onClick={() => router.push(`/profile/${u.id}`)}
                  className="group flex items-center gap-4 p-4 bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#1e1e1e] border border-white/10 shrink-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-sm font-bold text-white/50">
                        {(u.fullName || u.username)?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-white/90 group-hover:text-white">{u.fullName || u.username}</h3>
                    <p className="text-sm text-white/40">@{u.username}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Results */}
        {posts.length > 0 && (
          <div>
            <h2 className="text-sm font-bold tracking-wider uppercase text-white/40 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Karya
            </h2>
            <div className="space-y-3">
              {posts.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => router.push(`/posts/${p.id}`)}
                  className="group p-5 bg-[#0a0a0a]/40 backdrop-blur-xl border border-white/5 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-base font-bold text-white/90 group-hover:text-white mb-1 line-clamp-1">{p.title}</h3>
                      <p className="text-sm text-white/40">oleh {p.author?.fullName || p.author?.username}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
