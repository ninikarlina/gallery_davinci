'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Container,
  Box,
  Typography,
  List,
  ListItemButton,
  Avatar,
  ListItemAvatar,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, display: 'flex', gap: 1, alignItems: 'center' }} component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          placeholder="Cari username atau judul feed..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          inputProps={{ 'aria-label': 'search' }}
          sx={{ 
            '& .MuiOutlinedInput-root': { 
              color: 'white',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            } 
          }}
        />
        <IconButton type="submit" aria-label="search">
          <SearchIcon sx={{ color: 'white' }} />
        </IconButton>
      </Paper>

      <Box>
        <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Pengguna</Typography>
        <List disablePadding sx={{ mb: 2 }}>
          {users.length === 0 && <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tidak ada pengguna ditemukan</Typography>}
          {users.map((u) => (
            <ListItemButton
              key={u.id}
              onClick={() => router.push(`/profile/${u.id}`)}
              sx={{ bgcolor: '#121212', mb: 1, borderRadius: 1 }}
            >
              <ListItemAvatar>
                <Avatar src={u.avatar || undefined} sx={{ bgcolor: '#404040', width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}>{!u.avatar && (u.fullName || u.username)?.charAt(0)?.toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={u.fullName || u.username} 
                secondary={`@${u.username}`}
                primaryTypographyProps={{ sx: { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
                secondaryTypographyProps={{ sx: { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
              />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ my: 2, bgcolor: 'rgba(255,255,255,0.08)' }} />

        <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>Feed</Typography>
        <List disablePadding>
          {posts.length === 0 && <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tidak ada feed ditemukan</Typography>}
          {posts.map((p) => (
            <ListItemButton
              key={p.id}
              onClick={() => router.push(`/posts/${p.id}`)}
              sx={{ bgcolor: '#121212', mb: 1, borderRadius: 1 }}
            >
              <ListItemText 
                primary={p.title} 
                secondary={p.author?.fullName || p.author?.username}
                primaryTypographyProps={{ sx: { fontSize: { xs: '0.9rem', sm: '1rem' } } }}
                secondaryTypographyProps={{ sx: { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </Container>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="md" sx={{ py: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    }>
      <SearchContent />
    </Suspense>
  );
}
