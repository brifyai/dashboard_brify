-- MIGRACIÓN COMPLETA PARA SUPABASE
-- Ejecutar este script completo en el SQL Editor de Supabase

-- =====================================================
-- PASO 1: AGREGAR CAMPOS A LA TABLA USERS
-- =====================================================

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS join_date DATE,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC-3',
ADD COLUMN IF NOT EXISTS email_notifications TEXT DEFAULT 'all',
ADD COLUMN IF NOT EXISTS two_factor_auth TEXT DEFAULT 'disabled',
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- =====================================================
-- PASO 2: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_join_date ON users(join_date);

-- =====================================================
-- PASO 3: ACTUALIZAR DATOS EXISTENTES
-- =====================================================

-- Actualizar usuarios existentes con valores por defecto
UPDATE users 
SET 
  first_name = COALESCE(first_name, SPLIT_PART(name, ' ', 1)),
  last_name = COALESCE(last_name, SPLIT_PART(name, ' ', 2)),
  phone = COALESCE(phone, ''),
  location = COALESCE(location, ''),
  department = COALESCE(department, 'Engineering'),
  skills = COALESCE(skills, '{}'),
  join_date = COALESCE(join_date, created_at::date),
  language = COALESCE(language, 'es'),
  timezone = COALESCE(timezone, 'UTC-3'),
  email_notifications = COALESCE(email_notifications, 'all'),
  two_factor_auth = COALESCE(two_factor_auth, 'disabled'),
  preferences = COALESCE(preferences, '{}')
WHERE first_name IS NULL OR last_name IS NULL;

-- =====================================================
-- PASO 4: ACTUALIZAR TRIGGER PARA NUEVOS USUARIOS
-- =====================================================

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Actualizar la función del trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    first_name,
    last_name,
    role, 
    status, 
    profile, 
    bio, 
    phone,
    location,
    department,
    skills,
    join_date,
    language,
    timezone,
    email_notifications,
    two_factor_auth,
    avatar_url,
    preferences,
    created_at, 
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'first_name', SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 2)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    'active',
    jsonb_build_object(
      'avatar', NEW.raw_user_meta_data->>'avatar_url',
      'bio', COALESCE(NEW.raw_user_meta_data->>'bio', ''),
      'skills', COALESCE(NEW.raw_user_meta_data->>'skills', '[]')::jsonb,
      'location', COALESCE(NEW.raw_user_meta_data->>'location', ''),
      'department', COALESCE(NEW.raw_user_meta_data->>'department', 'Engineering'),
      'phone', COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      'language', COALESCE(NEW.raw_user_meta_data->>'language', 'es'),
      'timezone', COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC-3'),
      'email_notifications', COALESCE(NEW.raw_user_meta_data->>'email_notifications', 'all'),
      'two_factor_auth', COALESCE(NEW.raw_user_meta_data->>'two_factor_auth', 'disabled')
    ),
    COALESCE(NEW.raw_user_meta_data->>'bio', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'location', ''),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Engineering'),
    COALESCE(NEW.raw_user_meta_data->>'skills', '[]')::text[],
    COALESCE((NEW.raw_user_meta_data->>'join_date')::date, CURRENT_DATE),
    COALESCE(NEW.raw_user_meta_data->>'language', 'es'),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'UTC-3'),
    COALESCE(NEW.raw_user_meta_data->>'email_notifications', 'all'),
    COALESCE(NEW.raw_user_meta_data->>'two_factor_auth', 'disabled'),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'preferences', '{}')::jsonb,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear el trigger actualizado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PASO 5: CONFIGURAR DATOS DE PRUEBA PARA CAMILO ALEGRIA
-- =====================================================

-- Actualizar el perfil de Camilo Alegria con datos completos
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

-- =====================================================
-- PASO 6: VERIFICAR LA ESTRUCTURA ACTUALIZADA
-- =====================================================

-- Mostrar estructura de la tabla
SELECT 
  'ESTRUCTURA ACTUALIZADA' as estado,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar datos del usuario Camilo Alegria
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
  two_factor_auth,
  avatar_url
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- =====================================================
-- PASO 7: VERIFICAR TODOS LOS USUARIOS ACTUALIZADOS
-- =====================================================

SELECT 
  COUNT(*) as total_usuarios,
  COUNT(first_name) as con_nombre,
  COUNT(last_name) as con_apellido,
  COUNT(phone) as con_telefono,
  COUNT(location) as con_ubicacion,
  COUNT(department) as con_departamento,
  COUNT(skills) as con_habilidades
FROM users;

-- Mostrar algunos usuarios de ejemplo
SELECT 
  email,
  first_name,
  last_name,
  department,
  location,
  language,
  timezone
FROM users 
LIMIT 5;