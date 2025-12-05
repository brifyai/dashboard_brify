-- Script para verificar la estructura de la tabla users
-- Esto nos ayudará a entender qué campos están disponibles

-- 1. Ver estructura completa de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Verificar si existe algún registro
SELECT COUNT(*) as total_usuarios FROM users;

-- 3. Ver algunos registros de ejemplo (si existen)
SELECT * FROM users LIMIT 5;