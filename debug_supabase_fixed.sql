-- =====================================================
-- DIAGNÓSTICO COMPLETO DE SUPABASE (CORREGIDO)
-- Identificar la causa raíz de los errores 500
-- =====================================================

-- 1. VERIFICAR CONFIGURACIÓN DE SUPABASE
SELECT 
  'Configuración de Supabase:' as info,
  name,
  setting
FROM pg_settings 
WHERE name IN ('search_path', 'timezone', 'lc_messages')
ORDER BY name;

-- 2. VERIFICAR EXTENSIONES INSTALADAS
SELECT 
  'Extensiones instaladas:' as info,
  extname,
  extversion
FROM pg_extension
ORDER BY extname;

-- 3. VERIFICAR SI LAS TABLAS EXISTEN Y SU ESTRUCTURA
SELECT 
  'Tablas existentes:' as info,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY table_name;

-- 4. VERIFICAR PERMISOS RLS
SELECT 
  'RLS habilitado:' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- 5. VERIFICAR POLÍTICAS EXISTENTES
SELECT 
  'Políticas existentes:' as info,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename, policyname;

-- 6. VERIFICAR DATOS EN LAS TABLAS
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

-- 7. VERIFICAR FUNCIONES
SELECT 
  'Funciones existentes:' as info,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('get_day_type')
ORDER BY routine_name;

-- 8. VERIFICAR ÍNDICES
SELECT 
  'Índices existentes:' as info,
  schemaname,
  tablename,
  indexname
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename, indexname;

-- 9. VERIFICAR PERMISOS DE USUARIO
SELECT 
  'Permisos de usuario:' as info,
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY table_name, privilege_type;

-- 10. VERIFICAR CONEXIONES ACTIVAS
SELECT 
  'Conexiones activas:' as info,
  COUNT(*) as total_connections,
  COUNT(CASE WHEN state = 'active' THEN 1 END) as active_connections,
  COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle_connections
FROM pg_stat_activity;

-- 11. VERIFICAR ESTADO DE LA BASE DE DATOS
SELECT 
  'Estado de la BD:' as info,
  datname,
  numbackends,
  xact_commit,
  xact_rollback
FROM pg_stat_database 
WHERE datname = current_database();

-- 12. VERIFICAR USUARIO ACTUAL
SELECT 
  'Usuario actual:' as info,
  current_user as usuario,
  current_database() as base_datos,
  current_schema as esquema;
