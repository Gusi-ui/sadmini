-- Script corregido para crear usuarios de prueba en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- =====================================================
-- CREAR USUARIOS DE PRUEBA
-- =====================================================

-- 1. Crear usuario administrador
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@sadmini.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador del Sistema"}',
  false,
  '',
  '',
  '',
  ''
);

-- 2. Crear usuario trabajadora
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'trabajadora@sadmini.com',
  crypt('worker123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "María García López"}',
  false,
  '',
  '',
  '',
  ''
);

-- =====================================================
-- CREAR PERFILES CORRESPONDIENTES
-- =====================================================

-- 1. Perfil del administrador
INSERT INTO profiles (id, email, full_name, role, phone, address) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@sadmini.com', 'Administrador del Sistema', 'admin', '+34600000001', 'Calle Principal 123, Mataró')
ON CONFLICT (id) DO NOTHING;

-- 2. Perfil de la trabajadora
INSERT INTO profiles (id, email, full_name, role, phone, address) VALUES
  ('00000000-0000-0000-0000-000000000002', 'trabajadora@sadmini.com', 'María García López', 'worker', '+34600000002', 'Calle Secundaria 456, Mataró')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VINCULAR TRABAJADORA CON SU PERFIL
-- =====================================================

-- Actualizar la trabajadora existente para vincularla con su perfil
UPDATE workers 
SET profile_id = '00000000-0000-0000-0000-000000000002'
WHERE employee_id = 'TRB001';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que los usuarios se crearon correctamente
SELECT 
  'Usuarios creados exitosamente' as status,
  COUNT(*) as total_users
FROM auth.users 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- Verificar que los perfiles se crearon correctamente
SELECT 
  'Perfiles creados exitosamente' as status,
  COUNT(*) as total_profiles
FROM profiles 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
