import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, handleSupabaseError } from '../config/supabase';

// Hook para queries optimizadas con paginación
export const useOptimizedQuery = (queryKey, queryFunction, options = {}) => {
  return useQuery({
    queryKey,
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    ...options
  });
};

// Hook para obtener usuarios con paginación eficiente
export const useUsers = (page = 1, pageSize = 50, searchTerm = '', filters = {}) => {
  return useOptimizedQuery(
    ['users', page, pageSize, searchTerm, filters],
    async () => {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .range((page - 1) * pageSize, page * pageSize - 1);

      // Aplicar búsqueda
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          query = query.eq(key, value);
        }
      });

      // Ordenar por ID para consistencia
      query = query.order('id', { ascending: true });

      const { data, error, count } = await query;

      if (error) throw new Error(handleSupabaseError(error));

      return {
        data,
        totalCount: count,
        totalPages: Math.ceil(count / pageSize),
        currentPage: page,
        hasNextPage: page < Math.ceil(count / pageSize),
        hasPreviousPage: page > 1
      };
    },
    {
      keepPreviousData: true,
      select: (data) => ({
        ...data,
        // Transformar datos para optimizar renderizado
        data: data.data.map(user => ({
          ...user,
          // Solo cargar campos necesarios para la vista
          name: user.name,
          email: user.email,
          status: user.status,
          created_at: user.created_at,
          // Lazy load de campos pesados
          profile: user.profile ? {
            avatar: user.profile.avatar,
            bio: user.profile.bio
          } : null
        }))
      })
    }
  );
};

// Hook para estadísticas en tiempo real
export const useRealTimeStats = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['realtime-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .single();

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
    staleTime: 15000, // 15 segundos
    cacheTime: 60000, // 1 minuto
  });
};

// Hook para mutaciones optimizadas
export const useOptimizedMutation = (mutationFunction, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation(mutationFunction, {
    onSuccess: (data, variables, context) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['realtime-stats'] });
      
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error('Mutation Error:', error);
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
    retry: 2,
    retryDelay: 1000,
    ...options
  });
};

// Hook para actualizar usuario
export const useUpdateUser = () => {
  return useOptimizedMutation(
    async ({ id, updates }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    },
    {
      onSuccess: () => {
        console.log('Usuario actualizado exitosamente');
      }
    }
  );
};

// Hook para crear usuario
export const useCreateUser = () => {
  return useOptimizedMutation(
    async (userData) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    },
    {
      onSuccess: () => {
        console.log('Usuario creado exitosamente');
      }
    }
  );
};

// Hook para eliminar usuario
export const useDeleteUser = () => {
  return useOptimizedMutation(
    async (userId) => {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw new Error(handleSupabaseError(error));
      return { id: userId };
    },
    {
      onSuccess: () => {
        console.log('Usuario eliminado exitosamente');
      }
    }
  );
};

// Hook para búsqueda en tiempo real
export const useSearchUsers = (searchTerm, debounceMs = 300) => {
  return useQuery({
    queryKey: ['search-users', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, status')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20);

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000,
    cacheTime: 60000,
  });
};

// Hook para obtener datos de gráficos con agregación eficiente
export const useChartData = (chartType = 'users', timeRange = '7d') => {
  return useQuery({
    queryKey: ['chart-data', chartType, timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_chart_data', {
          chart_type: chartType,
          time_range: timeRange
        });

      if (error) throw new Error(handleSupabaseError(error));
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 15 * 60 * 1000, // 15 minutos
  });
};