-- =====================================================
-- CONFIGURACIÓN DE AUTENTICACIÓN REAL PARA PRODUCCIÓN
-- Crear usuarios reales en auth.users y perfiles
-- =====================================================

-- 1. Crear usuarios reales en auth.users usando la función de Supabase
-- Nota: Estos usuarios se crearán con la API de Supabase, no con SQL directo

-- 2. Crear perfiles para los usuarios que ya existen
INSERT INTO profiles (id, email, full_name, role, phone, address) VALUES
  (
    (SELECT id FROM auth.users WHERE email = 'admin@mataro.cat' LIMIT 1),
    'admin@mataro.cat',
    'Administrador Mataró',
    'admin',
    '+34937580200',
    'Plaça de l''Ajuntament 1, 08301 Mataró'
  ),
  (
    (SELECT id FROM auth.users WHERE email = 'trabajadora@mataro.cat' LIMIT 1),
    'trabajadora@mataro.cat',
    'María García López',
    'worker',
    '+34600000002',
    'Carrer de la Riera 123, 08301 Mataró'
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

-- 3. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas existentes
DROP POLICY IF EXISTS "Profiles accessible by all" ON profiles;
DROP POLICY IF EXISTS "Workers accessible by all" ON workers;
DROP POLICY IF EXISTS "Users accessible by all" ON users;
DROP POLICY IF EXISTS "Assignments accessible by all" ON assignments;
DROP POLICY IF EXISTS "Time slots accessible by all" ON assignment_time_slots;
DROP POLICY IF EXISTS "Holidays accessible by all" ON holidays;
DROP POLICY IF EXISTS "Work hours accessible by all" ON work_hours;

-- 5. Crear políticas de producción correctas
-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para workers (acceso completo para usuarios autenticados)
CREATE POLICY "Authenticated users can manage workers" ON workers
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para users (clientes) - acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users can manage users" ON users
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para assignments - acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users can manage assignments" ON assignments
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para assignment_time_slots - acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users can manage time slots" ON assignment_time_slots
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para holidays - acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users can manage holidays" ON holidays
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para work_hours - acceso completo para usuarios autenticados
CREATE POLICY "Authenticated users can manage work hours" ON work_hours
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. Verificar configuración
SELECT 
  'RLS habilitado:' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename;

-- 7. Verificar políticas
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

-- 8. Verificar perfiles
SELECT 
  'Perfiles existentes:' as info,
  id,
  email,
  full_name,
  role
FROM profiles;

-- Mensaje final
SELECT 
  'CONFIGURACIÓN DE PRODUCCIÓN COMPLETADA' as status,
  'Ahora necesitas crear usuarios reales en Supabase Auth' as message;
