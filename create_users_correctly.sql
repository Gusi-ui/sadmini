-- =====================================================
-- SCRIPT CORRECTO PARA CREAR USUARIOS EN SUPABASE
-- Este script debe ejecutarse en la consola web de Supabase
-- =====================================================

-- 1. Primero, eliminar usuarios existentes si los hay
DELETE FROM auth.users WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
DELETE FROM profiles WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 2. Crear usuarios usando la función de Supabase
-- NOTA: Estos comandos deben ejecutarse desde la aplicación o usando la API de Supabase
-- No se pueden ejecutar directamente en SQL

-- 3. Crear los perfiles correspondientes (se ejecutarán cuando se creen los usuarios)
-- Los perfiles se crearán automáticamente mediante triggers cuando se registren los usuarios

-- 4. Verificar la configuración de autenticación
SELECT 
  'Configuración de autenticación' as info,
  'Asegúrate de que el signup esté habilitado' as note;

-- 5. Verificar que no hay usuarios duplicados
SELECT 
  'Verificación de usuarios existentes' as status,
  COUNT(*) as total_users
FROM auth.users 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 6. Verificar perfiles existentes
SELECT 
  'Verificación de perfiles existentes' as status,
  COUNT(*) as total_profiles
FROM profiles 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
