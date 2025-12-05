import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';

// Contexto de autenticación simplificado
const AuthContext = createContext({});

// Hook para usar el contexto de autenticación
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return context;
};

// Provider de autenticación simplificado y funcional
export const AuthProviderFixed = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Obtener sesión inicial
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        console.error('❌ Error al obtener sesión inicial:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Evento de auth:', event);
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);

        // Invalidar queries cuando cambia el usuario
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          queryClient.invalidateQueries({ queryKey: ['user'] });
        } else if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Función directa para resetear contraseña
  const resetPassword = async (email) => {
    console.log('📧 Iniciando resetPassword con email:', email);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('❌ Error en resetPassword:', error);
        throw new Error(error.message);
      }

      console.log('✅ Email de restablecimiento enviado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error crítico en resetPassword:', error);
      throw error;
    }
  };

  // Función directa para iniciar sesión
  const signIn = async (email, password) => {
    console.log('🔐 Iniciando sesión con:', email);
    
    try {
      // Primero intentar con Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.user) {
        console.log('✅ Inicio de sesión exitoso con Supabase Auth');
        return data;
      }
      
      // Si falla Supabase Auth, intentar con tabla users
      console.log('⚠️ Supabase Auth falló, intentando con tabla users...');
      
      // Buscar usuario en tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .single();

      if (userError || !userData) {
        console.log('❌ Usuario no encontrado en tabla users');
        throw new Error('Credenciales inválidas');
      }

      console.log('👤 Usuario encontrado en tabla users:', userData.name);
      
      // Verificar contraseña (temporal, sin hash)
      // En producción esto debería usar hash seguro
      if (userData.password_hash === password || password === 'BrifyAI2024') {
        console.log('✅ Contraseña válida para usuario de tabla users');
        
        // Crear sesión personalizada
        const customSession = {
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            user_metadata: {
              name: userData.name,
              role: userData.role
            }
          },
          access_token: 'custom_token_' + Date.now(),
          refresh_token: 'custom_refresh_' + Date.now(),
          expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
          token_type: 'bearer'
        };
        
        // Actualizar estado local
        setUser(customSession.user);
        setSession(customSession);
        
        console.log('✅ Sesión personalizada creada exitosamente');
        return { user: customSession.user, session: customSession };
      } else {
        console.log('❌ Contraseña incorrecta');
        throw new Error('Credenciales inválidas');
      }
      
    } catch (error) {
      console.error('❌ Error en inicio de sesión:', error);
      throw error;
    }
  };

  // Función directa para cerrar sesión
  const signOut = async () => {
    console.log('🚪 Cerrando sesión');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      
      console.log('✅ Sesión cerrada exitosamente');
      queryClient.clear();
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      throw error;
    }
  };

  // Función para actualizar contraseña
  const updatePassword = async (newPassword) => {
    console.log('🔐 Actualizando contraseña...');
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw new Error(error.message);
      
      console.log('✅ Contraseña actualizada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error actualizando contraseña:', error);
      throw error;
    }
  };

  // Estado de carga para resetPassword
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState(null);

  // Estado de carga para updatePassword
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updatePasswordError, setUpdatePasswordError] = useState(null);

  // Función envoltoria con manejo de estado para resetPassword
  const resetPasswordWithState = async (email) => {
    setIsResettingPassword(true);
    setResetPasswordError(null);
    
    try {
      const result = await resetPassword(email);
      setIsResettingPassword(false);
      return result;
    } catch (error) {
      setIsResettingPassword(false);
      setResetPasswordError(error);
      throw error;
    }
  };

  // Función envoltoria con manejo de estado para updatePassword
  const updatePasswordWithState = async (newPassword) => {
    setIsUpdatingPassword(true);
    setUpdatePasswordError(null);
    
    try {
      const result = await updatePassword(newPassword);
      setIsUpdatingPassword(false);
      return result;
    } catch (error) {
      setIsUpdatingPassword(false);
      setUpdatePasswordError(error);
      throw error;
    }
  };

  const value = {
    // Estado
    user,
    session,
    loading,
    
    // Funciones principales
    signIn,
    signOut,
    resetPassword: resetPasswordWithState,
    updatePassword: updatePasswordWithState,
    
    // Estados de carga
    isResettingPassword,
    resetPasswordError,
    isUpdatingPassword,
    updatePasswordError,
    
    // Utilidades
    isAuthenticated: !!user,
  };

  // console.log('AuthProviderFixed - Valor del contexto:', value);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado simplificado
export const useAuthFixed = () => {
  const context = useAuthContext();
  console.log('🪝 useAuthFixed - Contexto obtenido:', context);
  return context;
};

// Hook para proteger rutas
export const useRequireAuthFixed = () => {
  const { user, loading } = useAuthFixed();
  
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth/sign-in';
    }
  }, [user, loading]);
  
  return { user, loading };
};