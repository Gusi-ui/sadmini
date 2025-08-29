import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera un código de empleado único automáticamente
 * Formato: EMP + número secuencial de 3 dígitos (EMP001, EMP002, etc.)
 */
export async function generateEmployeeCode(): Promise<string> {
  try {
    // Obtener todos los códigos de empleado existentes
    const { data: workers, error } = await supabase
      .from('workers')
      .select('employee_id')
      .order('employee_id', { ascending: false });

    if (error) {
      console.error('Error al obtener códigos de empleado:', error);
      // En caso de error, generar código basado en timestamp
      const timestamp = Date.now().toString().slice(-3);
      return `EMP${timestamp}`;
    }

    // Si no hay trabajadoras, empezar con EMP001
    if (!workers || workers.length === 0) {
      return 'EMP001';
    }

    // Encontrar el número más alto y generar el siguiente
    let maxNumber = 0;
    workers.forEach(worker => {
      if (worker.employee_id && worker.employee_id.startsWith('EMP')) {
        const numberPart = worker.employee_id.substring(3);
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });

    // Generar el siguiente código
    const nextNumber = maxNumber + 1;
    return `EMP${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error inesperado al generar código de empleado:', error);
    // Fallback: usar timestamp
    const timestamp = Date.now().toString().slice(-3);
    return `EMP${timestamp}`;
  }
}

/**
 * Genera una contraseña temporal segura
 * Formato: 8 caracteres con mayúsculas, minúsculas y números
 */
export function generateTemporaryPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const allChars = uppercase + lowercase + numbers;
  
  let password = '';
  
  // Asegurar al menos un carácter de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  // Completar con caracteres aleatorios hasta 8 caracteres
  for (let i = 3; i < 8; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclar los caracteres
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
