import { createContext, useContext, useState } from 'react'

/**
 * Context para gerenciar estado do drawer (menu lateral)
 * Compartilha entre Drawer e AppLayout para sincronizar layout
 */
const DrawerContext = createContext({
  isExpanded: true,
  toggleExpanded: () => {},
})

export function DrawerProvider({ children }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  return (
    <DrawerContext.Provider value={{ isExpanded, toggleExpanded }}>
      {children}
    </DrawerContext.Provider>
  )
}

export function useDrawer() {
  const context = useContext(DrawerContext)
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider')
  }
  return context
}
