import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, Heart, Search } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { STORE_NAME } from '../../lib/supabase'

export default function StoreNav({ onSearchOpen }) {
  const { itemCount, setDrawerOpen, lastAdded } = useCart()
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300
        ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-rose-100' : 'bg-transparent'}`}>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center h-16 gap-4">

          {/* Logo se sirve desde la carpeta /public para Netlify */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/logo-xiomi.png" 
              alt={STORE_NAME} 
              className="h-10 w-auto" 
            />
            <span className="font-display text-xl font-semibold text-ink leading-none tracking-tight">
              {STORE_NAME}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-8 flex-1">
            {[
              { to: '/',         label: 'Inicio' },
              { to: '/catalogo', label: 'Catálogo' },
              { to: '/nosotras', label: 'Nosotros' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all
                      ${location.pathname === to
                        ? 'text-rose-600 bg-rose-50'
                        : 'text-ink/70 hover:text-ink hover:bg-cream-200'}`}>
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 ml-auto">
            {/* Search */}
            <button onClick={onSearchOpen}
                    className="p-2 rounded-full text-ink/60 hover:text-ink hover:bg-cream-200 transition-all">
              <Search size={18} />
            </button>

            {/* Cart */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 rounded-full text-ink/60 hover:text-rose-600 hover:bg-rose-50 transition-all group">
              <ShoppingBag size={18} className={lastAdded ? 'animate-cart-bounce text-rose-600' : ''} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold
                                  rounded-full flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-2 rounded-full text-ink/60 hover:text-ink hover:bg-cream-200 transition-all">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-white border-b border-rose-100 shadow-lg animate-fade-in md:hidden">
          <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
            {[
              { to: '/',         label: 'Inicio' },
              { to: '/catalogo', label: 'Catálogo' },
              { to: '/nosotras', label: 'Nosotras' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                    className="px-4 py-3 text-sm font-medium text-ink/70 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
