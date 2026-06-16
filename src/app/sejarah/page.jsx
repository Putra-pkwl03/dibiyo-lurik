import Image from 'next/image';
import Footer from '../components/home/Footer.jsx'

export default function SejarahPage() {
  return (
    <div className="bg-[#0b1311] text-[#f3f4f6] min-h-screen py-40 px-4 sm:px-6 lg:px-8">

      {/* SECTION 1: HERO HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="text-xs font-bold tracking-widest text-[#d9a05b] uppercase bg-[#d9a05b]/10 px-4 py-1.5 rounded-full">
          Napak Tilas & Warisan Budaya
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mt-4 mb-6 tracking-wide">
          Untaian Kasih & Dedikasi <br />
          <span className="text-[#d9a05b] italic font-normal">Sang Maestro Lurik</span>
        </h1>
        <div className="w-24 h-[1px] bg-[#d9a05b] mx-auto mb-6" />
        <p className="text-[#9ca3af] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed italic">
          "Sebuah cerita tentang keteguhan hati, cinta yang saling menguatkan, dan sebilah kayu ATBM yang menolak punah ditelan zaman."
        </p>
      </div>

      {/* SECTION 2: FOTO MONUMEN SEJARAH */}
      <div className="max-w-4xl mx-auto mb-24">
        <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-[#111c19] p-4 shadow-2xl">
          <div className="relative w-full h-[250px] sm:h-[450px] overflow-hidden rounded-xl">
            <Image
              src="/images/Sutidjah-Sosok-Perempuan-Pendamping-Dibyo-Sumarto-Pelestari-Tenun-Lurik-1.jpg"
              alt="Simbah H. Dibyo Sumarto dan Simbah Hjh. Sutidjah"
              layout="fill"
              className="object-cover sepia-[30%] contrast-[110%]"
              priority
            />
          </div>
          <p className="text-center text-xs sm:text-sm text-[#9ca3af] mt-4 italic">
            Mengenang Simbah H. Dibyo Sumarto & Simbah Hjh. Sutidjah — Pelestari & Jiwa Tenun Lurik Tradisional.
          </p>
        </div>
      </div>

      {/* SECTION 3: INTI CERITA (TWO-COLUMN STORYTELLING) */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-sm sm:text-base mb-24">
        
        {/* Kolom Kiri: Pengantar Arkeologis Lurik */}
        <div className="md:col-span-1 space-y-6 border-l-2 border-[#d9a05b]/30 pl-6">
          <h3 className="text-lg font-serif font-bold text-[#d9a05b] tracking-wide uppercase">
            Asal-Usul <br />Serat Garis Nusantara
          </h3>
          <p className="text-[#9ca3af] leading-relaxed text-justify">
            Dari berbagai sumber sejarah, tenun Nusantara, khususnya tenun lurik sudah berkembang sejak zaman kerajaan Majapahit. Konon, prajuritnya mengenakan baju hitam dengan garis putih strip tiga di lengan.
          </p>
          <p className="text-[#9ca3af] leading-relaxed text-justify">
            Pola ini berevolusi hingga diserap oleh prajurit Kraton Ngayogyakarta Hadiningrat seperti brigade Mantrijero, Jogokaryo, hingga para Abdi Dalem.
          </p>
        </div>

        {/* Kolom Tengah & Kanan: Kisah Perjuangan & Romantisme */}
        <div className="md:col-span-2 space-y-6 text-[#d1d5db]">
          <p className="leading-relaxed text-justify">
            Memasuki era 1970-an, gelombang mesin tekstil modern menghantam keras. Harga kain murah buatan mesin membuat sentra tenun legendaris di Yogyakarta bertumbuh surut dan gulung tikar. Namun, di daerah Krapyak, Bantul, seorang mantan buruh tenun bernama <strong className="text-white">Dibyo Sumarto</strong> mengambil langkah berani pada tahun 1962: ia teguh mendirikan usaha tenun mandiri di rumahnya sendiri.
          </p>
          
          <blockquote className="border-l-4 border-[#d9a05b] bg-[#111c19] p-5 my-6 rounded-r-lg italic text-[#e5e7eb] font-serif">
            "Dibyo adalah sosok yang tekun menenun, Sutidjah mendampingi. Ibarat seorang tukang, ia bisa bekerja optimal ketika ada laden-nya."
          </blockquote>

          <p className="leading-relaxed text-justify">
            Perjuangan melawan zaman tidak dilalui Dibyo sendirian. Ada <strong className="text-white">Sutidjah</strong>, sang istri tercinta yang setia duduk di sampingnya memintal benang menjadi pakan tenunan sembari menyusun strategi dagang. 
          </p>
          <p className="leading-relaxed text-justify">
            Kombinasi harmonis ini melahirkan keajaiban. Jika Dibyo andal memproduksi, Sutidjah lihai menawarkan. Mereka rela bersepeda berboncengan sejauh 30 km melintasi batas kota hingga Muntilan demi menawarkan selembar kain lurik agar dapur tetap mengepul dan tradisi tetap hidup.
          </p>
        </div>
      </div>

      {/* SECTION 4: TIMELINE PASANG SURUT (DARK STYLISH TIMELINE) */}
      <div className="max-w-4xl mx-auto mb-24 relative border-t border-gray-800 pt-16">
        <h3 className="text-center font-serif text-2xl text-[#d9a05b] mb-12 uppercase tracking-widest">
          Garis Waktu Perjalanan
        </h3>
        
        <div className="space-y-12">
          {/* Node 1 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 bg-[#111c19]/50 p-6 rounded-xl border border-gray-800">
            <div className="text-3xl font-serif font-bold text-[#d9a05b] sm:w-24 shrink-0">2000</div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Patahnya Semangat Sang Maestro</h4>
              <p className="text-[#9ca3af] text-sm leading-relaxed text-justify">
                Sutidjah dipanggil terlebih dahulu oleh Yang Maha Kuasa. Kepergian sang belahan jiwa membuat Dibyo seakan patah kemudi. Tenun dibiarkan berjalan apa adanya, tanpa inovasi, hanya sebatas penantian sunyi untuk bertemu kembali. Beruntung, anak-anak mereka segera mengambil alih peran, menopang pundak sang ayah agar usaha ini terus bertahan.
              </p>
            </div>
          </div>

          {/* Node 2 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 bg-[#111c19]/50 p-6 rounded-xl border border-gray-800">
            <div className="text-3xl font-serif font-bold text-[#d9a05b] sm:w-24 shrink-0">2006</div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Ujian Gempa Yogyakarta</h4>
              <p className="text-[#9ca3af] text-sm leading-relaxed text-justify">
                Gempa besar meruntuhkan hampir seluruh bangunan produksi. Di tengah keterbatasan fisik dan usia senja, komitmen kuat Pak Dibyo berpadu dengan kepedulian berbagai pihak menjadi bahan bakar utama untuk bangkit membangun kembali puing-puing kejayaan Lurik dari nol.
              </p>
            </div>
          </div>

          {/* Node 3 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-12 bg-[#111c19]/50 p-6 rounded-xl border border-gray-800">
            <div className="text-3xl font-serif font-bold text-[#d9a05b] sm:w-24 shrink-0">2008</div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Kepulangan Sang Maestro</h4>
              <p className="text-[#9ca3af] text-sm leading-relaxed text-justify">
                Di usia 84 tahun, setelah perjuangan panjang melawan sakit rutin, Pak H. Dibyo Sumarto menutup usia dengan tenang. Beliau berpulang, bersanding kembali dengan istri setianya di keabadian, meninggalkan sejuta lembar benang warisan budaya yang adiluhung bagi nusantara.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: FINAL MEMORIAM / QUOTE OUTRO */}
      <div className="max-w-3xl mx-auto text-center bg-gradient-to-b from-[#111c19] to-transparent p-8 sm:p-12 rounded-2xl border border-gray-800/60">
        <p className="text-2xl font-serif italic text-white mb-6">
          "Saya mungkin tidak menangi melihat masanya generasi muda ini memiliki kebanggaan pada tenun, tetapi saat ini saya telah mencoba melakukan sesuatu. Pertahankan lurik ini dan jadikan kebanggaan dengan memakai atau membuatnya."
        </p>
        <span className="text-xs font-bold tracking-widest text-[#d9a05b] uppercase block mb-2">
          — Pesan Terakhir Simbah H. Dibyo Sumarto
        </span>
        <div className="w-12 h-[1px] bg-gray-700 mx-auto my-6" />
        <p className="text-xs text-[#9ca3af] tracking-wide uppercase">
          Kini tugas kita sebagai generasi penerus untuk menjaga detak jantung ATBM ini tetap berdenyut.
        </p>
      </div>
    <Footer />
    </div>
  );
}