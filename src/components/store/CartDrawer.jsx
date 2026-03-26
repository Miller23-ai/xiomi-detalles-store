import { useCart } from '../../contexts/CartContext'
import { X, Trash2, Plus, Minus, ShoppingBag, MessageCircle, Pencil, Check } from 'lucide-react'
import { useState } from 'react'
import { STORE_NAME, STORE_WA } from '../../lib/supabase'

export default function CartDrawer() {
  const { items, removeItem, updateQty, updateNota, clear, total, setDrawerOpen } = useCart()
  const [editingNota, setEditingNota] = useState(null)
  const [notaText,    setNotaText]    = useState('')

  function buildWaMessage() {
    const header = `🌸 *Pedido — ${STORE_NAME}*\n\n`
    const lines  = items.map(i => {
      const sub = `• *${i.nombre}* x${i.cantidad} — S/ ${(i.precio_venta * i.cantidad).toFixed(2)}`
      return i.nota ? `${sub}\n  ↳ ${i.nota}` : sub
    }).join('\n')
    const footer = `\n\n*Total: S/ ${total.toFixed(2)}*\n\nPor favor confírmame disponibilidad y detalles de entrega. ¡Gracias! 💕`
    return `https://wa.me/${STORE_WA}?text=${encodeURIComponent(header + lines + footer)}`
  }

  function startNota(item) {
    setEditingNota(item.id)
    setNotaText(item.nota || '')
  }

  function saveNota(id) {
    updateNota(id, notaText)
    setEditingNota(null)
  }

  return (
    <>
      <div className="cart-overlay" onClick={() => setDrawerOpen(false)} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-rose-600" />
            <h2 className="font-display text-xl font-semibold text-ink">Mi carrito</h2>
            {items.length > 0 && (
              <span className="bg-rose-100 text-rose-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {items.reduce((s,i) => s+i.cantidad, 0)}
              </span>
            )}
          </div>
          <button onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-rose-200" />
              </div>
              <p className="font-display text-xl text-ink/50 mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-gray-400">Agrega algo especial para alguien especial 🌸</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl hover:bg-cream-100 transition-colors group">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0">
                  {item.photo_url
                    ? <img src={item.photo_url} alt={item.nombre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-2xl">🌸</div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-medium text-ink leading-snug line-clamp-2">{item.nombre}</p>
                    <button onClick={() => removeItem(item.id)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <p className="text-rose-600 font-semibold text-sm mt-0.5">
                    S/ {(item.precio_venta * item.cantidad).toFixed(2)}
                  </p>

                  {/* Nota */}
                  {editingNota === item.id ? (
                    <div className="flex gap-1 mt-1.5">
                      <input value={notaText} onChange={e => setNotaText(e.target.value)}
                             className="flex-1 text-xs border border-rose-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-rose-400"
                             placeholder="Personalización, color, dedicatoria..."
                             autoFocus onKeyDown={e => e.key === 'Enter' && saveNota(item.id)} />
                      <button onClick={() => saveNota(item.id)}
                              className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all">
                        <Check size={11} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startNota(item)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 mt-1 transition-colors">
                      <Pencil size={10} />
                      {item.nota ? <span className="italic">{item.nota}</span> : 'Agregar nota / personalización'}
                    </button>
                  )}

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.id, item.cantidad - 1)} className="qty-btn">
                      <Minus size={10} />
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{item.cantidad}</span>
                    <button onClick={() => updateQty(item.id, item.cantidad + 1)} className="qty-btn">
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink/60 font-medium">Subtotal</span>
              <span className="font-display text-xl font-semibold text-ink">S/ {total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 -mt-1">
              El precio final puede variar según personalizaciones. Te confirmamos al contactarte.
            </p>
            <a href={buildWaMessage()} target="_blank" rel="noopener noreferrer"
               className="btn-rose w-full justify-center text-base py-4 rounded-2xl shadow-lg shadow-rose-600/20">
              <MessageCircle size={18} />
              Pedir por WhatsApp
            </a>
            <button onClick={clear}
                    className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1">
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
