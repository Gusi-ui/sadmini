# 🏠 Sistema de Gestión de Cuidado Doméstico

**Versión:** 1.0.0  
**Fecha:** Agosto 2025  
**Autor:** MiniMax Agent

Sistema completo de gestión para empresas de cuidado doméstico, que incluye una aplicación administrativa web y una aplicación móvil progresiva (PWA) para trabajadoras.

## 🚀 Despliegue Rápido en Vercel

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Gusi-ui/sadmini.git
cd sadmini
```

### 2. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL desde `/supabase/migrations/`
3. Configura las políticas RLS
4. Obtén tus credenciales (URL + Anon Key)

### 3. Configurar Variables de Entorno

Crea los archivos `.env.local` en las siguientes ubicaciones:

**Proyecto principal (`/`):**
```bash
cp env.example .env.local
```

**Aplicación administrativa (`/admin-web/`):**
```bash
cp admin-web/env.example admin-web/.env.local
```

Edita los archivos con tus credenciales de Supabase:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 4. Instalar Dependencias

```bash
# Instalar dependencias del proyecto principal
pnpm install

# Instalar dependencias de la aplicación administrativa
cd admin-web
pnpm install
cd ..

# Instalar dependencias de la PWA
cd pwa-app/pwa-trabajadoras
pnpm install
cd ../..
```

### 5. Configurar Base de Datos

```bash
# Iniciar Supabase localmente (opcional)
supabase start

# Aplicar migraciones
supabase db push

# Generar tipos de TypeScript
pnpm gen:types
```

### 6. Desplegar en Vercel

1. **Conectar con Vercel:**
   - Ve a [Vercel](https://vercel.com)
   - Importa el repositorio desde GitHub
   - Configura las variables de entorno en Vercel

2. **Configurar Variables de Entorno en Vercel:**
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

3. **Configurar Build Settings:**
   - **Framework Preset:** Vite
   - **Build Command:** `cd admin-web && pnpm build`
   - **Output Directory:** `admin-web/dist`
   - **Install Command:** `pnpm install`

4. **Desplegar:**
   - Haz clic en "Deploy"
   - Vercel construirá y desplegará automáticamente

## 📱 Aplicaciones Incluidas

### 🏢 Aplicación Administrativa (`/admin-web/`)
- Gestión completa de trabajadoras y usuarios
- Sistema de asignaciones con horarios flexibles
- Reportes mensuales avanzados
- Alertas inteligentes del sistema

### 📱 PWA para Trabajadoras (`/pwa-app/pwa-trabajadoras/`)
- Aplicación móvil instalable
- Consulta de horarios y asignaciones
- Reportes personales de horas trabajadas
- Funcionamiento offline

## 🛠️ Stack Tecnológico

- **Frontend:** React 18 + TypeScript + Vite 6
- **UI:** Tailwind CSS + Shadcn/UI + Lucide React
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Formularios:** React Hook Form + Zod
- **Estado:** TanStack Query
- **PWA:** Service Worker + Web App Manifest

## 📊 Funcionalidades Principales

- ✅ Gestión completa de trabajadoras y usuarios
- ✅ Sistema de asignaciones con múltiples tramos horarios
- ✅ Cálculo automático de horas mensuales
- ✅ Detección de conflictos de horarios
- ✅ Reportes financieros avanzados
- ✅ Aplicación PWA para trabajadoras
- ✅ Autenticación segura con Supabase
- ✅ Políticas de seguridad RLS

## 🔧 Desarrollo Local

```bash
# Iniciar aplicación administrativa
cd admin-web
pnpm dev

# Iniciar PWA
cd ../pwa-app/pwa-trabajadoras
pnpm dev

# Iniciar Supabase local
supabase start
```

## 📚 Documentación

- [Manual de Usuario](docs/USER_MANUAL.md)
- [Guía de Instalación](docs/DEPLOYMENT.md)
- [Documentación de la API](docs/API.md)

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit de cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
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
