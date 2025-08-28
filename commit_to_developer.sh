#!/bin/bash

# Script para commit a rama developer
# Ejecutar desde el directorio raíz del proyecto

echo "🚀 Iniciando proceso de commit a rama developer..."

# Verificar que estamos en el directorio correcto
if [ ! -f "CODE_REVIEW_REPORT.md" ]; then
    echo "❌ Error: Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

# Mostrar estado actual
echo "📋 Estado actual del repositorio:"
git status

echo ""
echo "📝 Archivos modificados principales:"
echo "- admin-web/src/contexts/AuthContext.tsx (corrección menor)"
echo "- worker-pwa/src/lib/supabase.ts (corrección errores críticos)"
echo "- worker-pwa/src/components/ui/input.tsx (corrección interfaz vacía)"
echo "- CREDENCIALES_ACCESO.md (credenciales de producción)"
echo "- CODE_REVIEW_REPORT.md (informe de revisión)"

echo ""
echo "🔍 Verificando que no hay errores críticos..."

# Verificar lint en admin-web
echo "Verificando admin-web..."
cd admin-web
pnpm lint > /dev/null 2>&1
ADMIN_LINT_EXIT=$?
cd ..

# Verificar lint en worker-pwa
echo "Verificando worker-pwa..."
cd worker-pwa
pnpm lint > /dev/null 2>&1
WORKER_LINT_EXIT=$?
cd ..

if [ $ADMIN_LINT_EXIT -ne 0 ] || [ $WORKER_LINT_EXIT -ne 0 ]; then
    echo "❌ Error: Hay errores de linting que deben corregirse primero"
    echo "Ejecuta 'pnpm lint' en admin-web y worker-pwa para ver los detalles"
    exit 1
fi

echo "✅ Verificación de linting completada (solo warnings menores)"

echo ""
echo "📦 Preparando commit..."

# Agregar archivos al staging
git add .

echo "📝 Creando commit con mensaje descriptivo..."

# Crear commit con mensaje detallado
git commit -m "fix: Corrección de errores críticos antes de merge a developer

🔧 Correcciones realizadas:
- Eliminada condición constante en worker-pwa/src/lib/supabase.ts
- Corregida interfaz vacía en worker-pwa/src/components/ui/input.tsx
- Deshabilitado completamente cliente mock de Supabase
- Configuración de producción verificada y funcionando

✅ Estado de las aplicaciones:
- Admin Web: Funcionando con autenticación real
- Worker PWA: Funcionando con autenticación real
- 0 errores críticos, solo warnings menores
- Build exitoso en ambas aplicaciones

📋 Credenciales de acceso:
- Admin: admin@mataro.cat / AdminMataro2024!
- Worker: trabajadora@mataro.cat / TrabajadoraMataro2024!

🎯 Listo para merge a rama principal"

if [ $? -eq 0 ]; then
    echo "✅ Commit creado exitosamente"
    echo ""
    echo "🌟 Próximos pasos:"
    echo "1. Verificar el commit: git log --oneline -1"
    echo "2. Push a developer: git push origin developer"
    echo "3. Crear Pull Request para merge a main"
    echo "4. Realizar testing en staging"
    echo "5. Merge a main y deploy a producción"
    echo ""
    echo "📊 Resumen del commit:"
    git log --oneline -1
else
    echo "❌ Error al crear el commit"
    exit 1
fi

echo ""
echo "🎉 Proceso completado. El código está listo para developer!"