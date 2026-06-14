// src/app/page.jsx
import Navbar from './components/home/Navbar'
import Hero from './components/home/Hero'
import Features from './components/home/Features'
import CTA from './components/home/CTA'
import Catalog from './components/home/Catalog'
import Footer from './components/home/Footer'

export default function RootPage() {
  return (
    <div className="min-h-screen bg-[#0A1715] text-[#F9F6F0] antialiased overflow-x-hidden selection:bg-[#E5BA73] selection:text-[#12110F]">
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Catalog />
      <Footer />
    </div>
  )
}