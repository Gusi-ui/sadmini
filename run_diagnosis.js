import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Leer variables de entorno
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno SUPABASE_URL y SUPABASE_ANON_KEY requeridas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runDiagnosis() {
  console.log('🔍 Ejecutando diagnóstico de planificación...')
  
  try {
    // 1. Verificar festivos existentes
    console.log('\n📅 Verificando festivos...')
    const { data: holidaysCount, error: holidaysError } = await supabase
      .from('holidays')
      .select('*', { count: 'exact' })
      .eq('municipality', 'Mataró')
      .eq('is_active', true)
    
    if (holidaysError) {
      console.error('Error al verificar festivos:', holidaysError)
    } else {
      console.log(`✅ Festivos de Mataró encontrados: ${holidaysCount?.length || 0}`)
      if (holidaysCount && holidaysCount.length > 0) {
        console.log('Festivos 2025:')
        holidaysCount
          .filter(h => h.date.startsWith('2025'))
          .forEach(h => console.log(`  - ${h.date}: ${h.name} (${h.type})`))
      }
    }
    
    // 2. Verificar trabajadora Rosa
    console.log('\n👩‍💼 Verificando trabajadora Rosa...')
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('email', 'rosa.romu@hotmail.com')
      .single()
    
    if (workerError) {
      console.error('Error al verificar trabajadora:', workerError)
      return
    }
    
    if (!worker) {
      console.log('❌ Trabajadora Rosa no encontrada')
      return
    }
    
    console.log(`✅ Trabajadora encontrada: ${worker.full_name} (ID: ${worker.id})`)
    
    // 3. Verificar asignaciones de Rosa
    console.log('\n📋 Verificando asignaciones de Rosa...')
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select(`
        *,
        user:users(full_name),
        time_slots:assignment_time_slots(*)
      `)
      .eq('worker_id', worker.id)
      .eq('is_active', true)
    
    if (assignmentsError) {
      console.error('Error al verificar asignaciones:', assignmentsError)
      return
    }
    
    console.log(`✅ Asignaciones activas: ${assignments?.length || 0}`)
    
    if (assignments && assignments.length > 0) {
      assignments.forEach((assignment, index) => {
        console.log(`\n  Asignación ${index + 1}:`)
        console.log(`    Usuario: ${assignment.user?.full_name}`)
        console.log(`    Período: ${assignment.start_date} - ${assignment.end_date || 'indefinido'}`)
        console.log(`    Tramos horarios: ${assignment.time_slots?.length || 0}`)
        
        if (assignment.time_slots && assignment.time_slots.length > 0) {
          assignment.time_slots.forEach(slot => {
            if (slot.is_active) {
              console.log(`      - ${slot.day_type} (día ${slot.day_of_week}): ${slot.start_time} - ${slot.end_time}`)
            }
          })
          
          // Verificar tramos problemáticos
          const weekendSlots = assignment.time_slots.filter(slot => 
            slot.is_active && slot.day_type === 'fin_semana'
          )
          
          if (weekendSlots.length > 0) {
            console.log(`    ⚠️  PROBLEMA: ${weekendSlots.length} tramos de fin de semana encontrados`)
            weekendSlots.forEach(slot => {
              console.log(`      - Fin de semana: ${slot.start_time} - ${slot.end_time}`)
            })
          }
        }
      })
    }
    
    // 4. Verificar función get_day_type
    console.log('\n🗓️  Verificando función get_day_type...')
    const testDates = [
      '2025-01-01', // Año Nuevo (festivo)
      '2025-01-02', // Jueves normal (laborable)
      '2025-01-04', // Sábado (fin_semana)
      '2025-01-06'  // Reyes (festivo)
    ]
    
    for (const date of testDates) {
      const { data: dayTypeResult, error: dayTypeError } = await supabase
        .rpc('get_day_type', { input_date: date })
      
      if (dayTypeError) {
        console.error(`Error al verificar ${date}:`, dayTypeError)
      } else {
        console.log(`  ${date}: ${dayTypeResult}`)
      }
    }
    
    console.log('\n✅ Diagnóstico completado')
    
  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error)
  }
}

runDiagnosis()