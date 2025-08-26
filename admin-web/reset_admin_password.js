// Script para resetear la contraseña del administrador
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

// Usar la clave de servicio para operaciones administrativas
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetAdminPassword() {
  console.log('🔐 Reseteando contraseña del administrador...')
  
  try {
    const adminEmail = 'admin@sadmini.com'
    const newPassword = 'admin123'
    
    // Buscar el usuario por email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError)
      return
    }
    
    const adminUser = users.users.find(user => user.email === adminEmail)
    
    if (!adminUser) {
      console.error(`❌ No se encontró usuario con email: ${adminEmail}`)
      return
    }
    
    console.log(`👤 Usuario encontrado: ${adminUser.email} (ID: ${adminUser.id})`)
    
    // Actualizar la contraseña
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      {
        password: newPassword,
        email_confirm: true // Confirmar el email si no está confirmado
      }
    )
    
    if (updateError) {
      console.error('❌ Error actualizando contraseña:', updateError)
      return
    }
    
    console.log('✅ Contraseña actualizada exitosamente!')
    console.log(`📧 Email: ${adminEmail}`)
    console.log(`🔑 Nueva contraseña: ${newPassword}`)
    console.log(`✉️ Email confirmado: ${updateData.user.email_confirmed_at ? 'Sí' : 'No'}`)
    
    // Probar el login con la nueva contraseña
    console.log('\n🧪 Probando login con la nueva contraseña...')
    
    // Crear un cliente normal para probar el login
    const testClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY)
    
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: adminEmail,
      password: newPassword
    })
    
    if (loginError) {
      console.error('❌ Error en login de prueba:', loginError)
    } else {
      console.log('✅ Login de prueba exitoso!')
      console.log(`👤 Usuario: ${loginData.user.email}`)
      
      // Cerrar la sesión de prueba
      await testClient.auth.signOut()
      console.log('🚪 Sesión de prueba cerrada')
    }
    
    console.log('\n📋 Credenciales para usar en la aplicación web:')
    console.log(`Email: ${adminEmail}`)
    console.log(`Contraseña: ${newPassword}`)
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

resetAdminPassword()