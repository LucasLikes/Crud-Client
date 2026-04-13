import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { DrawerProvider } from './context/DrawerContext.jsx'
import { testBearerToken } from './utils/testBearer.js'

// Disponibilizar função de teste no console
window.testBearerToken = testBearerToken

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <DrawerProvider>
        <App />
      </DrawerProvider>
    </AuthProvider>
  </StrictMode>,
)
