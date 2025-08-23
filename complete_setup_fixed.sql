-- =====================================================
-- CONFIGURACIÓN COMPLETA DEL SISTEMA (VERSIÓN CORREGIDA)
-- Sistema de Gestión de Cuidado Domiciliario
-- Ejecutar este script completo en el SQL Editor de Supabase
-- =====================================================

-- =====================================================
-- 1. CREAR TABLAS PRINCIPALES
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

-- Tabla de tramos horarios por asignación
CREATE TABLE IF NOT EXISTS assignment_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
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

-- Tabla de registro de horas trabajadas
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

-- =====================================================
-- 2. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_workers_is_active ON workers(is_active);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_active ON assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_assignments_worker ON assignments(worker_id);
CREATE INDEX IF NOT EXISTS idx_assignments_user ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_assignment ON assignment_time_slots(assignment_id);
CREATE INDEX IF NOT EXISTS idx_work_hours_date ON work_hours(work_date);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);

-- =====================================================
-- 3. FUNCIONES AUXILIARES
-- =====================================================

-- Función para determinar el tipo de día
CREATE OR REPLACE FUNCTION get_day_type(target_date DATE)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
  day_of_week INTEGER;
  is_holiday BOOLEAN;
BEGIN
  day_of_week := EXTRACT(ISODOW FROM target_date);
  
  SELECT EXISTS(
    SELECT 1 FROM holidays 
    WHERE date = target_date AND is_active = TRUE
  ) INTO is_holiday;
  
  IF is_holiday THEN
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

-- =====================================================
-- 4. CONFIGURAR PERMISOS Y POLÍTICAS
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes para evitar errores de duplicación
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Workers are viewable by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers can be created by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers can be updated by authenticated users" ON workers;
DROP POLICY IF EXISTS "Workers can be deleted by authenticated users" ON workers;

DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be created by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be updated by authenticated users" ON users;
DROP POLICY IF EXISTS "Users can be deleted by authenticated users" ON users;

DROP POLICY IF EXISTS "Assignments are viewable by authenticated users" ON assignments;
DROP POLICY IF EXISTS "Assignments can be created by authenticated users" ON assignments;
DROP POLICY IF EXISTS "Assignments can be updated by authenticated users" ON assignments;
DROP POLICY IF EXISTS "Assignments can be deleted by authenticated users" ON assignments;

DROP POLICY IF EXISTS "Time slots are viewable by authenticated users" ON assignment_time_slots;
DROP POLICY IF EXISTS "Time slots can be created by authenticated users" ON assignment_time_slots;
DROP POLICY IF EXISTS "Time slots can be updated by authenticated users" ON assignment_time_slots;
DROP POLICY IF EXISTS "Time slots can be deleted by authenticated users" ON assignment_time_slots;

DROP POLICY IF EXISTS "Holidays are viewable by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be created by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be updated by authenticated users" ON holidays;
DROP POLICY IF EXISTS "Holidays can be deleted by authenticated users" ON holidays;

DROP POLICY IF EXISTS "Work hours are viewable by authenticated users" ON work_hours;
DROP POLICY IF EXISTS "Work hours can be created by authenticated users" ON work_hours;
DROP POLICY IF EXISTS "Work hours can be updated by authenticated users" ON work_hours;
DROP POLICY IF EXISTS "Work hours can be deleted by authenticated users" ON work_hours;

-- Crear políticas para profiles
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Crear políticas para workers
CREATE POLICY "Workers are viewable by authenticated users" ON workers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Workers can be created by authenticated users" ON workers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Workers can be updated by authenticated users" ON workers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Workers can be deleted by authenticated users" ON workers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para users (clientes)
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can be created by authenticated users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can be updated by authenticated users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can be deleted by authenticated users" ON users
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para assignments
CREATE POLICY "Assignments are viewable by authenticated users" ON assignments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Assignments can be created by authenticated users" ON assignments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Assignments can be updated by authenticated users" ON assignments
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Assignments can be deleted by authenticated users" ON assignments
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para assignment_time_slots
CREATE POLICY "Time slots are viewable by authenticated users" ON assignment_time_slots
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Time slots can be created by authenticated users" ON assignment_time_slots
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Time slots can be updated by authenticated users" ON assignment_time_slots
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Time slots can be deleted by authenticated users" ON assignment_time_slots
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para holidays
CREATE POLICY "Holidays are viewable by authenticated users" ON holidays
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Holidays can be created by authenticated users" ON holidays
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Holidays can be updated by authenticated users" ON holidays
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Holidays can be deleted by authenticated users" ON holidays
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para work_hours
CREATE POLICY "Work hours are viewable by authenticated users" ON work_hours
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Work hours can be created by authenticated users" ON work_hours
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Work hours can be updated by authenticated users" ON work_hours
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Work hours can be deleted by authenticated users" ON work_hours
  FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. INSERTAR DATOS DE PRUEBA
-- =====================================================

-- Insertar trabajadoras de prueba
INSERT INTO workers (employee_id, dni, full_name, email, phone, address, emergency_contact, emergency_phone, hire_date) VALUES
  ('TRB001', '12345678A', 'María García López', 'maria.garcia@example.com', '+34600000001', 'Calle Mayor 123, Mataró', 'Juan García', '+34600000002', '2024-01-15'),
  ('TRB002', '87654321B', 'Ana Martínez Ruiz', 'ana.martinez@example.com', '+34600000003', 'Avenida Catalunya 456, Mataró', 'Carlos Martínez', '+34600000004', '2024-02-01'),
  ('TRB003', '11223344C', 'Carmen Rodríguez Vega', 'carmen.rodriguez@example.com', '+34600000005', 'Plaza España 789, Mataró', 'Miguel Rodríguez', '+34600000006', '2024-03-10')
ON CONFLICT (employee_id) DO NOTHING;

-- Insertar usuarios/clientes de prueba
INSERT INTO users (full_name, dni, email, phone, address, emergency_contact, emergency_phone, monthly_hours, birth_date, gender) VALUES
  ('Isabel Fernández Moreno', '11111111A', 'isabel.fernandez@example.com', '+34600000007', 'Calle Sant Josep 10, Mataró', 'Pedro Fernández', '+34600000008', 40, '1945-05-20', 'Femenino'),
  ('José López Martín', '22222222B', 'jose.lopez@example.com', '+34600000009', 'Carrer de la Pau 25, Mataró', 'María López', '+34600000010', 35, '1940-08-15', 'Masculino'),
  ('Rosa Sánchez Jiménez', '33333333C', 'rosa.sanchez@example.com', '+34600000011', 'Avinguda del Mar 50, Mataró', 'Antonio Sánchez', '+34600000012', 45, '1950-12-03', 'Femenino'),
  ('Manuel Torres García', '44444444D', 'manuel.torres@example.com', '+34600000013', 'Calle Sant Andreu 15, Mataró', 'Carmen Torres', '+34600000014', 30, '1938-03-10', 'Masculino')
ON CONFLICT (dni) DO NOTHING;

-- Insertar asignaciones de prueba
INSERT INTO assignments (worker_id, user_id, start_date, notes) 
SELECT 
  w.id,
  u.id,
  '2024-01-01',
  'Asignación inicial'
FROM workers w, users u
WHERE w.employee_id = 'TRB001' AND u.dni = '11111111A'
ON CONFLICT (worker_id, user_id) DO NOTHING;

INSERT INTO assignments (worker_id, user_id, start_date, notes) 
SELECT 
  w.id,
  u.id,
  '2024-01-01',
  'Asignación inicial'
FROM workers w, users u
WHERE w.employee_id = 'TRB002' AND u.dni = '22222222B'
ON CONFLICT (worker_id, user_id) DO NOTHING;

-- Insertar tramos horarios de prueba
INSERT INTO assignment_time_slots (assignment_id, day_of_week, day_type, start_time, end_time)
SELECT 
  a.id,
  1, -- Lunes
  'laborable',
  '08:00:00',
  '12:00:00'
FROM assignments a
JOIN workers w ON a.worker_id = w.id
JOIN users u ON a.user_id = u.id
WHERE w.employee_id = 'TRB001' AND u.dni = '11111111A'
ON CONFLICT DO NOTHING;

-- Insertar días festivos de 2025
INSERT INTO holidays (date, name, type) VALUES
  ('2025-01-01', 'Año Nuevo', 'nacional'),
  ('2025-01-06', 'Día de Reyes', 'nacional'),
  ('2025-04-18', 'Viernes Santo', 'nacional'),
  ('2025-04-20', 'Domingo de Resurrección', 'nacional'),
  ('2025-05-01', 'Día del Trabajo', 'nacional'),
  ('2025-08-15', 'Asunción de la Virgen', 'nacional'),
  ('2025-09-11', 'Diada de Catalunya', 'autonomico'),
  ('2025-10-12', 'Día de la Hispanidad', 'nacional'),
  ('2025-11-01', 'Todos los Santos', 'nacional'),
  ('2025-12-06', 'Día de la Constitución', 'nacional'),
  ('2025-12-25', 'Navidad', 'nacional')
ON CONFLICT (date) DO NOTHING;

-- =====================================================
-- 6. VERIFICACIÓN FINAL
-- =====================================================

-- Verificar tablas creadas
SELECT 
  'Tablas creadas:' as info,
  COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours');

-- Verificar datos insertados
SELECT 
  'Trabajadoras:' as info,
  COUNT(*) as count
FROM workers;

SELECT 
  'Usuarios:' as info,
  COUNT(*) as count
FROM users;

SELECT 
  'Asignaciones:' as info,
  COUNT(*) as count
FROM assignments;

SELECT 
  'Días festivos:' as info,
  COUNT(*) as count
FROM holidays;

-- Verificar políticas creadas
SELECT 
  'Políticas creadas:' as info,
  COUNT(*) as count
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'users', 'assignments', 'assignment_time_slots', 'holidays', 'work_hours');

-- Mostrar resumen final
SELECT 
  'CONFIGURACIÓN COMPLETADA EXITOSAMENTE' as status,
  'El sistema está listo para usar con datos de prueba' as message;
