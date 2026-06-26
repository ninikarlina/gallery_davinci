# TITANIUM SPATIAL Glass: ARCHITECTURAL LAWS

Dokumen ini adalah sumber kebenaran mutlak (source of truth) untuk meredesain komponen di ekosistem UI **Titanium Spatial Glass**. Estetika ini sangat terinspirasi oleh antarmuka *Spatial Computing* kelas atas (seperti visionOS) dan desain industri logam titanium presisi.

Setiap kali Anda meredesain komponen baru (misalnya `RegisterForm` atau `PostCard`), Anda **wajib** mematuhi hukum arsitektur berikut:

## 1. SPATIAL GLASS (THE CANVAS)
Kaca utama tidak boleh terlihat datar. Harus ada kedalaman optik yang ekstrim.
- **Deep Blur**: Gunakan efek blur tingkat tinggi: `backdrop-blur-[64px]` atau minimal `backdrop-blur-3xl`.
- **Translucency**: Gunakan latar belakang hitam yang sangat tembus pandang: `bg-[#0a0a0a]/40`.
- **Inner Specular Highlights**: Wajib memiliki pantulan cahaya di ujung atasnya: `border border-white/10` dikombinasikan dengan `shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]`.
- **Micro-Texture (Grain)**: Untuk menghindari kesan "CSS murahan", panel kaca utama wajib disuntikkan tekstur *noise* halus:
  ```tsx
  <div 
    className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-screen"
    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
  ></div>
  ```

## 2. MACHINED TITANIUM (INPUTS & HARDWARE)
Input dan tombol tidak boleh berbentuk kotak datar. Mereka harus terasa seperti perangkat mekanis padat.
- **Deep Drilled Inputs (Lubang Input)**: Kotak input harus terasa dibor ke dalam bongkahan metal. Gunakan:
  `bg-[#050505]/60 border border-black/50 border-t-black/80 border-b-white/10 shadow-[inset_0_4px_12px_rgba(0,0,0,0.6)]`.
- **Metallic Gradients (Tombol)**: Tombol harus menggunakan gradien linier subtil layaknya metal asahan: `bg-gradient-to-b from-white/15 to-white/5`.
- **Physical Depth**: Berikan efek mekanis saat tombol ditekan: `active:scale-[0.98]`.

## 3. AMBIENT SHADOWS (NO HARSH DROPS)
Jangan pernah memakai `shadow-xl` standar yang pekat di belakang panel yang melayang.
- Gunakan bayangan super difus/lembut yang menyebar jauh: `shadow-[0_40px_80px_rgba(0,0,0,0.8)]`.

## 4. KINETIC LIGHTING
Cahaya harus dinamis dan bereaksi terhadap interaksi pengguna (kursor mouse).
- **Macro Lighting (Panel)**: Wajib di-wrap dengan `framer-motion` dan menggunakan `useMotionValue` serta `useMotionTemplate` untuk membuat *radial gradient mask* yang mengikuti mouse.
- **Micro Sheen (Tombol)**: Tombol harus punya animasi kilau (*sheen*) yang menyapu saat di-hover. Tambahkan div ini di dalam tombol utama yang memiliki `group/btn` dan `overflow-hidden`:
  ```tsx
  <div className="absolute inset-0 -translate-x-[150%] group-hover/btn:translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none"></div>
  ```

## 5. ETCHED ICONOGRAPHY & TYPOGRAPHY
Teks dan ikon tidak dicat di atas kaca, melainkan diukir (*etched*).
- **Etched Shadow**: Tambahkan `drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]` atau `rgba(0,0,0,0.8)` di bawah teks dan ikon agar terlihat "terukir" ke dalam kaca atau dicetak timbul.
- **Typography Tracking**:
  - Untuk Judul/Heading: Gunakan `tracking-tight` agar modern dan elegan.
  - Untuk Label (Uppercase) / Tombol: Gunakan `tracking-[0.2em]` atau `tracking-widest` agar memberikan kesan *industrial*.
- **Iconography**: Selalu gunakan pustaka `lucide-react`.
