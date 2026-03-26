import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Lock, Mail, AlertCircle, Heart } from 'lucide-react'

export default function AdminLogin() {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await signIn(email, password)
    if (error) setError('Correo o contraseña incorrectos.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ink via-ink/95 to-rose-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-900/50">
            <Heart size={26} className="text-white fill-white" />
          </div>
          <h1 className="font-display text-3xl text-white mb-1">Panel Admin</h1>
          <p className="text-white/40 text-sm">Xiomi Detalles</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Correo</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                       className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500"
                       placeholder="admin@ejemplo.com" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                       className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-rose-500"
                       placeholder="••••••••" required />
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 text-red-400 text-xs px-3 py-2.5 rounded-xl border border-red-500/20">
                <AlertCircle size={13} /> {error}
              </div>
            )}
            <button type="submit" disabled={loading}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-900/50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Ingresar'}
            </button>
          </form>
        </div>
        <p className="text-center text-white/20 text-xs mt-6">
          <a href="/" className="hover:text-white/40 transition-colors">← Volver a la tienda</a>
        </p>
      </div>
    </div>
  )
}
