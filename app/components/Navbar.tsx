'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  TextField,
} from '@mui/material';
import {
  Home as HomeIcon,
  Image as ImageIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Book as BookIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    handleMenuClose();
    router.push('/login');
  };

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  if (!mounted) {
    return null;
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: '#000000', borderBottom: '1px solid #333333' }}>
      <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Link href="/feed" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer'
              }}
            >
              <Image
                src="/logo.png"
                alt="Gallery Davinci Logo"
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
              <Typography
                variant="h5"
                component="div"
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#ffffff',
                  fontSize: { xs: '1.1rem', sm: '1.5rem' }
                }}
              >
                Gallery Davinci
              </Typography>
            </Box>
          </Link>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, alignItems: 'center' }}>
            <Box component="form" onSubmit={(e) => { e.preventDefault(); if (searchTerm.trim()) router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`); }} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Cari username atau judul feed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  backgroundColor: '#121212',
                  borderRadius: 1,
                  input: { color: 'white', fontSize: { xs: '0.875rem', sm: '1rem' } },
                  width: { xs: 200, sm: 280 },
                }}
                InputProps={{
                  endAdornment: (
                    <IconButton type="submit" sx={{ color: 'white' }}>
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
              />

              <Button
                component={Link}
                href="/feed"
                startIcon={<HomeIcon />}
                sx={{ color: '#ffffff', '&:hover': { color: '#b0b0b0' } }}
              >
                Beranda
              </Button>

            {user ? (
              <>
                <NotificationBell />
                <Button
                  component={Link}
                  href={`/profile/${user.id}`}
                  startIcon={
                    <Avatar
                      src={user.avatar || undefined}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        bgcolor: '#404040',
                      }}
                    >
                      {!user.avatar && user.fullName.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  sx={{ color: '#ffffff', '&:hover': { color: '#b0b0b0' } }}
                >
                  {user.fullName}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="contained"
                  endIcon={<LogoutIcon />}
                  sx={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: '1px solid #404040',
                    '&:hover': {
                      backgroundColor: '#333333',
                    },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href="/login"
                  variant="contained"
                  sx={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="outlined"
                  sx={{
                    borderColor: '#404040',
                    color: '#ffffff',
                    '&:hover': {
                      borderColor: '#ffffff',
                      backgroundColor: '#333333',
                    },
                  }}
                >
                  Daftar
                </Button>
              </>
            )}
            </Box>
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            {user && <NotificationBell />}
            <IconButton
              size="large"
              onClick={() => router.push('/search')}
              sx={{ color: '#ffffff' }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              size="large"
              onClick={handleMenuOpen}
              sx={{ color: '#ffffff' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              sx={{
                '& .MuiPaper-root': {
                  backgroundColor: '#1e1e1e',
                  border: '1px solid #333333',
                },
              }}
            >
              <MenuItem component={Link} href="/feed" onClick={handleMenuClose}>
                <HomeIcon sx={{ mr: 1 }} /> Beranda
              </MenuItem>
              {user ? [
                <MenuItem key="profile" component={Link} href={`/profile/${user.id}`} onClick={handleMenuClose}>
                  <Avatar
                    src={user.avatar || undefined}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: 12,
                      bgcolor: '#404040',
                      mr: 1,
                    }}
                  >
                    {!user.avatar && user.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                  {user.fullName}
                </MenuItem>,
                <MenuItem key="logout" onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              ] : [
                <MenuItem key="login" component={Link} href="/login" onClick={handleMenuClose}>
                  Login
                </MenuItem>,
                <MenuItem key="register" component={Link} href="/register" onClick={handleMenuClose}>
                  Daftar
                </MenuItem>
              ]}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }
