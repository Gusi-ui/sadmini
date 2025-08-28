-- =====================================================
-- BACKUP DE DATOS DE PRUEBA
-- Creado automáticamente antes de migrar a producción
-- Fecha: $(date '+%Y-%m-%d %H:%M:%S')
-- =====================================================

-- Este archivo contiene todos los datos de prueba actuales
-- para poder restaurarlos si es necesario durante la migración

-- IMPORTANTE: Ejecutar este backup ANTES de migrar a producción

BEGIN;

-- Backup de festivos (estos se mantienen en producción)
CREATE TABLE IF NOT EXISTS backup_holidays AS 
SELECT * FROM holidays;

-- Backup de trabajadoras de prueba
CREATE TABLE IF NOT EXISTS backup_workers AS 
SELECT * FROM workers;

-- Backup de usuarios/clientes de prueba
CREATE TABLE IF NOT EXISTS backup_users AS 
SELECT * FROM users;

-- Backup de asignaciones de prueba
CREATE TABLE IF NOT EXISTS backup_assignments AS 
SELECT * FROM assignments;

-- Backup de tramos horarios de prueba
CREATE TABLE IF NOT EXISTS backup_assignment_time_slots AS 
SELECT * FROM assignment_time_slots;

-- Backup de perfiles de prueba (si existen)
CREATE TABLE IF NOT EXISTS backup_profiles AS 
SELECT * FROM profiles WHERE id LIKE 'mock-%' OR email LIKE '%@email.com';

-- Backup de horas de trabajo registradas (si existen)
CREATE TABLE IF NOT EXISTS backup_work_hours AS 
SELECT * FROM work_hours;

COMMIT;

-- Verificar que el backup se creó correctamente
SELECT 
  'BACKUP COMPLETADO' as status,
  'Tablas de backup creadas:' as info;

SELECT 
  'backup_holidays' as tabla,
  COUNT(*) as registros
FROM backup_holidays
UNION ALL
SELECT 
  'backup_workers' as tabla,
  COUNT(*) as registros
FROM backup_workers
UNION ALL
SELECT 
  'backup_users' as tabla,
  COUNT(*) as registros
FROM backup_users
UNION ALL
SELECT 
  'backup_assignments' as tabla,
  COUNT(*) as registros
FROM backup_assignments
UNION ALL
SELECT 
  'backup_assignment_time_slots' as tabla,
  COUNT(*) as registros
FROM backup_assignment_time_slots
UNION ALL
SELECT 
  'backup_profiles' as tabla,
  COUNT(*) as registros
FROM backup_profiles
UNION ALL
SELECT 
  'backup_work_hours' as tabla,
  COUNT(*) as registros
FROM backup_work_hours;

-- =====================================================
-- SCRIPT DE RESTAURACIÓN (usar solo si es necesario)
-- =====================================================

/*
-- Para restaurar los datos de prueba, ejecutar:

BEGIN;

-- Limpiar datos actuales (CUIDADO: esto borra todo)
TRUNCATE TABLE work_hours CASCADE;
TRUNCATE TABLE assignment_time_slots CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE workers CASCADE;
DELETE FROM profiles WHERE id NOT LIKE 'real-%';

-- Restaurar datos de backup
INSERT INTO holidays SELECT * FROM backup_holidays ON CONFLICT DO NOTHING;
INSERT INTO workers SELECT * FROM backup_workers ON CONFLICT DO NOTHING;
INSERT INTO users SELECT * FROM backup_users ON CONFLICT DO NOTHING;
INSERT INTO assignments SELECT * FROM backup_assignments ON CONFLICT DO NOTHING;
INSERT INTO assignment_time_slots SELECT * FROM backup_assignment_time_slots ON CONFLICT DO NOTHING;
INSERT INTO profiles SELECT * FROM backup_profiles ON CONFLICT DO NOTHING;
INSERT INTO work_hours SELECT * FROM backup_work_hours ON CONFLICT DO NOTHING;

COMMIT;

SELECT 'DATOS DE PRUEBA RESTAURADOS' as status;
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
Este backup incluye:

1. FESTIVOS: Se mantienen en producción (datos útiles)
2. TRABAJADORAS DE PRUEBA: 
   - María García López (TRB001)
   - Carmen Martín Ruiz (TRB002) 
   - Ana Fernández Solé (TRB003)

3. USUARIOS/CLIENTES DE PRUEBA:
   - Dolores Pérez Vidal (86h mensuales)
   - Francisco Jiménez Alba (41h mensuales)
   - Rosa Alonso Martín (65h mensuales)

4. ASIGNACIONES Y HORARIOS: Configuraciones complejas de ejemplo

5. PERFILES MOCK: Perfiles de autenticación simulada

6. HORAS DE TRABAJO: Registros de tiempo si existen

Para migrar a producción:
1. Ejecutar este backup
2. Configurar variables de entorno reales
3. Crear usuarios reales en Supabase Auth
4. Configurar políticas RLS de producción
5. Migrar datos útiles (festivos, algunos usuarios ejemplo)
6. Actualizar contextos de autenticación
7. Probar login real
*/