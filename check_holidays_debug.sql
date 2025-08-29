-- Script para verificar el estado de los festivos en la base de datos
-- y diagnosticar problemas de planificación

-- 1. Verificar festivos existentes
SELECT 
    'Festivos en la base de datos' as info,
    COUNT(*) as total_holidays,
    COUNT(CASE WHEN municipality = 'Mataró' THEN 1 END) as mataro_holidays,
    COUNT(CASE WHEN EXTRACT(YEAR FROM date::date) = 2025 THEN 1 END) as holidays_2025
FROM holidays 
WHERE is_active = true;

-- 2. Mostrar festivos de Mataró para 2025
SELECT 
    'Festivos Mataró 2025' as info,
    date,
    name,
    type,
    municipality
FROM holidays 
WHERE municipality = 'Mataró' 
    AND EXTRACT(YEAR FROM date::date) = 2025
    AND is_active = true
ORDER BY date;

-- 3. Verificar trabajadora con email rosa.romu@hotmail.com
SELECT 
    'Trabajadora Rosa' as info,
    w.id as worker_id,
    w.full_name,
    w.email,
    w.is_active
FROM workers w
WHERE w.email = 'rosa.romu@hotmail.com';

-- 4. Verificar asignaciones de la trabajadora
SELECT 
    'Asignaciones Rosa' as info,
    a.id as assignment_id,
    a.start_date,
    a.end_date,
    a.is_active,
    u.full_name as user_name
FROM assignments a
JOIN workers w ON a.worker_id = w.id
JOIN users u ON a.user_id = u.id
WHERE w.email = 'rosa.romu@hotmail.com';

-- 5. Verificar tramos horarios de la trabajadora
SELECT 
    'Tramos Horarios Rosa' as info,
    ats.day_of_week,
    ats.day_type,
    ats.start_time,
    ats.end_time,
    ats.is_active
FROM assignment_time_slots ats
JOIN assignments a ON ats.assignment_id = a.id
JOIN workers w ON a.worker_id = w.id
WHERE w.email = 'rosa.romu@hotmail.com'
    AND ats.is_active = true
ORDER BY ats.day_of_week, ats.day_type;

-- 6. Verificar función get_day_type para algunos días de enero 2025
SELECT 
    'Función get_day_type' as info,
    date_val,
    EXTRACT(ISODOW FROM date_val) as day_of_week,
    get_day_type(date_val) as calculated_day_type,
    CASE 
        WHEN EXTRACT(ISODOW FROM date_val) IN (6, 7) THEN 'fin_semana'
        WHEN EXISTS(SELECT 1 FROM holidays WHERE date = date_val::text AND is_active = true) THEN 'festivo'
        ELSE 'laborable'
    END as expected_day_type
FROM (
    SELECT generate_series('2025-01-01'::date, '2025-01-15'::date, '1 day'::interval)::date as date_val
) dates
ORDER BY date_val;