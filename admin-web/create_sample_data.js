// Script para crear datos de ejemplo en modo desarrollo
// Este script se ejecuta automáticamente cuando la aplicación está en modo mock

const sampleData = {
  workers: [
    {
      id: 'worker-1',
      employee_id: 'EMP001',
      dni: '12345678A',
      full_name: 'María García López',
      email: 'maria.garcia@example.com',
      phone: '+34600123456',
      address: 'Calle Mayor 123, Mataró',
      emergency_contact: 'Juan García',
      emergency_phone: '+34600654321',
      hire_date: '2023-01-15',
      is_active: true,
      notes: 'Trabajadora experimentada con más de 5 años en el sector',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'worker-2',
      employee_id: 'EMP002',
      dni: '87654321B',
      full_name: 'Carmen Rodríguez Martín',
      email: 'carmen.rodriguez@example.com',
      phone: '+34600789012',
      address: 'Avenida Barcelona 45, Mataró',
      emergency_contact: 'Pedro Rodríguez',
      emergency_phone: '+34600210987',
      hire_date: '2023-03-20',
      is_active: true,
      notes: 'Especializada en cuidados geriátricos',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'worker-3',
      employee_id: 'EMP003',
      dni: '11223344C',
      full_name: 'Ana Fernández Silva',
      email: 'ana.fernandez@example.com',
      phone: '+34600345678',
      address: 'Plaza España 12, Mataró',
      emergency_contact: 'Luis Fernández',
      emergency_phone: '+34600876543',
      hire_date: '2023-06-10',
      is_active: true,
      notes: 'Trabajadora joven con formación en auxiliar de enfermería',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  users: [
    {
      id: 'user-1',
      full_name: 'José Martínez Pérez',
      dni: '98765432D',
      email: 'jose.martinez@example.com',
      phone: '+34600111222',
      address: 'Calle Rosario 78, Mataró',
      emergency_contact: 'María Martínez',
      emergency_phone: '+34600333444',
      medical_notes: 'Diabetes tipo 2, hipertensión. Medicación diaria.',
      monthly_hours: 60,
      is_active: true,
      birth_date: '1945-03-15',
      gender: 'Masculino',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user-2',
      full_name: 'Dolores Sánchez García',
      dni: '55667788E',
      email: 'dolores.sanchez@example.com',
      phone: '+34600555666',
      address: 'Calle Sant Pere 34, Mataró',
      emergency_contact: 'Carlos Sánchez',
      emergency_phone: '+34600777888',
      medical_notes: 'Alzheimer inicial, necesita supervisión para medicación.',
      monthly_hours: 80,
      is_active: true,
      birth_date: '1938-11-22',
      gender: 'Femenino',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'user-3',
      full_name: 'Francisco López Ruiz',
      dni: '99887766F',
      email: 'francisco.lopez@example.com',
      phone: '+34600999000',
      address: 'Avenida Maresme 156, Mataró',
      emergency_contact: 'Isabel López',
      emergency_phone: '+34600111000',
      medical_notes: 'Movilidad reducida, usa silla de ruedas.',
      monthly_hours: 40,
      is_active: true,
      birth_date: '1950-07-08',
      gender: 'Masculino',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  assignments: [
    {
      id: 'assignment-1',
      worker_id: 'worker-1',
      user_id: 'user-1',
      start_date: '2024-01-01',
      end_date: null,
      notes: 'Cuidados básicos y administración de medicación',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'assignment-2',
      worker_id: 'worker-2',
      user_id: 'user-2',
      start_date: '2024-01-15',
      end_date: null,
      notes: 'Supervisión y acompañamiento, control de medicación',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'assignment-3',
      worker_id: 'worker-3',
      user_id: 'user-3',
      start_date: '2024-02-01',
      end_date: null,
      notes: 'Ayuda con movilidad y cuidados personales',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  
  holidays: [
    {
      id: 'holiday-1',
      name: 'Año Nuevo',
      date: '2024-01-01',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-2',
      name: 'Reyes Magos',
      date: '2024-01-06',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-3',
      name: 'Viernes Santo',
      date: '2024-03-29',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-4',
      name: 'Lunes de Pascua',
      date: '2024-04-01',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-5',
      name: 'Fiesta del Trabajo',
      date: '2024-05-01',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-6',
      name: 'San Juan',
      date: '2024-06-24',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-7',
      name: 'Asunción de la Virgen',
      date: '2024-08-15',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-8',
      name: 'Fiesta Nacional',
      date: '2024-10-12',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-9',
      name: 'Todos los Santos',
      date: '2024-11-01',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-10',
      name: 'Constitución',
      date: '2024-12-06',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-11',
      name: 'Inmaculada Concepción',
      date: '2024-12-08',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'holiday-12',
      name: 'Navidad',
      date: '2024-12-25',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = sampleData
} else if (typeof window !== 'undefined') {
  window.sampleData = sampleData
}