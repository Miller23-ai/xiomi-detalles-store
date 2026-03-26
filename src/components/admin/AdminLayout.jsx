import { NavLink, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag,
  BarChart2, LogOut, ChevronRight, Heart, X, Settings, ExternalLink
} from 'lucide-react'

const links = [
  { to: '/admin',          label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/admin/pedidos',  label: 'Pedidos',     icon: ShoppingBag },
  { to: '/admin/productos',label: 'Productos',   icon: Package },
  { to: '/admin/clientes', label: 'Clientes',    icon: Users },
  null,
  { to: '/admin/reportes', label: 'Reportes',    icon: BarChart2 },
  { to: '/admin/config',   label: 'Configuración',icon: Settings },
]

export function AdminSidebar({ open, onClose }) {
  const { signOut, user } = useAuth()
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={`
        fixed top-0 left-0 h-full w-60 z-30 flex flex-col
        transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ background: 'linear-gradient(180deg,#1a0a0f 0%,#2d0f1a 100%)' }}>

        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg,#e91e63,#880e4f)' }}>
              <Heart size={16} className="text-white fill-white" />
            </div>
            <div className="flex-1">
              <p className="font-display text-white text-base leading-tight">Xiomi Detalles</p>
              <p className="text-white/30 text-xs">Panel Admin</p>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/30 hover:text-white"><X size={16} /></button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map((link, i) => {
            if (!link) return <div key={i} className="my-2 border-t border-white/10" />
            const Icon = link.icon
            return (
              <NavLink key={link.to} to={link.to} end={link.to === '/admin'} onClick={onClose}
                       className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={16} />
                <span className="flex-1">{link.label}</span>
                <ChevronRight size={12} className="opacity-30" />
              </NavLink>
            )
          })}

          <div className="my-2 border-t border-white/10" />
          <Link to="/" target="_blank"
                className="admin-sidebar-link text-white/30 hover:text-white/60">
            <ExternalLink size={16} />
            <span className="flex-1">Ver tienda</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 mb-2">
            <div className="w-7 h-7 rounded-full bg-rose-600/40 flex items-center justify-center text-white text-xs font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <p className="text-white/50 text-xs truncate">{user?.email}</p>
          </div>
          <button onClick={signOut}
                  className="admin-sidebar-link w-full text-red-400/60 hover:text-red-400 hover:bg-red-900/20">
            <LogOut size={16} /> <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'

const TITLES = {
  '/admin':           'Dashboard',
  '/admin/pedidos':   'Pedidos',
  '/admin/productos': 'Productos',
  '/admin/clientes':  'Clientes',
  '/admin/reportes':  'Reportes',
  '/admin/config':    'Configuración',
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const title = TITLES[loc.pathname] || 'Admin'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-4 flex-shrink-0">
          <button className="lg:hidden text-gray-400 hover:text-rose-600 transition-colors" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <h1 className="font-display text-xl text-gray-800 flex-1">{title}</h1>
          <Link to="/" target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-600 transition-colors border border-gray-200 hover:border-rose-200 px-3 py-1.5 rounded-full">
            <ExternalLink size={12} /> Ver tienda
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
