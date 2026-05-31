'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const POCustomTable = dynamic(() => import('../../../../../components/cs/po/poc/POCustomTable'), { ssr: false })

export default function PreOrderCustomPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/pre-order-custom') 
      const json = await res.json()
      setData(Array.isArray(json.data) ? json.data : [])
    } catch (err) {
      console.error(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full mx-auto space-y-6">
      <h1 className="text-3xl font-semibold text-[#8B5E3C] mb-4">Pre-order Custom</h1>
      <div className="border border-[#D4A373]/40 rounded-xl p-6 bg-white shadow-sm">
        <h2 className="text-xl font-medium text-[#8B5E3C] mb-6">List Pre-Order Custom</h2>
        {loading ? (
          <p className="py-10 text-center">Memuat data...</p>
        ) : (
          <POCustomTable data={data} />
        )}
      </div>
    </div>
  )
}