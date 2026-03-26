// AdminClientes.jsx
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, Eye, Phone, Mail, X, MessageCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const LABEL = { pendiente:'Pendiente', en_proceso:'En proceso', listo:'Listo', entregado:'Entregado', cancelado:'Cancelado' }

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-display text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}

export function AdminClientes() {
  const [clientes, setClientes] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [hist,     setHist]     = useState(null)
  const [histData, setHistData] = useState([])
  const [histLoad, setHistLoad] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('clientes').select('*').order('nombre')
    setClientes(data || [])
    setLoading(false)
  }

  async function openHist(c) {
    setHist(c); setHistLoad(true)
    const { data } = await supabase.from('pedidos').select('*, items_pedido(*)')
      .eq('cliente_id', c.id).order('created_at', { ascending:false })
    setHistData(data || []); setHistLoad(false)
  }

  const filtered = clientes.filter(c =>
    c.nombre?.toLowerCase().includes(search.toLowerCase()) || c.telefono?.includes(search)
  )

  const getStats = (pedidos) => ({
    total:     pedidos.filter(p=>p.estado==='entregado').reduce((s,p)=>s+Number(p.total),0),
    count:     pedidos.length,
    entregados:pedidos.filter(p=>p.estado==='entregado').length,
  })

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente..."
               className="admin-input pl-8 py-2 text-xs" />
      </div>

      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-rose-50/40">
              {['Cliente','Contacto','Desde','Acciones'].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">Cargando...</td></tr>}
            {filtered.map(c => (
              <tr key={c.id} className="border-b border-gray-50 hover:bg-rose-50/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs flex-shrink-0">
                      {c.nombre?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{c.nombre}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.telefono && <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10}/>{c.telefono}</p>}
                  {c.email    && <p className="text-xs text-gray-400 flex items-center gap-1"><Mail  size={10}/>{c.email}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {format(new Date(c.created_at), 'd MMM yyyy', { locale:es })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {c.telefono && (
                      <a href={`https://wa.me/51${c.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                         className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all">
                        <MessageCircle size={14} />
                      </a>
                    )}
                    <button onClick={() => openHist(c)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                      <Eye size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!hist} onClose={() => setHist(null)} title={`Historial — ${hist?.nombre}`}>
        {histLoad ? (
          <div className="flex justify-center py-8"><div className="w-7 h-7 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {(() => { const s = getStats(histData); return (
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-rose-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-rose-600">{s.count}</p>
                  <p className="text-xs text-gray-400">Pedidos</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-600">{s.entregados}</p>
                  <p className="text-xs text-gray-400">Entregados</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-amber-600">S/ {s.total.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">Total gastado</p>
                </div>
              </div>
            )})()}
            <div className="space-y-2">
              {histData.map(p => (
                <div key={p.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">#{p.numero_pedido}</span>
                      <span className={`badge-${p.estado}`}>{LABEL[p.estado]}</span>
                    </div>
                    <span className="font-bold text-gray-700">S/ {Number(p.total).toFixed(2)}</span>
                  </div>
                  {p.items_pedido?.map((i,idx) => (
                    <p key={idx} className="text-xs text-gray-400">• {i.producto_nombre} ×{i.cantidad}</p>
                  ))}
                </div>
              ))}
              {histData.length === 0 && <p className="text-center text-gray-400 text-sm py-6">Sin pedidos</p>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// AdminReportes.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format as fmtDate, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { es as esLocale } from 'date-fns/locale'
import { Table, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function AdminReportes() {
  const [data,    setData]    = useState([])
  const [period,  setPeriod]  = useState(6)
  const [loading, setLoading] = useState(true)
  const [totals,  setTotals]  = useState({})

  useEffect(() => { loadData() }, [period])

  async function loadData() {
    setLoading(true)
    const months = Array.from({ length:period }, (_,i) => {
      const d = subMonths(new Date(), period-1-i)
      return { label:fmtDate(d,'MMM yyyy',{locale:esLocale}), short:fmtDate(d,'MMM',{locale:esLocale}), start:fmtDate(startOfMonth(d),'yyyy-MM-dd'), end:fmtDate(endOfMonth(d),'yyyy-MM-dd') }
    })
    const rows = await Promise.all(months.map(async m => {
      const [{ data:p },{ data:c },{ data:g }] = await Promise.all([
        supabase.from('pedidos').select('total').eq('estado','entregado').gte('fecha_pedido',m.start).lte('fecha_pedido',m.end),
        supabase.from('compras').select('total').gte('fecha',m.start).lte('fecha',m.end),
        supabase.from('gastos').select('monto').gte('fecha',m.start).lte('fecha',m.end),
      ])
      const v = (p||[]).reduce((s,x)=>s+Number(x.total),0)
      const mat = (c||[]).reduce((s,x)=>s+Number(x.total),0)
      const otr = (g||[]).reduce((s,x)=>s+Number(x.monto),0)
      return { mes:m.short, mesCompleto:m.label, ventas:v, materiales:mat, otros:otr, ganancia:v-mat-otr }
    }))
    setData(rows)
    setTotals(rows.reduce((a,m)=>({ ventas:(a.ventas||0)+m.ventas, materiales:(a.materiales||0)+m.materiales, otros:(a.otros||0)+m.otros, ganancia:(a.ganancia||0)+m.ganancia }),{}))
    setLoading(false)
  }

  function exportXLSX() {
    const ws = XLSX.utils.json_to_sheet(data.map(m=>({ Mes:m.mesCompleto, Ventas:m.ventas.toFixed(2), Materiales:m.materiales.toFixed(2), Otros:m.otros.toFixed(2), Ganancia:m.ganancia.toFixed(2) })))
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Reporte')
    XLSX.writeFile(wb,`xiomi-reporte-${fmtDate(new Date(),'yyyy-MM')}.xlsx`)
  }

  function exportPDF() {
    const doc = new jsPDF()
    doc.setFillColor(194,24,91); doc.rect(0,0,210,28,'F')
    doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold')
    doc.text('Xiomi Detalles — Reporte Financiero',15,18)
    autoTable(doc,{
      startY:35,
      head:[['Mes','Ventas','Materiales','Otros','Ganancia']],
      body:data.map(m=>[m.mesCompleto,`S/${m.ventas.toFixed(2)}`,`S/${m.materiales.toFixed(2)}`,`S/${m.otros.toFixed(2)}`,`S/${m.ganancia.toFixed(2)}`]),
      headStyles:{ fillColor:[194,24,91] },
      alternateRowStyles:{ fillColor:[255,248,252] },
    })
    doc.save(`xiomi-reporte-${fmtDate(new Date(),'yyyy-MM')}.pdf`)
  }

  const fmt = v => `S/ ${Number(v||0).toFixed(2)}`

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {[3,6,12].map(m=>(
            <button key={m} onClick={()=>setPeriod(m)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${period===m?'bg-rose-600 text-white':'bg-white border border-gray-200 text-gray-500 hover:border-rose-300'}`}>
              {m} meses
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={exportXLSX} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-600 transition-all bg-white">
            <Table size={13} className="text-emerald-500" /> Excel
          </button>
          <button onClick={exportPDF} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-600 transition-all bg-white">
            <FileText size={13} className="text-red-500" /> PDF
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['Ventas','green',totals.ventas],['Materiales','amber',totals.materiales],['Otros gastos','purple',totals.otros],['Ganancia neta','rose',totals.ganancia]].map(([l,c,v])=>(
          <div key={l} className={`admin-card border-l-4 ${c==='green'?'border-emerald-400':c==='amber'?'border-amber-400':c==='purple'?'border-purple-400':'border-rose-500'}`}>
            <p className="text-xs text-gray-400 mb-1">{l}</p>
            <p className={`text-xl font-bold ${c==='green'?'text-emerald-600':c==='amber'?'text-amber-600':c==='purple'?'text-purple-600':'text-rose-600'}`}>{fmt(v)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="admin-card">
        <h3 className="font-display text-base text-gray-700 mb-4">Ventas vs Gastos por mes</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fce4ec" />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:'#9ca3af' }} />
            <YAxis tick={{ fontSize:11, fill:'#9ca3af' }} tickFormatter={v=>`S/${v}`} />
            <Tooltip formatter={(v,n)=>[`S/ ${Number(v).toFixed(2)}`, n==='ventas'?'Ventas':n==='materiales'?'Materiales':n==='otros'?'Otros':'Ganancia']} />
            <Legend />
            <Bar dataKey="ventas"     name="Ventas"     fill="#e91e63" radius={[4,4,0,0]} />
            <Bar dataKey="materiales" name="Materiales" fill="#fbbf24" radius={[4,4,0,0]} />
            <Bar dataKey="ganancia"   name="Ganancia"   fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="admin-card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-rose-50/40">
              {['Mes','Ventas','Materiales','Otros','Ganancia','Margen'].map(h=>(
                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Cargando...</td></tr>
              : data.map((m,i)=>{
                  const mg = m.ventas>0?((m.ganancia/m.ventas)*100).toFixed(0):0
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-rose-50/10">
                      <td className="px-4 py-3 text-sm text-gray-700 capitalize">{m.mesCompleto}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{fmt(m.ventas)}</td>
                      <td className="px-4 py-3 text-sm text-amber-600">{fmt(m.materiales)}</td>
                      <td className="px-4 py-3 text-sm text-purple-600">{fmt(m.otros)}</td>
                      <td className={`px-4 py-3 text-sm font-bold ${m.ganancia>=0?'text-emerald-600':'text-red-500'}`}>{fmt(m.ganancia)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${Number(mg)>=40?'bg-emerald-100 text-emerald-700':Number(mg)>=20?'bg-amber-100 text-amber-700':'bg-red-100 text-red-600'}`}>{mg}%</span>
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

// AdminConfig.jsx
import { Save, CheckCircle2 } from 'lucide-react'

export function AdminConfig() {
  const [config,  setConfig]  = useState({})
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)

  useEffect(() => { loadConfig() }, [])

  async function loadConfig() {
    setLoading(true)
    const { data } = await supabase.from('configuracion').select('*')
    const map = {}; (data||[]).forEach(r=>{map[r.clave]=r.valor||''})
    setConfig(map); setLoading(false)
  }

  async function save() {
    setSaving(true)
    for (const [clave,valor] of Object.entries(config)) {
      await supabase.from('configuracion').upsert({clave,valor},{onConflict:'clave'})
    }
    setSaving(false); setSaved(true); setTimeout(()=>setSaved(false),3000)
  }

  const s = (k,v) => setConfig(p=>({...p,[k]:v}))

  if (loading) return <div className="flex justify-center py-12"><div className="w-7 h-7 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" /></div>

  return (
    <div className="max-w-2xl space-y-5">
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm px-4 py-3 rounded-xl border border-emerald-200">
          <CheckCircle2 size={15} /> Guardado correctamente
        </div>
      )}
      <div className="admin-card space-y-4">
        <h3 className="font-display text-lg text-gray-700 border-b border-gray-100 pb-3">Negocio</h3>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre del negocio</label>
          <input value={config.negocio_nombre||''} onChange={e=>s('negocio_nombre',e.target.value)} className="admin-input" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono WhatsApp</label>
          <input value={config.whatsapp_telefono||''} onChange={e=>s('whatsapp_telefono',e.target.value)} className="admin-input" placeholder="999888777" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Saldo inicial de caja (S/)</label>
          <input type="number" value={config.saldo_inicial||'0'} onChange={e=>s('saldo_inicial',e.target.value)} className="admin-input" />
        </div>
      </div>

      <div className="admin-card space-y-4">
        <h3 className="font-display text-lg text-gray-700 border-b border-gray-100 pb-3">Mensaje WhatsApp para pedidos</h3>
        <textarea value={config.whatsapp_mensaje_entrega||''} onChange={e=>s('whatsapp_mensaje_entrega',e.target.value)}
                  className="admin-input resize-none font-mono text-xs" rows={4} />
        <div className="flex gap-2 flex-wrap">
          {['{cliente}','{total}','{saldo}','{fecha_entrega}'].map(v=>(
            <button key={v} onClick={()=>s('whatsapp_mensaje_entrega',(config.whatsapp_mensaje_entrega||'')+v)}
                    className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200 hover:bg-green-100">{v}</button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving}
                className="admin-btn px-6 py-2.5">
          <Save size={14} /> {saving?'Guardando...':'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
