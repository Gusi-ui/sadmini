# Guía de Despliegue en Producción

## 🚀 Aplicaciones del Sistema

Este sistema consta de tres aplicaciones independientes:

1. **Admin Panel** (`admin-web/`) - Panel de administración
2. **Worker PWA** (`worker-pwa/`) - Aplicación para trabajadoras
3. **PWA Trabajadoras Mataró** (`mataro-trabajadoras-pwa/`) - PWA específica para Mataró

## 📋 Variables de Entorno Requeridas

### Supabase (Obligatorias)
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-clave-servicio (solo admin-web)
```

### Configuración de Aplicaciones
```
VITE_APP_NAME=Nombre de la aplicación
VITE_APP_VERSION=1.0.0
VITE_MUNICIPALITY=Mataró (solo mataro-trabajadoras-pwa)
VITE_ENABLE_NOTIFICATIONS=true
```

### URLs de Interconexión
```
VITE_PWA_URL=https://trabajadoras.cuidado-domestico.com
VITE_ADMIN_URL=https://admin.cuidado-domestico.com
```

## 🔧 Despliegue en Vercel

### Opción 1: Despliegue Automático (Recomendado)

1. **Conectar cada aplicación por separado**:
   - Ve a [vercel.com](https://vercel.com)
   - Clic en "New Project"
   - Importa tu repositorio
   - Selecciona el directorio raíz correspondiente:
     - `admin-web/` para el panel de administración
     - `worker-pwa/` para la aplicación de trabajadoras
     - `mataro-trabajadoras-pwa/` para la PWA de Mataró

2. **Configurar Build Settings**:
   ```
   Framework Preset: Vite
   Root Directory: [directorio-correspondiente]
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

3. **Variables de Entorno**:
   - Ve a Settings > Environment Variables
   - Añade todas las variables requeridas para cada aplicación

4. **Deploy**:
   - Haz clic en "Deploy"
   - Vercel detectará automáticamente el archivo `vercel.json`

### Opción 2: Vercel CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Para cada aplicación:
cd admin-web/
vercel
# Seguir instrucciones y configurar variables de entorno

cd ../worker-pwa/
vercel
# Repetir proceso

cd ../mataro-trabajadoras-pwa/
vercel
# Repetir proceso
```

## 🔵 Despliegue en Netlify

### Para cada aplicación:

1. **Conectar Repositorio**:
   - Ve a [netlify.com](https://netlify.com)
   - "New site from Git"
   - Selecciona tu repositorio

2. **Build Settings**:
   ```
   Base directory: [admin-web|worker-pwa|mataro-trabajadoras-pwa]
   Build command: npm run build
   Publish directory: [directorio-base]/dist
   ```

3. **Variables de Entorno**:
   - Site settings > Environment variables
   - Añade las variables correspondientes

## 📱 URLs de Producción Sugeridas

- **Admin Panel**: `https://admin.cuidado-domestico.com`
- **Worker PWA**: `https://trabajadoras.cuidado-domestico.com`
- **PWA Mataró**: `https://mataro.cuidado-domestico.com`

## ✅ Verificación Post-Despliegue

### Checklist para cada aplicación:

- [ ] La aplicación carga correctamente
- [ ] Las variables de entorno están configuradas
- [ ] La conexión con Supabase funciona
- [ ] El sistema de autenticación funciona
- [ ] Las notificaciones push están habilitadas (PWAs)
- [ ] Los service workers se registran correctamente (PWAs)
- [ ] La navegación entre páginas funciona
- [ ] Los formularios envían datos correctamente

### Comandos de verificación local:

```bash
# Verificar builds localmente
cd admin-web && npm run build
cd ../worker-pwa && npm run build
cd ../mataro-trabajadoras-pwa && npm run build

# Previsualizar builds
cd admin-web && npm run preview
cd ../worker-pwa && npm run preview
cd ../mataro-trabajadoras-pwa && npm run preview
```

## 🔒 Configuración de Seguridad

### Supabase
- Configurar Row Level Security (RLS)
- Definir políticas de acceso apropiadas
- Configurar autenticación y autorización

### Dominios
- Añadir dominios de producción a la lista de URLs permitidas en Supabase
- Configurar CORS si es necesario

## 🚨 Solución de Problemas

### Error: "Supabase URL not found"
- Verificar que `VITE_SUPABASE_URL` esté configurada
- Comprobar que la URL sea correcta

### Error: "Build failed"
- Verificar que todas las dependencias estén instaladas
- Comprobar errores de TypeScript
- Revisar la configuración de build

### Error: "Environment variables not loaded"
- Verificar que las variables estén configuradas en la plataforma de despliegue
- Comprobar que los nombres coincidan exactamente

## 📞 Soporte

Para problemas de despliegue, revisar:
1. Logs de build en la plataforma de despliegue
2. Console del navegador para errores de runtime
3. Configuración de variables de entorno
4. Estado de Supabase

---

**Nota**: Cada aplicación debe desplegarse por separado ya que son proyectos independientes con sus propias configuraciones y dependencias.