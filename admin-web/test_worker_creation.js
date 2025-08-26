// Script para probar la creación de trabajadoras
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

async function testWorkerCreation() {
  console.log('🔍 Probando creación de trabajadora...')
  
  try {
    // Primero verificar si hay usuarios autenticados
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('👤 Usuario actual:', user ? user.email : 'No autenticado')
    
    if (user) {
      // Verificar perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      console.log('📋 Perfil del usuario:', profile)
      if (profileError) {
        console.error('❌ Error obteniendo perfil:', profileError)
      }
    }
    
    // Intentar crear una trabajadora de prueba
    const testWorkerData = {
      employee_id: 'TEST001',
      dni: '12345678A',
      full_name: 'Trabajadora de Prueba',
      email: 'test@example.com',
      phone: '+34600000000',
      address: 'Dirección de prueba',
      emergency_contact: 'Contacto de emergencia',
      emergency_phone: '+34600000001',
      hire_date: new Date().toISOString().split('T')[0],
      notes: 'Trabajadora creada para pruebas',
      is_active: true
    }
    
    console.log('📝 Intentando crear trabajadora con datos:', testWorkerData)
    
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .insert(testWorkerData)
      .select()
      .single()
    
    if (workerError) {
      console.error('❌ Error creando trabajadora:', workerError)
      console.error('Código de error:', workerError.code)
      console.error('Mensaje:', workerError.message)
      console.error('Detalles:', workerError.details)
    } else {
      console.log('✅ Trabajadora creada exitosamente:', worker)
      
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
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testWorkerCreation()