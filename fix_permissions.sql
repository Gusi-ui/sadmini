-- =====================================================
-- CONFIGURAR PERMISOS Y POLÍTICAS DE SUPABASE
-- Ejecutar en Supabase SQL Editor después de setup_database.sql
-- =====================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- 2. Crear políticas para profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Crear políticas para workers
CREATE POLICY "Workers are viewable by authenticated users" ON workers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Workers can be created by authenticated users" ON workers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Workers can be updated by authenticated users" ON workers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Workers can be deleted by authenticated users" ON workers
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Crear políticas para users (clientes)
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can be created by authenticated users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can be updated by authenticated users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can be deleted by authenticated users" ON users
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Crear políticas para assignments
CREATE POLICY "Assignments are viewable by authenticated users" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Assignments can be created by authenticated users" ON assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Assignments can be updated by authenticated users" ON assignments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Assignments can be deleted by authenticated users" ON assignments
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Crear políticas para assignment_time_slots
CREATE POLICY "Time slots are viewable by authenticated users" ON assignment_time_slots
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Time slots can be created by authenticated users" ON assignment_time_slots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Time slots can be updated by authenticated users" ON assignment_time_slots
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Time slots can be deleted by authenticated users" ON assignment_time_slots
  FOR DELETE USING (auth.role() = 'authenticated');

-- 7. Crear políticas para holidays
CREATE POLICY "Holidays are viewable by authenticated users" ON holidays
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Holidays can be created by authenticated users" ON holidays
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Holidays can be updated by authenticated users" ON holidays
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Holidays can be deleted by authenticated users" ON holidays
  FOR DELETE USING (auth.role() = 'authenticated');

-- 8. Crear políticas para work_hours
CREATE POLICY "Work hours are viewable by authenticated users" ON work_hours
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Work hours can be created by authenticated users" ON work_hours
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Work hours can be updated by authenticated users" ON work_hours
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Work hours can be deleted by authenticated users" ON work_hours
  FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Verificar que las políticas se crearon correctamente
SELECT 
  'Políticas creadas:' as info,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours')
ORDER BY tablename, policyname;

-- 10. Mostrar resumen
SELECT 
  'Configuración de permisos completada' as status,
  'Las tablas ahora son accesibles desde la aplicación' as message;
