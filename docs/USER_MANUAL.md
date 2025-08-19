# Manual de Usuario

Guía completa para usar el Sistema de Gestión de Ayuda Domiciliaria.

## 📋 Índice

1. [Inicio de Sesión](#inicio-de-sesión)
2. [Dashboard Principal](#dashboard-principal)
3. [Gestión de Trabajadoras](#gestión-de-trabajadoras)
4. [Gestión de Usuarios/Clientes](#gestión-de-usuariosclientes)
5. [Sistema de Asignaciones](#sistema-de-asignaciones)
6. [Planificación](#planificación)
7. [Gestión de Festivos](#gestión-de-festivos)
8. [Reportes Mensuales](#reportes-mensuales)
9. [Preguntas Frecuentes](#preguntas-frecuentes)

## 🔐 Inicio de Sesión

### Acceder al Sistema

1. **Abrir la Aplicación**:
   - Ve a la URL de tu instalación
   - Verás la pantalla de login

2. **Credenciales**:
   - **Email**: Tu dirección de correo electrónico
   - **Contraseña**: Tu contraseña segura

3. **Primer Acceso**:
   - Si es tu primer acceso, contacta al administrador del sistema
   - Solo usuarios con rol "admin" pueden acceder

### Cerrar Sesión

- Haz clic en tu nombre (esquina superior derecha)
- Selecciona "Cerrar Sesión"

## 🏠 Dashboard Principal

El dashboard te muestra un resumen general del sistema:

### Estadísticas Principales
- **Trabajadoras Activas**: Número de trabajadoras disponibles
- **Usuarios Activos**: Clientes que reciben servicios
- **Asignaciones del Día**: Servicios programados para hoy
- **Alertas Activas**: Conflictos o problemas que requieren atención

### Panel de Alertas

🔴 **Alertas Críticas**: Conflictos de horarios, asignaciones sin trabajadora
🟡 **Alertas de Información**: Recordatorios, fechas importantes

**Acciones**:
- Haz clic en una alerta para ver detalles
- Resuelve conflictos siguiendo las sugerencias
- Marca alertas como resueltas

## 👥 Gestión de Trabajadoras

### Ver Lista de Trabajadoras

1. **Navegar**:
   - Sidebar izquierdo > "Trabajadoras"

2. **Tabs Disponibles**:
   - **Activas**: Trabajadoras en servicio
   - **Inactivas**: Trabajadoras desactivadas (para reactivación)

### Buscar Trabajadoras

- **Campo de búsqueda**: Busca por nombre, DNI, email o código
- **Filtros**: Los resultados se filtran automáticamente

### Añadir Nueva Trabajadora

1. **Botón "Nueva Trabajadora"** (esquina superior derecha)

2. **Formulario - Datos Básicos**:
   - **Código de Empleado**: ID único (ej: TRB001)
   - **DNI**: Formato español (12345678A)
   - **Nombre Completo**: Nombre y apellidos
   - **Fecha de Contratación**: No puede ser futura

3. **Datos de Contacto**:
   - **Email**: Dirección válida
   - **Teléfono**: Formato español (+34 600 000 000)
   - **Dirección**: Opcional

4. **Contacto de Emergencia**:
   - **Nombre**: Persona de contacto
   - **Teléfono**: Número de emergencia

5. **Notas Adicionales**:
   - **Observaciones**: Información relevante

### Editar Trabajadora

1. **Buscar** la trabajadora en la lista
2. **Icono de edición** (lápiz) en la fila
3. **Modificar** los campos necesarios
4. **Guardar** cambios

### Activar/Desactivar Trabajadora

**Desactivar**:
- Útil para bajas temporales
- La trabajadora pasa a la pestaña "Inactivas"
- No se pueden crear nuevas asignaciones

**Reactivar**:
- Desde la pestaña "Inactivas"
- Botón "Activar" en la fila
- Vuelve a estar disponible para asignaciones

## 🏡 Gestión de Usuarios/Clientes

### Añadir Nuevo Cliente

1. **Navegar**: Sidebar > "Usuarios"
2. **"Nuevo Usuario"**

3. **Información Personal**:
   - **Nombre Completo**
   - **DNI**: Formato español
   - **Fecha de Nacimiento**: Opcional
   - **Género**: Opcional

4. **Contacto**:
   - **Email**: Opcional
   - **Teléfono**: Opcional
   - **Dirección**: Obligatoria (lugar del servicio)

5. **Información del Servicio**:
   - **Horas Mensuales**: Horas contratadas (1-200)
   - **Notas Médicas**: Información médica relevante

6. **Emergencia**:
   - **Contacto de Emergencia**
   - **Teléfono de Emergencia**

### Gestionar Clientes Existentes

- **Buscar**: Por nombre o DNI
- **Editar**: Actualizar información
- **Activar/Desactivar**: Gestionar estado del servicio

## 📅 Sistema de Asignaciones

### Crear Nueva Asignación

1. **Navegar**: Sidebar > "Asignaciones"
2. **"Nueva Asignación"**

3. **Datos Básicos**:
   - **Trabajadora**: Seleccionar de la lista de activas
   - **Cliente**: Seleccionar usuario
   - **Fecha de Inicio**: Cuándo comienza el servicio
   - **Fecha de Fin**: Opcional (servicio indefinido)
   - **Notas**: Información adicional

### Configurar Horarios Flexibles

Cada asignación puede tener múltiples tramos horarios:

1. **Días de la Semana**: Lunes a Domingo
2. **Tipos de Día**:
   - **Laborable**: Lunes a viernes no festivos
   - **Fin de Semana**: Sábados y domingos
   - **Festivo**: Días festivos oficiales

3. **Horarios por Tipo**:
   - **Hora de Inicio**: Formato 24h (ej: 09:00)
   - **Hora de Fin**: Debe ser posterior al inicio

### Ejemplo de Configuración

```
Lunes (Laborable): 09:00 - 12:00
Martes (Laborable): 09:00 - 12:00
Miércoles (Laborable): 15:00 - 18:00
Sábado (Fin de Semana): 10:00 - 13:00
Domingo (Fin de Semana): No servicio
Festivos: 10:00 - 12:00
```

### Gestionar Conflictos

El sistema detecta automáticamente:
- **Solapamientos**: Misma trabajadora en dos lugares
- **Horarios imposibles**: Traslados muy rápidos
- **Sobrecarga**: Demasiadas horas por día

**Resolución**:
1. El sistema mostrará una alerta
2. Sigue las sugerencias proporcionadas
3. Modifica horarios o reasigna trabajadoras

## 📊 Planificación

### Vista Mensual

1. **Navegar**: Sidebar > "Planificación"
2. **Seleccionar Mes**: Control de mes/año
3. **Filtrar**: Por trabajadora específica (opcional)

### Tipos de Vista

**Vista Calendario**:
- Visualización en formato calendario
- Cada día muestra asignaciones activas
- Colores por tipo de día (laborable/festivo/fin de semana)

**Vista Lista**:
- Lista detallada por día
- Información completa de cada asignación
- Mejor para revisión detallada

### Estadísticas del Mes

- **Total Asignaciones**: Servicios programados
- **Trabajadoras Activas**: Personal disponible
- **Días Laborables**: Días de trabajo normales
- **Festivos**: Días festivos del mes
- **Fines de Semana**: Sábados y domingos

## 🎉 Gestión de Festivos

### Importancia de los Festivos

Los festivos afectan:
- **Horarios de servicio**: Pueden cambiar los horarios
- **Cálculo de horas**: Impactan en reportes mensuales
- **Planificación**: Ayudan en la organización

### Gestionar Festivos

1. **Navegar**: Sidebar > "Festivos"
2. **Ver Calendario**: Festivos programados

### Añadir Festivo

1. **"Nuevo Festivo"**
2. **Información**:
   - **Fecha**: Día del festivo
   - **Nombre**: Descripción (ej: "Día de Navidad")
   - **Tipo**:
     - **Nacional**: Todo el país
     - **Autonómico**: Comunidad específica
     - **Local**: Municipal (Mataró por defecto)
   - **Municipio**: Por defecto Mataró

### Festivos Preconfigurados

El sistema incluye:
- Festivos nacionales españoles
- Festivos de Cataluña
- Festivos locales de Mataró

## 📈 Reportes Mensuales

### Generar Reporte

1. **Navegar**: Sidebar > "Reportes"
2. **Filtros**:
   - **Mes y Año**: Período a analizar
   - **Cliente**: Específico o todos
   - **Trabajadora**: Específica o todas

### Contenido del Reporte

**Resumen Ejecutivo**:
- Horas contratadas vs horas calculadas
- Exceso o déficit de horas
- Distribución por tipo de día

**Detalle por Cliente**:
- Nombre y dirección
- Horas mensuales contratadas
- Horas reales calculadas
- Diferencia (+ exceso / - déficit)
- Trabajadora asignada

**Análisis por Tipo de Día**:
- **Días Laborables**: Lunes-viernes no festivos
- **Festivos**: Días festivos oficiales
- **Fines de Semana**: Sábados y domingos

### Cálculo de Horas

El sistema calcula automáticamente:

1. **Días del Mes**: Identifica cada tipo de día
2. **Horarios Asignados**: Según configuración de asignación
3. **Total por Tipo**: Suma horas por categoría
4. **Total Mensual**: Suma de todos los tipos
5. **Comparación**: vs horas contratadas

### Ejemplo de Cálculo

```
Cliente: María García
Horas Contratadas: 60h/mes

Días Laborables: 22 días × 2h = 44h
Fines de Semana: 8 días × 1h = 8h
Festivos: 2 días × 1.5h = 3h

Total Calculado: 55h
Diferencia: -5h (déficit)
```

### Exportar Reportes

**Formato PDF**:
- Documento profesional
- Fácil de compartir
- Incluye gráficos

**Formato Excel**:
- Datos tabulares
- Análisis adicional
- Fácil manipulación

**Acciones**:
1. **Botón "Exportar"** en la parte superior
2. **Seleccionar formato**
3. **Descargar archivo**

## ❓ Preguntas Frecuentes

### General

**P: ¿Puedo usar el sistema en móvil?**
R: Sí, la aplicación es responsive y funciona en móviles y tablets.

**P: ¿Los datos están seguros?**
R: Sí, usamos Supabase con cifrado y políticas de seguridad RLS.

**P: ¿Puedo tener múltiples administradores?**
R: Sí, se pueden crear múltiples cuentas de administrador.

### Trabajadoras

**P: ¿Qué pasa si desactivo una trabajadora con asignaciones?**
R: Las asignaciones existentes se mantienen, pero no se pueden crear nuevas.

**P: ¿Puedo reactivar una trabajadora?**
R: Sí, desde la pestaña "Inactivas" con el botón "Activar".

**P: ¿El código de empleado debe ser único?**
R: Sí, cada trabajadora debe tener un código único.

### Asignaciones

**P: ¿Puedo asignar la misma trabajadora a múltiples clientes?**
R: Sí, pero el sistema alertará si hay conflictos de horario.

**P: ¿Qué pasa si hay festivos?**
R: El sistema automáticamente aplica los horarios de "festivo" configurados.

**P: ¿Puedo cambiar horarios después de crear la asignación?**
R: Sí, editando la asignación y modificando los tramos horarios.

### Reportes

**P: ¿Los reportes se actualizan automáticamente?**
R: Sí, siempre muestran los datos más recientes.

**P: ¿Puedo ver reportes de meses anteriores?**
R: Sí, seleccionando el mes deseado en los filtros.

**P: ¿Qué significa "exceso" y "déficit"?**
R: Exceso = más horas de las contratadas, Déficit = menos horas de las contratadas.

### Problemas Técnicos

**P: La página no carga**
R: Verifica tu conexión a internet y recarga la página. Si persiste, contacta soporte.

**P: No puedo guardar cambios**
R: Verifica que todos los campos obligatorios estén completos y en formato correcto.

**P: Veo errores de validación**
R: Los mensajes de error indican exactamente qué corregir (formato de DNI, email, etc.).

## 📞 Soporte Técnico

### Contacto

- **Documentación**: Consulta este manual primero
- **Issues**: Reporta problemas en el repositorio
- **Email**: Contacta al administrador del sistema

### Información Útil para Soporte

Cuando reportes un problema, incluye:
- **Navegador** y versión
- **Pasos** para reproducir el error
- **Mensaje de error** exacto
- **Capturas de pantalla** si es posible

---

**¡Gracias por usar el Sistema de Gestión de Ayuda Domiciliaria! 🏠💙**
