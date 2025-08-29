-- Migración: Agregar ON DELETE CASCADE a la tabla profiles
-- Fecha: 2025-01-20
-- Descripción: Permite eliminar usuarios de auth.users sin restricciones de clave foránea

-- Primero eliminamos la restricción existente
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Agregamos la nueva restricción con ON DELETE CASCADE
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- También verificamos que workers tenga CASCADE para profile_id
ALTER TABLE workers DROP CONSTRAINT IF EXISTS workers_profile_id_fkey;
ALTER TABLE workers ADD CONSTRAINT workers_profile_id_fkey 
  FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;