'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Home, LogOut, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMobileMenuOpen(false);
    window.location.href = '/feed';
  };

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-lg">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Gallery Davinci Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40">
              Gallery Davinci
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group/input flex items-center">
              <input
                type="text"
                placeholder="Cari username atau judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-full pl-5 pr-10 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-black/40 transition-all shadow-inner font-medium tracking-wide"
              />
              <button type="submit" className="absolute right-3 text-white/40 hover:text-white/80 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </form>

            <Link href="/feed" className="text-sm font-bold tracking-wider text-white/60 hover:text-white uppercase transition-colors flex items-center gap-2">
              <Home className="w-4 h-4" />
              Beranda
            </Link>

            {mounted && (
              user ? (
                <div className="flex items-center gap-4 ml-2 border-l border-white/10 pl-5 shadow-inner h-8">
                  <NotificationBell />
                  
                  <Link 
                    href={`/profile/${user.id}`} 
                    className="flex items-center gap-2.5 text-sm font-bold tracking-wider text-white/60 hover:text-white uppercase transition-colors group/profile"
                  >
                    <div className="w-7 h-7 rounded-full bg-black border border-white/20 shadow-inner overflow-hidden flex items-center justify-center relative group-hover/profile:border-white/50 transition-colors">
                      {user.avatar ? (
                        <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white/50" />
                      )}
                    </div>
                    <span className="">{user.username || user.fullName.split(' ')[0]}</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="group/btn relative overflow-hidden bg-gradient-to-b from-red-500/20 to-red-500/5 hover:from-red-500/30 hover:to-red-500/10 border border-red-500/30 border-b-black/50 text-red-100 font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-[0.96] text-xs uppercase tracking-wider"
                  >
                    <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-5 shadow-inner h-8">
                  <Link
                    href="/login"
                    className="text-xs font-bold tracking-wider text-white/60 hover:text-white uppercase transition-colors px-3 py-1.5"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="group/btn relative overflow-hidden bg-gradient-to-b from-white/15 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 border-b-black/50 text-white font-bold py-1.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-[0.96] text-xs uppercase tracking-wider"
                  >
                    <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                    <span className="">Daftar</span>
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-1">
            {mounted && user && <NotificationBell />}
            <button
              onClick={() => router.push('/search')}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white/60 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Spatial Glass) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-black/40 backdrop-blur-3xl border-b border-white/10 shadow-lg overflow-hidden"
          >

            <div className="px-4 py-6 space-y-4 relative z-10">
              <Link 
                href="/feed" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 text-sm font-bold tracking-wider text-white/70 hover:text-white uppercase p-3 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Home className="w-5 h-5" />
                Beranda
              </Link>
              
              {mounted && user && (
                <Link 
                  href={`/profile/${user.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 text-sm font-bold tracking-wider text-white/70 hover:text-white uppercase p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-black border border-white/20 shadow-inner overflow-hidden flex items-center justify-center relative">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-white/50" />
                    )}
                  </div>
                  {user.fullName}
                </Link>
              )}

              <div className="pt-4 border-t border-white/10 shadow-lg mt-4">
                {mounted && (
                  user ? (
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 text-sm font-bold tracking-wider text-red-400 hover:text-red-300 uppercase p-3 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Logout
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-center text-sm font-bold tracking-wider text-white/70 hover:text-white uppercase p-3 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group/btn relative overflow-hidden bg-gradient-to-b from-white/15 to-white/5 hover:from-white/20 border border-white/10 text-white p-3 rounded-xl font-bold tracking-wider uppercase text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
                      >
                         <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                        <span className="">Daftar</span>
                      </Link>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
