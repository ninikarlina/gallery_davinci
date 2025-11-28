'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{
        backgroundColor: '#121212',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: '120px',
              fontWeight: 'bold',
              color: '#ffffff',
              mb: 2,
            }}
          >
            404
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: '#ffffff',
              mb: 2,
            }}
          >
            Halaman Tidak Ditemukan
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#b0b0b0',
              mb: 4,
            }}
          >
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </Typography>
          <Button
            component={Link}
            href="/feed"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{
              backgroundColor: '#000000',
              color: '#ffffff',
              border: '1px solid #404040',
              '&:hover': {
                backgroundColor: '#333333',
              },
            }}
          >
            Kembali ke Beranda
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
