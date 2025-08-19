-- Migración: Configurar Row Level Security (RLS) y políticas de seguridad
-- Fecha: 2025-08-19
-- Descripción: Configuración completa de seguridad para todas las tablas

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla profiles
-- Los usuarios pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Los administradores pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Los administradores pueden crear nuevos perfiles
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Políticas para la tabla workers
-- Los administradores pueden gestionar todas las trabajadoras
CREATE POLICY "Admins can manage workers" ON workers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Las trabajadoras pueden ver su propia información
CREATE POLICY "Workers can view own info" ON workers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.id = workers.profile_id
    )
  );

-- Políticas para la tabla users (clientes)
-- Los administradores pueden gestionar todos los usuarios
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Las trabajadoras pueden ver usuarios asignados a ellas
CREATE POLICY "Workers can view assigned users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a 
      JOIN workers w ON a.worker_id = w.id 
      JOIN profiles p ON w.profile_id = p.id
      WHERE p.id = auth.uid() 
        AND a.user_id = users.id 
        AND a.is_active = true
    )
  );

-- Políticas para la tabla assignments
-- Los administradores pueden gestionar todas las asignaciones
CREATE POLICY "Admins can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Las trabajadoras pueden ver sus propias asignaciones
CREATE POLICY "Workers can view own assignments" ON assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workers w 
      JOIN profiles p ON w.profile_id = p.id
      WHERE p.id = auth.uid() 
        AND w.id = assignments.worker_id
    )
  );

-- Políticas para la tabla assignment_time_slots
-- Los administradores pueden gestionar todos los tramos horarios
CREATE POLICY "Admins can manage time slots" ON assignment_time_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Las trabajadoras pueden ver tramos horarios de sus asignaciones
CREATE POLICY "Workers can view own assignment time slots" ON assignment_time_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assignments a 
      JOIN workers w ON a.worker_id = w.id 
      JOIN profiles p ON w.profile_id = p.id
      WHERE p.id = auth.uid() 
        AND a.id = assignment_time_slots.assignment_id
        AND a.is_active = true
    )
  );

-- Políticas para la tabla holidays
-- Todos los usuarios autenticados pueden ver los festivos
CREATE POLICY "Authenticated users can view holidays" ON holidays
  FOR SELECT USING (auth.role() = 'authenticated');

-- Solo administradores pueden gestionar festivos
CREATE POLICY "Admins can manage holidays" ON holidays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Políticas para la tabla work_hours
-- Los administradores pueden gestionar todas las horas trabajadas
CREATE POLICY "Admins can manage work hours" ON work_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Las trabajadoras pueden gestionar sus propias horas trabajadas
CREATE POLICY "Workers can manage own work hours" ON work_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM workers w 
      JOIN profiles p ON w.profile_id = p.id
      WHERE p.id = auth.uid() 
        AND w.id = work_hours.worker_id
    )
  );

-- Políticas para la tabla system_alerts
-- Los administradores pueden gestionar todas las alertas
CREATE POLICY "Admins can manage system alerts" ON system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Las trabajadoras pueden ver alertas relacionadas con sus asignaciones
CREATE POLICY "Workers can view relevant alerts" ON system_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workers w 
      JOIN profiles p ON w.profile_id = p.id
      WHERE p.id = auth.uid() 
        AND (
          system_alerts.related_entity_id = w.id 
          OR system_alerts.related_entity_id IN (
            SELECT a.id FROM assignments a WHERE a.worker_id = w.id
          )
        )
    )
  );

-- Políticas para la tabla monthly_reports
-- Los administradores pueden gestionar todos los reportes
CREATE POLICY "Admins can manage monthly reports" ON monthly_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Las trabajadoras pueden ver reportes de sus usuarios asignados
CREATE POLICY "Workers can view own users reports" ON monthly_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workers w 
      JOIN profiles p ON w.profile_id = p.id
      WHERE p.id = auth.uid() 
        AND w.id = monthly_reports.worker_id
    )
  );

-- Políticas adicionales para permitir inserción de perfiles desde triggers de auth
-- Esto permite que se cree un perfil cuando se registra un usuario
CREATE POLICY "Allow profile creation on signup" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Función y trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'worker');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para nuevos usuarios
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
