// Script para verificar usuarios administradores en la base de datos
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ No configurada')
  console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ No configurada')
  process.exit(1)
}

// Usar la clave de servicio para bypasear RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminUsers() {
  console.log('🔍 Verificando usuarios administradores...')
  
  try {
    // Obtener todos los perfiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (profilesError) {
      console.error('❌ Error obteniendo perfiles:', profilesError)
      return
    }
    
    console.log(`📋 Total de perfiles encontrados: ${profiles.length}`)
    
    if (profiles.length === 0) {
      console.log('⚠️ No se encontraron perfiles en la base de datos')
      return
    }
    
    // Mostrar todos los perfiles
    console.log('\n👥 Lista de todos los perfiles:')
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.full_name || 'Sin nombre'}`)
      console.log(`   📧 Email: ${profile.email}`)
      console.log(`   🔑 ID: ${profile.id}`)
      console.log(`   👤 Rol: ${profile.role} ${profile.role === 'admin' ? '👑' : '👷'}`)
      console.log(`   📅 Creado: ${new Date(profile.created_at).toLocaleString()}`)
    })
    
    // Filtrar administradores
    const adminProfiles = profiles.filter(p => p.role === 'admin')
    console.log(`\n👑 Administradores encontrados: ${adminProfiles.length}`)
    
    if (adminProfiles.length === 0) {
      console.log('❌ No hay usuarios con rol de administrador')
      console.log('\n🔧 Para crear un administrador, puedes:')
      console.log('1. Actualizar un perfil existente a rol "admin"')
      console.log('2. Crear un nuevo usuario con rol "admin"')
    } else {
      console.log('\n✅ Administradores activos:')
      adminProfiles.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.full_name} (${admin.email})`)
      })
    }
    
    // Verificar usuarios de auth
    console.log('\n🔐 Verificando usuarios en auth.users...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error obteniendo usuarios de auth:', authError)
    } else {
      console.log(`📊 Total de usuarios en auth: ${authUsers.users.length}`)
      
      // Verificar si hay usuarios sin perfil
      const usersWithoutProfile = authUsers.users.filter(user => 
        !profiles.some(profile => profile.id === user.id)
      )
      
      if (usersWithoutProfile.length > 0) {
        console.log(`\n⚠️ Usuarios sin perfil (${usersWithoutProfile.length}):`)
        usersWithoutProfile.forEach(user => {
          console.log(`- ${user.email} (ID: ${user.id})`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkAdminUsers()