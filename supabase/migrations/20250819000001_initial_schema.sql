-- Migración: Crear estructura base del sistema de cuidado domiciliario
-- Fecha: 2025-08-19
-- Descripción: Tablas principales para trabajadoras, usuarios, asignaciones y sistema de reportes

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
