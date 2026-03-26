import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Eye, ChevronRight, XCircle, MessageCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADOS = ['pendiente','en_proceso','listo','entregado','cancelado']
const LABEL   = { pendiente:'Pendiente', en_proceso:'En proceso', listo:'Listo', entregado:'Entregado', cancelado:'Cancelado' }
const NEXT    = { pendiente:'en_proceso', en_proceso:'listo', listo:'entregado' }

function Modal({ open, onClose, title, children, size='md' }) {
  if (!open) return null
  const sizes = { md:'max-w-xl', lg:'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={e => e.target===e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-display text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}

export default function AdminPedidos() {
  const [pedidos,   setPedidos]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filterEst, setFilterEst] = useState('todos')
  const [view,      setView]      = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('pedidos').select('*, items_pedido(*)')
      .order('created_at', { ascending: false })
    setPedidos(data || [])
    setLoading(false)
  }

  async function changeEstado(id, estado) {
    await supabase.from('pedidos').update({ estado }).eq('id', id)
    load()
    if (view?.id === id) setView(p => ({ ...p, estado }))
  }

  const filtered = pedidos.filter(p => {
    const match = p.cliente_nombre?.toLowerCase().includes(search.toLowerCase())
    const est   = filterEst === 'todos' || p.estado === filterEst
    return match && est
  })

  const conteos = {}
  pedidos.forEach(p => { conteos[p.estado] = (conteos[p.estado]||0)+1 })

  const fmtFecha = d => d ? format(new Date(d+'T12:00:00'), 'd MMM', { locale:es }) : '—'

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['todos',...ESTADOS].map(e => (
            <button key={e} onClick={() => setFilterEst(e)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1
                      ${filterEst===e ? 'bg-rose-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-rose-300'}`}>
              {e==='todos'?'Todos':LABEL[e]}
              {e!=='todos'&&conteos[e] ? <span className={`text-xs rounded-full w-4 h-4 flex items-center justify-center ${filterEst===e?'bg-white/30':'bg-gray-100'}`}>{conteos[e]}</span> : null}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
                 placeholder="Buscar cliente..." className="admin-input pl-8 py-2 w-44 text-xs" />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-rose-50/40">
                {['#','Cliente','Entrega','Total','Saldo','Estado','Acciones'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Cargando...</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No hay pedidos</td></tr>}
              {filtered.map(p => {
                const saldo = Number(p.total) - Number(p.adelanto||0)
                const tel   = p.cliente_telefono?.replace(/\D/g,'')
                const waLink= tel ? `https://wa.me/${tel.startsWith('51')?tel:'51'+tel}` : null
                return (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-rose-50/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">#{p.numero_pedido}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-700">{p.cliente_nombre}</p>
                      {p.cliente_telefono && <p className="text-xs text-gray-400">{p.cliente_telefono}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{fmtFecha(p.fecha_entrega)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">S/ {Number(p.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${saldo>0?'text-amber-600':'text-emerald-600'}`}>
                        S/ {saldo.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className={`badge-${p.estado}`}>{LABEL[p.estado]}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {NEXT[p.estado] && (
                          <button onClick={() => changeEstado(p.id, NEXT[p.estado])} title="Avanzar estado"
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                            <ChevronRight size={14} />
                          </button>
                        )}
                        {!['cancelado','entregado'].includes(p.estado) && (
                          <button onClick={() => changeEstado(p.id,'cancelado')} title="Cancelar"
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                            <XCircle size={14} />
                          </button>
                        )}
                        {waLink && (
                          <a href={waLink} target="_blank" rel="noopener noreferrer"
                             className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all">
                            <MessageCircle size={14} />
                          </a>
                        )}
                        <button onClick={() => setView(p)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Modal open={!!view} onClose={() => setView(null)} title={`Pedido #${view?.numero_pedido}`} size="lg">
        {view && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[['Cliente', view.cliente_nombre], ['Teléfono', view.cliente_telefono||'—'],
                ['Fecha pedido', fmtFecha(view.fecha_pedido)], ['Fecha entrega', fmtFecha(view.fecha_entrega)]].map(([l,v]) => (
                <div key={l} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{l}</p>
                  <p className="font-medium">{v}</p>
                </div>
              ))}
            </div>

            {/* Cambio de estado */}
            <div className="bg-rose-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">Cambiar estado:</p>
              <div className="flex gap-2 flex-wrap">
                {ESTADOS.filter(e=>e!==view.estado).map(e => (
                  <button key={e} onClick={() => changeEstado(view.id, e)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium badge-${e} hover:opacity-80 transition-all`}>
                    {LABEL[e]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Estado actual: <span className={`badge-${view.estado} ml-1`}>{LABEL[view.estado]}</span></p>
            </div>

            {view.items_pedido?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">PRODUCTOS</p>
                {view.items_pedido.map((item,i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                    <div>
                      <p>{item.producto_nombre}</p>
                      {item.notas_personalizacion && <p className="text-xs text-gray-400 italic">{item.notas_personalizacion}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">S/ {Number(item.subtotal).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{item.cantidad} × S/{item.precio_unitario}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-rose-50 rounded-xl p-3 space-y-1">
              <div className="flex justify-between"><span className="text-gray-600">Total</span><span className="font-bold text-rose-600">S/ {Number(view.total).toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Adelanto</span><span>S/ {Number(view.adelanto||0).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold border-t border-rose-200 pt-1">
                <span>Saldo pendiente</span>
                <span className="text-amber-600">S/ {(Number(view.total)-Number(view.adelanto||0)).toFixed(2)}</span>
              </div>
            </div>
            {view.notas && <div className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-1">Notas</p><p>{view.notas}</p></div>}
          </div>
        )}
      </Modal>
    </div>
  )
}
