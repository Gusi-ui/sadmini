import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registrado con éxito:', registration)
      })
      .catch((registrationError) => {
        console.log('SW registro falló:', registrationError)
      })
  })
}

// Detectar si la app se puede instalar
let deferredPrompt: any

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir que Chrome 67 y anteriores muestren automáticamente el prompt
  e.preventDefault()
  // Guardar el evento para que se pueda activar más tarde
  deferredPrompt = e
  
  console.log('PWA se puede instalar')
})

window.addEventListener('appinstalled', (evt) => {
  console.log('PWA fue instalada', evt)
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)