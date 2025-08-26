import { z } from 'zod'

// Validaciones para trabajadoras
export const workerSchema = z.object({
  employee_id: z.string()
    .min(1, 'El código de empleado es obligatorio')
    .max(50, 'El código de empleado no puede tener más de 50 caracteres')
    .regex(/^[A-Z0-9]+$/, 'El código debe contener solo letras mayúsculas y números'),
  
  dni: z.string()
    .min(1, 'El DNI es obligatorio')
    .regex(/^[0-9]{8}[A-Z]$/, 'El DNI debe tener el formato válido (12345678A)'),
  
  full_name: z.string()
    .min(1, 'El nombre completo es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede tener más de 255 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z.string()
    .min(1, 'El email es obligatorio')
    .email('El formato del email no es válido')
    .max(255, 'El email no puede tener más de 255 caracteres'),
  
  phone: z.string()
    .min(1, 'El teléfono es obligatorio')
    .regex(/^(\+34)?[6-9][0-9]{8}$/, 'El teléfono debe tener un formato válido español'),
  
  address: z.string()
    .max(500, 'La dirección no puede tener más de 500 caracteres')
    .optional(),
  
  emergency_contact: z.string()
    .max(255, 'El contacto de emergencia no puede tener más de 255 caracteres')
    .optional(),
  
  emergency_phone: z.string()
    .regex(/^$|^(\+34)?[6-9][0-9]{8}$/, 'El teléfono de emergencia debe tener un formato válido español')
    .optional(),
  
  hire_date: z.string()
    .min(1, 'La fecha de contratación es obligatoria')
    .refine((date) => {
      const hireDate = new Date(date)
      const today = new Date()
      return hireDate <= today
    }, 'La fecha de contratación no puede ser futura'),
  
  notes: z.string()
    .max(1000, 'Las notas no pueden tener más de 1000 caracteres')
    .optional()
})

export type WorkerFormData = z.infer<typeof workerSchema>

// Validaciones para usuarios/clientes
export const userSchema = z.object({
  full_name: z.string()
    .min(1, 'El nombre completo es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(255, 'El nombre no puede tener más de 255 caracteres')
    .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  dni: z.string()
    .min(1, 'El DNI es obligatorio')
    .regex(/^[0-9]{8}[A-Z]$/, 'El DNI debe tener el formato válido (12345678A)'),
  
  email: z.string()
    .email('El formato del email no es válido')
    .max(255, 'El email no puede tener más de 255 caracteres')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .regex(/^$|^(\+34)?[6-9][0-9]{8}$/, 'El teléfono debe tener un formato válido español')
    .optional(),
  
  address: z.string()
    .min(1, 'La dirección es obligatoria')
    .max(500, 'La dirección no puede tener más de 500 caracteres'),
  
  emergency_contact: z.string()
    .max(255, 'El contacto de emergencia no puede tener más de 255 caracteres')
    .optional(),
  
  emergency_phone: z.string()
    .regex(/^$|^(\+34)?[6-9][0-9]{8}$/, 'El teléfono de emergencia debe tener un formato válido español')
    .optional(),
  
  medical_notes: z.string()
    .max(2000, 'Las notas médicas no pueden tener más de 2000 caracteres')
    .optional(),
  
  monthly_hours: z.number()
    .min(1, 'Las horas mensuales deben ser mayor a 0')
    .max(200, 'Las horas mensuales no pueden ser mayor a 200')
    .int('Las horas mensuales deben ser un número entero'),
  
  birth_date: z.string()
    .refine((date) => {
      if (!date) return true
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 0 && age <= 120
    }, 'La fecha de nacimiento no es válida')
    .optional(),
  
  gender: z.enum(['hombre', 'mujer', 'otro'], {
    errorMap: () => ({ message: 'Debe seleccionar un género válido' })
  }).optional()
})

export type UserFormData = z.infer<typeof userSchema>

// Validaciones para asignaciones
export const assignmentSchema = z.object({
  worker_id: z.string()
    .min(1, 'Debe seleccionar una trabajadora')
    .optional()
    .refine((val) => val !== undefined && val !== '', {
      message: 'Debe seleccionar una trabajadora'
    }),
  
  user_id: z.string()
    .min(1, 'Debe seleccionar un usuario')
    .optional()
    .refine((val) => val !== undefined && val !== '', {
      message: 'Debe seleccionar un usuario'
    }),
  
  start_date: z.string()
    .min(1, 'La fecha de inicio es obligatoria')
    .refine((date) => {
      const startDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return startDate >= today
    }, 'La fecha de inicio no puede ser anterior a hoy'),
  
  end_date: z.string()
    .transform((val) => val === '' ? undefined : val)
    .refine((date) => {
      if (!date) return true
      const endDate = new Date(date)
      return !isNaN(endDate.getTime())
    }, 'La fecha de fin no es válida')
    .optional(),
  
  notes: z.string()
    .max(1000, 'Las notas no pueden tener más de 1000 caracteres')
    .optional()
})

export type AssignmentFormData = z.infer<typeof assignmentSchema> & {
  worker_id?: string
  user_id?: string
}

// Validaciones para tramos horarios
export const timeSlotSchema = z.object({
  assignment_id: z.string()
    .optional(),
  
  day_of_week: z.number()
    .min(1, 'Día de la semana inválido')
    .max(7, 'Día de la semana inválido'),
  
  day_type: z.enum(['laborable', 'festivo', 'fin_semana'], {
    errorMap: () => ({ message: 'Tipo de día inválido' })
  }),
  
  start_time: z.string()
    .min(1, 'La hora de inicio es obligatoria')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  
  end_time: z.string()
    .min(1, 'La hora de fin es obligatoria')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
    .refine((endTime) => {
      return true
    }, 'La hora de fin debe ser posterior a la hora de inicio')
})

export type TimeSlotFormData = z.infer<typeof timeSlotSchema> & {
  assignment_id?: string
}

// Validaciones para festivos
export const holidaySchema = z.object({
  date: z.string()
    .min(1, 'La fecha es obligatoria')
    .refine((date) => {
      const holidayDate = new Date(date)
      return !isNaN(holidayDate.getTime())
    }, 'La fecha no es válida'),
  
  name: z.string()
    .min(1, 'El nombre del festivo es obligatorio')
    .max(255, 'El nombre no puede tener más de 255 caracteres'),
  
  type: z.enum(['nacional', 'autonomico', 'local'], {
    errorMap: () => ({ message: 'Tipo de festivo inválido' })
  }),
  
  municipality: z.string()
    .max(100, 'El municipio no puede tener más de 100 caracteres')
    .default('Mataró')
})

export type HolidayFormData = z.infer<typeof holidaySchema>

// Validaciones para el login
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es obligatorio')
    .email('El formato del email no es válido'),
  
  password: z.string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
})

export type LoginFormData = z.infer<typeof loginSchema>
