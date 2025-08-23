-- =====================================================
-- CREAR USUARIOS REALES - VERSIÓN FINAL
-- Elimina usuarios existentes y crea nuevos
-- =====================================================

-- 1. Eliminar usuarios existentes (si existen)
DELETE FROM profiles WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
DELETE FROM auth.users WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 2. Crear usuarios directamente en auth.users
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@sadmini.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Administrador del Sistema", "role": "admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ),
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'trabajadora@sadmini.com',
    crypt('worker123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "María García López", "role": "worker"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );

-- 3. Verificar usuarios creados
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

-- 4. Crear perfiles para los usuarios
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
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 5. Verificar perfiles creados
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

-- 6. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- 7. Eliminar políticas existentes
DROP POLICY IF EXISTS "Profiles accessible by all" ON profiles;
DROP POLICY IF EXISTS "Workers accessible by all" ON workers;
DROP POLICY IF EXISTS "Users accessible by all" ON users;
DROP POLICY IF EXISTS "Assignments accessible by all" ON assignments;
DROP POLICY IF EXISTS "Time slots accessible by all" ON assignment_time_slots;
DROP POLICY IF EXISTS "Holidays accessible by all" ON holidays;
DROP POLICY IF EXISTS "Work hours accessible by all" ON work_hours;

-- 8. Crear políticas de producción correctas
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

-- 9. Verificar configuración final
SELECT 
  'CONFIGURACIÓN COMPLETADA' as status,
  'Usuarios reales creados y RLS configurado' as message;

-- 10. Verificar que todo funciona
SELECT 
  'Prueba de acceso con RLS:' as info,
  COUNT(*) as total_workers
FROM workers;

SELECT 
  'Prueba de acceso con RLS:' as info,
  COUNT(*) as total_users
FROM users;
