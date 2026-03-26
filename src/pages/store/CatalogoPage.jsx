import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import ProductCard from '../../components/store/ProductCard'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

const SORT_OPTIONS = [
  { v: 'reciente',   l: 'Más recientes' },
  { v: 'precio_asc', l: 'Menor precio' },
  { v: 'precio_desc',l: 'Mayor precio' },
  { v: 'nombre',     l: 'A → Z' },
]

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,   setProducts]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [sort,       setSort]       = useState('reciente')
  const [showFilter, setShowFilter] = useState(false)

  const catParam   = searchParams.get('cat') || ''
  const activeCat  = catParam

  useEffect(() => {
    Promise.all([
      supabase.from('productos').select('*').eq('activo', true),
      supabase.from('categorias').select('nombre').eq('tipo', 'producto').order('nombre'),
    ]).then(([{ data: p }, { data: c }]) => {
      setProducts(p || [])
      setCategorias(c?.map(x => x.nombre) || [])
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (activeCat) list = list.filter(p => p.categoria === activeCat)
    if (search)    list = list.filter(p => p.nombre?.toLowerCase().includes(search.toLowerCase()) || p.descripcion?.toLowerCase().includes(search.toLowerCase()))
    switch (sort) {
      case 'precio_asc':  list.sort((a, b) => a.precio_venta - b.precio_venta); break
      case 'precio_desc': list.sort((a, b) => b.precio_venta - a.precio_venta); break
      case 'nombre':      list.sort((a, b) => a.nombre.localeCompare(b.nombre)); break
      default: break
    }
    return list
  }, [products, activeCat, search, sort])

  function setCat(cat) {
    const next = new URLSearchParams(searchParams)
    if (cat) next.set('cat', cat); else next.delete('cat')
    setSearchParams(next)
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="mb-10">
          <p className="text-rose-600 text-sm font-semibold uppercase tracking-widest mb-1">Catálogo</p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink">
            {activeCat || 'Todos nuestros detalles'}
          </h1>
          {!loading && (
            <p className="text-ink/40 mt-1 text-sm">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── SIDEBAR FILTERS ──────────────────── */}
          <aside className={`
            lg:w-56 flex-shrink-0 space-y-6
            ${showFilter ? 'block' : 'hidden lg:block'}
          `}>
            {/* Categories */}
            <div>
              <h3 className="font-display text-lg text-ink mb-3">Categorías</h3>
              <div className="space-y-1">
                <button onClick={() => setCat('')}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all
                          ${!activeCat ? 'bg-rose-600 text-white font-medium' : 'text-ink/60 hover:bg-rose-50 hover:text-rose-600'}`}>
                  ✨ Todos ({products.length})
                </button>
                {categorias.map(cat => {
                  const count = products.filter(p => p.categoria === cat).length
                  return (
                    <button key={cat} onClick={() => setCat(cat)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex justify-between items-center
                              ${activeCat === cat ? 'bg-rose-600 text-white font-medium' : 'text-ink/60 hover:bg-rose-50 hover:text-rose-600'}`}>
                      <span>{cat}</span>
                      <span className={`text-xs ${activeCat === cat ? 'text-white/70' : 'text-ink/30'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price range hint */}
            {products.length > 0 && (
              <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <h3 className="font-display text-base text-ink mb-2">Precios</h3>
                <p className="text-sm text-ink/50">
                  Desde <span className="font-semibold text-rose-600">S/ {Math.min(...products.map(p => p.precio_venta)).toFixed(0)}</span>
                  {' '}hasta <span className="font-semibold text-rose-600">S/ {Math.max(...products.map(p => p.precio_venta)).toFixed(0)}</span>
                </p>
              </div>
            )}
          </aside>

          {/* ── PRODUCTS AREA ──────────────────── */}
          <div className="flex-1">
            {/* Search + Sort bar */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                       placeholder="Buscar producto..."
                       className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="relative">
                <select value={sort} onChange={e => setSort(e.target.value)}
                        className="pl-4 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white appearance-none cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <button onClick={() => setShowFilter(!showFilter)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white">
                <SlidersHorizontal size={15} className="text-rose-500" />
                Filtros
              </button>
            </div>

            {/* Active filter pill */}
            {activeCat && (
              <div className="flex gap-2 mb-4 flex-wrap">
                <span className="flex items-center gap-2 bg-rose-100 text-rose-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {activeCat}
                  <button onClick={() => setCat('')}><X size={11} /></button>
                </span>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden">
                    <div className="skeleton aspect-[4/5]" />
                    <div className="p-4 space-y-2 bg-white">
                      <div className="skeleton h-4 rounded w-3/4" />
                      <div className="skeleton h-8 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl block mb-4">🔍</span>
                <h3 className="font-display text-2xl text-ink mb-2">Sin resultados</h3>
                <p className="text-ink/50 text-sm mb-6">No encontramos productos con ese criterio</p>
                <button onClick={() => { setSearch(''); setCat('') }} className="btn-ghost inline-flex">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
                {filtered.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 40} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
