-- =====================================================
-- CREAR USUARIOS REALES DIRECTAMENTE EN AUTH.USERS
-- Usando funciones de Supabase para evitar problemas de permisos
-- =====================================================

-- 1. Crear usuarios usando la función de Supabase
-- Nota: Esto requiere permisos de service_role

-- Crear usuario administrador
SELECT auth.create_user(
  'admin@sadmini.com',
  'admin123',
  '{"full_name": "Administrador del Sistema", "role": "admin"}',
  true -- email_confirm
);

-- Crear usuario trabajadora
SELECT auth.create_user(
  'trabajadora@sadmini.com',
  'worker123',
  '{"full_name": "María García López", "role": "worker"}',
  true -- email_confirm
);

-- 2. Verificar usuarios creados
SELECT 
  'Usuarios en auth.users:' as info,
  id,
  email,
  raw_user_meta_data,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
ORDER BY email;

-- 3. Crear perfiles para los usuarios
INSERT INTO profiles (id, email, full_name, role, phone, address) 
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'role' as role,
  CASE 
    WHEN email = 'admin@sadmini.com' THEN '+34600000001'
    WHEN email = 'trabajadora@sadmini.com' THEN '+34600000002'
  END as phone,
  CASE 
    WHEN email = 'admin@sadmini.com' THEN 'Calle Principal 123, Mataró'
    WHEN email = 'trabajadora@sadmini.com' THEN 'Calle Secundaria 456, Mataró'
  END as address
FROM auth.users
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

-- 4. Verificar perfiles creados
SELECT 
  'Perfiles creados:' as info,
  id,
  email,
  full_name,
  role,
  phone,
  address
FROM profiles
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
ORDER BY email;

-- 5. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- 6. Eliminar políticas existentes
DROP POLICY IF EXISTS "Profiles accessible by all" ON profiles;
DROP POLICY IF EXISTS "Workers accessible by all" ON workers;
DROP POLICY IF EXISTS "Users accessible by all" ON users;
DROP POLICY IF EXISTS "Assignments accessible by all" ON assignments;
DROP POLICY IF EXISTS "Time slots accessible by all" ON assignment_time_slots;
DROP POLICY IF EXISTS "Holidays accessible by all" ON holidays;
DROP POLICY IF EXISTS "Work hours accessible by all" ON work_hours;

-- 7. Crear políticas de producción correctas
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

-- 8. Verificar configuración final
SELECT 
  'CONFIGURACIÓN COMPLETADA' as status,
  'Usuarios reales creados y RLS configurado' as message;

-- 9. Verificar que todo funciona
SELECT 
  'Prueba de acceso con RLS:' as info,
  COUNT(*) as total_workers
FROM workers;

SELECT 
  'Prueba de acceso con RLS:' as info,
  COUNT(*) as total_users
FROM users;
