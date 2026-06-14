// app/layout.jsx
import { CartProvider } from "@/app/context/CartContext"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ProgressBar from "@/app/components/ProgressBar";
import Navbar from "@/app/components/home/Navbar"; 
import { Suspense } from "react"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dibyo Lurik - Internal",
  description: "Sistem Manajemen Internal Dibyo Lurik",
};


export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-[#0A1715] text-[#F9F6F0] min-h-screen antialiased">
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <Navbar />
        <CartProvider>      {/* ← buka */}
          {children}        {/* ← drchilen di dalam */}
        </CartProvider>     {/* ← tutup */}
      </body>
    </html>
  )
}