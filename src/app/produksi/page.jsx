import Image from 'next/image';
import Footer from '../components/home/Footer.jsx'


const DATA_PRODUKSI = [
  {
    step: "01",
    title: "Pewarnaan Benang (Wenter)",
    description: "Proses awal dimulai dengan pewarnaan benang mentah (bisa menggunakan pewarna alam atau sintetik). Benang dicelup berulang kali dan diaduk di dalam wadah besar beralaskan kayu hingga warna meresap sempurna ke dalam serat kain.",
    imageSrc: "/images/pewarnaan-benang-500x335.jpg",
    alt: "Proses Wenter Mewarnai Benang Lurik"
  },
  {
    step: "02",
    title: "Proses Palet",
    description: "Setelah benang kering, benang akan dipindahkan ke dalam klenting atau palet kecil menggunakan alat roda putar tradisional. Proses ini membutuhkan ketelitian agar gulungan benang rapi dan tidak kusut saat masuk ke sekoci tenun.",
    imageSrc: "/images/palet-500x335.jpg",
    alt: "Proses Palet Memindahkan Benang"
  },
  {
    step: "03",
    title: "Proses Sekir (Penyetelan Benang)",
    description: "Benang-benang yang telah diwarnai kemudian disusun dan digulung pada sebuah silinder besar (alat sekir) untuk membentuk pola dasar atau motif garis-garis khas lurik yang diinginkan sebelum siap dipasang pada mesin tenun.",
    imageSrc: "/images/sekir-lurik-500x335.jpg",
    alt: "Proses Sekir Mengatur Motif Lurik"
  },
  {
    step: "04",
    title: "Proses Cucuk (Memasukkan Gun)",
    description: "Setiap helai mata benang dimasukkan satu per satu secara manual ke dalam sisir tenun (gun). Ini adalah salah satu proses paling membutuhkan kesabaran tingkat tinggi karena menentukan kerapatan dan presisi struktur helai kain.",
    imageSrc: "/images/proses-cucuk-benang-500x335.jpg",
    alt: "Proses Cucuk Memasukkan Benang ke Sisir Tenun"
  },
  {
    step: "05",
    title: "Proses Tenun (ATBM)",
    description: "Tahap akhir di mana pengrajin menggerakkan Alat Tenun Bukan Mesin (ATBM) menggunakan kombinasi tangan dan kaki secara sinkron. Lembar demi lembar benang menyatu membentuk sehelai kain lurik bernilai seni tinggi yang siap digunakan.",
    imageSrc: "/images/proses-tenun-lurik-500x335.jpg",
    alt: "Proses Menenun Kain Lurik dengan ATBM"
  }
];

export default function ProduksiPage() {
  return (
    <div className="bg-[#0b1311] text-[#f3f4f6] min-h-screen py-40 px-4 sm:px-6 lg:px-8">
      {/* 1. Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-24">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#d9a05b] mb-4 uppercase tracking-wider">
          Proses Produksi Kain Lurik
        </h1>
        <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mx-auto">
          Dokumentasi transparansi langkah pengerjaan kain ATBM tradisional. Mengubah untaian benang mentah menjadi karya seni warisan budaya bernilai tinggi.
        </p>
      </div>

      {/* 2. Timeline Section */}
      <div className="max-w-6xl mx-auto space-y-24 sm:space-y-32 relative">
        
        {/* Line tengah dekoratif untuk layar besar */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-[2px] bg-[#d9a05b]/20 h-full top-4" />

        {DATA_PRODUKSI.map((proses, index) => {
          const isEven = index % 2 === 0;
          return (
            <div 
              key={proses.step} 
              className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 relative ${
                isEven ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Sumbu lingkaran dekoratif di tengah timeline */}
              <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full bg-[#0b1311] border-2 border-[#d9a05b] items-center justify-center text-xs font-bold text-[#d9a05b] z-10 shadow-lg">
                {proses.step}
              </div>

              {/* Bagian Gambar */}
              <div className="w-full md:w-1/2 group">
                <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#111c19] shadow-2xl transition-all duration-300 group-hover:border-[#d9a05b]/40">
                  <Image
                    src={proses.imageSrc}
                    alt={proses.alt}
                    width={500}
                    height={335}
                    layout="responsive"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Bagian Konten Teks */}
              <div className="w-full md:w-1/2 space-y-4 px-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold tracking-widest text-[#d9a05b] bg-[#d9a05b]/10 px-3 py-1 rounded-full uppercase">
                    Langkah {proses.step}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-wide">
                  {proses.title}
                </h2>
                <p className="text-[#9ca3af] leading-relaxed text-sm sm:text-base">
                  {proses.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <Footer />
    </div>
  );
}