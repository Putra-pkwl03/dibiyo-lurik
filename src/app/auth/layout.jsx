export default function AuthLayout({ children }) {
  return (
    // Menggunakan w-screen h-screen m-0 p-0 dan overflow-hidden 
    // agar layout bersih tanpa margin, padding, atau scrollbar sekunder di luar form.
    <div className="w-screen h-screen p-0 m-0 overflow-hidden bg-white">
      {children}
    </div>
  )
}