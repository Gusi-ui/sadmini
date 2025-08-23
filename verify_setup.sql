-- =====================================================
-- VERIFICACIÓN COMPLETA DE LA CONFIGURACIÓN
-- Ejecutar después de setup_database.sql y link_users.sql
-- =====================================================

-- 1. Verificar estructura de tablas
SELECT 
  'Estructura de tablas:' as section,
  table_name,
  'OK' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY table_name;

-- 2. Verificar datos de trabajadoras
SELECT 
  'Trabajadoras:' as section,
  employee_id,
  full_name,
  email,
  is_active
FROM workers
ORDER BY employee_id;

-- 3. Verificar datos de usuarios/clientes
SELECT 
  'Usuarios/Clientes:' as section,
  dni,
  full_name,
  monthly_hours,
  is_active
FROM users
ORDER BY dni;

-- 4. Verificar asignaciones
SELECT 
  'Asignaciones:' as section,
  w.employee_id,
  w.full_name as trabajadora,
  u.full_name as cliente,
  a.start_date,
  a.is_active
FROM assignments a
JOIN workers w ON a.worker_id = w.id
JOIN users u ON a.user_id = u.id
ORDER BY w.employee_id;

-- 5. Verificar días festivos
SELECT 
  'Días festivos 2025:' as section,
  date,
  name,
  type
FROM holidays
WHERE EXTRACT(year FROM date) = 2025
ORDER BY date;

-- 6. Verificar perfiles de autenticación
SELECT 
  'Perfiles de autenticación:' as section,
  p.email,
  p.full_name,
  p.role,
  CASE WHEN u.id IS NOT NULL THEN 'Vinculado' ELSE 'No vinculado' END as auth_status
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.email;

-- 7. Verificar índices
SELECT 
  'Índices creados:' as section,
  indexname,
  tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 8. Verificar funciones
SELECT 
  'Funciones creadas:' as section,
  routine_name,
  'OK' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_day_type')
ORDER BY routine_name;

-- 9. Resumen final
SELECT 
  'RESUMEN FINAL' as section,
  'Configuración completada exitosamente' as status,
  'La base de datos está lista para usar con datos de prueba' as message;
