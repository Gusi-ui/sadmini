# Sistema de Notificaciones Push - Worker PWA

## Implementación Completada

Se ha implementado un sistema completo de notificaciones push para la aplicación Worker PWA del sistema de cuidado domiciliario.

## Archivos Creados/Modificados

### Archivos PWA Core
- `public/manifest.json` - Configuración PWA con metadatos y iconos
- `public/sw.js` - Service Worker con soporte para push notifications y cache
- `index.html` - Meta tags PWA y enlaces a manifest

### Hooks React
- `src/hooks/usePushNotifications.ts` - Hook para gestión de notificaciones push
- `src/hooks/useServiceWorker.ts` - Hook para gestión del service worker

### Componentes
- `src/components/PushNotificationManager.tsx` - Componente UI para gestión de notificaciones
- `src/components/ui/` - Componentes UI copiados desde admin-web

### Configuración
- `src/main.tsx` - Registro automático del service worker
- `src/App.tsx` - Integración del componente de notificaciones
- `src/lib/` - Utilidades copiadas desde admin-web

### Iconos
- `public/icons/icon.svg` - Icono principal SVG
- `public/icons/icon-*.png` - Iconos en diferentes tamaños

## Funcionalidades Implementadas

### ✅ Service Worker
- Registro automático al cargar la aplicación
- Cache de recursos para funcionamiento offline
- Manejo de eventos push
- Sincronización en background

### ✅ Push Notifications
- Solicitud de permisos de notificación
- Suscripción/desuscripción a notificaciones
- Envío de notificaciones de prueba
- Manejo de clics en notificaciones
- Integración con VAPID keys

### ✅ PWA Features
- Manifest.json configurado
- Iconos en múltiples tamaños
- Meta tags para instalación
- Soporte para iOS y Android

## Configuración Requerida

### Variables de Entorno
```env
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key_here
VITE_API_BASE_URL=your_api_base_url_here
```

### Backend API Endpoints
El sistema espera estos endpoints en el backend:
- `POST /api/push/subscribe` - Guardar suscripción
- `DELETE /api/push/unsubscribe` - Eliminar suscripción
- `POST /api/push/send-test` - Enviar notificación de prueba

## Uso

1. **Permisos**: El usuario debe otorgar permisos de notificación
2. **Suscripción**: La aplicación se suscribe automáticamente al servicio push
3. **Notificaciones**: Se pueden enviar desde el backend o probar desde la UI
4. **Instalación**: La aplicación se puede instalar como PWA nativa

## Próximos Pasos

- [ ] Implementar el backend para manejo de suscripciones
- [ ] Configurar VAPID keys en producción
- [ ] Integrar con sistema de notificaciones del admin
- [ ] Añadir notificaciones programadas
- [ ] Implementar categorías de notificaciones

## Testing

Para probar las notificaciones:
1. Abrir la aplicación en `http://localhost:5173/`
2. Permitir notificaciones cuando se solicite
3. Usar el botón "Enviar Notificación de Prueba"
4. Verificar que la notificación aparece en el sistema

## Notas Técnicas

- Las notificaciones requieren HTTPS en producción
- El service worker se registra automáticamente
- Los iconos son SVG escalables para mejor rendimiento
- Compatible con todos los navegadores modernos
- Soporte completo para instalación PWA