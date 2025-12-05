-- Migración completa para corregir la tabla users
-- Problema: La columna id debe ser UUID para coincidir con Supabase Auth

-- 1. Verificar si la tabla existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'Tabla users existe, procediendo con migración...';
    ELSE
        RAISE NOTICE 'Tabla users no existe, creando desde cero...';
    END IF;
END $$;

-- 2. Crear la tabla users con estructura correcta (si no existe)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    bio TEXT,
    role VARCHAR(50) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    department VARCHAR(100) DEFAULT 'Engineering',
    location VARCHAR(100),
    skills TEXT[],
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(20) DEFAULT 'UTC-3',
    email_notifications VARCHAR(20) DEFAULT 'all',
    two_factor_auth VARCHAR(20) DEFAULT 'disabled',
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    join_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 4. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas RLS básicas
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 8. Comentarios para documentación
COMMENT ON TABLE users IS 'Tabla de perfiles de usuario vinculada con Supabase Auth';
COMMENT ON COLUMN users.id IS 'ID del usuario (UUID) - coincide con Supabase Auth';
COMMENT ON COLUMN users.email IS 'Email del usuario';
COMMENT ON COLUMN users.skills IS 'Array de habilidades del usuario';
COMMENT ON COLUMN users.preferences IS 'Preferencias del usuario en formato JSON';

-- 9. Verificar la estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;