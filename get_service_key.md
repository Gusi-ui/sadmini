# 🔑 Obtener Service Key de Supabase

## 📋 Pasos para Configurar Autenticación Real

### 1. Obtener Service Key
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `gkmjnhumsbiscpkbyihv`
3. Ve a **Settings** → **API**
4. Copia la **Service Key** (anónima)
5. Reemplaza la Service Key en `create_real_users.js`

### 2. Ejecutar Script de Creación de Usuarios
```bash
cd home-care-management/admin-web
node ../create_real_users.js
```

### 3. Configurar Base de Datos
Ejecuta `setup_production_auth.sql` en Supabase SQL Editor

### 4. Probar Autenticación Real
- Usa las credenciales reales:
  - **Admin**: `admin@sadmini.com` / `admin123`
  - **Trabajadora**: `trabajadora@sadmini.com` / `worker123`

## 🔒 Seguridad de Producción

### ✅ Ventajas de la Configuración Real:
- ✅ **RLS habilitado** con políticas correctas
- ✅ **Usuarios reales** en Supabase Auth
- ✅ **Autenticación segura** con JWT
- ✅ **Perfiles vinculados** correctamente
- ✅ **Políticas de acceso** por rol

### 🛡️ Políticas de Seguridad:
- **Profiles**: Usuarios solo ven/editan su propio perfil
- **Workers**: Usuarios autenticados pueden gestionar trabajadoras
- **Users**: Usuarios autenticados pueden gestionar clientes
- **Assignments**: Usuarios autenticados pueden gestionar asignaciones
- **Holidays**: Usuarios autenticados pueden gestionar festivos
- **Work Hours**: Usuarios autenticados pueden gestionar horas

## 🚀 Estado Final

Después de completar estos pasos tendrás:
- ✅ **Sistema de producción** completamente funcional
- ✅ **Autenticación real** y segura
- ✅ **RLS configurado** correctamente
- ✅ **Datos protegidos** por políticas
- ✅ **Usuarios reales** con roles específicos

## 📞 Credenciales de Acceso

### Administrador
- **Email**: `admin@sadmini.com`
- **Password**: `admin123`
- **Rol**: `admin`

### Trabajadora
- **Email**: `trabajadora@sadmini.com`
- **Password**: `worker123`
- **Rol**: `worker`
