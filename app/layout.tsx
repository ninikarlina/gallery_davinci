import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import ThemeProvider from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "Gallery Davinci - Platform Karya Sastra Mahasiswa",
  description: "Komunitas digital untuk mahasiswa sastra berbagi puisi, pantun, cerpen, buku, dan gambar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
