# 🔑 Obtener Service Key Correcta (service_role)

## ⚠️ Problema Identificado

El error "User not allowed" indica que estamos usando la **anon key** en lugar de la **service_role key**.

## 📋 Pasos para Obtener la Service Key Correcta

### 1. Ir a Supabase Dashboard
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `gkmjnhumsbiscpkbyihv`

### 2. Obtener Service Role Key
1. Ve a **Settings** → **API**
2. Busca la sección **Project API keys**
3. Copia la **service_role** key (NO la anon key)
4. La service_role key empieza con `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Y contiene `"role":"service_role"` en el payload

### 3. Diferencias entre Keys

#### ❌ Anon Key (Lo que tienes ahora):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpuaHVtc2Jpc2Nwa2J5aWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTQwOTIsImV4cCI6MjA3MTE5MDA5Mn0._UYrbiBNQsBQQSIajJaqOnQJMRL2rfEMcqTZDxYvrOc
```

#### ✅ Service Role Key (Lo que necesitas):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpuaHVtc2Jpc2Nwa2J5aWh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxNDA5MiwiZXhwIjoyMDcxMTkwMDkyfQ.XXXXX
```

### 4. Actualizar Script
Una vez que tengas la service_role key:
1. Abre `create_real_users.js`
2. Reemplaza la línea de `supabaseServiceKey`
3. Ejecuta el script nuevamente

## 🔒 Seguridad

⚠️ **IMPORTANTE**: La service_role key tiene permisos completos. Úsala solo para:
- Crear usuarios iniciales
- Scripts de administración
- Nunca en el frontend

## 📞 Próximos Pasos

1. Obtén la service_role key
2. Actualiza el script
3. Ejecuta `create_real_users.js`
4. Ejecuta `setup_production_auth.sql`
5. Prueba la autenticación real
