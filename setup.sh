#!/bin/bash

# Script de configuración inicial para el Sistema de Gestión de Ayuda Domiciliaria
# Autor: MiniMax Agent

set -e

echo "🏥 Configurando Sistema de Gestión de Ayuda Domiciliaria..."
echo "================================================"

# Verificar prerrequisitos
echo "📋 Verificando prerrequisitos..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
fi

echo "✅ Prerrequisitos verificados"

# Crear archivos de configuración si no existen
echo "⚙️ Configurando variables de entorno..."

if [ ! -f .env.local ]; then
    if [ -f env.example ]; then
        cp env.example .env.local
        echo "📁 Creado .env.local (por favor, edítalo con tus credenciales de Supabase)"
    else
        echo "⚠️ Archivo env.example no encontrado. Crea manualmente .env.local"
    fi
fi

if [ ! -f admin-web/.env.local ]; then
    if [ -f admin-web/env.example ]; then
        cp admin-web/env.example admin-web/.env.local
        echo "📁 Creado admin-web/.env.local"
    else
        echo "⚠️ Archivo admin-web/env.example no encontrado. Crea manualmente admin-web/.env.local"
    fi
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
cd admin-web
pnpm install
cd ..

echo "✅ Setup completado exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Edita .env.local y admin-web/.env.local con tus credenciales de Supabase"
echo "2. Ejecuta las migraciones de base de datos:"
echo "   supabase db push"
echo "3. Inicia la aplicación de desarrollo:"
echo "   cd admin-web && pnpm dev"
echo ""
echo "📚 Ver README.md para instrucciones detalladas"
echo "🌐 La aplicación estará disponible en http://localhost:5173"
