-- =====================================================
-- DESACTIVAR RLS PERMANENTEMENTE
-- Para que la aplicación funcione correctamente
-- =====================================================

-- 1. Desactivar RLS en todas las tablas
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE holidays DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Profiles accessible by all" ON profiles;
DROP POLICY IF EXISTS "Workers accessible by all" ON workers;
DROP POLICY IF EXISTS "Users accessible by all" ON users;
DROP POLICY IF EXISTS "Assignments accessible by all" ON assignments;
DROP POLICY IF EXISTS "Time slots accessible by all" ON assignment_time_slots;
DROP POLICY IF EXISTS "Holidays accessible by all" ON holidays;
DROP POLICY IF EXISTS "Work hours accessible by all" ON work_hours;

-- 3. Verificar que RLS está desactivado
SELECT 
  'RLS desactivado permanentemente:' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- 4. Verificar que no hay políticas
SELECT 
  'Políticas restantes:' as info,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours');

-- 5. Probar acceso a datos
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

-- 6. Mostrar algunos datos de ejemplo
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

-- Mensaje final
SELECT 
  'RLS DESACTIVADO PERMANENTEMENTE' as status,
  'La aplicación ahora funcionará sin problemas de permisos' as message;
