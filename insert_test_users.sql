-- Script para insertar usuarios de prueba en la base de datos
-- Ejecutar este script para agregar datos de ejemplo

-- Insertar usuarios/clientes de ejemplo
INSERT INTO users (id, full_name, dni, email, phone, address, emergency_contact, emergency_phone, medical_notes, monthly_hours, birth_date, gender, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Dolores Pérez Vidal', '87654321Z', 'dolores.perez@email.com', '+34 700 111 111', 'Carrer de la Riera 45, Mataró', 'José Pérez (hijo)', '+34 700 111 112', 'Diabetes tipo 2. Medicación: Metformina 850mg cada 12h. Movilidad reducida.', 86, '1945-03-15', 'mujer', true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Francisco Jiménez Alba', '98765432Y', 'francisco.jimenez@email.com', '+34 700 222 222', 'Carrer de Sant Josep 78, Mataró', 'Teresa Jiménez (hija)', '+34 700 222 223', 'Hipertensión arterial. Medicación: Enalapril 10mg por la mañana.', 41, '1940-11-22', 'hombre', true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Rosa Alonso Martín', '11223344X', 'rosa.alonso@email.com', '+34 700 333 333', 'Passeig del Callao 12, Mataró', 'Miguel Alonso (hermano)', '+34 700 333 334', 'Alzheimer inicial. Requiere supervisión en actividades básicas.', 65, '1950-07-08', 'mujer', true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Carmen López García', '55667788W', 'carmen.lopez@email.com', '+34 700 444 444', 'Carrer de Barcelona 156, Mataró', 'Ana López (nieta)', '+34 700 444 445', 'Sin medicación especial. Buena movilidad.', 30, '1955-09-12', 'mujer', true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Antonio Ruiz Fernández', '99887766V', 'antonio.ruiz@email.com', '+34 700 555 555', 'Avinguda Maresme 89, Mataró', 'María Ruiz (hija)', '+34 700 555 556', 'Problemas de movilidad. Usa bastón.', 52, '1948-12-03', 'hombre', true)
ON CONFLICT (id) DO NOTHING;

-- Verificar que los usuarios se insertaron correctamente
SELECT 
  'Usuarios insertados correctamente' as status,
  COUNT(*) as total_users
FROM users;

-- Mostrar los usuarios insertados
SELECT 
  full_name,
  dni,
  email,
  phone,
  monthly_hours,
  is_active
FROM users
ORDER BY full_name;