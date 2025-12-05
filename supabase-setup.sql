-- Script de configuración para Supabase
-- Ejecuta este script en tu proyecto de Supabase para configurar las tablas necesarias

-- =============================================
-- TABLA DE USUARIOS OPTIMIZADA
-- =============================================

CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active',
  profile JSONB,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- =============================================
-- TABLA DE ESTADÍSTICAS
-- =============================================

CREATE TABLE IF NOT EXISTS stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  active_users INTEGER DEFAULT 0,
  revenue INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0.0,
  server_load INTEGER DEFAULT 0,
  memory_usage INTEGER DEFAULT 0,
  network_latency INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INSERTAR DATOS DE PRUEBA PARA ESTADÍSTICAS
-- =============================================

INSERT INTO stats (
  active_users, 
  revenue, 
  conversion_rate, 
  server_load, 
  memory_usage, 
  network_latency
) VALUES (
  1234,
  45678,
  3.2,
  45,
  72,
  23
) ON CONFLICT DO NOTHING;

-- =============================================
-- FUNCIÓN PARA OBTENER DATOS DE GRÁFICOS
-- =============================================

CREATE OR REPLACE FUNCTION get_chart_data(chart_type TEXT, time_range TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  CASE chart_type
    WHEN 'users' THEN
      SELECT json_agg(
        json_build_object(
          'date', date_trunc('day', created_at),
          'count', COUNT(*)
        )
      ) INTO result
      FROM users
      WHERE created_at >= NOW() - INTERVAL time_range
      GROUP BY date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at);
    
    WHEN 'stats' THEN
      SELECT json_build_object(
        'activeUsers', (SELECT COUNT(*) FROM users WHERE status = 'active'),
        'revenue', 50000 + (RANDOM() * 10000)::INTEGER,
        'conversionRate', (2 + RANDOM() * 3)::DECIMAL(3,1),
        'serverLoad', (40 + RANDOM() * 30)::INTEGER,
        'memoryUsage', (50 + RANDOM() * 40)::INTEGER,
        'networkLatency', (20 + RANDOM() * 30)::INTEGER
      ) INTO result;
      
    WHEN 'revenue' THEN
      SELECT json_agg(
        json_build_object(
          'month', date_trunc('month', created_at),
          'revenue', SUM(revenue)
        )
      ) INTO result
      FROM stats
      WHERE created_at >= NOW() - INTERVAL time_range
      GROUP BY date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at);
  END CASE;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS
-- =============================================

CREATE OR REPLACE FUNCTION update_stats()
RETURNS VOID AS $$
BEGIN
  UPDATE stats SET
    active_users = (SELECT COUNT(*) FROM users WHERE status = 'active'),
    server_load = (40 + RANDOM() * 30)::INTEGER,
    memory_usage = (50 + RANDOM() * 40)::INTEGER,
    network_latency = (20 + RANDOM() * 30)::INTEGER,
    updated_at = NOW()
  WHERE id = (SELECT id FROM stats LIMIT 1);
  
  -- Si no existe stats, crear uno nuevo
  IF NOT FOUND THEN
    INSERT INTO stats (
      active_users,
      server_load,
      memory_usage,
      network_latency
    ) VALUES (
      (SELECT COUNT(*) FROM users WHERE status = 'active'),
      (40 + RANDOM() * 30)::INTEGER,
      (50 + RANDOM() * 40)::INTEGER,
      (20 + RANDOM() * 30)::INTEGER
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INSERTAR DATOS DE PRUEBA PARA USUARIOS
-- =============================================

INSERT INTO users (name, email, status, profile, bio) VALUES
('Juan Pérez', 'juan.perez@email.com', 'active', '{"role": "admin"}', 'Administrador del sistema'),
('María García', 'maria.garcia@email.com', 'active', '{"role": "user"}', 'Usuario activo'),
('Carlos López', 'carlos.lopez@email.com', 'inactive', '{"role": "user"}', 'Usuario inactivo'),
('Ana Martín', 'ana.martin@email.com', 'active', '{"role": "moderator"}', 'Moderadora'),
('Luis Rodríguez', 'luis.rodriguez@email.com', 'pending', '{"role": "user"}', 'Usuario pendiente'),
('Carmen Sánchez', 'carmen.sanchez@email.com', 'active', '{"role": "user"}', 'Usuario activo'),
('Pedro González', 'pedro.gonzalez@email.com', 'active', '{"role": "user"}', 'Usuario activo'),
('Isabel Fernández', 'isabel.fernandez@email.com', 'inactive', '{"role": "user"}', 'Usuario inactivo'),
('Miguel Torres', 'miguel.torres@email.com', 'active', '{"role": "user"}', 'Usuario activo'),
('Laura Ruiz', 'laura.ruiz@email.com', 'active', '{"role": "user"}', 'Usuario activo')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- FUNCIÓN PARA GENERAR USUARIOS DE PRUEBA
-- =============================================

CREATE OR REPLACE FUNCTION generate_test_users(count INTEGER)
RETURNS VOID AS $$
DECLARE
  i INTEGER;
  user_name TEXT;
  user_email TEXT;
  user_status TEXT;
BEGIN
  FOR i IN 1..count LOOP
    user_name := 'Usuario Test ' || i;
    user_email := 'test' || i || '@example.com';
    
    -- Asignar status aleatorio
    CASE (RANDOM() * 3)::INTEGER
      WHEN 0 THEN user_status := 'active';
      WHEN 1 THEN user_status := 'inactive';
      ELSE user_status := 'pending';
    END CASE;
    
    INSERT INTO users (name, email, status, profile, bio) VALUES
    (
      user_name,
      user_email,
      user_status,
      '{"role": "user", "test": true}',
      'Usuario generado automáticamente para pruebas'
    )
    ON CONFLICT (email) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- HABILITAR ROW LEVEL SECURITY (OPCIONAL)
-- =============================================

-- Habilitar RLS en las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública (ajustar según necesidades)
CREATE POLICY "Allow public read access" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON stats
  FOR SELECT USING (true);

-- =============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =============================================

COMMENT ON TABLE users IS 'Tabla de usuarios optimizada para escalabilidad';
COMMENT ON TABLE stats IS 'Tabla de estadísticas en tiempo real';
COMMENT ON FUNCTION get_chart_data IS 'Función para obtener datos de gráficos con filtros';
COMMENT ON FUNCTION update_stats IS 'Función para actualizar estadísticas automáticamente';
COMMENT ON FUNCTION generate_test_users IS 'Genera usuarios de prueba para testing';

-- =============================================
-- VERIFICACIÓN DE CONFIGURACIÓN
-- =============================================

-- Verificar que todo se creó correctamente
SELECT 
  'users' as table_name, 
  count(*) as record_count 
FROM users
UNION ALL
SELECT 
  'stats' as table_name, 
  count(*) as record_count 
FROM stats;