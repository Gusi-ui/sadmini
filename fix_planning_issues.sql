-- Script para corregir problemas de planificación
-- 1. Insertar festivos de Mataró 2025 si no existen
-- 2. Verificar y corregir tramos horarios problemáticos

DO $$
DECLARE
    holiday_count INTEGER;
    assignment_count INTEGER;
BEGIN
    -- Verificar si ya existen festivos de Mataró para 2025
    SELECT COUNT(*) INTO holiday_count
    FROM holidays 
    WHERE municipality = 'Mataró' 
        AND EXTRACT(YEAR FROM date::date) = 2025
        AND is_active = true;
    
    -- Si no hay festivos, insertarlos
    IF holiday_count = 0 THEN
        RAISE NOTICE 'Insertando festivos de Mataró 2025...';
        
        INSERT INTO holidays (date, name, type, municipality, is_active) VALUES
        ('2025-01-01', 'Cap d''Any', 'nacional', 'Mataró', true),
        ('2025-01-06', 'Reis', 'nacional', 'Mataró', true),
        ('2025-04-18', 'Divendres Sant', 'nacional', 'Mataró', true),
        ('2025-04-21', 'Dilluns de Pasqua Florida', 'autonomico', 'Mataró', true),
        ('2025-05-01', 'Festa del Treball', 'nacional', 'Mataró', true),
        ('2025-06-09', 'Fira a Mataró', 'local', 'Mataró', true),
        ('2025-06-24', 'Sant Joan', 'autonomico', 'Mataró', true),
        ('2025-07-28', 'Festa major de Les Santes', 'local', 'Mataró', true),
        ('2025-08-15', 'L''Assumpció', 'nacional', 'Mataró', true),
        ('2025-09-11', 'Diada Nacional de Catalunya', 'autonomico', 'Mataró', true),
        ('2025-11-01', 'Tots Sants', 'nacional', 'Mataró', true),
        ('2025-12-06', 'Dia de la Constitució', 'nacional', 'Mataró', true),
        ('2025-12-08', 'La Immaculada', 'nacional', 'Mataró', true),
        ('2025-12-25', 'Nadal', 'nacional', 'Mataró', true),
        ('2025-12-26', 'Sant Esteve', 'autonomico', 'Mataró', true)
        ON CONFLICT (date, municipality) DO NOTHING;
        
        RAISE NOTICE 'Festivos de Mataró 2025 insertados correctamente.';
    ELSE
        RAISE NOTICE 'Ya existen % festivos de Mataró para 2025.', holiday_count;
    END IF;
    
    -- Verificar asignaciones de trabajadoras que solo deberían trabajar días laborables
    -- pero tienen tramos horarios para fines de semana
    RAISE NOTICE 'Verificando tramos horarios problemáticos...';
    
    -- Mostrar trabajadoras con tramos de fin de semana que podrían ser problemáticos
    FOR assignment_count IN
        SELECT DISTINCT w.full_name
        FROM workers w
        JOIN assignments a ON w.id = a.worker_id
        JOIN assignment_time_slots ats ON a.id = ats.assignment_id
        WHERE ats.day_type = 'fin_semana'
            AND ats.is_active = true
            AND a.is_active = true
            AND w.is_active = true
    LOOP
        RAISE NOTICE 'Trabajadora con servicios de fin de semana: %', assignment_count;
    END LOOP;
    
    -- Verificar específicamente la trabajadora rosa.romu@hotmail.com
    SELECT COUNT(*) INTO assignment_count
    FROM workers w
    JOIN assignments a ON w.id = a.worker_id
    JOIN assignment_time_slots ats ON a.id = ats.assignment_id
    WHERE w.email = 'rosa.romu@hotmail.com'
        AND ats.day_type = 'fin_semana'
        AND ats.is_active = true;
    
    IF assignment_count > 0 THEN
        RAISE NOTICE 'PROBLEMA ENCONTRADO: La trabajadora rosa.romu@hotmail.com tiene % tramos horarios de fin de semana.', assignment_count;
        
        -- Mostrar los tramos problemáticos
        RAISE NOTICE 'Tramos de fin de semana encontrados:';
        FOR assignment_count IN
            SELECT ats.day_of_week, ats.start_time, ats.end_time
            FROM workers w
            JOIN assignments a ON w.id = a.worker_id
            JOIN assignment_time_slots ats ON a.id = ats.assignment_id
            WHERE w.email = 'rosa.romu@hotmail.com'
                AND ats.day_type = 'fin_semana'
                AND ats.is_active = true
        LOOP
            RAISE NOTICE 'Día %, Horario: % - %', assignment_count;
        END LOOP;
        
        -- OPCIÓN: Desactivar tramos de fin de semana para trabajadoras de días laborables
        -- Descomenta las siguientes líneas si quieres corregir automáticamente:
        /*
        UPDATE assignment_time_slots 
        SET is_active = false,
            updated_at = NOW()
        FROM assignments a
        JOIN workers w ON a.worker_id = w.id
        WHERE assignment_time_slots.assignment_id = a.id
            AND w.email = 'rosa.romu@hotmail.com'
            AND assignment_time_slots.day_type = 'fin_semana';
        
        RAISE NOTICE 'Tramos de fin de semana desactivados para rosa.romu@hotmail.com';
        */
    ELSE
        RAISE NOTICE 'No se encontraron tramos de fin de semana para rosa.romu@hotmail.com';
    END IF;
    
    -- Verificar que la función get_day_type funciona correctamente
    RAISE NOTICE 'Verificando función get_day_type...';
    
    -- Probar algunos días específicos
    RAISE NOTICE 'Día 2025-01-01 (Año Nuevo): %', get_day_type('2025-01-01'::date);
    RAISE NOTICE 'Día 2025-01-02 (Jueves normal): %', get_day_type('2025-01-02'::date);
    RAISE NOTICE 'Día 2025-01-04 (Sábado): %', get_day_type('2025-01-04'::date);
    RAISE NOTICE 'Día 2025-01-06 (Reyes): %', get_day_type('2025-01-06'::date);
    
END $$;

-- Mostrar resumen final
SELECT 
    'RESUMEN FINAL' as info,
    (
        SELECT COUNT(*) 
        FROM holidays 
        WHERE municipality = 'Mataró' 
            AND EXTRACT(YEAR FROM date::date) = 2025
            AND is_active = true
    ) as festivos_mataro_2025,
    (
        SELECT COUNT(*) 
        FROM workers w
        JOIN assignments a ON w.id = a.worker_id
        JOIN assignment_time_slots ats ON a.id = ats.assignment_id
        WHERE w.email = 'rosa.romu@hotmail.com'
            AND ats.is_active = true
    ) as tramos_rosa_total,
    (
        SELECT COUNT(*) 
        FROM workers w
        JOIN assignments a ON w.id = a.worker_id
        JOIN assignment_time_slots ats ON a.id = ats.assignment_id
        WHERE w.email = 'rosa.romu@hotmail.com'
            AND ats.day_type = 'laborable'
            AND ats.is_active = true
    ) as tramos_rosa_laborables,
    (
        SELECT COUNT(*) 
        FROM workers w
        JOIN assignments a ON w.id = a.worker_id
        JOIN assignment_time_slots ats ON a.id = ats.assignment_id
        WHERE w.email = 'rosa.romu@hotmail.com'
            AND ats.day_type = 'fin_semana'
            AND ats.is_active = true
    ) as tramos_rosa_fin_semana;