-- Migración: Insertar datos iniciales y festivos de Mataró 2025
-- Fecha: 2025-08-19
-- Descripción: Datos de ejemplo y festivos oficiales para el sistema

-- Insertar festivos de Mataró 2025
INSERT INTO holidays (date, name, type, municipality) VALUES
-- Festivos nacionales
('2025-01-01', 'Año Nuevo', 'nacional', 'Mataró'),
('2025-01-06', 'Epifanía del Señor', 'nacional', 'Mataró'),
('2025-04-18', 'Viernes Santo', 'nacional', 'Mataró'),
('2025-04-21', 'Lunes de Pascua', 'nacional', 'Mataró'),
('2025-05-01', 'Día del Trabajador', 'nacional', 'Mataró'),
('2025-08-15', 'Asunción de la Virgen', 'nacional', 'Mataró'),
('2025-10-12', 'Fiesta Nacional de España', 'nacional', 'Mataró'),
('2025-11-01', 'Todos los Santos', 'nacional', 'Mataró'),
('2025-12-06', 'Día de la Constitución', 'nacional', 'Mataró'),
('2025-12-08', 'Inmaculada Concepción', 'nacional', 'Mataró'),
('2025-12-25', 'Navidad', 'nacional', 'Mataró'),
('2025-12-26', 'San Esteban', 'nacional', 'Mataró'),

-- Festivos autonómicos de Cataluña
('2025-09-11', 'Diada Nacional de Cataluña', 'autonomico', 'Mataró'),
('2025-06-24', 'San Juan', 'autonomico', 'Mataró'),

-- Festivos locales de Mataró
('2025-07-23', 'Santa Cristina (Patrona de Mataró)', 'local', 'Mataró'),
('2025-02-17', 'Carnaval', 'local', 'Mataró')

ON CONFLICT (date) DO NOTHING;

-- Datos de ejemplo para desarrollo/testing
-- Nota: Estos datos se pueden eliminar en producción

-- NOTA: Los perfiles se crearán automáticamente cuando los usuarios se registren
-- Por ahora comentamos esta inserción para evitar errores de clave foránea

-- INSERT INTO profiles (id, email, full_name, role, phone) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'admin@mataro.com', 'Administrador Sistema', 'admin', '+34 600 000 001')
-- ON CONFLICT (id) DO NOTHING;

-- Insertar trabajadoras de ejemplo
INSERT INTO workers (id, employee_id, dni, full_name, email, phone, address, emergency_contact, emergency_phone, hire_date, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'TRB001', '12345678A', 'María García López', 'maria.garcia@mataro.com', '+34 600 111 111', 'Calle Mayor 1, Mataró', 'Juan García', '+34 600 111 112', '2024-01-15', true),
('22222222-2222-2222-2222-222222222222', 'TRB002', '23456789B', 'Carmen Martín Ruiz', 'carmen.martin@mataro.com', '+34 600 222 222', 'Avenida del Mar 25, Mataró', 'Pedro Martín', '+34 600 222 223', '2024-02-01', true),
('33333333-3333-3333-3333-333333333333', 'TRB003', '34567890C', 'Ana Fernández Solé', 'ana.fernandez@mataro.com', '+34 600 333 333', 'Plaza de la Vila 10, Mataró', 'Luis Fernández', '+34 600 333 334', '2023-08-10', false)
ON CONFLICT (id) DO NOTHING;

-- Insertar usuarios/clientes de ejemplo
INSERT INTO users (id, full_name, dni, email, phone, address, emergency_contact, emergency_phone, medical_notes, monthly_hours, birth_date, gender) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dolores Pérez Vidal', '87654321Z', 'dolores.perez@email.com', '+34 700 111 111', 'Carrer de la Riera 45, Mataró', 'José Pérez (hijo)', '+34 700 111 112', 'Diabetes tipo 2. Medicación: Metformina 850mg cada 12h. Movilidad reducida.', 86, '1945-03-15', 'mujer'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Francisco Jiménez Alba', '98765432Y', 'francisco.jimenez@email.com', '+34 700 222 222', 'Carrer de Sant Josep 78, Mataró', 'Teresa Jiménez (hija)', '+34 700 222 223', 'Hipertensión arterial. Medicación: Enalapril 10mg por la mañana.', 41, '1940-11-22', 'hombre'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rosa Alonso Martín', '11223344X', 'rosa.alonso@email.com', '+34 700 333 333', 'Passeig del Callao 12, Mataró', 'Miguel Alonso (hermano)', '+34 700 333 334', 'Alzheimer inicial. Requiere supervisión en actividades básicas.', 65, '1950-07-08', 'mujer')
ON CONFLICT (id) DO NOTHING;

-- Insertar asignaciones de ejemplo
INSERT INTO assignments (id, worker_id, user_id, start_date, is_active, notes) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2025-01-01', true, 'Usuario de 86h mensuales con horarios complejos'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2025-01-01', true, 'Usuario de 41h mensuales con horarios variables'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-01-01', true, 'Usuario de 65h mensuales')
ON CONFLICT (id) DO NOTHING;

-- Insertar tramos horarios para usuario de 86h (Dolores Pérez)
-- Días laborables: 2 tramos (8:00-9:30 + 13:00-15:00 = 3.5h/día)
INSERT INTO assignment_time_slots (assignment_id, day_of_week, day_type, start_time, end_time) VALUES
-- Lunes a viernes laborables - Tramo mañana
('dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'laborable', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'laborable', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 'laborable', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'laborable', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 5, 'laborable', '08:00', '09:30'),
-- Lunes a viernes laborables - Tramo tarde
('dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'laborable', '13:00', '15:00'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'laborable', '13:00', '15:00'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 'laborable', '13:00', '15:00'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'laborable', '13:00', '15:00'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 5, 'laborable', '13:00', '15:00'),
-- Festivos de semana: 1 tramo (8:00-9:30 = 1.5h)
('dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'festivo', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'festivo', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 'festivo', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'festivo', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 5, 'festivo', '08:00', '09:30'),
-- Fines de semana: 1 tramo (8:00-9:30 = 1.5h)
('dddddddd-dddd-dddd-dddd-dddddddddddd', 6, 'fin_semana', '08:00', '09:30'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 7, 'fin_semana', '08:00', '09:30')
ON CONFLICT DO NOTHING;

-- Insertar tramos horarios para usuario de 41h (Francisco Jiménez)
-- Solo días laborables con horarios variables por día
INSERT INTO assignment_time_slots (assignment_id, day_of_week, day_type, start_time, end_time) VALUES
-- Lunes: 9:45-11:45 (2h)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, 'laborable', '09:45', '11:45'),
-- Martes: 11:15-11:45 (0.5h) + 17:00-18:30 (1.5h) = 2h
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 'laborable', '11:15', '11:45'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 'laborable', '17:00', '18:30'),
-- Miércoles: 9:45-11:45 (2h)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 3, 'laborable', '09:45', '11:45'),
-- Jueves: 11:15-11:45 (0.5h) + 17:00-18:30 (1.5h) = 2h
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 4, 'laborable', '11:15', '11:45'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 4, 'laborable', '17:00', '18:30'),
-- Viernes laborables: 9:45-12:45 (3h)
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 5, 'laborable', '09:45', '12:45')
ON CONFLICT DO NOTHING;

-- Insertar tramos horarios para usuario de 65h (Rosa Alonso)
-- Horarios estándar: lunes a viernes 9:00-12:00 (3h/día) = 65h/mes aproximadamente
INSERT INTO assignment_time_slots (assignment_id, day_of_week, day_type, start_time, end_time) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 'laborable', '09:00', '12:00'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 'laborable', '09:00', '12:00'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 3, 'laborable', '09:00', '12:00'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 4, 'laborable', '09:00', '12:00'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 5, 'laborable', '09:00', '12:00')
ON CONFLICT DO NOTHING;
