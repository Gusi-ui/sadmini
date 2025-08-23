-- =====================================================
-- DIAGNÓSTICO DE TABLAS Y PERMISOS
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Verificar si las tablas existen
SELECT 
  'Tablas existentes:' as info,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY table_name;

-- 2. Verificar permisos RLS (Row Level Security)
SELECT 
  'RLS habilitado:' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- 3. Verificar políticas de acceso
SELECT 
  'Políticas existentes:' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename, policyname;

-- 4. Verificar datos en las tablas
SELECT 
  'Datos en workers:' as info,
  COUNT(*) as count
FROM workers;

SELECT 
  'Datos en users:' as info,
  COUNT(*) as count
FROM users;

SELECT 
  'Datos en assignments:' as info,
  COUNT(*) as count
FROM assignments;

SELECT 
  'Datos en holidays:' as info,
  COUNT(*) as count
FROM holidays;

-- 5. Verificar configuración de Supabase
SELECT 
  'Configuración de Supabase:' as info,
  name,
  value
FROM pg_settings 
WHERE name IN ('search_path', 'timezone', 'lc_messages')
ORDER BY name;
