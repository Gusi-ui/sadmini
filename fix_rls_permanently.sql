-- =====================================================
-- CONFIGURAR RLS CORRECTAMENTE
-- Políticas que permiten acceso autenticado y anónimo
-- =====================================================

-- 1. Habilitar RLS nuevamente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Workers are viewable by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers can be created by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers can be updated by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers can be deleted by authenticated users" ON workers;

DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be created by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be updated by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be deleted by authenticated users" ON users;

DROP POLICY IF EXISTS "Assignments are viewable by authenticated users" ON assignments;
DROP POLICY IF EXISTS "Assignments can be created by authenticated users" ON assignments;
DROP POLICY IF EXISTS "Assignments can be updated by authenticated users" ON assignments;
DROP POLICY IF EXISTS "Assignments can be deleted by authenticated users" ON assignments;

DROP POLICY IF EXISTS "Time slots are viewable by authenticated users" ON assignment_time_slots;
DROP POLICY IF EXISTS "Time slots can be created by authenticated users" ON assignment_time_slots;
DROP POLICY IF EXISTS "Time slots can be updated by authenticated users" ON assignment_time_slots;
DROP POLICY IF EXISTS "Time slots can be deleted by authenticated users" ON assignment_time_slots;

DROP POLICY IF EXISTS "Holidays are viewable by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be created by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be updated by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be deleted by authenticated users" ON holidays;

DROP POLICY IF EXISTS "Work hours are viewable by authenticated users" ON work_hours;
DROP POLICY IF EXISTS "Work hours can be created by authenticated users" ON work_hours;
DROP POLICY IF EXISTS "Work hours can be updated by authenticated users" ON work_hours;
DROP POLICY IF EXISTS "Work hours can be deleted by authenticated users" ON work_hours;

-- 3. Crear políticas más permisivas para desarrollo
-- Políticas para profiles
CREATE POLICY "Profiles accessible by all" ON profiles
  FOR ALL USING (true);

-- Políticas para workers
CREATE POLICY "Workers accessible by all" ON workers
  FOR ALL USING (true);

-- Políticas para users (clientes)
CREATE POLICY "Users accessible by all" ON users
  FOR ALL USING (true);

-- Políticas para assignments
CREATE POLICY "Assignments accessible by all" ON assignments
  FOR ALL USING (true);

-- Políticas para assignment_time_slots
CREATE POLICY "Time slots accessible by all" ON assignment_time_slots
  FOR ALL USING (true);

-- Políticas para holidays
CREATE POLICY "Holidays accessible by all" ON holidays
  FOR ALL USING (true);

-- Políticas para work_hours
CREATE POLICY "Work hours accessible by all" ON work_hours
  FOR ALL USING (true);

-- 4. Verificar que las políticas se crearon
SELECT 
  'Políticas creadas:' as info,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename, policyname;

-- 5. Verificar que RLS está habilitado
SELECT 
  'RLS habilitado:' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- 6. Probar acceso a datos
SELECT 
  'Prueba de acceso con RLS:' as info,
  COUNT(*) as total_workers
FROM workers;

SELECT 
  'Prueba de acceso con RLS:' as info,
  COUNT(*) as total_users
FROM users;

-- Mensaje de confirmación
SELECT 
  'RLS CONFIGURADO CORRECTAMENTE' as status,
  'Las políticas permiten acceso completo para desarrollo' as message;
