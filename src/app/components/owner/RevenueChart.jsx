'use client'

import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

// Struktur dataData sekarang menerima objek utuh dari API backend yang baru
export default function RevenueChart({ data = { graphData: [], totals: { orders: 0, por: 0, poc: 0 } } }) {
  const monthsLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const chartData = monthsLabel.map((month, index) => ({
    name: month,
    amount: data?.graphData?.[index] || 0
  }))

  const formatYAxis = (value) => {
    if (value === 0) return '0'
    return value.toLocaleString('id-ID', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-xs text-white border rounded shadow-md bg-stone-900 border-stone-700">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-stone-300 mt-0.5">
            Rp {payload[0].value.toLocaleString('id-ID')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#F4EAE1]/40 shadow-sm w-full">
      {/* Header Bagian Atas */}
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row">
        <div>
          <h3 className="text-sm font-bold text-stone-800">Grafik Pendapatan</h3>
          <p className="text-[11px] text-stone-500">Akumulasi pendapatan tahun berjalan</p>
        </div>

        {/* Informasi Akumulasi Kategori di Samping Kanan Atas */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-right sm:text-right text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="font-medium text-stone-600">Direct Orders:</span>
            <span className="font-bold text-stone-900">Rp {(data?.totals?.orders || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="font-medium text-stone-600">POR:</span>
            <span className="font-bold text-stone-900">Rp {(data?.totals?.por || 0).toLocaleString('id-ID')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-stone-600">POC:</span>
            <span className="font-bold text-stone-900">Rp {(data?.totals?.poc || 0).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* Area Chart */}
      <div className="w-full h-80 text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 35, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#A47352" strokeOpacity={0.3} vertical={false} />
            
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#000000', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#FCDB78', strokeOpacity: 0.3 }}
              tickLine={false}
            />
            
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fill: '#000000', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FCDB78', fillOpacity: 0.05 }} />
            
            <Bar 
              dataKey="amount" 
              fill="#FCDB78" 
              radius={[2, 2, 0, 0]} 
              maxBarSize={32}     
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}