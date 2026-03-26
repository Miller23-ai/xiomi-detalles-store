import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { TrendingUp, ShoppingBag, Users, Package, AlertTriangle, Clock, ChevronRight, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, subDays, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

const ESTADO_COLORS = { pendiente:'#f59e0b', en_proceso:'#3b82f6', listo:'#10b981', entregado:'#6b7280', cancelado:'#ef4444' }
const ESTADO_LABEL  = { pendiente:'Pendiente', en_proceso:'En proceso', listo:'Listo', entregado:'Entregado', cancelado:'Cancelado' }

function KpiCard({ label, value, sub, icon: Icon, color = 'rose' }) {
  const colors = {
    rose:   'bg-rose-50 text-rose-600 ring-rose-100',
    green:  'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber:  'bg-amber-50 text-amber-600 ring-amber-100',
    blue:   'bg-blue-50 text-blue-600 ring-blue-100',
    red:    'bg-red-50 text-red-600 ring-red-100',
  }
  return (
    <div className="admin-card flex items-start gap-4 hover:-translate-y-0.5 transition-transform">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ${colors[color]}`}>
        <Icon size={19} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({})
  const [chart,   setChart]   = useState([])
  const [pie,     setPie]     = useState([])
  const [recent,  setRecent]  = useState([])
  const [lowStock,setLowStock]= useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true); setError(null)
    try {
      const hoy   = new Date()
      const inicio = format(startOfMonth(hoy), 'yyyy-MM-dd')
      const last7  = Array.from({ length: 7 }, (_, i) => format(subDays(hoy, 6-i), 'yyyy-MM-dd'))

      const [
        { data: pedidosMes },
        { data: ventasDias },
        { data: allPedidos },
        { data: clientes },
        { data: productos },
        { data: allMat },
        { data: recentPed },
      ] = await Promise.all([
        supabase.from('pedidos').select('total,estado,adelanto').gte('fecha_pedido', inicio),
        supabase.from('pedidos').select('total,fecha_pedido').eq('estado','entregado').gte('fecha_pedido', last7[0]),
        supabase.from('pedidos').select('estado').not('estado','eq','entregado'),
        supabase.from('clientes').select('id', { count:'exact', head:true }),
        supabase.from('productos').select('id', { count:'exact', head:true }).eq('activo',true),
        supabase.from('materiales').select('nombre,stock_actual,stock_minimo,unidad'),
        supabase.from('pedidos').select('*').order('created_at',{ ascending:false }).limit(5),
      ])

      const ventas   = (pedidosMes||[]).filter(p=>p.estado==='entregado').reduce((s,p)=>s+Number(p.total),0)
      const activos  = (pedidosMes||[]).filter(p=>!['entregado','cancelado'].includes(p.estado)).length
      const porCobrar= (pedidosMes||[]).filter(p=>!['entregado','cancelado'].includes(p.estado))
                         .reduce((s,p)=>s+(Number(p.total)-Number(p.adelanto||0)),0)

      setStats({ ventas, activos, clientes: clientes?.length || 0, productos: productos?.length || 0, porCobrar })

      setChart(last7.map(dia => ({
        dia: format(new Date(dia+'T12:00:00'), 'EEE', { locale:es }),
        ventas: (ventasDias||[]).filter(p=>p.fecha_pedido===dia).reduce((s,p)=>s+Number(p.total),0)
      })))

      const counts = {}
      ;(allPedidos||[]).forEach(p => { counts[p.estado]=(counts[p.estado]||0)+1 })
      setPie(Object.entries(counts).map(([name,value])=>({ name, value })))

      setRecent(recentPed||[])
      setLowStock((allMat||[]).filter(m=>Number(m.stock_actual)<=Number(m.stock_minimo)).slice(0,5))
    } catch(e) { setError(e.message) }
    finally { setLoading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-9 h-9 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertTriangle size={32} className="text-red-400" />
      <p className="text-red-600 text-sm">{error}</p>
      <button onClick={load} className="admin-btn"><RefreshCw size={13} /> Reintentar</button>
    </div>
  )

  const fmt = v => `S/ ${Number(v||0).toFixed(2)}`

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ventas del mes" value={fmt(stats.ventas)}  icon={TrendingUp} color="green" />
        <KpiCard label="Pedidos activos" value={stats.activos||0}  icon={ShoppingBag} color="amber" />
        <KpiCard label="Por cobrar"      value={fmt(stats.porCobrar)} icon={Clock}  color="rose" />
        <KpiCard label="Clientes"        value={stats.clientes||0} icon={Users} color="blue" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="admin-card lg:col-span-2">
          <h3 className="font-display text-base text-gray-700 mb-4">Ventas — últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#e91e63" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#e91e63" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
              <XAxis dataKey="dia" tick={{ fontSize:11, fill:'#9ca3af' }} />
              <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} tickFormatter={v=>`S/${v}`} />
              <Tooltip formatter={v=>[`S/ ${Number(v).toFixed(2)}`,'Ventas']} />
              <Area type="monotone" dataKey="ventas" stroke="#e91e63" strokeWidth={2} fill="url(#roseGrad)" dot={{ fill:'#e91e63', r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card">
          <h3 className="font-display text-base text-gray-700 mb-4">Estado pedidos</h3>
          {pie.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pie} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value">
                  {pie.map((e, i) => <Cell key={i} fill={ESTADO_COLORS[e.name]||'#e91e63'} />)}
                </Pie>
                <Tooltip formatter={(v,n)=>[v, ESTADO_LABEL[n]||n]} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 text-sm py-16">Sin pedidos activos</p>}
        </div>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pedidos recientes */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base text-gray-700">Pedidos recientes</h3>
            <Link to="/admin/pedidos" className="text-xs text-rose-500 hover:underline flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {recent.length === 0 && <p className="text-gray-400 text-sm text-center py-6">Sin pedidos</p>}
            {recent.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs flex-shrink-0">
                  {p.cliente_nombre?.[0]?.toUpperCase() || '#'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{p.cliente_nombre}</p>
                  <p className="text-xs text-gray-400">#{p.numero_pedido}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-700">S/ {Number(p.total).toFixed(2)}</p>
                  <span className={`badge-${p.estado}`}>{ESTADO_LABEL[p.estado]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock bajo */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-base text-gray-700">Stock bajo ⚠️</h3>
          </div>
          {lowStock.length === 0 ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 rounded-xl px-4 py-3 text-sm">
              <Package size={15} /> Todo el inventario está en orden
            </div>
          ) : lowStock.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 bg-red-50 rounded-xl mb-2">
              <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{m.nombre}</p>
                <p className="text-xs text-red-500">{m.stock_actual} / {m.stock_minimo} {m.unidad}</p>
              </div>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">Reponer</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
