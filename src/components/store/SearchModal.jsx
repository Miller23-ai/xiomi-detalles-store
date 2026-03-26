import { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

export default function SearchModal({ open, onClose }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState([])
  const [loading,  setLoading]  = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setTimeout(() => inputRef.current?.focus(), 100) }
  }, [open])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase.from('productos')
        .select('id, nombre, precio_venta, photo_url, categoria')
        .eq('activo', true)
        .ilike('nombre', `%${query}%`)
        .limit(8)
      setResults(data || [])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-up">
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Search size={18} className="text-rose-400 flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                 placeholder="Buscar detalles, ramos, cajas..."
                 className="flex-1 text-base text-ink placeholder-gray-300 focus:outline-none font-body" />
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="skeleton w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">Sin resultados para "<span className="text-ink">{query}</span>"</p>
            </div>
          )}

          {!loading && results.length === 0 && !query && (
            <div className="p-6 text-center">
              <p className="text-gray-300 text-sm font-display text-lg italic">¿Qué detalle especial buscas?</p>
            </div>
          )}

          {results.map(p => (
            <Link key={p.id} to={`/producto/${p.id}`} onClick={onClose}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-rose-50 transition-colors group">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-rose-50 flex-shrink-0">
                {p.photo_url
                  ? <img src={p.photo_url} alt={p.nombre} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-lg">🌸</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink line-clamp-1">{p.nombre}</p>
                <p className="text-xs text-rose-400">{p.categoria}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-rose-600">S/ {Number(p.precio_venta).toFixed(2)}</span>
                <ArrowRight size={13} className="text-gray-300 group-hover:text-rose-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
