-- =====================================================
-- MIGRACIÓN COMPLETA DEL SISTEMA DE CUIDADO DOMICILIARIO
-- =====================================================
-- Ejecutar este archivo completo en el SQL Editor de Supabase
-- Fecha: 2025-08-19

-- =====================================================
-- MIGRACIÓN 1: ESTRUCTURA BASE
-- =====================================================

-- Tabla de perfiles de usuario (extiende auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'worker')),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de trabajadoras
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  employee_id VARCHAR(50) UNIQUE NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de usuarios/clientes
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT NOT NULL,
  emergency_contact VARCHAR(255),
  emergency_phone VARCHAR(20),
  medical_notes TEXT,
  monthly_hours INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  birth_date DATE,
  gender VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de asignaciones (relación trabajadora-cliente)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, user_id)
);

-- Nueva tabla para tramos horarios flexibles por asignación
CREATE TABLE IF NOT EXISTS assignment_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Lunes, 7=Domingo
  day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('laborable', 'festivo', 'fin_semana')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de días festivos
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('nacional', 'autonomico', 'local')),
  municipality VARCHAR(100) DEFAULT 'Mataró',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para registro de horas trabajadas
CREATE TABLE IF NOT EXISTS work_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id),
  user_id UUID NOT NULL REFERENCES users(id),
  work_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  total_hours DECIMAL(4,2) NOT NULL,
  day_type VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de alertas del sistema
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  suggested_action TEXT,
  related_entity_type VARCHAR(50),
  related_entity_id UUID,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de reportes mensuales calculados
CREATE TABLE IF NOT EXISTS monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  worker_id UUID NOT NULL REFERENCES workers(id),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  assigned_hours INTEGER NOT NULL,
  calculated_hours DECIMAL(5,2) NOT NULL,
  excess_deficit_hours DECIMAL(5,2) NOT NULL, -- Positivo = exceso, Negativo = déficit
  working_days INTEGER NOT NULL,
  holiday_days INTEGER NOT NULL,
  weekend_days INTEGER NOT NULL,
  report_data JSONB, -- Detalles del cálculo
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_workers_is_active ON workers(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_active ON assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_worker ON assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_assignment ON assignment_time_slots(assignment_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_day ON assignment_time_slots(day_of_week, day_type);
CREATE INDEX IF NOT EXISTS idx_work_hours_date ON work_hours(work_date);
CREATE INDEX IF NOT EXISTS idx_work_hours_assignment ON work_hours(assignment_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_user_date ON monthly_reports(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_system_alerts_unresolved ON system_alerts(is_resolved) WHERE is_resolved = FALSE;

-- Funciones auxiliares para cálculos de reportes
CREATE OR REPLACE FUNCTION get_day_type(target_date DATE)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
  day_of_week INTEGER;
  is_holiday BOOLEAN;
BEGIN
  -- Obtener día de la semana (1 = Lunes, 7 = Domingo)
  day_of_week := EXTRACT(ISODOW FROM target_date);
  
  -- Verificar si es festivo
  SELECT EXISTS(
    SELECT 1 FROM holidays 
    WHERE date = target_date AND is_active = TRUE
  ) INTO is_holiday;
  
  -- Determinar tipo de día
  IF is_holiday THEN
    -- Si es festivo pero es fin de semana, considerarlo fin de semana
    IF day_of_week IN (6, 7) THEN
      RETURN 'fin_semana';
    ELSE
      RETURN 'festivo';
    END IF;
  ELSIF day_of_week IN (6, 7) THEN
    RETURN 'fin_semana';
  ELSE
    RETURN 'laborable';
  END IF;
END;
$$;

-- Función para calcular horas mensuales de un usuario
CREATE OR REPLACE FUNCTION calculate_monthly_hours(
  user_id_param UUID,
  year_param INTEGER,
  month_param INTEGER
)
RETURNS DECIMAL(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
  total_hours DECIMAL(5,2) := 0;
  current_date DATE;
  end_date DATE;
  day_type VARCHAR(20);
  daily_hours DECIMAL(4,2);
BEGIN
  -- Fecha de inicio y fin del mes
  current_date := DATE(year_param || '-' || LPAD(month_param::TEXT, 2, '0') || '-01');
  end_date := (current_date + INTERVAL '1 month - 1 day')::DATE;
  
  -- Iterar sobre cada día del mes
  WHILE current_date <= end_date LOOP
    -- Determinar tipo de día
    day_type := get_day_type(current_date);
    
    -- Calcular horas para este día
    SELECT COALESCE(SUM(
      EXTRACT(EPOCH FROM (ats.end_time - ats.start_time)) / 3600
    ), 0) INTO daily_hours
    FROM assignments a
    JOIN assignment_time_slots ats ON a.id = ats.assignment_id
    WHERE a.user_id = user_id_param
      AND a.is_active = TRUE
      AND ats.is_active = TRUE
      AND ats.day_of_week = EXTRACT(ISODOW FROM current_date)
      AND ats.day_type = day_type
      AND (a.start_date <= current_date)
      AND (a.end_date IS NULL OR a.end_date >= current_date);
    
    total_hours := total_hours + daily_hours;
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN total_hours;
END;
$$;

-- Triggers para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers a las tablas necesarias
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assignment_time_slots_updated_at BEFORE UPDATE ON assignment_time_slots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_hours_updated_at BEFORE UPDATE ON work_hours FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRACIÓN 2: DATOS INICIALES
-- =====================================================

-- Insertar perfiles de administrador y trabajadora de ejemplo
INSERT INTO profiles (id, email, full_name, role, phone, address) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@sadmini.com', 'Administrador del Sistema', 'admin', '+34600000001', 'Calle Principal 123, Mataró'),
  ('00000000-0000-0000-0000-000000000002', 'trabajadora@sadmini.com', 'María García López', 'worker', '+34600000002', 'Calle Secundaria 456, Mataró')
ON CONFLICT (id) DO NOTHING;

-- Insertar trabajadoras de ejemplo
INSERT INTO workers (employee_id, dni, full_name, email, phone, address, emergency_contact, emergency_phone, hire_date, notes) VALUES
  ('EMP001', '12345678A', 'María García López', 'maria.garcia@sadmini.com', '+34600000002', 'Calle Secundaria 456, Mataró', 'Juan García', '+34600000003', '2024-01-15', 'Trabajadora experimentada en cuidado de ancianos'),
  ('EMP002', '87654321B', 'Ana Martínez Ruiz', 'ana.martinez@sadmini.com', '+34600000004', 'Avenida Central 789, Mataró', 'Carlos Martínez', '+34600000005', '2024-02-01', 'Especializada en cuidado de personas con movilidad reducida'),
  ('EMP003', '11223344C', 'Carmen Rodríguez Vega', 'carmen.rodriguez@sadmini.com', '+34600000006', 'Plaza Mayor 321, Mataró', 'Luis Rodríguez', '+34600000007', '2024-03-10', 'Experiencia en cuidado de personas con demencia')
ON CONFLICT (employee_id) DO NOTHING;

-- Insertar usuarios/clientes de ejemplo
INSERT INTO users (full_name, dni, email, phone, address, emergency_contact, emergency_phone, medical_notes, monthly_hours, birth_date, gender) VALUES
  ('José López Pérez', '11111111A', 'jose.lopez@email.com', '+34600000008', 'Calle Mayor 100, Mataró', 'María López', '+34600000009', 'Hipertensión controlada. Toma medicación diaria.', 60, '1940-05-15', 'hombre'),
  ('Isabel Fernández Moreno', '22222222B', 'isabel.fernandez@email.com', '+34600000010', 'Calle San Juan 200, Mataró', 'Pedro Fernández', '+34600000011', 'Diabetes tipo 2. Necesita ayuda con la medicación.', 80, '1935-08-22', 'mujer'),
  ('Antonio Jiménez Silva', '33333333C', 'antonio.jimenez@email.com', '+34600000012', 'Avenida Barcelona 300, Mataró', 'Carmen Jiménez', '+34600000013', 'Movilidad reducida. Usa silla de ruedas.', 120, '1938-12-03', 'hombre'),
  ('Rosa Martín González', '44444444D', 'rosa.martin@email.com', '+34600000014', 'Calle del Mar 400, Mataró', 'Francisco Martín', '+34600000015', 'Demencia leve. Necesita supervisión constante.', 100, '1942-03-18', 'mujer'),
  ('Manuel Torres Sánchez', '55555555E', 'manuel.torres@email.com', '+34600000016', 'Plaza España 500, Mataró', 'Ana Torres', '+34600000017', 'Problemas de visión. Necesita ayuda para moverse.', 90, '1937-07-25', 'hombre')
ON CONFLICT (dni) DO NOTHING;

-- Insertar asignaciones de ejemplo
INSERT INTO assignments (worker_id, user_id, start_date, notes) VALUES
  ((SELECT id FROM workers WHERE employee_id = 'EMP001'), (SELECT id FROM users WHERE dni = '11111111A'), '2024-01-20', 'Cuidado básico y acompañamiento'),
  ((SELECT id FROM workers WHERE employee_id = 'EMP001'), (SELECT id FROM users WHERE dni = '22222222B'), '2024-02-05', 'Ayuda con medicación y cuidado personal'),
  ((SELECT id FROM workers WHERE employee_id = 'EMP002'), (SELECT id FROM users WHERE dni = '33333333C'), '2024-03-15', 'Cuidado especializado para movilidad reducida'),
  ((SELECT id FROM workers WHERE employee_id = 'EMP002'), (SELECT id FROM users WHERE dni = '44444444D'), '2024-03-20', 'Supervisión y acompañamiento para demencia'),
  ((SELECT id FROM workers WHERE employee_id = 'EMP003'), (SELECT id FROM users WHERE dni = '55555555E'), '2024-04-01', 'Ayuda para movilidad y cuidado personal')
ON CONFLICT (worker_id, user_id) DO NOTHING;

-- Insertar tramos horarios de ejemplo
INSERT INTO assignment_time_slots (assignment_id, day_of_week, day_type, start_time, end_time) VALUES
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP001' AND u.dni = '11111111A'), 1, 'laborable', '09:00', '12:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP001' AND u.dni = '11111111A'), 3, 'laborable', '09:00', '12:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP001' AND u.dni = '11111111A'), 5, 'laborable', '09:00', '12:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP001' AND u.dni = '22222222B'), 2, 'laborable', '14:00', '18:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP001' AND u.dni = '22222222B'), 4, 'laborable', '14:00', '18:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP002' AND u.dni = '33333333C'), 1, 'laborable', '08:00', '14:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP002' AND u.dni = '33333333C'), 3, 'laborable', '08:00', '14:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP002' AND u.dni = '44444444D'), 2, 'laborable', '15:00', '20:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP002' AND u.dni = '44444444D'), 4, 'laborable', '15:00', '20:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP003' AND u.dni = '55555555E'), 1, 'laborable', '10:00', '16:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP003' AND u.dni = '55555555E'), 3, 'laborable', '10:00', '16:00'),
  ((SELECT a.id FROM assignments a JOIN workers w ON a.worker_id = w.id JOIN users u ON a.user_id = u.id WHERE w.employee_id = 'EMP003' AND u.dni = '55555555E'), 5, 'laborable', '10:00', '16:00');

-- Insertar festivos de ejemplo para 2025
INSERT INTO holidays (date, name, type, municipality) VALUES
  ('2025-01-01', 'Año Nuevo', 'nacional', 'Mataró'),
  ('2025-01-06', 'Día de Reyes', 'nacional', 'Mataró'),
  ('2025-04-18', 'Viernes Santo', 'nacional', 'Mataró'),
  ('2025-04-21', 'Lunes de Pascua', 'nacional', 'Mataró'),
  ('2025-05-01', 'Día del Trabajador', 'nacional', 'Mataró'),
  ('2025-06-24', 'San Juan', 'nacional', 'Mataró'),
  ('2025-08-15', 'Asunción de la Virgen', 'nacional', 'Mataró'),
  ('2025-09-11', 'Diada de Catalunya', 'autonomico', 'Mataró'),
  ('2025-10-12', 'Día de la Hispanidad', 'nacional', 'Mataró'),
  ('2025-11-01', 'Todos los Santos', 'nacional', 'Mataró'),
  ('2025-12-06', 'Día de la Constitución', 'nacional', 'Mataró'),
  ('2025-12-08', 'Inmaculada Concepción', 'nacional', 'Mataró'),
  ('2025-12-25', 'Navidad', 'nacional', 'Mataró'),
  ('2025-12-26', 'San Esteban', 'autonomico', 'Mataró')
ON CONFLICT (date) DO NOTHING;

-- =====================================================
-- MIGRACIÓN 3: POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

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

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para workers
CREATE POLICY "Admins can manage workers" ON workers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can view their own data" ON workers
  FOR SELECT USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para users
CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para assignments
CREATE POLICY "Admins can manage assignments" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can view their assignments" ON assignments
  FOR SELECT USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para assignment_time_slots
CREATE POLICY "Admins can manage time slots" ON assignment_time_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can view their time slots" ON assignment_time_slots
  FOR SELECT USING (
    assignment_id IN (
      SELECT a.id FROM assignments a 
      JOIN workers w ON a.worker_id = w.id 
      WHERE w.profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para holidays
CREATE POLICY "Everyone can view holidays" ON holidays
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage holidays" ON holidays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para work_hours
CREATE POLICY "Admins can manage work hours" ON work_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can view their work hours" ON work_hours
  FOR SELECT USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para system_alerts
CREATE POLICY "Admins can manage alerts" ON system_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can view alerts" ON system_alerts
  FOR SELECT USING (true);

-- Políticas para monthly_reports
CREATE POLICY "Admins can manage reports" ON monthly_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Workers can view their reports" ON monthly_reports
  FOR SELECT USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FINALIZACIÓN
-- =====================================================

-- Verificar que todo se creó correctamente
SELECT 'Migración completada exitosamente' as status;
