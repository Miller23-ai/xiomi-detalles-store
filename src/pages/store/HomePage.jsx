import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ProductCard from '../../components/store/ProductCard'
import { ArrowRight, Sparkles, Heart, Star, Gift, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STORE_WA } from '../../lib/supabase'

const FEATURES = [
  { icon: Heart,    title: 'Hecho con amor',      desc: 'Cada detalle es creado artesanalmente para ti' },
  { icon: Sparkles, title: '100% personalizable',  desc: 'Elige colores, flores y dedicatorias únicas' },
  { icon: Gift,     title: 'Entrega a domicilio',  desc: 'Llevamos tu regalo al destino especial' },
  { icon: Star,     title: 'Calidad garantizada',  desc: 'Materiales de primera para detalles eternos' },
]

export default function HomePage() {
  const [featured,  setFeatured]  = useState([])
  const [categorias,setCategorias]= useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('productos').select('*').eq('activo', true).order('created_at', { ascending: false }).limit(8),
      supabase.from('categorias').select('nombre, color').eq('tipo', 'producto').limit(8),
    ]).then(([{ data: p }, { data: c }]) => {
      setFeatured(p || [])
      setCategorias(c || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream-100 via-white to-blush-100" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(232,164,184,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(194,24,91,0.08) 0%, transparent 50%)'
        }} />
        {/* Decorative circles */}
        <div className="absolute top-20 right-0 w-96 h-96 rounded-full border border-rose-200/30 translate-x-1/3" />
        <div className="absolute top-40 right-12 w-64 h-64 rounded-full border border-blush-200/40" />
        <div className="absolute bottom-20 left-0 w-72 h-72 rounded-full bg-gradient-to-br from-rose-100/40 to-transparent -translate-x-1/3" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-24 pb-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-2 rounded-full animate-fade-up">
              <Sparkles size={12} />
              Detalles únicos para momentos especiales
            </div>

            <h1 className="font-display text-5xl sm:text-6xl xl:text-7xl font-semibold text-ink leading-[1.05] animate-fade-up stagger-1">
              Regala algo
              <br />
              <em className="text-rose-600 not-italic">inolvidable</em>
              <br />
              <span className="text-3xl sm:text-4xl xl:text-5xl text-ink/40 font-light">con amor ✨</span>
            </h1>

            <p className="text-lg text-ink/60 leading-relaxed max-w-lg animate-fade-up stagger-2">
              Ramos eternos, cajas LED personalizadas, detalles únicos para San Valentín,
              cumpleaños y cada momento que merece ser recordado.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up stagger-3">
              <Link to="/catalogo" className="btn-rose text-base px-8 py-4 shadow-lg shadow-rose-600/25">
                Ver catálogo
                <ArrowRight size={18} />
              </Link>
              <a href={`https://wa.me/${STORE_WA}?text=${encodeURIComponent('¡Hola! Me gustaría cotizar un detalle personalizado 🌸')}`}
                 target="_blank" rel="noopener noreferrer"
                 className="btn-ghost text-base px-8 py-4">
                <MessageCircle size={18} />
                Pedir personalizado
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 animate-fade-up stagger-4">
              <div className="flex -space-x-2">
                {['#f4a7b9','#e8768c','#d4506e','#c2185b'].map((c,i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white"
                       style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }} />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-xs text-ink/50">+200 clientes felices</p>
              </div>
            </div>
          </div>

          {/* Visual collage */}
          <div className="relative h-[520px] hidden lg:block animate-fade-up stagger-2">
            {featured.slice(0, 3).map((p, i) => {
              const positions = [
                'top-0 right-0 w-64 h-80',
                'top-24 left-0 w-52 h-64',
                'bottom-0 right-16 w-56 h-64',
              ]
              const rotations = ['rotate-2', '-rotate-3', 'rotate-1']
              return (
                <Link key={p.id} to={`/producto/${p.id}`}
                      className={`absolute ${positions[i]} ${rotations[i]} rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow`}>
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.nombre} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-rose-100 to-blush-200 flex items-center justify-center">
                        <span className="text-6xl">🌸</span>
                      </div>}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                    <p className="text-white text-xs font-medium line-clamp-1">{p.nombre}</p>
                    <p className="text-white/80 text-xs">S/ {Number(p.precio_venta).toFixed(2)}</p>
                  </div>
                </Link>
              )
            })}
            {featured.length < 3 && (
              <div className="top-0 right-0 w-64 h-80 absolute rounded-2xl bg-gradient-to-br from-rose-100 to-blush-200 flex items-center justify-center">
                <span className="text-7xl">🌸</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────── */}
      {categorias.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="text-center mb-10">
              <h2 className="font-display text-4xl text-ink mb-2">Explora por categoría</h2>
              <p className="text-ink/50">Encuentra el detalle perfecto para cada ocasión</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link to="/catalogo"
                    className="tag bg-rose-600 text-white hover:bg-rose-700 transition-all py-3 px-6 text-sm font-semibold">
                ✨ Todos
              </Link>
              {categorias.map(cat => (
                <Link key={cat.nombre} to={`/catalogo?cat=${encodeURIComponent(cat.nombre)}`}
                      className="tag bg-rose-50 text-rose-600 hover:bg-rose-100 hover:scale-105 transition-all py-3 px-6 text-sm font-medium border border-rose-100">
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ───────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-rose-600 text-sm font-semibold uppercase tracking-widest mb-2">Lo más reciente</p>
            <h2 className="font-display text-4xl sm:text-5xl text-ink">Nuestros detalles</h2>
          </div>
          <Link to="/catalogo" className="hidden sm:flex items-center gap-2 text-sm font-medium text-ink/60 hover:text-rose-600 transition-colors group">
            Ver todos
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="skeleton aspect-[4/5]" />
                <div className="p-4 space-y-2 bg-white">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="skeleton h-8 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 50} />)}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/catalogo" className="btn-ghost inline-flex">
            Ver catálogo completo
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────── */}
      <section className="py-20 bg-ink text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl sm:text-5xl mb-3">¿Por qué elegirnos?</h2>
            <p className="text-white/50">Cada detalle está pensado para sorprender</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-rose-600/30 transition-all">
                  <Icon size={22} className="text-rose-400" />
                </div>
                <h3 className="font-display text-lg text-white mb-1">{title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA WHATSAPP ──────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="bg-gradient-to-r from-rose-600 to-rose-800 rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)' }} />
          <div className="relative">
            <span className="text-5xl mb-4 block">💕</span>
            <h2 className="font-display text-4xl sm:text-5xl mb-4">¿Tienes algo especial en mente?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Cuéntanos tu idea y creamos el detalle perfecto para ti.
              Personalizamos todo con mucho amor.
            </p>
            <a href={`https://wa.me/${STORE_WA}?text=${encodeURIComponent('¡Hola Xiomi Detalles! Quisiera un detalle personalizado especial 🌸')}`}
               target="_blank" rel="noopener noreferrer"
               className="btn-white inline-flex text-base px-8 py-4 shadow-xl">
              <MessageCircle size={20} />
              Cotizar ahora por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
