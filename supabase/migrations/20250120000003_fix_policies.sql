-- =====================================================
-- MIGRACIÓN: ARREGLAR POLÍTICAS RLS
-- =====================================================

-- 1. Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can manage workers" ON workers;
DROP POLICY IF EXISTS "Authenticated users can manage users" ON users;
DROP POLICY IF EXISTS "Authenticated users can manage assignments" ON assignments;
DROP POLICY IF EXISTS "Authenticated users can manage time slots" ON assignment_time_slots;
DROP POLICY IF EXISTS "Authenticated users can manage holidays" ON holidays;
DROP POLICY IF EXISTS "Authenticated users can manage work hours" ON work_hours;

-- También eliminar políticas con nombres diferentes
DROP POLICY IF EXISTS "Profiles accessible by all" ON profiles;
DROP POLICY IF EXISTS "Workers accessible by all" ON workers;
DROP POLICY IF EXISTS "Users accessible by all" ON users;
DROP POLICY IF EXISTS "Assignments accessible by all" ON assignments;
DROP POLICY IF EXISTS "Time slots accessible by all" ON assignment_time_slots;
DROP POLICY IF EXISTS "Holidays accessible by all" ON holidays;
DROP POLICY IF EXISTS "Work hours accessible by all" ON work_hours;

-- 2. Crear políticas de producción correctas
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
