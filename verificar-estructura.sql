-- VERIFICAR ESTRUCTURA REAL DE LA TABLA USERS
-- Ejecutar este script primero para ver la estructura actual

-- Verificar la estructura completa de la tabla users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar el tipo de dato específico del campo id
SELECT 
  column_name,
  data_type,
  udt_name,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'id';

-- Verificar si existe el usuario Camilo Alegria y su ID real
SELECT 
  id,
  email,
  name,
  status,
  created_at
FROM users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar el ID en auth.users
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'camiloalegriabarra@gmail.com';

-- Verificar tipos de datos en auth.users
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth'
  AND column_name = 'id';