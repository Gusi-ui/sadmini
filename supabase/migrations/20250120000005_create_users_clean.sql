-- =====================================================
-- MIGRACIÓN: CREAR USUARIOS LIMPIOS - MANEJO DE REFERENCIAS
-- =====================================================

-- 1. Eliminar registros dependientes de los perfiles que vamos a borrar
-- Eliminar work_hours asociados a asignaciones de los perfiles de admin/trabajadora
DELETE FROM work_hours
WHERE assignment_id IN (
    SELECT a.id
    FROM assignments a
    JOIN workers w ON a.worker_id = w.id
    JOIN profiles p ON w.profile_id = p.id
    WHERE p.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
);

-- Eliminar assignment_time_slots asociados a asignaciones de los perfiles de admin/trabajadora
DELETE FROM assignment_time_slots
WHERE assignment_id IN (
    SELECT a.id
    FROM assignments a
    JOIN workers w ON a.worker_id = w.id
    JOIN profiles p ON w.profile_id = p.id
    WHERE p.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
);

-- Eliminar asignaciones asociadas a los perfiles de admin/trabajadora
DELETE FROM assignments
WHERE worker_id IN (
    SELECT w.id
    FROM workers w
    JOIN profiles p ON w.profile_id = p.id
    WHERE p.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
);

-- Eliminar workers asociados a los perfiles de admin/trabajadora
DELETE FROM workers
WHERE profile_id IN (
    SELECT id FROM profiles WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
);

-- 2. Eliminar perfiles y usuarios de autenticación
DELETE FROM profiles WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
DELETE FROM auth.users WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 3. Crear usuarios directamente en auth.users
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

-- 4. Verificar usuarios creados
SELECT 
  'Usuarios creados en auth.users:' as info,
  id,
  email,
  raw_user_meta_data,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
ORDER BY email;

-- 5. Crear perfiles para los usuarios
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

-- 6. Verificar perfiles creados
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
