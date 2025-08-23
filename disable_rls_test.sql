-- =====================================================
-- DESACTIVAR RLS TEMPORALMENTE PARA PRUEBAS
-- Esto nos ayudará a identificar si RLS es el problema
-- =====================================================

-- Desactivar RLS en todas las tablas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE holidays DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está desactivado
SELECT 
  'RLS desactivado:' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- Verificar que podemos acceder a los datos
SELECT 
  'Prueba de acceso a workers:' as info,
  COUNT(*) as total_workers
FROM workers;

SELECT 
  'Prueba de acceso a users:' as info,
  COUNT(*) as total_users
FROM users;

SELECT 
  'Prueba de acceso a assignments:' as info,
  COUNT(*) as total_assignments
FROM assignments;

SELECT 
  'Prueba de acceso a holidays:' as info,
  COUNT(*) as total_holidays
FROM holidays;

-- Mostrar algunos datos de ejemplo
SELECT 
  'Datos de workers:' as info,
  employee_id,
  full_name,
  email,
  is_active
FROM workers
LIMIT 3;

SELECT 
  'Datos de users:' as info,
  full_name,
  dni,
  monthly_hours,
  is_active
FROM users
LIMIT 3;

-- Mensaje de confirmación
SELECT 
  'RLS DESACTIVADO TEMPORALMENTE' as status,
  'Prueba ahora la aplicación. Si funciona, el problema era RLS' as message;
