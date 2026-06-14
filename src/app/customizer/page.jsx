// src/app/customizer/page.jsx
"use client"

import { useState } from 'react'
import CustomizerCanvas from '../components/home/custom/CustomizerCanvas' 
import CustomizerSidebar from '../components/home/custom/CustomizerSidebar'

export default function CustomizerPage() {

  const [stripeThickness, setStripeThickness] = useState(4)
  const [activeColor, setActiveColor] = useState('gold')
  const [previewMode, setPreviewMode] = useState('fabric')
  const DEFAULT_BG_COLOR = '#132237'
  const DEFAULT_DENSITY = 80
  const DEFAULT_STRIPES = [
    { id: 1, thickness: 4, color: '#E5BA73' }, 
    { id: 2, thickness: 2, color: '#2B4C7E' }, 
    { id: 3, thickness: 6, color: '#F9F6F0' }, 
  ]

  const [bgColor, setBgColor] = useState(DEFAULT_BG_COLOR)
  const [patternDensity, setPatternDensity] = useState(DEFAULT_DENSITY)
  const [stripes, setStripes] = useState(DEFAULT_STRIPES)

  const handleResetAll = () => {
    setBgColor(DEFAULT_BG_COLOR)
    setPatternDensity(DEFAULT_DENSITY)
    setStripes(DEFAULT_STRIPES)
    setPreviewMode('fabric') 
    
    setStripeThickness(4)
    setActiveColor('gold')
  }

  return (
    <main className="min-h-screen bg-[#0A1715] text-[#F9F6F0] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-stretch gap-10 p-6 mx-auto max-w-7xl lg:flex-row">
        
        <CustomizerCanvas 
          bgColor={bgColor}
          patternDensity={patternDensity}
          stripes={stripes}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          onReset={handleResetAll} 
        />
        <CustomizerSidebar 
          bgColor={bgColor}
          setBgColor={setBgColor}
          patternDensity={patternDensity}
          setPatternDensity={setPatternDensity}
          stripes={stripes}
          setStripes={setStripes}
        />

      </div>
    </main>
  )
}