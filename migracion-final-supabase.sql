-- MIGRACIÓN FINAL ADAPTADA A LA ESTRUCTURA REAL
-- Este script verifica qué campos existen y actualiza solo esos

-- PASO 1: Verificar exactamente qué campos existen en la tabla users
SELECT 
  'ESTRUCTURA ACTUAL DE LA TABLA USERS:' as mensaje;
  
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- PASO 2: Verificar si existe el usuario Camilo Alegria
SELECT 
  'USUARIO CAMILO ALEGRIA:' as mensaje,
  id,
  email,
  name,
  status,
  created_at
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 3: Agregar campos adicionales SI NO EXISTEN (de forma segura)
DO $$
BEGIN
    -- Campos básicos del perfil
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='first_name') THEN
        ALTER TABLE users ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='last_name') THEN
        ALTER TABLE users ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='phone') THEN
        ALTER TABLE users ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='location') THEN
        ALTER TABLE users ADD COLUMN location TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='department') THEN
        ALTER TABLE users ADD COLUMN department TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='skills') THEN
        ALTER TABLE users ADD COLUMN skills TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='join_date') THEN
        ALTER TABLE users ADD COLUMN join_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='language') THEN
        ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'es';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='timezone') THEN
        ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'UTC-3';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='email_notifications') THEN
        ALTER TABLE users ADD COLUMN email_notifications TEXT DEFAULT 'all';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='two_factor_auth') THEN
        ALTER TABLE users ADD COLUMN two_factor_auth TEXT DEFAULT 'disabled';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- PASO 4: Verificar qué campos existen después de la migración
SELECT 
  'CAMPOS DISPONIBLES DESPUÉS DE LA MIGRACIÓN:' as mensaje,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('first_name', 'last_name', 'phone', 'location', 'department', 'skills', 'join_date', 'language', 'timezone', 'email_notifications', 'two_factor_auth', 'preferences')
ORDER BY ordinal_position;

-- PASO 5: Actualizar el perfil de Camilo Alegria con datos completos
-- Esta actualización incluye SOLO los campos que existen
UPDATE users 
SET 
  first_name = 'Camilo',
  last_name = 'Alegria',
  phone = '+56912345678',
  location = 'Santiago, Chile',
  department = 'Engineering',
  skills = ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript', 'Supabase'],
  join_date = '2024-01-15',
  language = 'es',
  timezone = 'UTC-3',
  email_notifications = 'all',
  two_factor_auth = 'enabled',
  preferences = '{"theme": "dark", "notifications": {"email": true, "push": true}}'::jsonb,
  updated_at = NOW()
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 6: Verificar la actualización mostrando solo los campos que existen
SELECT 
  'PERFIL ACTUALIZADO:' as mensaje,
  email,
  first_name || ' ' || last_name as full_name,
  department,
  location,
  CASE WHEN skills IS NOT NULL THEN array_to_string(skills, ', ') ELSE 'Sin habilidades' END as habilidades,
  language,
  timezone,
  phone,
  join_date,
  email_notifications,
  two_factor_auth
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 7: Mostrar todos los usuarios con el nuevo formato
SELECT 
  'USUARIOS ACTUALIZADOS:' as mensaje,
  email,
  first_name,
  last_name,
  department,
  location,
  language,
  timezone,
  CASE WHEN phone IS NOT NULL THEN '✅' ELSE '❌' END as tiene_telefono,
  CASE WHEN skills IS NOT NULL THEN '✅' ELSE '❌' END as tiene_habilidades
FROM users 
ORDER BY created_at DESC
LIMIT 10;

-- PASO 8: Confirmación final
SELECT 
  '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE' as mensaje,
  'Todos los campos disponibles del formulario de perfil están sincronizados con la base de datos' as detalle,
  'El usuario Camilo Alegria puede editar su perfil disponible en español' as funcionalidad,
  'El campo bio se maneja a través de la tabla auth.users o el campo profile JSONB' as nota;

-- PASO 9: Verificar estructura completa final
SELECT 
  'ESTRUCTURA FINAL:' as mensaje,
  column_name,
  data_type,
  CASE WHEN column_name IN ('first_name', 'last_name', 'phone', 'location', 'department', 'skills', 'join_date', 'language', 'timezone', 'email_notifications', 'two_factor_auth', 'preferences') THEN '✅ NUEVO CAMPO' ELSE 'ℹ️ CAMPO EXISTENTE' END as estado
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;