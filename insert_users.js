// Script para insertar usuarios de prueba en Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env del directorio raíz
dotenv.config({ path: '.env' })

// Configuración de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas')
  console.error('Asegúrate de que VITE_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY estén configuradas en .env')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Configurada' : 'No encontrada')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Usuarios de prueba
const testUsers = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    full_name: 'Dolores Pérez Vidal',
    dni: '87654321Z',
    email: 'dolores.perez@email.com',
    phone: '+34 700 111 111',
    address: 'Carrer de la Riera 45, Mataró',
    emergency_contact: 'José Pérez (hijo)',
    emergency_phone: '+34 700 111 112',
    medical_notes: 'Diabetes tipo 2. Medicación: Metformina 850mg cada 12h. Movilidad reducida.',
    monthly_hours: 86,
    birth_date: '1945-03-15',
    gender: 'mujer',
    is_active: true
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    full_name: 'Francisco Jiménez Alba',
    dni: '98765432Y',
    email: 'francisco.jimenez@email.com',
    phone: '+34 700 222 222',
    address: 'Carrer de Sant Josep 78, Mataró',
    emergency_contact: 'Teresa Jiménez (hija)',
    emergency_phone: '+34 700 222 223',
    medical_notes: 'Hipertensión arterial. Medicación: Enalapril 10mg por la mañana.',
    monthly_hours: 41,
    birth_date: '1940-11-22',
    gender: 'hombre',
    is_active: true
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    full_name: 'Rosa Alonso Martín',
    dni: '11223344X',
    email: 'rosa.alonso@email.com',
    phone: '+34 700 333 333',
    address: 'Passeig del Callao 12, Mataró',
    emergency_contact: 'Miguel Alonso (hermano)',
    emergency_phone: '+34 700 333 334',
    medical_notes: 'Alzheimer inicial. Requiere supervisión en actividades básicas.',
    monthly_hours: 65,
    birth_date: '1950-07-08',
    gender: 'mujer',
    is_active: true
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    full_name: 'Carmen López García',
    dni: '55667788W',
    email: 'carmen.lopez@email.com',
    phone: '+34 700 444 444',
    address: 'Carrer de Barcelona 156, Mataró',
    emergency_contact: 'Ana López (nieta)',
    emergency_phone: '+34 700 444 445',
    medical_notes: 'Sin medicación especial. Buena movilidad.',
    monthly_hours: 30,
    birth_date: '1955-09-12',
    gender: 'mujer',
    is_active: true
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    full_name: 'Antonio Ruiz Fernández',
    dni: '99887766V',
    email: 'antonio.ruiz@email.com',
    phone: '+34 700 555 555',
    address: 'Avinguda Maresme 89, Mataró',
    emergency_contact: 'María Ruiz (hija)',
    emergency_phone: '+34 700 555 556',
    medical_notes: 'Problemas de movilidad. Usa bastón.',
    monthly_hours: 52,
    birth_date: '1948-12-03',
    gender: 'hombre',
    is_active: true
  }
];

async function insertTestUsers() {
  console.log('🚀 Iniciando inserción de usuarios de prueba...');
  console.log(`📡 Conectando a: ${supabaseUrl}`);
  
  try {
    // Verificar conexión
    const { data: testConnection, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message);
      return;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    
    // Insertar usuarios
    const { data, error } = await supabase
      .from('users')
      .upsert(testUsers, { onConflict: 'id' })
      .select();
    
    if (error) {
      console.error('❌ Error al insertar usuarios:', error.message);
      return;
    }
    
    console.log(`✅ ${data.length} usuarios insertados correctamente:`);
    data.forEach(user => {
      console.log(`   - ${user.full_name} (${user.dni})`);
    });
    
    // Verificar total de usuarios
    const { data: allUsers, error: countError } = await supabase
      .from('users')
      .select('full_name, dni, is_active')
      .order('full_name');
    
    if (countError) {
      console.error('❌ Error al contar usuarios:', countError.message);
      return;
    }
    
    console.log(`\n📊 Total de usuarios en la base de datos: ${allUsers.length}`);
    console.log('👥 Usuarios activos:');
    allUsers.filter(u => u.is_active).forEach(user => {
      console.log(`   - ${user.full_name} (${user.dni})`);
    });
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

// Ejecutar el script
insertTestUsers();