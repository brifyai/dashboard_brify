import { QueryClient } from '@tanstack/react-query';

// Configuración optimizada del QueryClient para manejar 50,000 usuarios
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran frescos
      staleTime: 5 * 60 * 1000, // 5 minutos
      
      // Tiempo que los datos permanecen en cache
      cacheTime: 15 * 60 * 1000, // 15 minutos
      
      // Número de reintentos en caso de error
      retry: (failureCount, error) => {
        // No reintentar errores de autenticación
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Reintentar hasta 3 veces para otros errores
        return failureCount < 3;
      },
      
      // Delay entre reintentos (exponencial)
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // No refetch cuando la ventana vuelve a tener foco
      refetchOnWindowFocus: false,
      
      // Refetch cuando se recupera la conexión
      refetchOnReconnect: true,
      
      // Refetch en background
      refetchInBackground: false,
    },
    mutations: {
      // Número de reintentos para mutaciones
      retry: 1,
      
      // Delay entre reintentos para mutaciones
      retryDelay: 1000,
    },
  },
});

// Configuración específica para queries de usuarios (datos grandes)
export const userQueryConfig = {
  staleTime: 2 * 60 * 1000, // 2 minutos para datos de usuarios
  cacheTime: 10 * 60 * 1000, // 10 minutos en cache
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
};

// Configuración para estadísticas en tiempo real
export const statsQueryConfig = {
  staleTime: 30 * 1000, // 30 segundos
  cacheTime: 2 * 60 * 1000, // 2 minutos
  refetchInterval: 30 * 1000, // Refetch cada 30 segundos
  refetchIntervalInBackground: true,
};

// Configuración para gráficos
export const chartQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 15 * 60 * 1000, // 15 minutos
  refetchOnWindowFocus: false,
};

// Hook para invalidar queries relacionadas
export const invalidateRelatedQueries = (queryClient) => {
  return {
    users: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    stats: () => queryClient.invalidateQueries({ queryKey: ['realtime-stats'] }),
    charts: () => queryClient.invalidateQueries({ queryKey: ['chart-data'] }),
    search: () => queryClient.invalidateQueries({ queryKey: ['search-users'] }),
    all: () => queryClient.invalidateQueries(),
  };
};

// Configuración de prefetch para mejorar UX
export const prefetchQueries = (queryClient) => {
  return {
    // Prefetch datos de usuarios para la siguiente página
    prefetchNextUsersPage: async (page, pageSize = 50) => {
      await queryClient.prefetchQuery({
        queryKey: ['users', page + 1, pageSize],
        queryFn: () => fetchUsersPage(page + 1, pageSize),
        staleTime: 10 * 60 * 1000, // 10 minutos
      });
    },
    
    // Prefetch estadísticas
    prefetchStats: async () => {
      await queryClient.prefetchQuery({
        queryKey: ['realtime-stats'],
        queryFn: fetchStats,
        staleTime: 60 * 1000, // 1 minuto
      });
    },
    
    // Prefetch datos de gráficos
    prefetchChartData: async (chartType = 'users', timeRange = '7d') => {
      await queryClient.prefetchQuery({
        queryKey: ['chart-data', chartType, timeRange],
        queryFn: () => fetchChartData(chartType, timeRange),
        staleTime: 15 * 60 * 1000, // 15 minutos
      });
    },
  };
};

// Funciones auxiliares para prefetch (estas deberían implementarse con Supabase)
const fetchUsersPage = async (page, pageSize) => {
  // Implementar con Supabase
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  
  // Placeholder - implementar con Supabase
  return {
    data: [],
    totalCount: 0,
    totalPages: 0,
    currentPage: page,
    hasNextPage: false,
    hasPreviousPage: page > 1
  };
};

const fetchStats = async () => {
  // Implementar con Supabase
  return {
    activeUsers: 0,
    revenue: 0,
    conversionRate: 0,
    serverLoad: 0,
    memoryUsage: 0,
    networkLatency: 0,
  };
};

const fetchChartData = async (chartType, timeRange) => {
  // Implementar con Supabase
  return {
    series: [],
    options: {}
  };
};