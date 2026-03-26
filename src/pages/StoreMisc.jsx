// NosotrasPage.jsx
import { Heart, Sparkles, Gift, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NosotrasPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-600/25">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="font-display text-5xl sm:text-6xl text-ink font-semibold mb-4">
            Nuestra historia
          </h1>
          <p className="text-xl text-ink/60 max-w-2xl mx-auto leading-relaxed">
            Cada detalle que creamos lleva un pedacito de nuestro corazón.
            Somos más que una tienda — somos el puente entre tus emociones y quien amas.
          </p>
        </div>

        {/* Story */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-rose-100 to-blush-200 flex items-center justify-center">
            <span className="text-[100px]">🌸</span>
          </div>
          <div className="space-y-5">
            <h2 className="font-display text-3xl text-ink">Por qué lo hacemos</h2>
            <p className="text-ink/60 leading-relaxed">
              Xiomi Detalles nació de la necesidad de encontrar regalos que realmente expresen
              lo que sentimos. Cansadas de lo genérico, decidimos crear detalles únicos,
              personalizados, hechos con dedicación y amor.
            </p>
            <p className="text-ink/60 leading-relaxed">
              Cada ramo eterno, cada caja iluminada, cada dedicatoria es creada pensando
              en la sonrisa de quien la recibe. Eso nos mueve, eso nos inspira.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Sparkles, title: 'Autenticidad',    desc: 'Cada pieza es única, igual que la persona que la recibe.' },
            { icon: Heart,    title: 'Con amor',        desc: 'Ponemos corazón en cada detalle que creamos.' },
            { icon: Star,     title: 'Excelencia',      desc: 'Materiales de calidad para momentos que duran para siempre.' },
          ].map(({ icon:Icon, title, desc }) => (
            <div key={title} className="text-center p-6 rounded-2xl bg-rose-50 border border-rose-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <Icon size={22} className="text-rose-600" />
              </div>
              <h3 className="font-display text-xl text-ink mb-2">{title}</h3>
              <p className="text-ink/50 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-ink rounded-3xl p-12 text-white">
          <h2 className="font-display text-4xl mb-4">¿Lista para sorprender?</h2>
          <p className="text-white/60 mb-8">Encuentra el detalle perfecto en nuestro catálogo</p>
          <Link to="/catalogo" className="btn-white inline-flex">
            <Gift size={18} /> Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}

// StoreLayout.jsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import StoreNav from '../components/store/StoreNav'
import StoreFooter from '../components/store/StoreFooter'
import CartDrawer from '../components/store/CartDrawer'
import SearchModal from '../components/store/SearchModal'
import { useCart } from '../contexts/CartContext'

export function StoreLayout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { drawerOpen, setDrawerOpen } = useCart()
  return (
    <div className="min-h-screen bg-cream">
      <StoreNav onSearchOpen={() => setSearchOpen(true)} />
      <Outlet />
      <StoreFooter />
      {drawerOpen && <CartDrawer />}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
