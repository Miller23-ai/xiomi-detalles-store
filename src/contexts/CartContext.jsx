import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const [items,     setItems]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('xd_cart') || '[]') } catch { return [] }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lastAdded,  setLastAdded]  = useState(null)

  useEffect(() => {
    localStorage.setItem('xd_cart', JSON.stringify(items))
  }, [items])

  const addItem = useCallback((product, qty = 1, nota = '') => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + qty }
        return next
      }
      return [...prev, { ...product, cantidad: qty, nota }]
    })
    setLastAdded(product.id)
    setTimeout(() => setLastAdded(null), 1500)
  }, [])

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) { removeItem(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: qty } : i))
  }, [removeItem])

  const updateNota = useCallback((id, nota) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, nota } : i))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const total     = items.reduce((s, i) => s + (i.precio_venta * i.cantidad), 0)
  const itemCount = items.reduce((s, i) => s + i.cantidad, 0)

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, updateNota, clear,
      total, itemCount, drawerOpen, setDrawerOpen, lastAdded
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
