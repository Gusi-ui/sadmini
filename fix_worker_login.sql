-- =====================================================
-- SCRIPT PARA ARREGLAR EL LOGIN DE LA TRABAJADORA
-- Ejecutar este script en el SQL Editor de Supabase Console
-- =====================================================

-- 1. Verificar si existe el registro en la tabla workers
SELECT 
  'Estado actual de workers:' as info,
  COUNT(*) as total_workers,
  COUNT(CASE WHEN email = 'trabajadora@sadmini.com' THEN 1 END) as trabajadora_exists
FROM workers;

-- 2. Obtener el ID del usuario existente en auth.users
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar el ID del usuario por email
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'trabajadora@sadmini.com';
    
    -- Si encontramos el usuario, actualizar o crear el perfil
    IF user_uuid IS NOT NULL THEN
        -- Actualizar perfil existente
        UPDATE profiles 
        SET 
            id = user_uuid,
            full_name = 'María García López',
            role = 'worker',
            phone = '+34600000002',
            address = 'Calle Secundaria 456, Mataró'
        WHERE email = 'trabajadora@sadmini.com';
        
        -- Si no existe el perfil, crearlo con el ID correcto
        IF NOT FOUND THEN
            INSERT INTO profiles (id, email, full_name, role, phone, address) 
            VALUES (
                user_uuid,
                'trabajadora@sadmini.com',
                'María García López',
                'worker',
                '+34600000002',
                'Calle Secundaria 456, Mataró'
            );
        END IF;
        
        RAISE NOTICE 'Perfil actualizado/creado para usuario ID: %', user_uuid;
    ELSE
        RAISE EXCEPTION 'Usuario trabajadora@sadmini.com no encontrado en auth.users';
    END IF;
END $$;

-- 3. Actualizar registro existente en la tabla workers con el ID correcto
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Obtener el ID del usuario
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'trabajadora@sadmini.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Actualizar registro existente
        UPDATE workers 
        SET 
            email = 'trabajadora@sadmini.com',
            profile_id = user_uuid,
            full_name = 'María García López',
            phone = '+34600000002',
            address = 'Calle Secundaria 456, Mataró',
            emergency_contact = 'Juan García',
            emergency_phone = '+34600000003',
            is_active = true,
            notes = 'Trabajadora de prueba para el sistema'
        WHERE employee_id = 'TRB001';
        
        -- Si no existe, insertar nuevo registro
        IF NOT FOUND THEN
            INSERT INTO workers (
                employee_id,
                dni,
                full_name,
                email,
                phone,
                address,
                emergency_contact,
                emergency_phone,
                hire_date,
                profile_id,
                is_active,
                notes
            ) VALUES (
                'TRB001',
                '12345678A',
                'María García López',
                'trabajadora@sadmini.com',
                '+34600000002',
                'Calle Secundaria 456, Mataró',
                'Juan García',
                '+34600000003',
                '2024-01-15',
                user_uuid,
                true,
                'Trabajadora de prueba para el sistema'
            );
        END IF;
        
        RAISE NOTICE 'Worker actualizado/creado con profile_id: %', user_uuid;
    ELSE
        RAISE EXCEPTION 'No se pudo obtener el ID del usuario';
    END IF;
END $$;

-- 4. Verificar que el registro se actualizó correctamente
SELECT 
  'Verificación final:' as info,
  id,
  employee_id,
  email,
  full_name,
  profile_id,
  is_active
FROM workers
WHERE email = 'trabajadora@sadmini.com';

-- 5. Verificar que el profile_id coincide con auth.users
SELECT 
  'Verificación de vinculación:' as info,
  w.email as worker_email,
  w.profile_id as worker_profile_id,
  p.email as profile_email,
  p.role as profile_role,
  u.email as auth_email,
  CASE 
    WHEN w.profile_id = u.id THEN 'CORRECTO: IDs coinciden'
    ELSE 'ERROR: IDs no coinciden'
  END as status_vinculacion
FROM workers w
LEFT JOIN profiles p ON w.profile_id = p.id
LEFT JOIN auth.users u ON p.id = u.id
WHERE w.email = 'trabajadora@sadmini.com';

-- 6. Mensaje de confirmación
SELECT 
  'CONFIGURACIÓN COMPLETADA' as status,
  'La trabajadora ya puede hacer login con el ID correcto de auth.users' as message;