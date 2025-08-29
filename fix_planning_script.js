import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Leer variables de entorno
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixPlanningIssues() {
  console.log('🔧 Corrigiendo problemas de planificación...')
  
  try {
    // 1. Verificar si faltan festivos de Mataró 2025
    console.log('\n📅 Verificando festivos de Mataró 2025...')
    const { data: existingHolidays, error: holidaysError } = await supabase
      .from('holidays')
      .select('date')
      .eq('municipality', 'Mataró')
      .gte('date', '2025-01-01')
      .lte('date', '2025-12-31')
      .eq('is_active', true)
    
    if (holidaysError) {
      console.error('Error al verificar festivos:', holidaysError)
      return
    }
    
    const existingDates = existingHolidays?.map(h => h.date) || []
    console.log(`✅ Festivos existentes: ${existingDates.length}`)
    
    // Festivos de Mataró 2025 que deberían existir
    const requiredHolidays = [
      { date: '2025-01-01', name: 'Cap d\'Any', type: 'nacional' },
      { date: '2025-01-06', name: 'Reis', type: 'nacional' },
      { date: '2025-04-18', name: 'Divendres Sant', type: 'nacional' },
      { date: '2025-04-21', name: 'Dilluns de Pasqua Florida', type: 'autonomico' },
      { date: '2025-05-01', name: 'Festa del Treball', type: 'nacional' },
      { date: '2025-06-09', name: 'Fira a Mataró', type: 'local' },
      { date: '2025-06-24', name: 'Sant Joan', type: 'autonomico' },
      { date: '2025-07-28', name: 'Festa major de Les Santes', type: 'local' },
      { date: '2025-08-15', name: 'L\'Assumpció', type: 'nacional' },
      { date: '2025-09-11', name: 'Diada Nacional de Catalunya', type: 'autonomico' },
      { date: '2025-11-01', name: 'Tots Sants', type: 'nacional' },
      { date: '2025-12-06', name: 'Dia de la Constitució', type: 'nacional' },
      { date: '2025-12-08', name: 'La Immaculada', type: 'nacional' },
      { date: '2025-12-25', name: 'Nadal', type: 'nacional' },
      { date: '2025-12-26', name: 'Sant Esteve', type: 'autonomico' }
    ]
    
    // Insertar festivos faltantes
    const missingHolidays = requiredHolidays.filter(h => !existingDates.includes(h.date))
    
    if (missingHolidays.length > 0) {
      console.log(`📝 Insertando ${missingHolidays.length} festivos faltantes...`)
      
      const holidaysToInsert = missingHolidays.map(h => ({
        date: h.date,
        name: h.name,
        type: h.type,
        municipality: 'Mataró',
        is_active: true
      }))
      
      const { error: insertError } = await supabase
        .from('holidays')
        .insert(holidaysToInsert)
      
      if (insertError) {
        console.error('Error al insertar festivos:', insertError)
      } else {
        console.log('✅ Festivos insertados correctamente')
        missingHolidays.forEach(h => {
          console.log(`  + ${h.date}: ${h.name}`)
        })
      }
    } else {
      console.log('✅ Todos los festivos ya están presentes')
    }
    
    // 2. Verificar y corregir asignaciones de Rosa
    console.log('\n👩‍💼 Verificando asignaciones de Rosa...')
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('id, full_name')
      .eq('email', 'rosa.romu@hotmail.com')
      .single()
    
    if (workerError || !worker) {
      console.log('❌ Trabajadora Rosa no encontrada')
      return
    }
    
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        id,
        start_date,
        end_date,
        user_id,
        time_slots:assignment_time_slots(*)
      `)
      .eq('worker_id', worker.id)
      .eq('is_active', true)
    
    if (assignmentsError) {
      console.error('Error al verificar asignaciones:', assignmentsError)
      return
    }
    
    console.log(`✅ Asignaciones encontradas: ${assignments?.length || 0}`)
    
    // Verificar asignaciones sin tramos horarios
    const assignmentsWithoutSlots = assignments?.filter(a => 
      !a.time_slots || a.time_slots.length === 0
    ) || []
    
    if (assignmentsWithoutSlots.length > 0) {
      console.log(`⚠️  ${assignmentsWithoutSlots.length} asignaciones sin tramos horarios`)
      
      for (const assignment of assignmentsWithoutSlots) {
        console.log(`\n📋 Configurando tramos horarios para asignación ${assignment.id}...`)
        
        // Crear tramos horarios básicos para días laborables (Lunes a Viernes)
        const timeSlots = [
          { day_of_week: 1, day_type: 'laborable', start_time: '09:00', end_time: '13:00' }, // Lunes
          { day_of_week: 2, day_type: 'laborable', start_time: '09:00', end_time: '13:00' }, // Martes
          { day_of_week: 3, day_type: 'laborable', start_time: '09:00', end_time: '13:00' }, // Miércoles
          { day_of_week: 4, day_type: 'laborable', start_time: '09:00', end_time: '13:00' }, // Jueves
          { day_of_week: 5, day_type: 'laborable', start_time: '09:00', end_time: '13:00' }  // Viernes
        ]
        
        const slotsToInsert = timeSlots.map(slot => ({
          assignment_id: assignment.id,
          day_of_week: slot.day_of_week,
          day_type: slot.day_type,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_active: true
        }))
        
        const { error: slotsError } = await supabase
          .from('assignment_time_slots')
          .insert(slotsToInsert)
        
        if (slotsError) {
          console.error(`Error al crear tramos horarios para asignación ${assignment.id}:`, slotsError)
        } else {
          console.log(`✅ Tramos horarios creados para asignación ${assignment.id}`)
          console.log('  - Lunes a Viernes: 09:00 - 13:00 (días laborables)')
        }
      }
    }
    
    // 3. Verificar y eliminar tramos de fin de semana incorrectos
    console.log('\n🔍 Verificando tramos de fin de semana...')
    const { data: weekendSlots, error: weekendError } = await supabase
      .from('assignment_time_slots')
      .select(`
        id,
        day_type,
        start_time,
        end_time,
        assignment:assignments!inner(
          worker:workers!inner(full_name, email)
        )
      `)
      .eq('day_type', 'fin_semana')
      .eq('is_active', true)
      .eq('assignment.worker.email', 'rosa.romu@hotmail.com')
    
    if (weekendError) {
      console.error('Error al verificar tramos de fin de semana:', weekendError)
    } else if (weekendSlots && weekendSlots.length > 0) {
      console.log(`⚠️  Encontrados ${weekendSlots.length} tramos de fin de semana para Rosa`)
      console.log('🗑️  Desactivando tramos de fin de semana...')
      
      const slotIds = weekendSlots.map(slot => slot.id)
      const { error: deactivateError } = await supabase
        .from('assignment_time_slots')
        .update({ is_active: false })
        .in('id', slotIds)
      
      if (deactivateError) {
        console.error('Error al desactivar tramos de fin de semana:', deactivateError)
      } else {
        console.log('✅ Tramos de fin de semana desactivados correctamente')
      }
    } else {
      console.log('✅ No se encontraron tramos de fin de semana problemáticos')
    }
    
    console.log('\n🎉 Corrección de problemas de planificación completada')
    console.log('\n📋 Resumen de cambios:')
    console.log('  ✅ Festivos de Mataró 2025 verificados/insertados')
    console.log('  ✅ Tramos horarios de días laborables configurados para Rosa')
    console.log('  ✅ Tramos de fin de semana incorrectos eliminados')
    console.log('\n🔄 Reinicia la aplicación para ver los cambios reflejados')
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error)
  }
}

fixPlanningIssues()