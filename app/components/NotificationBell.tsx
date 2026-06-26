'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trash2, CheckCheck } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  postId?: string;
  bookId?: string;
  imageId?: string;
  actorName: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
      const unread = response.data.notifications.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await axios.patch(
          `/api/notifications/${notification.id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    setIsOpen(false);
    if (notification.postId) router.push(`/posts/${notification.postId}`);
    else if (notification.bookId) router.push(`/books/${notification.bookId}`);
    else if (notification.imageId) router.push(`/images/${notification.imageId}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        '/api/notifications/read-all',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.filter(n => n.id !== notificationId));
      const unread = notifications.filter(n => n.id !== notificationId && !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
    return date.toLocaleDateString('id-ID');
  };

  if (!token) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/60 hover:text-white transition-colors drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] rounded-full hover:bg-white/5 active:scale-95"
      >
        <Bell className="w-4 h-4 md:w-5 md:h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 md:top-1 md:right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-red-600 text-xs font-bold text-white shadow-[0_2px_4px_rgba(239,68,68,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] border border-red-400">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-4 w-[320px] sm:w-[400px] max-h-[480px] flex flex-col bg-[#0a0a0a]/90 backdrop-blur-[64px] border border-white/10 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden z-50 origin-top-right"
          >
            {/* SVG Noise Texture */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            ></div>

            {/* Header */}
            <div className="relative z-10 px-5 py-4 flex items-center justify-between border-b border-white/10 shadow-[0_1px_0_rgba(0,0,0,0.5)] bg-gradient-to-b from-white/5 to-transparent">
              <h3 className="text-sm font-bold tracking-wider text-white/90 uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Notifikasi
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-[#90caf9] hover:text-[#b3d8f9] transition-colors uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] bg-[#90caf9]/10 hover:bg-[#90caf9]/20 px-2 py-1 rounded-md border border-[#90caf9]/20"
                >
                  <CheckCheck className="w-3 h-3" />
                  Tandai Dibaca
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium tracking-wide text-white/40 uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                    Tidak ada notifikasi
                  </p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`group relative flex items-start gap-3 p-4 cursor-pointer transition-all border-b border-white/5 last:border-b-0 ${
                        notification.isRead
                          ? 'hover:bg-white/5'
                          : 'bg-[#90caf9]/5 hover:bg-[#90caf9]/10'
                      }`}
                    >
                      {/* Unread indicator line */}
                      {!notification.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#90caf9] to-[#42a5f5] shadow-[0_0_8px_rgba(144,202,249,0.5)]"></div>
                      )}

                      <div className="flex-1 min-w-0 pr-8">
                        <p className={`text-sm sm:text-sm leading-relaxed mb-2 break-words drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] ${notification.isRead ? 'text-white/60' : 'text-white/90 font-medium'}`}>
                          {notification.content}
                        </p>
                        <p className="text-xs font-bold tracking-wider text-white/30 uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                        title="Hapus notifikasi"
                      >
                        <Trash2 className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
