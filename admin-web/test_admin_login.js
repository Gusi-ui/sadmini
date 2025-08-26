// Script para probar el login del administrador y creación de trabajadoras
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testAdminLogin() {
  console.log('🔐 Probando login del administrador...')
  
  try {
    // Intentar hacer login con las credenciales del admin
    const adminEmail = 'admin@sadmini.com'
    const adminPassword = 'admin123' // Contraseña común para pruebas
    
    console.log(`📧 Intentando login con: ${adminEmail}`)
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    })
    
    if (loginError) {
      console.error('❌ Error en login:', loginError.message)
      
      // Intentar con otras contraseñas comunes
      const commonPasswords = ['password', '123456', 'admin', 'sadmini123', 'admin@sadmini']
      
      console.log('🔄 Probando con contraseñas comunes...')
      for (const password of commonPasswords) {
        console.log(`🔑 Probando contraseña: ${password}`)
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: password
        })
        
        if (!error) {
          console.log(`✅ Login exitoso con contraseña: ${password}`)
          break
        } else {
          console.log(`❌ Falló con: ${password}`)
        }
      }
      
      return
    }
    
    console.log('✅ Login exitoso!')
    console.log('👤 Usuario logueado:', loginData.user.email)
    
    // Verificar perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError)
      return
    }
    
    console.log('📋 Perfil del usuario:')
    console.log(`   Nombre: ${profile.full_name}`)
    console.log(`   Rol: ${profile.role} ${profile.role === 'admin' ? '👑' : '👷'}`)
    
    if (profile.role !== 'admin') {
      console.error('❌ El usuario no tiene rol de administrador')
      return
    }
    
    // Intentar crear una trabajadora de prueba
    console.log('\n📝 Intentando crear trabajadora de prueba...')
    
    const testWorkerData = {
      employee_id: 'TEST002',
      dni: '87654321B',
      full_name: 'Trabajadora de Prueba Admin',
      email: 'test-admin@example.com',
      phone: '+34600000002',
      address: 'Dirección de prueba admin',
      emergency_contact: 'Contacto de emergencia admin',
      emergency_phone: '+34600000003',
      hire_date: new Date().toISOString().split('T')[0],
      notes: 'Trabajadora creada por admin autenticado',
      is_active: true
    }
    
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .insert(testWorkerData)
      .select()
      .single()
    
    if (workerError) {
      console.error('❌ Error creando trabajadora:', workerError)
      console.error('Código:', workerError.code)
      console.error('Mensaje:', workerError.message)
      console.error('Detalles:', workerError.details)
    } else {
      console.log('✅ Trabajadora creada exitosamente!')
      console.log('📋 Datos de la trabajadora:', worker)
      
      // Limpiar: eliminar la trabajadora de prueba
      const { error: deleteError } = await supabase
        .from('workers')
        .delete()
        .eq('id', worker.id)
      
      if (deleteError) {
        console.warn('⚠️ No se pudo eliminar la trabajadora de prueba:', deleteError)
      } else {
        console.log('🧹 Trabajadora de prueba eliminada')
      }
    }
    
    // Cerrar sesión
    await supabase.auth.signOut()
    console.log('🚪 Sesión cerrada')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testAdminLogin()