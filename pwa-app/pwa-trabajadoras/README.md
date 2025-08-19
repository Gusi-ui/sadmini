# PWA Sistema de Cuidado Doméstico - Trabajadoras

## Descripción

Aplicación Web Progresiva (PWA) diseñada para trabajadoras del sistema de cuidado doméstico. Permite a las trabajadoras acceder a sus horarios, ver reportes mensuales y gestionar su información personal desde dispositivos móviles.

## Características

### ✨ Funcionalidades Core
- **Autenticación segura** con Supabase
- **Dashboard personalizado** con información de la trabajadora
- **Visualización de horarios** y asignaciones
- **Reportes mensuales** de horas trabajadas e ingresos
- **Perfil personal** con especialidades y datos de contacto

### 📱 Características PWA
- **Instalable**: Se puede instalar como app nativa
- **Funcionamiento offline**: Cache de datos críticos
- **Notificaciones push**: Alertas de nuevos horarios
- **Responsive**: Optimizado para móviles y tablets
- **Rápida carga**: Service Worker para caché inteligente

## Tecnologías Utilizadas

- **React 18** + **TypeScript**
- **Vite 6** (Bundling y desarrollo)
- **Tailwind CSS** (Estilos)
- **Supabase** (Backend y autenticación)
- **PWA API** (Manifest + Service Worker)
- **Lucide React** (Iconos)

## Instalación y Configuración

### 1. Prerrequisitos
- Node.js 18+ y pnpm
- Proyecto Supabase configurado

### 2. Clonar e instalar dependencias
```bash
cd pwa-app/pwa-trabajadoras
pnpm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` basado en `.env.example`:
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
VITE_APP_NAME="Sistema de Cuidado - Trabajadoras"
VITE_APP_VERSION="1.0.0"
```

### 4. Ejecutar en desarrollo
```bash
pnpm run dev
```

La aplicación estará disponible en `http://localhost:3001`

### 5. Construir para producción
```bash
pnpm run build
```

### 6. Servir la aplicación construida
```bash
pnpm run preview
```

## Estructura del Proyecto

```
src/
├── components/           # Componentes UI reutilizables
│   └── ui/              # Componentes base (Button, Card, etc.)
├── contexts/            # Contextos de React
│   └── AuthContext.tsx  # Contexto de autenticación
├── lib/                 # Utilidades y configuración
│   ├── supabase.ts      # Cliente de Supabase
│   └── utils.ts         # Funciones utilitarias
├── pages/               # Páginas principales
│   ├── LoginPage.tsx    # Página de login
│   └── DashboardPage.tsx # Dashboard principal
├── App.tsx              # Componente raíz
└── main.tsx             # Punto de entrada

public/
├── manifest.json        # Manifest PWA
├── sw.js               # Service Worker
├── icon-192x192.png    # Icono PWA 192x192
└── icon-512x512.png    # Icono PWA 512x512
```

## Configuración de Base de Datos

La aplicación requiere las siguientes tablas en Supabase:

- `workers` - Información de trabajadoras
- `users` - Usuarios del sistema
- `assignments` - Asignaciones de trabajo
- `assignments_time_slots` - Horarios detallados por asignación

**Nota**: Estas tablas son creadas automáticamente por el sistema administrativo.

## Uso de la PWA

### Instalación en dispositivos
1. Abre la aplicación en el navegador móvil
2. Busca la opción "Agregar a pantalla de inicio" o "Instalar app"
3. Confirma la instalación

### Funcionalidad offline
- La app funciona sin conexión para consultar datos almacenados
- Los datos se sincronizan automáticamente al recuperar conexión

### Notificaciones
- Recibe alertas de nuevos horarios
- Recordatorios de próximas citas
- Actualizaciones importantes del sistema

## Despliegue

### Opción 1: Netlify/Vercel
1. Conecta tu repositorio
2. Configura las variables de entorno
3. Despliega automáticamente

### Opción 2: Servidor propio
1. Construye la aplicación: `pnpm run build`
2. Sirve la carpeta `dist` con un servidor web
3. Configura HTTPS (requerido para PWA)

## Seguridad

- **Autenticación**: JWT tokens gestionados por Supabase
- **RLS**: Row Level Security en todas las tablas
- **HTTPS**: Requerido para funcionalidades PWA
- **CSP**: Content Security Policy configurado

## Soporte

### Navegadores compatibles
- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

### Dispositivos
- iOS 14+
- Android 8+
- Escritorio (todas las plataformas)

## Scripts disponibles

```bash
pnpm run dev          # Desarrollo
pnpm run build        # Construir para producción
pnpm run preview      # Vista previa de build
pnpm run lint         # Linting
pnpm run type-check   # Verificación de tipos
```

## Contribuir

1. Fork del proyecto
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y proprietario.

---

**Nota**: Esta PWA está diseñada para funcionar junto con el sistema administrativo. Asegúrate de que el backend esté configurado correctamente antes de usar la aplicación.