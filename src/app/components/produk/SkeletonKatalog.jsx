import React from 'react'

export default function SkeletonKatalog() {
  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 gap-8 md:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((n) => (
        <div key={n} className="bg-[#1A1917]/50 border border-[#E5BA73]/5 rounded-2xl h-[450px] p-6 flex flex-col justify-between">
          <div className="w-full aspect-[4/3] bg-white/5 rounded-xl"></div>
          <div className="w-2/3 h-5 mt-4 bg-white/10 rounded"></div>
          <div className="w-1/2 h-4 mt-2 bg-white/5 rounded"></div>
          <div className="w-full h-12 mt-auto bg-white/5 rounded-xl"></div>
        </div>
      ))}
    </div>
  )
}