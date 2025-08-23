-- =====================================================
-- SCRIPT PARA CONFIGURAR AUTENTICACIÓN Y CREAR USUARIOS
-- Ejecutar este script en el SQL Editor de Supabase Console
-- =====================================================

-- 1. Verificar y habilitar el registro de usuarios
-- Esto debe hacerse desde la configuración de Supabase Dashboard

-- 2. Crear función para insertar usuarios directamente (método alternativo)
CREATE OR REPLACE FUNCTION create_test_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_role TEXT
) RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Generar un UUID para el usuario
  user_id := gen_random_uuid();
  
  -- Insertar en auth.users
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
    user_id,
    user_email,
    crypt(user_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('full_name', user_full_name, 'role', user_role),
    false,
    '',
    '',
    '',
    ''
  );
  
  -- Crear perfil correspondiente
  INSERT INTO profiles (id, email, full_name, role, phone, address) VALUES
    (user_id, user_email, user_full_name, user_role, '+34600000000', 'Dirección por defecto')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear usuarios de prueba usando la función
SELECT create_test_user(
  'admin@sadmini.com',
  'admin123',
  'Administrador del Sistema',
  'admin'
);

SELECT create_test_user(
  'trabajadora@sadmini.com',
  'worker123',
  'María García López',
  'worker'
);

-- 4. Verificar que los usuarios se crearon correctamente
SELECT 
  'Usuarios creados exitosamente' as status,
  COUNT(*) as total_users
FROM auth.users 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 5. Verificar que los perfiles se crearon correctamente
SELECT 
  'Perfiles creados exitosamente' as status,
  COUNT(*) as total_profiles
FROM profiles 
WHERE email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

-- 6. Mostrar información de los usuarios creados
SELECT 
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.raw_user_meta_data->>'role' as role,
  p.phone,
  p.address
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');
