-- Crear tabla de notificaciones para el CRM Dashboard
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'user', 'payment', 'system', 'security')),
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insertar notificaciones de ejemplo
INSERT INTO notifications (title, message, type, priority, category, action_url) VALUES
('Nuevo usuario registrado', 'Se ha registrado un nuevo usuario en el sistema', 'info', 'normal', 'user', '/admin/crm?view=users'),
('Pago recibido', 'Se ha recibido un nuevo pago de $50.000 CLP', 'success', 'high', 'payment', '/admin/crm?view=payments'),
('Plan próximo a vencer', 'El plan "Plan Brify" de 5 usuarios vence en 3 días', 'warning', 'normal', 'user', '/admin/crm?view=users'),
('Error en sistema de pagos', 'Se detectó un error en el procesamiento de pagos', 'error', 'urgent', 'system', '/admin/crm?view=payments'),
('Actualización de seguridad', 'Se ha aplicado una actualización de seguridad crítica', 'info', 'high', 'security', NULL),
('Reporte mensual disponible', 'El reporte de estadísticas de diciembre está listo', 'success', 'normal', 'general', NULL),
('Mantenimiento programado', 'El sistema estará en mantenimiento el próximo domingo', 'warning', 'normal', 'system', NULL),
('Nuevo plan creado', 'Se ha creado un nuevo plan "Plan Premium"', 'success', 'normal', 'general', '/admin/crm?view=plans'),
('Usuario inactivo', '10 usuarios no han iniciado sesión en los últimos 30 días', 'warning', 'low', 'user', '/admin/crm?view=users'),
('Backup completado', 'Se ha completado exitosamente el backup de la base de datos', 'success', 'low', 'system', NULL);

-- Habilitar Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver sus propias notificaciones
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id::uuid);

-- Política para que los usuarios puedan actualizar sus propias notificaciones
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id::uuid);

-- Política para que los administradores puedan ver todas las notificaciones
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id::text = auth.uid()::text 
            AND users.role = 'admin'
        )
    );