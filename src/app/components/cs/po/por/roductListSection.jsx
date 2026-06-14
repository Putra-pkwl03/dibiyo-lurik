import React from 'react'
import ProductItemRow from './ProductItemRow'

export default function ProductListSection({ items, onUpdateField, onRemoveItem }) {
  return (
    <div className="p-5 space-y-4 border rounded-lg border-stone-200 bg-stone-50/50">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold tracking-wider uppercase text-stone-700">
          Daftar Item Kain Pre-Order
        </h4>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-xs text-center bg-white border border-dashed rounded text-stone-400">
          Belum ada produk yang dipilih untuk orderan ini.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <ProductItemRow
              key={item.id || index}
              item={item}
              index={index}
              onUpdateField={onUpdateField}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>
      )}
    </div>
  )
}