import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase - Credenciales reales
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hvhmsecjrkmlqlruznfe.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aG1zZWNqcmttbHFscnV6bmZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxMDYsImV4cCI6MjA4MDM2NTEwNn0.zE9klNhzyoW7tDqfE-69i4crKsdtzenP0i01c5xOgE4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Configuración para optimizar rendimiento con muchos usuarios
export const supabaseConfig = {
  // Configurar pool de conexiones
  db: {
    schema: 'public'
  },
  // Configurar límites para queries grandes
  global: {
    headers: {
      'x-application-name': 'dashboard'
    }
  }
};

// Hook para manejo de errores de Supabase
export const handleSupabaseError = (error) => {
  console.error('Supabase Error:', error);
  
  if (error.code === 'PGRST116') {
    return 'No se encontraron datos';
  }
  
  if (error.code === '23505') {
    return 'El registro ya existe';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente';
  }
  
  return 'Error de conexión. Intenta nuevamente';
};