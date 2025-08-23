-- =====================================================
-- VINCULAR USUARIOS DE AUTENTICACIÓN CON PERFILES
-- Ejecutar después de setup_database.sql
-- =====================================================

-- 1. Crear perfiles para los usuarios de autenticación existentes
INSERT INTO profiles (id, email, full_name, role, phone, address)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario del Sistema'),
  COALESCE(u.raw_user_meta_data->>'role', 'admin'),
  '+34600000000',
  'Dirección por defecto'
FROM auth.users u
WHERE u.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 2. Vincular trabajadora existente con su perfil
UPDATE workers 
SET profile_id = p.id
FROM profiles p
WHERE workers.email = p.email
AND p.email = 'trabajadora@sadmini.com';

-- 3. Verificar vinculaciones
SELECT 
  'Perfiles vinculados:' as info,
  COUNT(*) as count
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN ('admin@sadmini.com', 'trabajadora@sadmini.com');

SELECT 
  'Trabajadora vinculada:' as info,
  w.full_name,
  p.email
FROM workers w
JOIN profiles p ON w.profile_id = p.id
WHERE p.email = 'trabajadora@sadmini.com';

-- 4. Mostrar resumen final
SELECT 
  'Vinculación completada' as status,
  'Los usuarios pueden acceder al sistema' as message;
