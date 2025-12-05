import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';

// Contexto de autenticación
const AuthContext = createContext({});

// Hook para usar el contexto de autenticación
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  }
  return context;
};

// Provider de autenticación
export const AuthProvider = ({ children }) => {
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
        console.error('Error al obtener sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
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

  // Hook para obtener el usuario actual
  const useCurrentUser = () => {
    return useQuery({
      queryKey: ['user', user?.id],
      queryFn: async () => {
        if (!user) return null;

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw new Error(error.message);
        }

        return data || user;
      },
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutos
    });
  };

  // Mutación para iniciar sesión
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      console.log('Inicio de sesión exitoso:', data.user.email);
      // Redirigir al CRM después del login exitoso
      window.location.href = '/admin/default';
    },
    onError: (error) => {
      console.error('Error en inicio de sesión:', error);
    },
  });

  // Mutación para registrarse
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, fullName }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      console.log('Registro exitoso:', data.user?.email);
    },
    onError: (error) => {
      console.error('Error en registro:', error);
    },
  });

  // Mutación para cerrar sesión
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      console.log('Sesión cerrada exitosamente');
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Error al cerrar sesión:', error);
    },
  });

  // Mutación para restablecer contraseña
  const resetPasswordMutation = useMutation({
    mutationFn: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      console.log('Email de restablecimiento enviado');
    },
    onError: (error) => {
      console.error('Error al enviar email de restablecimiento:', error);
    },
  });

  // Mutación para actualizar contraseña
  const updatePasswordMutation = useMutation({
    mutationFn: async (newPassword) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      console.log('Contraseña actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error al actualizar contraseña:', error);
    },
  });

  // Función para crear perfil de usuario
  const createUserProfile = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userData.id,
            email: userData.email,
            name: userData.user_metadata?.full_name || '',
            role: 'user',
            status: 'active',
            profile: {
              avatar: userData.user_metadata?.avatar_url || null,
              bio: '',
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Error al crear perfil de usuario:', error);
      throw error;
    }
  };

  // Función para actualizar perfil de usuario
  const updateUserProfile = async (updates) => {
    try {
      if (!user) throw new Error('No hay usuario autenticado');

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  const value = {
    // Estado
    user,
    session,
    loading,
    
    // Queries
    useCurrentUser,
    
    // Mutaciones
    signIn: signInMutation.mutate,
    signInAsync: signInMutation.mutateAsync,
    signUp: signUpMutation.mutate,
    signUpAsync: signUpMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutate,
    updatePassword: updatePasswordMutation.mutate,
    
    // Estados de mutaciones
    isSigningIn: signInMutation.isPending,
    isSigningUp: signUpMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isUpdatingPassword: updatePasswordMutation.isPending,
    
    // Errores
    signInError: signInMutation.error,
    signUpError: signUpMutation.error,
    signOutError: signOutMutation.error,
    resetPasswordError: resetPasswordMutation.error,
    updatePasswordError: updatePasswordMutation.error,
    
    // Funciones auxiliares
    createUserProfile,
    updateUserProfile,
    
    // Utilidades
    isAuthenticated: !!user,
    isAdmin: user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar autenticación
export const useAuth = () => {
  const context = useAuthContext();
  return {
    ...context,
    // Aliases para compatibilidad
    login: context.signIn,
    loginAsync: context.signInAsync,
    register: context.signUp,
    registerAsync: context.signUpAsync,
    logout: context.signOut,
  };
};

// Hook para proteger rutas
export const useRequireAuth = () => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirigir al login si no está autenticado
      window.location.href = '/auth/sign-in';
    }
  }, [user, loading]);
  
  return { user, loading };
};

// Hook para verificar roles
export const useRequireRole = (requiredRole) => {
  const { user, loading } = useAuth();
  
  const hasRequiredRole = user && (
    user.user_metadata?.role === requiredRole ||
    user.app_metadata?.role === requiredRole
  );
  
  useEffect(() => {
    if (!loading && (!user || !hasRequiredRole)) {
      // Redirigir si no tiene el rol requerido
      window.location.href = '/unauthorized';
    }
  }, [user, loading, hasRequiredRole]);
  
  return { user, loading, hasRequiredRole };
};