import { useState } from 'react'
import { ShoppingBag, Heart, Eye, Check } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, delay = 0 }) {
  const { addItem, lastAdded, setDrawerOpen } = useCart()
  const [wished,  setWished]  = useState(false)
  const [adding,  setAdding]  = useState(false)

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    setAdding(true)
    addItem(product)
    setTimeout(() => {
      setAdding(false)
      setDrawerOpen(true)
    }, 600)
  }

  const margen = product.costo_estimado && product.precio_venta
    ? Math.round(((product.precio_venta - product.costo_estimado) / product.precio_venta) * 100) : null

  return (
    <div className="product-card animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <Link to={`/producto/${product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/5] bg-gradient-to-br from-rose-50 to-blush-100">
          {product.photo_url ? (
            <img src={product.photo_url} alt={product.nombre}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <span className="text-5xl opacity-60">🌸</span>
              <span className="text-xs text-rose-300 font-medium">{product.categoria}</span>
            </div>
          )}

          {/* Category badge */}
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-rose-600 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            {product.categoria}
          </span>

          {/* Wishlist */}
          <button
            onClick={e => { e.preventDefault(); setWished(!wished) }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center
              backdrop-blur shadow-sm transition-all
              ${wished ? 'bg-rose-600 text-white' : 'bg-white/90 text-rose-400 hover:bg-rose-50 hover:text-rose-600'}`}>
            <Heart size={14} className={wished ? 'fill-white' : ''} />
          </button>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/10 transition-all duration-300" />

          {/* Quick view */}
          <div className="absolute bottom-3 left-3 right-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="flex items-center justify-center gap-1.5 bg-white/95 text-ink text-xs font-medium py-2 rounded-xl shadow-sm">
              <Eye size={12} /> Ver detalles
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/producto/${product.id}`}>
          <h3 className="font-display text-base font-medium text-ink leading-snug mb-1 hover:text-rose-600 transition-colors line-clamp-2">
            {product.nombre}
          </h3>
        </Link>

        {product.descripcion && (
          <p className="text-xs text-ink/50 leading-relaxed mb-3 line-clamp-2">{product.descripcion}</p>
        )}

        <div className="flex items-center justify-between gap-2 mt-3">
          <div>
            <p className="font-display text-xl font-semibold text-rose-600">
              S/ {Number(product.precio_venta).toFixed(2)}
            </p>
          </div>

          <button onClick={handleAdd}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all
                    ${adding
                      ? 'bg-emerald-500 text-white scale-95'
                      : 'bg-rose-600 hover:bg-rose-700 text-white hover:shadow-lg hover:shadow-rose-600/20'}`}>
            {adding ? <><Check size={13} /> Listo</> : <><ShoppingBag size={13} /> Agregar</>}
          </button>
        </div>
      </div>
    </div>
  )
}
