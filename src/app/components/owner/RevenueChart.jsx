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

export default function RevenueChart({ dataArray = [] }) {
  const monthsLabel = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const chartData = monthsLabel.map((month, index) => ({
    name: month,
    amount: dataArray[index] || 0
  }))

  // Format Y-Axis disesuaikan dengan mockup (Angka penuh dengan desimal ,00)
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
        <div className="p-2 text-xs text-white bg-white border rounded shadow-md border-stone-700">
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
      <div className="w-full h-80 text-[10px]">
        {/* Responsive Container */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 35, bottom: 0 }}
          >
            {/* Grid horizontal putus-putus dengan opasitas halus dari warna utama */}
            <CartesianGrid strokeDasharray="2 2" stroke="#A47352" strokeOpacity={0.3} vertical={false} />
            
            {/* Sumbu X */}
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#000000', fontSize: 11, fontWeight: 500 }}
              axisLine={{ stroke: '#FCDB78', strokeOpacity: 0.3 }}
              tickLine={false}
            />
            
            {/* Sumbu Y */}
            <YAxis 
              tickFormatter={formatYAxis}
              tick={{ fill: '#000000', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FCDB78', fillOpacity: 0.05 }} />
            
            {/* Batang Utama Diagram menggunakan warna #FCDB78 */}
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