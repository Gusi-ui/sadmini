// =====================================================
// CONFIGURACIÓN INTERACTIVA DE PRODUCCIÓN
// Script para configurar credenciales reales de Supabase
// =====================================================

import readline from 'readline'
import fs from 'fs'
import path from 'path'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupProduction() {
  console.log('🚀 Configuración de Producción - Sistema de Cuidado Domiciliario')
  console.log('================================================================')
  console.log('')
  console.log('Este script te ayudará a configurar las credenciales de Supabase.')
  console.log('Necesitarás tener tu proyecto de Supabase creado y acceso al dashboard.')
  console.log('')
  console.log('📋 Pasos previos:')
  console.log('1. Ve a https://supabase.com/dashboard')
  console.log('2. Crea un nuevo proyecto o selecciona uno existente')
  console.log('3. Ve a Settings > API')
  console.log('4. Copia la URL del proyecto y las claves API')
  console.log('')

  const proceed = await question('¿Tienes las credenciales de Supabase listas? (s/n): ')
  if (proceed.toLowerCase() !== 's' && proceed.toLowerCase() !== 'si') {
    console.log('❌ Por favor, configura tu proyecto de Supabase primero.')
    rl.close()
    return
  }

  console.log('')
  console.log('🔧 Configurando credenciales...')
  console.log('')

  // Solicitar credenciales
  const supabaseUrl = await question('URL de Supabase (ej: https://abc123.supabase.co): ')
  const anonKey = await question('Clave anónima (anon/public key): ')
  const serviceKey = await question('Clave de service role (service_role key): ')

  console.log('')
  console.log('📝 Configurando URLs de aplicación...')
  const adminUrl = await question('URL del panel admin (ej: https://admin-mataro.vercel.app): ')
  const pwaUrl = await question('URL de la PWA trabajadoras (ej: https://trabajadoras-mataro.vercel.app): ')

  // Crear contenido del archivo .env
  const envContent = `# =====================================================
# CONFIGURACIÓN DE PRODUCCIÓN
# Sistema de Gestión de Cuidado Domiciliario - Mataró
# Generado automáticamente el ${new Date().toLocaleString()}
# =====================================================

# CONFIGURACIÓN DE SUPABASE
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${anonKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceKey}

# VARIABLES PARA APLICACIONES FRONTEND
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${anonKey}

# CONFIGURACIÓN DE LA APLICACIÓN
VITE_APP_NAME=Sistema de Cuidado Domiciliario
VITE_APP_VERSION=1.0.0
VITE_MUNICIPALITY=Mataró

# URLS DE PRODUCCIÓN
VITE_ADMIN_URL=${adminUrl}
VITE_PWA_URL=${pwaUrl}

# CONFIGURACIÓN DE PRODUCCIÓN
VITE_DEV_MODE=false
NODE_ENV=production
VITE_ENABLE_NOTIFICATIONS=true

# =====================================================
# CREDENCIALES DE ACCESO INICIAL
# =====================================================
# ADMINISTRADOR:
# Email: admin@mataro.cat
# Password: AdminMataro2024!
#
# TRABAJADORA DE EJEMPLO:
# Email: trabajadora@mataro.cat
# Password: TrabajadoraMataro2024!
#
# IMPORTANTE: Cambia estas contraseñas después del primer login
`

  // Escribir archivo .env
  fs.writeFileSync('.env', envContent)
  console.log('')
  console.log('✅ Archivo .env creado exitosamente!')
  console.log('')
  console.log('🎯 Próximos pasos:')
  console.log('1. Ejecutar: node create_real_users.js')
  console.log('2. Ejecutar setup_production_auth.sql en Supabase')
  console.log('3. Probar el login con las credenciales')
  console.log('')
  console.log('🔐 Credenciales de acceso:')
  console.log('Admin: admin@mataro.cat / AdminMataro2024!')
  console.log('Trabajadora: trabajadora@mataro.cat / TrabajadoraMataro2024!')
  console.log('')
  console.log('⚠️  IMPORTANTE: Cambia estas contraseñas después del primer login')

  rl.close()
}

setupProduction().catch(console.error)