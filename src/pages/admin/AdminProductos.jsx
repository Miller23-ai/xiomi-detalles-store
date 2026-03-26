import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Pencil, Trash2, Search, Image, Upload, X, Eye, EyeOff } from 'lucide-react'
import imageCompression from 'browser-image-compression'

const empty = { nombre:'', descripcion:'', categoria:'', precio_venta:'', costo_estimado:'', stock:'0', activo:true, photo_url:'' }

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-display text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">{children}</div>
      </div>
    </div>
  )
}

export default function AdminProductos() {
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState(empty)
  const [saving,     setSaving]     = useState(false)
  const [photoFile,  setPhotoFile]  = useState(null)
  const [preview,    setPreview]    = useState(null)
  const fileRef = useRef()

  useEffect(() => { fetch(); fetchCats() }, [])

  async function fetch() {
    setLoading(true)
    const { data } = await supabase.from('productos').select('*').order('nombre')
    setProductos(data || [])
    setLoading(false)
  }

  async function fetchCats() {
    const { data } = await supabase.from('categorias').select('nombre').eq('tipo','producto').order('nombre')
    setCategorias(data?.map(c => c.nombre) || [])
  }

  function openNew()   { setEditing(null); setForm({ ...empty, categoria: categorias[0]||'' }); setPhotoFile(null); setPreview(null); setModal(true) }
  function openEdit(p) {
    setEditing(p.id)
    setForm({ nombre:p.nombre, descripcion:p.descripcion||'', categoria:p.categoria||'', precio_venta:p.precio_venta, costo_estimado:p.costo_estimado||0, stock:p.stock||0, activo:p.activo, photo_url:p.photo_url||'' })
    setPhotoFile(null); setPreview(p.photo_url||null); setModal(true)
  }

  function onPhoto(e) {
    const f = e.target.files?.[0]; if (!f) return
    setPhotoFile(f); setPreview(URL.createObjectURL(f))
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...form, precio_venta:Number(form.precio_venta)||0, costo_estimado:Number(form.costo_estimado)||0, stock:Number(form.stock)||0 }
    let id = editing
    if (editing) {
      await supabase.from('productos').update(payload).eq('id', editing)
    } else {
      const { data } = await supabase.from('productos').insert(payload).select().single()
      id = data?.id
    }
    if (id && photoFile) {
      let fileToUpload = photoFile
      try {
        const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true }
        fileToUpload = await imageCompression(photoFile, options)
      } catch (error) {
        console.error('Error comprimiendo la imagen:', error)
      }
      
      const ext = photoFile.name.split('.').pop()
      await supabase.storage.from('productos').upload(`${id}.${ext}`, fileToUpload, { upsert:true })
      const { data:{ publicUrl } } = supabase.storage.from('productos').getPublicUrl(`${id}.${ext}`)
      await supabase.from('productos').update({ photo_url: publicUrl }).eq('id', id)
    }
    setSaving(false); setModal(false); fetch()
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar producto?')) return
    await supabase.from('productos').delete().eq('id', id)
    fetch()
  }

  async function toggleActivo(p) {
    await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id)
    fetch()
  }

  const filtered = productos.filter(p => p.nombre?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: productos.length },
          { label: 'Activos', value: productos.filter(p=>p.activo).length },
          { label: 'Precio promedio', value: `S/ ${productos.length ? (productos.reduce((s,p)=>s+p.precio_venta,0)/productos.length).toFixed(0) : 0}` },
        ].map(s => (
          <div key={s.label} className="admin-card text-center">
            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
                 className="admin-input pl-10 py-2 w-52 text-xs" />
        </div>
        <button onClick={openNew} className="admin-btn"><Plus size={14} /> Nuevo producto</button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_,i) => <div key={i} className="skeleton aspect-[3/4] rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => {
            const margen = p.costo_estimado && p.precio_venta
              ? Math.round(((p.precio_venta - p.costo_estimado) / p.precio_venta) * 100) : null
            return (
              <div key={p.id} className={`admin-card p-0 overflow-hidden group ${!p.activo ? 'opacity-60' : ''}`}>
                <div className="relative aspect-[4/3] bg-rose-50 overflow-hidden">
                  {p.photo_url
                    ? <img src={p.photo_url} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Image size={32} className="text-rose-200" /></div>}
                  <span className="absolute top-2 left-2 text-xs bg-white/90 text-rose-600 px-2 py-0.5 rounded-full font-medium">{p.categoria}</span>
                  {!p.activo && <span className="absolute top-2 right-2 text-xs bg-gray-800/70 text-white px-2 py-0.5 rounded-full">Inactivo</span>}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{p.nombre}</p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display text-base font-semibold text-rose-600">S/ {Number(p.precio_venta).toFixed(2)}</p>
                    {margen !== null && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${margen >= 40 ? 'bg-emerald-100 text-emerald-700' : margen >= 20 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>
                        {margen}%
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 pt-2 border-t border-gray-100">
                    <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 text-xs py-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                      <Pencil size={11} /> Editar
                    </button>
                    <button onClick={() => toggleActivo(p)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title={p.activo ? 'Desactivar' : 'Activar'}>
                      {p.activo ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <div className="space-y-4">
          {/* Photo */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Foto</label>
            {preview ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-rose-50">
                <img src={preview} className="w-full h-full object-cover" alt="preview" />
                <button onClick={() => { setPhotoFile(null); setPreview(null); setForm(p=>({...p,photo_url:''})) }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                  <X size={13} />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                      className="w-full h-28 border-2 border-dashed border-rose-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:bg-rose-50 transition-colors cursor-pointer">
                <Upload size={18} className="text-rose-300" />
                <p className="text-xs text-gray-400">Subir foto (máx. 5MB)</p>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
            <input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} className="admin-input" placeholder="Nombre del producto" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e=>setForm(p=>({...p,descripcion:e.target.value}))} className="admin-input resize-none" rows={2} placeholder="Descripción del producto..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Categoría</label>
              <select value={form.categoria} onChange={e=>setForm(p=>({...p,categoria:e.target.value}))} className="admin-select">
                {categorias.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))} className="admin-input" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Precio venta (S/) *</label>
              <input type="number" value={form.precio_venta} onChange={e=>setForm(p=>({...p,precio_venta:e.target.value}))} className="admin-input" step="0.50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Costo estimado (S/)</label>
              <input type="number" value={form.costo_estimado} onChange={e=>setForm(p=>({...p,costo_estimado:e.target.value}))} className="admin-input" step="0.50" />
            </div>
          </div>
          {form.precio_venta && form.costo_estimado && (
            <div className="bg-emerald-50 rounded-xl p-3 text-sm">
              Ganancia: <span className="font-bold text-emerald-600">S/ {(Number(form.precio_venta)-Number(form.costo_estimado)).toFixed(2)}</span>
              <span className="text-gray-400 ml-2">({(((Number(form.precio_venta)-Number(form.costo_estimado))/Number(form.precio_venta))*100).toFixed(0)}%)</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" id="activo" checked={form.activo} onChange={e=>setForm(p=>({...p,activo:e.target.checked}))} className="rounded" />
            <label htmlFor="activo" className="text-xs text-gray-600">Producto activo (visible en la tienda)</label>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-all">Cancelar</button>
            <button onClick={handleSave} disabled={saving || !form.nombre || !form.precio_venta} className="admin-btn px-5">
              {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
