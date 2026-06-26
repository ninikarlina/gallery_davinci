'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, User, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        // If scroll down and past navbar height, hide it. Else show it.
        if (currentScrollY > lastScrollY && currentScrollY > 80) {
          setIsVisible(false);
          setIsMobileMenuOpen(false); // also close mobile menu if scrolling down
        } else {
          setIsVisible(true);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    <nav className={`sticky top-0 z-50 w-full bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-lg transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-3 group focus:outline-none">
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
                className="w-64 bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-full pl-5 pr-10 py-2 text-sm text-white placeholder-white/20 focus:outline-none transition-all shadow-inner font-medium tracking-wide"
              />
              <button type="submit" className="absolute right-3 text-white/40 hover:text-white/80 transition-colors focus:outline-none">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {mounted && (
              user ? (
                <div className="flex items-center gap-4 ml-2 border-l border-white/10 pl-5 shadow-inner h-8">
                  <NotificationBell />
                  
                  <Link 
                    href={`/profile/${user.id}`} 
                    className="flex items-center gap-2.5 text-sm font-bold tracking-wider text-white/60 hover:text-white uppercase transition-colors group/profile focus:outline-none"
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
                </div>
              ) : (
                <div className="flex items-center gap-3 ml-2 border-l border-white/10 pl-5 shadow-inner h-8">
                  <Link
                    href="/login"
                    className="text-xs font-bold tracking-wider text-white/60 hover:text-white uppercase transition-colors px-3 py-1.5 focus:outline-none"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="group/btn relative overflow-hidden bg-gradient-to-b from-white/15 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 border-b-black/50 text-white font-bold py-1.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg active:scale-[0.96] text-xs uppercase tracking-wider focus:outline-none"
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
              className="p-2 text-white/60 hover:text-white transition-colors focus:outline-none"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (mounted && user) {
                  router.push(`/profile/${user.id}`);
                } else {
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }
              }}
              className="p-2 text-white/60 hover:text-white transition-colors focus:outline-none"
            >
              {mounted && user ? (
                <div className="w-7 h-7 rounded-full bg-black border border-white/20 shadow-inner overflow-hidden flex items-center justify-center relative">
                  {user.avatar ? (
                    <Image src={user.avatar} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white/50" />
                  )}
                </div>
              ) : (
                isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Spatial Glass) */}
      <AnimatePresence>
        {isMobileMenuOpen && !user && mounted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 w-full bg-black/40 backdrop-blur-3xl border-b border-white/10 shadow-lg overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4 relative z-10">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
