import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCart } from '../../contexts/CartContext'
import { ShoppingBag, ArrowLeft, Check, MessageCircle, Heart, ChevronRight, Minus, Plus } from 'lucide-react'
import ProductCard from '../../components/store/ProductCard'
import { STORE_WA } from '../../lib/supabase'

export default function ProductPage() {
  const { id } = useParams()
  const { addItem, setDrawerOpen } = useCart()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty,     setQty]     = useState(1)
  const [nota,    setNota]    = useState('')
  const [adding,  setAdding]  = useState(false)
  const [wished,  setWished]  = useState(false)

  useEffect(() => { window.scrollTo(0,0); loadProduct() }, [id])

  async function loadProduct() {
    setLoading(true)
    const { data } = await supabase.from('productos').select('*').eq('id', id).single()
    setProduct(data)
    if (data) {
      const { data: rel } = await supabase.from('productos')
        .select('*').eq('activo', true).eq('categoria', data.categoria).neq('id', id).limit(4)
      setRelated(rel || [])
    }
    setLoading(false)
  }

  function handleAdd() {
    if (!product) return
    setAdding(true)
    addItem(product, qty, nota)
    setTimeout(() => { setAdding(false); setDrawerOpen(true) }, 600)
  }

  const waLink = product ? `https://wa.me/${STORE_WA}?text=${encodeURIComponent(
    `¡Hola! Me interesa: *${product.nombre}* (S/ ${product.precio_venta})\nCantidad: ${qty}${nota ? `\nPersonalización: ${nota}` : ''}\n¿Está disponible? 🌸`
  )}` : '#'

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin" />
    </div>
  )

  if (!product) return (
    <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
      <span className="text-5xl">😔</span>
      <h2 className="font-display text-2xl text-ink">Producto no encontrado</h2>
      <Link to="/catalogo" className="btn-rose">Volver al catálogo</Link>
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <nav className="flex items-center gap-2 text-xs text-ink/40 mb-8">
          <Link to="/" className="hover:text-rose-600 transition-colors">Inicio</Link>
          <ChevronRight size={12} />
          <Link to="/catalogo" className="hover:text-rose-600 transition-colors">Catálogo</Link>
          <ChevronRight size={12} />
          <Link to={`/catalogo?cat=${encodeURIComponent(product.categoria)}`}
                className="hover:text-rose-600 transition-colors">{product.categoria}</Link>
          <ChevronRight size={12} />
          <span className="text-ink/70 line-clamp-1">{product.nombre}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-rose-50 to-blush-100 shadow-2xl shadow-rose-600/10">
              {product.photo_url
                ? <img src={product.photo_url} alt={product.nombre} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center"><span className="text-[120px]">🌸</span></div>}
            </div>
            <button onClick={() => setWished(!wished)}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all
                      ${wished ? 'bg-rose-600 text-white' : 'bg-white text-rose-400 hover:bg-rose-50'}`}>
              <Heart size={16} className={wished ? 'fill-white' : ''} />
            </button>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <span className="inline-block tag bg-rose-50 text-rose-600 border border-rose-100 mb-3">{product.categoria}</span>
              <h1 className="font-display text-4xl sm:text-5xl text-ink font-semibold leading-tight mb-3">{product.nombre}</h1>
              {product.descripcion && <p className="text-ink/60 leading-relaxed">{product.descripcion}</p>}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-rose-600">S/ {Number(product.precio_venta).toFixed(2)}</span>
              <span className="text-xs text-ink/40 font-medium">por unidad</span>
            </div>

            <div className="w-16 h-px bg-rose-200" />

            {/* Qty */}
            <div>
              <p className="text-sm font-medium text-ink mb-2">Cantidad</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl p-1">
                  <button onClick={() => setQty(Math.max(1, qty-1))} className="qty-btn border-0 hover:bg-rose-50"><Minus size={13} /></button>
                  <span className="w-8 text-center text-base font-semibold">{qty}</span>
                  <button onClick={() => setQty(qty+1)} className="qty-btn border-0 hover:bg-rose-50"><Plus size={13} /></button>
                </div>
                <span className="text-sm text-ink/40">= S/ {(product.precio_venta * qty).toFixed(2)}</span>
              </div>
            </div>

            {/* Nota */}
            <div>
              <p className="text-sm font-medium text-ink mb-2">Personalización <span className="text-ink/30 font-normal">(opcional)</span></p>
              <textarea value={nota} onChange={e => setNota(e.target.value)} rows={3}
                        placeholder="Ej: Color rosa, dedicatoria 'Para mi reina 💕'..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none placeholder-gray-300 font-body" />
            </div>

            <div className="flex gap-3 flex-col sm:flex-row">
              <button onClick={handleAdd}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold transition-all shadow-lg
                        ${adding ? 'bg-emerald-500 text-white shadow-emerald-500/25' : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25'}`}>
                {adding ? <><Check size={18} /> ¡Agregado!</> : <><ShoppingBag size={18} /> Agregar al carrito</>}
              </button>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                 className="flex items-center justify-center gap-2 py-4 px-5 rounded-2xl border-2 border-green-500 text-green-600 hover:bg-green-50 font-semibold text-sm transition-all">
                <MessageCircle size={16} /> WhatsApp
              </a>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
              {[['✨','Hecho a mano'],['🚚','Entrega a domicilio'],['💬','Asesoría personalizada']].map(([e, t]) => (
                <div key={t} className="text-center">
                  <span className="text-xl block mb-1">{e}</span>
                  <p className="text-xs text-ink/50">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-3xl text-ink mb-8">También te puede gustar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p, i) => <ProductCard key={p.id} product={p} delay={i*50} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
