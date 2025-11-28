# Sistem Notifikasi - Gallery Davinci

## Fitur
Sistem notifikasi real-time untuk memberitahu pengguna ketika:
- Seseorang menyukai (like) postingan/buku/gambar mereka
- Seseorang mengomentari postingan/buku/gambar mereka

## Komponen

### 1. Database Schema (`Notification` model)
- `id`: ID unik notifikasi
- `type`: Tipe notifikasi ('like' atau 'comment')
- `content`: Pesan notifikasi (contoh: "John menyukai postingan Anda")
- `isRead`: Status sudah dibaca atau belum
- `userId`: Penerima notifikasi
- `postId/bookId/imageId`: Referensi ke konten yang di-like/comment
- `actorId`: User yang melakukan aksi
- `actorName`: Nama user yang melakukan aksi
- `createdAt`: Waktu notifikasi dibuat

### 2. API Routes

#### GET /api/notifications
Mengambil semua notifikasi untuk user yang sedang login, diurutkan berdasarkan waktu terbaru.

#### PATCH /api/notifications/[id]/read
Menandai satu notifikasi sebagai sudah dibaca.

#### PATCH /api/notifications/read-all
Menandai semua notifikasi sebagai sudah dibaca.

### 3. Backend Integration

Notifikasi otomatis dibuat ketika:
- **Like**: User menyukai post/book/image orang lain (tidak membuat notifikasi jika like konten sendiri)
- **Comment**: User mengomentari post/book/image orang lain (tidak membuat notifikasi jika comment di konten sendiri)

Files yang dimodifikasi:
- `/api/posts/[id]/like/route.ts`
- `/api/books/[id]/like/route.ts`
- `/api/upload/images/[id]/like/route.ts`
- `/api/posts/[id]/comments/route.ts`
- `/api/books/[id]/comments/route.ts`
- `/api/upload/images/[id]/comments/route.ts`

### 4. UI Component - NotificationBell

**Lokasi**: `app/components/NotificationBell.tsx`

**Fitur**:
- Icon lonceng dengan badge merah menampilkan jumlah notifikasi belum dibaca
- Dropdown menu menampilkan daftar notifikasi
- Notifikasi belum dibaca ditandai dengan highlight biru
- Klik notifikasi untuk menandai sebagai dibaca dan navigasi ke konten
- Tombol "Tandai semua dibaca"
- Auto-refresh setiap 30 detik
- Menampilkan waktu relatif (contoh: "5 menit yang lalu")

**Tampilan**:
- Desktop: Terletak di navbar sebelah kiri nama user
- Mobile: Terletak di sebelah icon menu hamburger

### 5. Integration dengan Navbar

NotificationBell ditambahkan ke `app/components/Navbar.tsx`:
- Ditampilkan hanya jika user sudah login
- Responsive: Muncul di desktop dan mobile

## Cara Kerja

1. **User A** menyukai atau mengomentari konten milik **User B**
2. Backend otomatis membuat notifikasi untuk **User B**
3. NotificationBell **User B** menampilkan badge dengan jumlah notifikasi baru
4. **User B** klik icon lonceng untuk melihat daftar notifikasi
5. **User B** klik notifikasi tertentu:
   - Notifikasi ditandai sebagai "sudah dibaca"
   - Badge count berkurang
   - User dinavigasi ke konten yang relevan (feed page)

## Database Migration

Migration telah dibuat dan diterapkan:
```
prisma/migrations/20251128132413_add_notifications/
```

Untuk regenerate Prisma Client (jika diperlukan):
```bash
npx prisma generate
```

## Testing

1. Login dengan 2 akun berbeda
2. Dengan akun pertama, like atau comment pada post/book/image akun kedua
3. Dengan akun kedua, cek icon lonceng - seharusnya ada badge merah
4. Klik untuk melihat notifikasi
5. Klik notifikasi untuk mark as read

## Catatan
- Notifikasi TIDAK dibuat jika user like/comment konten sendiri
- Polling interval: 30 detik (dapat disesuaikan di `NotificationBell.tsx`)
- Maksimal tinggi dropdown: 480px dengan scroll
- Tema: Dark mode matching dengan aplikasi
