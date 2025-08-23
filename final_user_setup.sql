-- =====================================================
-- SCRIPT FINAL PARA CONFIGURAR USUARIOS EN SUPABASE
-- Ejecutar este script en el SQL Editor de Supabase Console
-- =====================================================

-- 1. Limpiar usuarios existentes
DELETE FROM auth.users WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
DELETE FROM profiles WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 2. Crear usuario administrador
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
  gen_random_uuid(),
  'admin@sadmini.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Administrador del Sistema", "role": "admin"}',
  false,
  '',
  '',
  '',
  ''
);

-- 3. Crear usuario trabajadora
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
  gen_random_uuid(),
  'trabajadora@sadmini.com',
  crypt('worker123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "María García López", "role": "worker"}',
  false,
  '',
  '',
  '',
  ''
);

-- 4. Crear perfiles correspondientes
INSERT INTO profiles (id, email, full_name, role, phone, address)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'role',
  '+34600000000',
  'Dirección por defecto'
FROM auth.users u
WHERE u.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 5. Verificar creación
SELECT 
  'Usuarios en auth.users:' as info,
  COUNT(*) as count
FROM auth.users 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

SELECT 
  'Perfiles creados:' as info,
  COUNT(*) as count
FROM profiles 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 6. Mostrar detalles de usuarios creados
SELECT 
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'role' as role,
  p.phone,
  p.address
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
