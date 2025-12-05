-- Migración para corregir el tipo de columna id en la tabla users
-- Problema: La columna id está como bigint pero Supabase Auth genera UUIDs

-- 1. Eliminar la columna id actual (si existe)
ALTER TABLE users DROP COLUMN IF EXISTS id;

-- 2. Agregar la columna id como UUID con la misma clave primaria
ALTER TABLE users ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- 3. Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- 4. Comentarios para documentación
COMMENT ON COLUMN users.id IS 'ID del usuario (UUID) - coincide con Supabase Auth';

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';