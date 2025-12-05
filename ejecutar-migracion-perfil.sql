-- Script para ejecutar la migración de perfil
-- Este script debe ejecutarse en el SQL Editor de Supabase

-- PASO 1: Ejecutar la migración de la tabla users
\i update-users-table.sql

-- PASO 2: Verificar que la migración se aplicó correctamente
SELECT 
  'Migración completada' as estado,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('first_name', 'last_name', 'phone', 'location', 'department', 'skills', 'join_date', 'language', 'timezone', 'email_notifications', 'two_factor_auth', 'preferences')
ORDER BY ordinal_position;

-- PASO 3: Verificar datos del usuario Camilo Alegria
SELECT 
  id,
  email,
  first_name,
  last_name,
  phone,
  location,
  department,
  skills,
  join_date,
  language,
  timezone,
  email_notifications,
  two_factor_auth,
  bio,
  avatar_url,
  preferences
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 4: Actualizar el perfil de Camilo con datos completos
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
  bio = 'Ingeniero de software con experiencia en React, Node.js y desarrollo web moderno. Apasionado por crear soluciones innovadoras y eficientes.',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=CamiloAlegria',
  preferences = '{"theme": "dark", "notifications": {"email": true, "push": true}}'::jsonb
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 5: Verificar la actualización
SELECT 
  email,
  first_name || ' ' || last_name as full_name,
  department,
  location,
  array_to_string(skills, ', ') as habilidades,
  language,
  timezone
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';