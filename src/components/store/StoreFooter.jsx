import { Heart, MessageCircle, Instagram } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STORE_NAME, STORE_WA } from '../../lib/supabase'

export default function StoreFooter() {
  return (
    <footer className="bg-ink text-white/70 mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center">
                <Heart size={13} className="text-white fill-white" />
              </div>
              <span className="font-display text-xl text-white">{STORE_NAME}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50">
              Creamos detalles personalizados únicos para tus momentos más especiales.
              Cada regalo hecho con amor y dedicación.
            </p>
            <div className="flex gap-3 mt-6">
              <a href={`https://wa.me/${STORE_WA}`} target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-all">
                <MessageCircle size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-rose-500 hover:to-purple-600 flex items-center justify-center transition-all">
                <Instagram size={15} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-white text-base mb-4">Tienda</h4>
            <ul className="space-y-2 text-sm">
              {[['/', 'Inicio'], ['/catalogo', 'Catálogo completo'], ['/nosotras', 'Nosotras']].map(([to, label]) => (
                <li key={to}><Link to={to} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-white text-base mb-4">Contacto</h4>
            <p className="text-sm mb-4">¿Tienes dudas o quieres un detalle personalizado?</p>
            <a href={`https://wa.me/${STORE_WA}`} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all">
              <MessageCircle size={15} />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} {STORE_NAME}. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">Hecho con <Heart size={10} className="fill-rose-400 text-rose-400" /> en Perú</p>
        </div>
      </div>
    </footer>
  )
}
