-- =====================================================
-- PRUEBA SIMPLE - VERIFICAR ACCESO A DATOS
-- =====================================================

-- 1. Verificar si las tablas existen
SELECT 'Tablas existentes:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY table_name;

-- 2. Verificar RLS
SELECT 'RLS habilitado:' as info;
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- 3. Desactivar RLS temporalmente
SELECT 'Desactivando RLS...' as info;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE holidays DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours DISABLE ROW LEVEL SECURITY;

-- 4. Verificar que RLS está desactivado
SELECT 'RLS después de desactivar:' as info;
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- 5. Probar acceso a datos
SELECT 'Prueba de acceso a workers:' as info;
SELECT COUNT(*) as total FROM workers;

SELECT 'Prueba de acceso a users:' as info;
SELECT COUNT(*) as total FROM users;

SELECT 'Prueba de acceso a assignments:' as info;
SELECT COUNT(*) as total FROM assignments;

SELECT 'Prueba de acceso a holidays:' as info;
SELECT COUNT(*) as total FROM holidays;

-- 6. Mostrar algunos datos
SELECT 'Datos de workers:' as info;
SELECT employee_id, full_name, email FROM workers LIMIT 3;

SELECT 'Datos de users:' as info;
SELECT full_name, dni, monthly_hours FROM users LIMIT 3;

SELECT 'RLS DESACTIVADO - PRUEBA LA APLICACIÓN AHORA' as mensaje;
