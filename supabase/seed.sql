-- Archivo de configuración inicial de la base de datos
-- Se ejecuta al hacer supabase db reset

-- Crear las extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Configurar zona horaria por defecto para Europa/Madrid
SET timezone = 'Europe/Madrid';

-- Configurar formato de fecha por defecto
SET datestyle = 'ISO, DMY';

-- Configurar idioma por defecto
SET lc_messages = 'es_ES.UTF-8';
SET lc_numeric = 'es_ES.UTF-8';
SET lc_time = 'es_ES.UTF-8';
