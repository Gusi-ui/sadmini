# Guía de Configuración para Producción

## Sistema de Gestión de Cuidado Domiciliario - Mataró

### 📋 Pasos para Configurar el Sistema en Producción

#### 1. Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una nueva cuenta o inicia sesión
   - Crea un nuevo proyecto
   - Anota la URL del proyecto y las claves API

2. **Configurar la base de datos:**
   - Ve al SQL Editor en tu proyecto de Supabase
   - Ejecuta el archivo `setup_database.sql` completo
   - Ejecuta el archivo `setup_production_auth.sql`

#### 2. Configurar Variables de Entorno

1. **En el directorio raíz (.env):**
   ```env
   # Configuración de Supabase
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   SUPABASE_SERVICE_ROLE_KEY=tu-clave-service-role-aqui
   
   # Configuración de la aplicación frontend
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   
   # Configuración del municipio
   VITE_MUNICIPALITY=Mataró
   
   # URLs de la aplicación (actualizar después del despliegue)
   VITE_ADMIN_URL=https://tu-dominio-admin.vercel.app
   VITE_PWA_URL=https://tu-dominio-pwa.vercel.app
   ```

2. **En admin-web/.env:**
   ```env
   # Configuración de Supabase
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-aqui
   
   # Configuración opcional
   VITE_MUNICIPALITY=Mataró
   VITE_PWA_URL=https://tu-dominio-pwa.vercel.app
   
   # Modo de desarrollo (false para producción)
   VITE_DEV_MODE=false
   ```

#### 3. Crear Usuarios Reales

1. **Ejecutar script de creación de usuarios:**
   ```bash
   cd /ruta/al/proyecto
   node create_real_users.js
   ```

2. **Usuarios creados por defecto:**
   - **Administrador:**
     - Email: `admin@mataro.cat`
     - Contraseña: `AdminMataro2024!`
     - Rol: Administrador del sistema
   
   - **Trabajadora de ejemplo:**
     - Email: `trabajadora@mataro.cat`
     - Contraseña: `TrabajadoraMataro2024!`
     - Rol: Trabajadora

#### 4. Desplegar las Aplicaciones

1. **Aplicación de Administración (admin-web):**
   - Despliega en Vercel, Netlify o tu plataforma preferida
   - Configura las variables de entorno en la plataforma
   - Actualiza `VITE_ADMIN_URL` con la URL final

2. **PWA para Trabajadoras (pwa-app):**
   - Despliega en Vercel, Netlify o tu plataforma preferida
   - Configura las variables de entorno en la plataforma
   - Actualiza `VITE_PWA_URL` con la URL final

#### 5. Configuración Post-Despliegue

1. **Actualizar URLs en variables de entorno**
2. **Probar el login con las credenciales de administrador**
3. **Crear trabajadoras reales desde la interfaz de administración**
4. **Crear usuarios/clientes reales**
5. **Configurar asignaciones y horarios**

### 🔐 Credenciales de Acceso

#### Administrador Principal
- **URL:** https://tu-dominio-admin.vercel.app
- **Email:** admin@mataro.cat
- **Contraseña:** AdminMataro2024!
- **Permisos:** Acceso completo al sistema

#### Trabajadora de Ejemplo
- **URL:** https://tu-dominio-pwa.vercel.app
- **Email:** trabajadora@mataro.cat
- **Contraseña:** TrabajadoraMataro2024!
- **Permisos:** Ver asignaciones y registrar horas

### 📱 Funcionalidades del Sistema

#### Panel de Administración
- Gestión de trabajadoras
- Gestión de usuarios/clientes
- Asignación de trabajadoras a clientes
- Configuración de horarios
- Gestión de días festivos
- Reportes y estadísticas

#### PWA para Trabajadoras
- Ver asignaciones del día
- Registrar entrada y salida
- Ver información de clientes
- Registrar notas de trabajo
- Funciona offline

### 🛠️ Mantenimiento

#### Tareas Regulares
1. **Actualizar días festivos** anualmente
2. **Revisar y actualizar** datos de trabajadoras
3. **Hacer backup** de la base de datos regularmente
4. **Monitorear** el uso y rendimiento

#### Soporte Técnico
- Documentación completa en `/docs`
- Logs de errores en Supabase Dashboard
- Monitoreo de aplicaciones en plataforma de despliegue

### ⚠️ Seguridad

#### Recomendaciones
1. **Cambiar contraseñas** por defecto inmediatamente
2. **Usar contraseñas seguras** para todos los usuarios
3. **Habilitar 2FA** en Supabase si es posible
4. **Revisar permisos** regularmente
5. **Mantener actualizadas** las dependencias

#### Variables Sensibles
- Nunca compartir `SUPABASE_SERVICE_ROLE_KEY`
- Mantener seguras las credenciales de administrador
- Usar HTTPS en todas las URLs de producción

---

**Fecha de configuración:** $(date)
**Versión del sistema:** 1.0.0
**Municipio:** Mataró, Catalunya