-- MIGRACIÓN SIMPLE PARA SUPABASE
-- Ejecutar este script directamente en el SQL Editor de Supabase

-- PASO 1: Verificar si existe el usuario Camilo Alegria
SELECT email, name FROM users WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 2: Si no existe, crearlo manualmente
INSERT INTO users (
  id,
  email,
  name,
  status,
  created_at,
  updated_at
) VALUES (
  'cd6fd2b0-6e8b-45ba-8de5-933f116f4041',
  'camiloalegriabarra@gmail.com',
  'Camilo Alegria',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- PASO 3: Agregar campos adicionales si no existen (de forma segura)
DO $$
BEGIN
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

-- PASO 4: Actualizar el perfil de Camilo Alegria con datos completos
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
  preferences = '{"theme": "dark", "notifications": {"email": true, "push": true}}'::jsonb,
  updated_at = NOW()
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 5: Verificar la actualización
SELECT 
  email,
  first_name || ' ' || last_name as full_name,
  department,
  location,
  array_to_string(skills, ', ') as habilidades,
  language,
  timezone,
  phone,
  bio,
  join_date,
  email_notifications,
  two_factor_auth
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- PASO 6: Mostrar todos los usuarios con el nuevo formato
SELECT 
  email,
  first_name,
  last_name,
  department,
  location,
  language,
  timezone,
  CASE WHEN phone IS NOT NULL THEN '✅' ELSE '❌' END as tiene_telefono,
  CASE WHEN skills IS NOT NULL THEN '✅' ELSE '❌' END as tiene_habilidades,
  CASE WHEN bio IS NOT NULL THEN '✅' ELSE '❌' END as tiene_bio
FROM users 
ORDER BY created_at DESC
LIMIT 10;