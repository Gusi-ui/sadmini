// Script para crear usuarios de prueba usando la API de Supabase
// Ejecutar con: node create_users_api.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gkmjnhumsbiscpkbyihv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrbWpuaHVtc2Jpc2Nwa2J5aWh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTYxNDA5MiwiZXhwIjoyMDcxMTkwMDkyfQ._kRrKuZUSrkXY3NIenH4UZZe3l2MVmhqFa8apVTjra8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createUser(email, password, fullName, role) {
  try {
    console.log(`Creando usuario: ${email}`)
    
    // Crear usuario usando la API de administración
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: role
      }
    })

    if (userError) {
      console.error(`Error creando usuario ${email}:`, userError)
      return null
    }

    console.log(`Usuario ${email} creado exitosamente`)
    
    // Crear perfil correspondiente
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        email: email,
        full_name: fullName,
        role: role,
        phone: '+34600000000',
        address: 'Dirección por defecto'
      })

    if (profileError) {
      console.error(`Error creando perfil para ${email}:`, profileError)
    } else {
      console.log(`Perfil para ${email} creado exitosamente`)
    }

    return userData.user
  } catch (error) {
    console.error(`Error inesperado creando usuario ${email}:`, error)
    return null
  }
}

async function main() {
  console.log('Iniciando creación de usuarios de prueba...\n')

  const users = [
    {
      email: 'admin@sadmini.com',
      password: 'admin123',
      fullName: 'Administrador del Sistema',
      role: 'admin'
    },
    {
      email: 'trabajadora@sadmini.com',
      password: 'worker123',
      fullName: 'María García López',
      role: 'worker'
    }
  ]

  for (const user of users) {
    await createUser(user.email, user.password, user.fullName, user.role)
    console.log('---')
  }

  console.log('\nVerificando usuarios creados...')
  
  // Verificar usuarios
  const { data: usersData, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .in('email', users.map(u => u.email))

  if (usersError) {
    console.error('Error verificando usuarios:', usersError)
  } else {
    console.log('Usuarios creados:')
    usersData.forEach(user => {
      console.log(`- ${user.email} (${user.role})`)
    })
  }

  console.log('\n¡Proceso completado!')
}

main().catch(console.error)
