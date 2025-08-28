#!/usr/bin/env node

// =====================================================
// SCRIPT DE MIGRACIÓN A PRODUCCIÓN
// Sistema de Gestión de Cuidado Domiciliario - Mataró
// =====================================================

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan')
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

async function checkEnvironmentVariables() {
  logStep('1', 'Verificando variables de entorno')
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]
  
  const missing = []
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }
  
  if (missing.length > 0) {
    logError('Variables de entorno faltantes:')
    missing.forEach(varName => log(`  - ${varName}`, 'red'))
    logInfo('Configura estas variables en tu archivo .env')
    return false
  }
  
  logSuccess('Todas las variables de entorno están configuradas')
  return true
}

async function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('No se pueden crear clientes de Supabase sin las credenciales')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

async function createRealUsers(supabase) {
  logStep('2', 'Creando usuarios reales en Supabase Auth')
  
  try {
    // Crear usuario administrador
    logInfo('Creando usuario administrador...')
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: 'admin@mataro.cat',
      password: 'AdminMataro2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Administrador Mataró',
        role: 'admin'
      }
    })
    
    if (adminError && !adminError.message.includes('already registered')) {
      logError(`Error creando administrador: ${adminError.message}`)
    } else {
      logSuccess('Usuario administrador creado/verificado')
    }
    
    // Crear usuario trabajadora de ejemplo
    logInfo('Creando usuario trabajadora de ejemplo...')
    const { data: workerUser, error: workerError } = await supabase.auth.admin.createUser({
      email: 'trabajadora@mataro.cat',
      password: 'TrabajadoraMataro2024!',
      email_confirm: true,
      user_metadata: {
        full_name: 'María García López',
        role: 'worker'
      }
    })
    
    if (workerError && !workerError.message.includes('already registered')) {
      logError(`Error creando trabajadora: ${workerError.message}`)
    } else {
      logSuccess('Usuario trabajadora creado/verificado')
    }
    
    return true
  } catch (error) {
    logError(`Error general creando usuarios: ${error.message}`)
    return false
  }
}

async function setupProductionPolicies(supabase) {
  logStep('3', 'Configurando políticas RLS de producción')
  
  try {
    // Leer y ejecutar el archivo SQL de configuración de producción
    const sqlPath = path.join(__dirname, 'setup_production_auth.sql')
    
    if (!fs.existsSync(sqlPath)) {
      logError('Archivo setup_production_auth.sql no encontrado')
      return false
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('SELECT'))
    
    logInfo(`Ejecutando ${statements.length} statements SQL...`)
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await supabase.rpc('exec_sql', { sql_query: statement })
        } catch (error) {
          // Algunos errores son esperados (como políticas que ya existen)
          if (!error.message.includes('already exists')) {
            logWarning(`Statement falló (puede ser normal): ${error.message}`)
          }
        }
      }
    }
    
    logSuccess('Políticas RLS configuradas')
    return true
  } catch (error) {
    logError(`Error configurando políticas: ${error.message}`)
    return false
  }
}

async function migrateUsefulData(supabase) {
  logStep('4', 'Migrando datos útiles de prueba')
  
  try {
    // Verificar si ya existen datos
    const { data: existingHolidays } = await supabase
      .from('holidays')
      .select('count')
      .limit(1)
    
    if (existingHolidays && existingHolidays.length > 0) {
      logInfo('Los festivos ya están configurados')
    } else {
      logInfo('Los festivos se configurarán con las migraciones de Supabase')
    }
    
    // Crear trabajadora real basada en los datos de prueba
    const { data: existingWorker } = await supabase
      .from('workers')
      .select('id')
      .eq('email', 'trabajadora@mataro.cat')
      .single()
    
    if (!existingWorker) {
      logInfo('Creando trabajadora real...')
      const { error: workerError } = await supabase
        .from('workers')
        .insert({
          employee_id: 'TRB001',
          dni: '12345678A',
          full_name: 'María García López',
          email: 'trabajadora@mataro.cat',
          phone: '+34600111111',
          address: 'Calle Mayor 1, Mataró',
          emergency_contact: 'Juan García',
          emergency_phone: '+34600111112',
          hire_date: new Date().toISOString().split('T')[0],
          is_active: true
        })
      
      if (workerError) {
        logError(`Error creando trabajadora: ${workerError.message}`)
      } else {
        logSuccess('Trabajadora real creada')
      }
    } else {
      logInfo('La trabajadora real ya existe')
    }
    
    return true
  } catch (error) {
    logError(`Error migrando datos: ${error.message}`)
    return false
  }
}

async function updateEnvironmentFiles() {
  logStep('5', 'Actualizando archivos de configuración')
  
  try {
    // Actualizar admin-web/.env
    const adminEnvPath = path.join(__dirname, 'admin-web', '.env')
    const adminEnvContent = `# Configuración de producción - Admin Web
VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY}
VITE_MUNICIPALITY=Mataró
VITE_DEV_MODE=false
`
    
    fs.writeFileSync(adminEnvPath, adminEnvContent)
    logSuccess('Archivo admin-web/.env actualizado')
    
    // Actualizar worker-pwa/.env
    const workerEnvPath = path.join(__dirname, 'worker-pwa', '.env')
    const workerEnvContent = `# Configuración de producción - Worker PWA
VITE_SUPABASE_URL=${process.env.VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${process.env.VITE_SUPABASE_ANON_KEY}
VITE_MUNICIPALITY=Mataró
VITE_DEV_MODE=false
`
    
    fs.writeFileSync(workerEnvPath, workerEnvContent)
    logSuccess('Archivo worker-pwa/.env actualizado')
    
    return true
  } catch (error) {
    logError(`Error actualizando archivos de entorno: ${error.message}`)
    return false
  }
}

async function main() {
  log('🚀 INICIANDO MIGRACIÓN A PRODUCCIÓN', 'bright')
  log('=====================================', 'bright')
  
  try {
    // Verificar variables de entorno
    const envOk = await checkEnvironmentVariables()
    if (!envOk) {
      process.exit(1)
    }
    
    // Crear cliente de Supabase
    const supabase = await createSupabaseClient()
    logSuccess('Cliente de Supabase creado')
    
    // Crear usuarios reales
    const usersOk = await createRealUsers(supabase)
    if (!usersOk) {
      logWarning('Algunos usuarios no se pudieron crear, continuando...')
    }
    
    // Configurar políticas de producción
    const policiesOk = await setupProductionPolicies(supabase)
    if (!policiesOk) {
      logWarning('Algunas políticas no se pudieron configurar, continuando...')
    }
    
    // Migrar datos útiles
    const dataOk = await migrateUsefulData(supabase)
    if (!dataOk) {
      logWarning('Algunos datos no se pudieron migrar, continuando...')
    }
    
    // Actualizar archivos de entorno
    const envFilesOk = await updateEnvironmentFiles()
    if (!envFilesOk) {
      logWarning('Algunos archivos de entorno no se pudieron actualizar')
    }
    
    log('\n🎉 MIGRACIÓN COMPLETADA', 'green')
    log('========================', 'green')
    
    logInfo('Próximos pasos:')
    log('1. Actualizar AuthContext.tsx en ambas aplicaciones', 'blue')
    log('2. Probar login con credenciales reales:', 'blue')
    log('   - Admin: admin@mataro.cat / AdminMataro2024!', 'blue')
    log('   - Worker: trabajadora@mataro.cat / TrabajadoraMataro2024!', 'blue')
    log('3. Desplegar aplicaciones en producción', 'blue')
    log('4. Configurar dominios y SSL', 'blue')
    
  } catch (error) {
    logError(`Error general en la migración: ${error.message}`)
    process.exit(1)
  }
}

// Ejecutar solo si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as migrateToProduction }