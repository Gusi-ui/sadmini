-- =====================================================
-- CONFIGURAR RLS DESPUÉS DE CREAR USUARIOS MANUALMENTE
-- =====================================================

-- 1. Crear perfiles para usuarios existentes
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

-- 2. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes
DROP POLICY IF EXISTS "Profiles accessible by all" ON profiles;
DROP POLICY IF EXISTS "Workers accessible by all" ON workers;
DROP POLICY IF EXISTS "Users accessible by all" ON users;
DROP POLICY IF EXISTS "Assignments accessible by all" ON assignments;
DROP POLICY IF EXISTS "Time slots accessible by all" ON assignment_time_slots;
DROP POLICY IF EXISTS "Holidays accessible by all" ON holidays;
DROP POLICY IF EXISTS "Work hours accessible by all" ON work_hours;

-- 4. Crear políticas de producción
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

-- 5. Verificar configuración
SELECT 
  'CONFIGURACIÓN COMPLETADA' as status,
  'RLS configurado correctamente' as message;

-- 6. Verificar usuarios y perfiles
SELECT 
  'Usuarios creados:' as info,
  COUNT(*) as total_users
FROM auth.users
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

SELECT 
  'Perfiles creados:' as info,
  COUNT(*) as total_profiles
FROM profiles
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
