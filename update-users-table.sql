-- Migración para agregar campos del perfil a la tabla users
-- Ejecutar este script en Supabase para agregar los campos necesarios

-- Agregar campos adicionales a la tabla users
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

-- Índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_join_date ON users(join_date);

-- Actualizar el trigger para manejar los nuevos campos
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
    join_date,
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
    COALESCE((NEW.raw_user_meta_data->>'join_date')::date, CURRENT_DATE),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Actualizar datos existentes con valores por defecto
UPDATE users SET 
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

-- Verificar la estructura actualizada
SELECT 
  'Estructura actualizada' as message,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;