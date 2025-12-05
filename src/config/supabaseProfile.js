import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase para LECTURA DE PERFIL
// Esta base de datos es SOLO para obtener información del perfil
const supabaseProfileUrl = 'https://leoyybfbnjajkktprhro.supabase.co';
const supabaseProfileAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlb3l5YmZibmphamtrdHByaHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4MTQ0MTYsImV4cCI6MjA2NDM5MDQxNn0.VfJoDIHgXB1k4kwgndmr2yLNDeDBBIrOVsbqaSWrjHU';

export const supabaseProfile = createClient(supabaseProfileUrl, supabaseProfileAnonKey, {
  auth: {
    autoRefreshToken: false, // No necesitamos auth en esta base
    persistSession: false,
    detectSessionInUrl: false
  },
  realtime: {
    enabled: false // Deshabilitamos realtime para solo lectura
  }
});

// Configuración para optimizar rendimiento de solo lectura
export const supabaseProfileConfig = {
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'dashboard-profile-readonly'
    }
  }
};

// Hook para manejo de errores específico para lectura de perfil
export const handleProfileError = (error) => {
  console.error('Profile Database Error:', error);
  
  if (error.code === 'PGRST116') {
    return 'No se encontraron datos del perfil';
  }
  
  if (error.message?.includes('JWT')) {
    return 'Error de autenticación en la base de datos de perfil';
  }
  
  return 'Error al leer datos del perfil. Intenta nuevamente';
};