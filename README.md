# 🏠 Sistema de Gestión de Cuidado Doméstico

**Versión:** 1.0.0  
**Fecha:** Agosto 2025  
**Autor:** MiniMax Agent

Sistema completo de gestión para empresas de cuidado doméstico, que incluye una aplicación administrativa web y una aplicación móvil progresiva (PWA) para trabajadoras.

## 📋 Descripción General

Este sistema permite gestionar de manera integral las operaciones de una empresa de cuidado doméstico, desde la administración de trabajadoras y usuarios hasta el seguimiento detallado de horarios y reportes financieros.

### 🎯 Características Principales

- **Sistema dual**: Aplicación administrativa + PWA para trabajadoras
- **Gestión completa**: Trabajadoras, usuarios, asignaciones y horarios flexibles
- **Reportes avanzados**: Análisis mensual de horas y cálculos financieros
- **Alertas inteligentes**: Detección automática de conflictos de horarios
- **PWA móvil**: Aplicación instalable para trabajadoras con funcionalidad offline
- **Autenticación segura**: Sistema completo con Supabase
- **Self-hosted**: Completamente auto-hospedable con tus propias credenciales

## 🏗️ Arquitectura del Sistema

```
home-care-management/
├── admin-app/                 # Aplicación administrativa web
│   ├── src/
│   │   ├── components/        # Componentes UI reutilizables
│   │   ├── hooks/            # Hooks personalizados para lógica de negocio
│   │   ├── pages/            # Páginas principales (Dashboard, Workers, etc.)
│   │   └── lib/              # Configuración de Supabase y utilidades
│   └── dist/                 # Build de producción
│
├── pwa-app/                  # Aplicación PWA para trabajadoras
│   └── pwa-trabajadoras/     # App React PWA
│       ├── src/
│       │   ├── components/   # Componentes UI
│       │   ├── contexts/     # Contextos de React
│       │   ├── pages/        # Login, Dashboard, Horarios, Reportes
│       │   └── lib/          # Cliente Supabase
│       ├── public/           # Assets PWA (manifest, iconos, service worker)
│       └── dist/             # Build de producción
│
├── supabase/                 # Configuración de backend
│   ├── migrations/           # Migraciones de base de datos
│   └── functions/            # Edge Functions (si aplicable)
│
└── docs/                     # Documentación del proyecto
    ├── README.md            # Esta documentación
    ├── SETUP.md             # Guía de instalación
    └── USER_MANUAL.md       # Manual de usuario
```

## 🔧 Stack Tecnológico

### Frontend
- **React 18** + **TypeScript**
- **Vite 6** (Build tool y desarrollo)
- **Tailwind CSS** (Estilos y diseño responsive)
- **Shadcn/UI** (Componentes de interfaz)
- **Lucide React** (Iconografía)
- **Date-fns** (Manejo de fechas)
- **React Hook Form** + **Zod** (Formularios y validación)

### Backend
- **Supabase** (Base de datos PostgreSQL + Autenticación + Storage)
- **Row Level Security (RLS)** (Seguridad de datos)
- **Edge Functions** (Lógica serverless cuando sea necesario)

### PWA
- **Service Worker** (Cache y funcionamiento offline)
- **Web App Manifest** (Instalación nativa)
- **Push Notifications** (Notificaciones en tiempo real)

## 🚀 Instalación Rápida

### Prerrequisitos
- **Node.js 18+** y **pnpm**
- **Cuenta de Supabase** (gratuita)
- **Servidor web** con HTTPS (para PWA)

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL (ver `/supabase/migrations/`)
3. Configura las políticas RLS
4. Obtén tus credenciales (URL + Anon Key)

### 2. Aplicación Administrativa

```bash
cd admin-app
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Desarrollo
pnpm run dev

# Producción
pnpm run build
```

### 3. PWA para Trabajadoras

```bash
cd pwa-app/pwa-trabajadoras
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase

# Desarrollo
pnpm run dev

# Producción
pnpm run build
```

## 📊 Funcionalidades Detalladas

### 🏢 Aplicación Administrativa

#### Gestión de Trabajadoras
- ✅ CRUD completo de trabajadoras
- ✅ Especialidades y tarifas por hora
- ✅ Disponibilidad y contactos
- ✅ Historial de asignaciones

#### Gestión de Usuarios
- ✅ Registro de clientes
- ✅ Información médica y requisitos especiales
- ✅ Contactos de emergencia
- ✅ Historial de servicios

#### Sistema de Asignaciones Flexibles
- ✅ **Múltiples franjas horarias por día**
- ✅ Asignaciones recurrentes (días de la semana)
- ✅ Fechas de inicio y fin configurables
- ✅ Estados: Activa, Completada, Cancelada

#### Alertas Inteligentes
- ✅ **Detección de conflictos de horarios**
- ✅ Alertas de solapamiento de asignaciones
- ✅ Notificaciones de disponibilidad
- ✅ Recordatorios automáticos

#### Reportes Mensuales Avanzados
- ✅ **Cálculo automático de horas trabajadas**
- ✅ Comparativa horas contratadas vs. trabajadas
- ✅ Análisis de superávit/déficit mensual
- ✅ Reportes por trabajadora y cliente
- ✅ Exportación a diferentes formatos

### 📱 PWA para Trabajadoras

#### Características Móviles
- ✅ **Instalable** como app nativa
- ✅ **Funciona offline** para consultas básicas
- ✅ **Notificaciones push** para nuevos horarios
- ✅ **Diseño responsive** optimizado para móviles

#### Funcionalidades
- ✅ **Dashboard personalizado** con información de la trabajadora
- ✅ **Vista de horarios diarios** y semanales
- ✅ **Reportes mensuales** de horas e ingresos
- ✅ **Perfil personal** editable
- ✅ **Historial de asignaciones**

## 🔐 Seguridad

- **Autenticación JWT** gestionada por Supabase
- **Row Level Security (RLS)** en todas las tablas
- **Roles diferenciados**: Admin, Trabajadora
- **HTTPS obligatorio** para funcionalidades PWA
- **Variables de entorno** para credenciales sensibles

## 📈 Casos de Uso

### Para Administradores
1. **Planificación de horarios**: Asignar trabajadoras a usuarios con horarios flexibles
2. **Monitoreo operacional**: Ver alertas de conflictos y resolver problemas
3. **Análisis financiero**: Revisar reportes mensuales y calcular costos
4. **Gestión de personal**: Administrar trabajadoras y sus disponibilidades

### Para Trabajadoras
1. **Consulta de horarios**: Ver asignaciones del día y de la semana
2. **Seguimiento personal**: Monitorear horas trabajadas e ingresos mensuales
3. **Información de clientes**: Acceder a datos relevantes para el cuidado
4. **Comunicación**: Recibir notificaciones de cambios o nuevas asignaciones

## 🚀 Despliegue

### Opciones de Hosting

**Frontend (Aplicaciones web):**
- Vercel, Netlify, Cloudflare Pages
- AWS S3 + CloudFront
- Servidor propio con nginx

**Base de Datos:**
- Supabase (recomendado)
- PostgreSQL auto-gestionado

### Configuración de Producción

1. **Build de las aplicaciones**
   ```bash
   # Admin app
   cd admin-app && pnpm run build
   
   # PWA
   cd pwa-app/pwa-trabajadoras && pnpm run build
   ```

2. **Variables de entorno de producción**
   - Configurar URLs de producción
   - Claves de API de Supabase
   - Configuración de notificaciones (VAPID keys)

3. **Certificados SSL**
   - **OBLIGATORIO** para PWA
   - Let's Encrypt o certificado comercial

## 📚 Documentación Adicional

- 📖 **[Manual de Usuario](docs/USER_MANUAL.md)**: Guía completa para administradores
- 🛠️ **[Guía de Instalación](docs/SETUP.md)**: Pasos detallados de configuración
- 🏗️ **[README Admin](admin-app/README.md)**: Documentación específica de la app administrativa
- 📱 **[README PWA](pwa-app/pwa-trabajadoras/README.md)**: Documentación específica de la PWA

## 🐛 Solución de Problemas

### Problemas Comunes

**Error de autenticación en PWA:**
- Verificar que las credenciales de Supabase sean correctas
- Confirmar que RLS esté configurado apropiadamente

**PWA no se instala:**
- Confirmar que el sitio está servido por HTTPS
- Verificar que el manifest.json esté accesible
- Comprobar que el service worker se registre correctamente

**Reportes no cargan datos:**
- Verificar que las asignaciones tengan `assignments_time_slots` asociados
- Confirmar que las fechas estén en formato correcto
- Comprobar permisos de base de datos

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto es privado y propietario.

## 📞 Soporte

Para soporte técnico o preguntas sobre el sistema:

- Revisar la documentación en `/docs/`
- Consultar los README específicos de cada aplicación
- Verificar los logs de Supabase para errores de backend

---

**Desarrollado con ❤️ por MiniMax Agent**  
*Sistema completo de gestión de cuidado doméstico - Agosto 2025*