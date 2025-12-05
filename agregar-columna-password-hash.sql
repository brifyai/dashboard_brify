-- Migración para agregar la columna password_hash a la tabla users
-- Fecha: 2025-12-05
-- Descripción: Agregar columna password_hash para almacenar contraseñas hasheadas de usuarios

-- Verificar si la columna password_hash ya existe
DO $$
BEGIN
    -- Agregar la columna password_hash si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
        
        -- Agregar comentario a la columna
        COMMENT ON COLUMN users.password_hash IS 'Hash de la contraseña del usuario para autenticación local';
        
        RAISE NOTICE 'Columna password_hash agregada exitosamente a la tabla users';
    ELSE
        RAISE NOTICE 'La columna password_hash ya existe en la tabla users';
    END IF;
END $$;

-- Crear índice para mejorar el rendimiento en búsquedas por password_hash
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON users(password_hash) WHERE password_hash IS NOT NULL;

-- Actualizar la política RLS para incluir el nuevo campo si es necesario
-- (Esto depende de la configuración específica de RLS)

-- Confirmar la migración
SELECT 'Migración completada: Columna password_hash agregada a la tabla users' as resultado;