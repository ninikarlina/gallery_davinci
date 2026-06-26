'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Kinetic Lighting Setup
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      window.location.href = '/feed';
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.status === 401) {
        setError('Email atau password salah. Silakan coba lagi.');
      } else if (err.response?.status === 500) {
        setError('Terjadi kesalahan server. Silakan coba lagi nanti.');
      } else {
        setError('Login gagal. Periksa koneksi internet Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Ambient glowing orb behind the glass */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-md group"
      >
        {/* Kinetic Lighting Specular Mask (Main Panel) */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-20"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${mouseX}px ${mouseY}px,
                rgba(255,255,255,0.15),
                transparent 40%
              )
            `,
          }}
        />

        {/* Spatial Glass Canvas */}
        <div className="relative rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg p-10 overflow-hidden z-10">

          <div className="relative z-30">
            {/* Header */}
            <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 mb-2">
              Gallery Davinci
            </h2>
            <p className="text-white/40 mb-10 text-sm font-bold tracking-widest">
              M A S U K &nbsp; A K U N
            </p>

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md shadow-inner">
                <p className="text-sm text-red-400 font-medium tracking-wide">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-2">
                  Email
                </label>
                <div className="relative group/input">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan email"
                    className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-black/40 transition-all shadow-inner font-medium tracking-wide"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider ml-2">
                  Password
                </label>
                <div className="relative group/input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Masukkan password"
                    className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-4 pr-12 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-black/40 transition-all shadow-inner font-medium tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Machined Titanium Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group/btn relative w-full overflow-hidden bg-gradient-to-b from-white/15 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 border-b-black/50 text-white font-medium py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {/* Button Micro-Sheen Hover Effect */}
                  <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white/90" />
                  ) : (
                    <>
                      <span className="tracking-widest text-sm font-bold">MASUK</span>
                      <ArrowRight className="w-4 h-4 text-white/90 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Link */}
            <div className="mt-10 text-center">
              <p className="text-sm font-medium tracking-wide text-white/40">
                Belum punya akun?{' '}
                <a
                  href="/register"
                  className="text-white/80 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-full after:bg-white/30 after:transition-all hover:after:bg-white"
                >
                  Daftar di sini
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
