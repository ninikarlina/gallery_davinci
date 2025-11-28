'use client';

import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

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

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
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

    // Navigate to the specific content
    handleClose();
    if (notification.postId) {
      router.push(`/posts/${notification.postId}`);
    } else if (notification.bookId) {
      router.push(`/books/${notification.bookId}`);
    } else if (notification.imageId) {
      router.push(`/images/${notification.imageId}`);
    }
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari yang lalu`;
    return date.toLocaleDateString('id-ID');
  };

  if (!token) return null;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 480,
            bgcolor: '#1e1e1e',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>Notifikasi</Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={handleMarkAllRead}
              sx={{ color: '#90caf9', textTransform: 'none' }}
            >
              Tandai semua dibaca
            </Button>
          )}
        </Box>
        
        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">Tidak ada notifikasi</Typography>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                bgcolor: notification.isRead ? 'transparent' : 'rgba(144, 202, 249, 0.08)',
                py: 1.5,
                px: 2,
                '&:hover': {
                  bgcolor: notification.isRead
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(144, 202, 249, 0.15)',
                },
                borderLeft: notification.isRead ? 'none' : '3px solid #90caf9',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {notification.content}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getTimeAgo(notification.createdAt)}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
