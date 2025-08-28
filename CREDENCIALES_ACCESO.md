# 🔐 CREDENCIALES DE ACCESO - PRODUCCIÓN

## 👨‍💼 Usuario Administrador
- **Email:** `admin@mataro.cat`
- **Contraseña:** `AdminMataro2024!`
- **Rol:** Administrador
- **Aplicación:** Admin Web (http://localhost:5175)

## 👩‍💼 Usuario Trabajadora
- **Email:** `trabajadora@mataro.cat`
- **Contraseña:** `TrabajadoraMataro2024!`
- **Rol:** Trabajadora
- **Aplicación:** Worker PWA (http://localhost:5174)

## 🔧 Usuarios Adicionales (Desarrollo)
- **Admin Desarrollo:** `admin@sadmini.com`
- **Trabajadora Desarrollo:** `trabajadora@sadmini.com`

## ⚠️ IMPORTANTE
- Estas son las credenciales de **PRODUCCIÓN**
- Los usuarios están configurados en Supabase Auth
- Las contraseñas son seguras y cumplen con los requisitos
- Usa estas credenciales para probar el login en ambas aplicaciones

## 🚀 Cómo probar
1. **Admin Web:** Ve a http://localhost:5175 y usa las credenciales de administrador
2. **Worker PWA:** Ve a http://localhost:5174 y usa las credenciales de trabajadora

## 🔍 Verificación
- ✅ Usuarios creados en Supabase Auth
- ✅ Variables de entorno de producción configuradas
- ✅ Cliente mock deshabilitado
- ✅ Autenticación real activada
- ✅ Registro de trabajadora creado en la tabla workers

## 🔧 Problema Resuelto
**Issue:** La aplicación de trabajadoras redirigía al formulario después del login
**Causa:** Faltaba el registro en la tabla `workers` para el email `trabajadora@mataro.cat`
**Solución:** Se creó el registro worker con ID de empleado TRB004

**Ahora ambas aplicaciones deberían funcionar correctamente con las credenciales proporcionadas.**