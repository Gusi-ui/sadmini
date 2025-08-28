// =====================================================
// CONFIGURAR POLÍTICAS RLS DE PRODUCCIÓN
// Script para ejecutar setup_production_auth.sql
// =====================================================

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

// Cargar variables de entorno desde .env
dotenv.config()

// Configuración de Supabase desde variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno faltantes')
  console.error('Asegúrate de configurar:')
  console.error('- SUPABASE_URL o VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Crear cliente de Supabase con service key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupProductionPolicies() {
  console.log('🔐 Configurando políticas RLS de producción...')
  console.log('')

  try {
    // 1. Crear perfiles para usuarios existentes
    console.log('📝 Creando perfiles para usuarios reales...')
    
    // Obtener IDs de usuarios de auth
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) {
      console.error('❌ Error obteniendo usuarios:', usersError.message)
      return
    }

    const adminUser = users.users.find(u => u.email === 'admin@mataro.cat')
    const workerUser = users.users.find(u => u.email === 'trabajadora@mataro.cat')

    if (adminUser) {
      const { error: adminProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: adminUser.id,
          email: 'admin@mataro.cat',
          full_name: 'Administrador Mataró',
          role: 'admin',
          phone: '+34937580200',
          address: 'Plaça de l\'Ajuntament 1, 08301 Mataró'
        })
      
      if (adminProfileError) {
        console.error('❌ Error creando perfil admin:', adminProfileError.message)
      } else {
        console.log('✅ Perfil de administrador creado/actualizado')
      }
    }

    if (workerUser) {
      const { error: workerProfileError } = await supabase
        .from('profiles')
        .upsert({
          id: workerUser.id,
          email: 'trabajadora@mataro.cat',
          full_name: 'María García López',
          role: 'worker',
          phone: '+34600000002',
          address: 'Carrer de la Riera 123, 08301 Mataró'
        })
      
      if (workerProfileError) {
        console.error('❌ Error creando perfil worker:', workerProfileError.message)
      } else {
        console.log('✅ Perfil de trabajadora creado/actualizado')
      }
    }

    // 2. Ejecutar comandos SQL para RLS y políticas
    console.log('')
    console.log('🔒 Configurando Row Level Security...')
    
    const rlsCommands = [
      'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE workers ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE assignment_time_slots ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE work_hours ENABLE ROW LEVEL SECURITY;'
    ]

    for (const command of rlsCommands) {
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      if (error && !error.message.includes('already enabled')) {
        console.log(`⚠️  RLS: ${command} - ${error.message}`)
      }
    }
    console.log('✅ RLS habilitado en todas las tablas')

    // 3. Eliminar políticas existentes
    console.log('')
    console.log('🗑️  Eliminando políticas existentes...')
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Profiles accessible by all" ON profiles;',
      'DROP POLICY IF EXISTS "Workers accessible by all" ON workers;',
      'DROP POLICY IF EXISTS "Users accessible by all" ON users;',
      'DROP POLICY IF EXISTS "Assignments accessible by all" ON assignments;',
      'DROP POLICY IF EXISTS "Time slots accessible by all" ON assignment_time_slots;',
      'DROP POLICY IF EXISTS "Holidays accessible by all" ON holidays;',
      'DROP POLICY IF EXISTS "Work hours accessible by all" ON work_hours;'
    ]

    for (const command of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: command })
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️  Drop: ${error.message}`)
      }
    }
    console.log('✅ Políticas antiguas eliminadas')

    // 4. Crear nuevas políticas de producción
    console.log('')
    console.log('🛡️  Creando políticas de producción...')
    
    const productionPolicies = [
      // Políticas para profiles
      'CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);',
      'CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);',
      'CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);',
      
      // Políticas para workers
      'CREATE POLICY "Authenticated users can manage workers" ON workers FOR ALL USING (auth.role() = \'authenticated\');',
      
      // Políticas para users
      'CREATE POLICY "Authenticated users can manage users" ON users FOR ALL USING (auth.role() = \'authenticated\');',
      
      // Políticas para assignments
      'CREATE POLICY "Authenticated users can manage assignments" ON assignments FOR ALL USING (auth.role() = \'authenticated\');',
      
      // Políticas para assignment_time_slots
      'CREATE POLICY "Authenticated users can manage time slots" ON assignment_time_slots FOR ALL USING (auth.role() = \'authenticated\');',
      
      // Políticas para holidays
      'CREATE POLICY "Authenticated users can manage holidays" ON holidays FOR ALL USING (auth.role() = \'authenticated\');',
      
      // Políticas para work_hours
      'CREATE POLICY "Authenticated users can manage work hours" ON work_hours FOR ALL USING (auth.role() = \'authenticated\');'
    ]

    for (const policy of productionPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql: policy })
      if (error && !error.message.includes('already exists')) {
        console.log(`⚠️  Policy: ${error.message}`)
      }
    }
    console.log('✅ Políticas de producción creadas')

    // 5. Verificar configuración
    console.log('')
    console.log('🔍 Verificando configuración...')
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
    
    if (profilesError) {
      console.error('❌ Error verificando perfiles:', profilesError.message)
    } else {
      console.log('📊 Perfiles existentes:')
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.role}) - ${profile.full_name}`)
      })
    }

    console.log('')
    console.log('🎉 Configuración de producción completada!')
    console.log('')
    console.log('📋 Próximos pasos:')
    console.log('  1. Probar login con credenciales reales')
    console.log('  2. Verificar que las aplicaciones funcionan correctamente')
    console.log('  3. Migrar datos útiles de prueba si es necesario')
    console.log('')
    console.log('🔐 Credenciales de acceso:')
    console.log('  Admin: admin@mataro.cat / AdminMataro2024!')
    console.log('  Trabajadora: trabajadora@mataro.cat / TrabajadoraMataro2024!')

  } catch (error) {
    console.error('💥 Error general:', error.message)
  }
}

// Ejecutar la función
setupProductionPolicies()