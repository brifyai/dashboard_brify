import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, HStack, VStack, Text, Badge, Progress, useColorModeValue, SimpleGrid, Skeleton } from '@chakra-ui/react';
import { MdTrendingUp, MdTrendingDown, MdRemove, MdSpeed, MdMemory, MdNetworkCheck } from 'react-icons/md';
import { useRealTimeStats } from '../hooks/useSupabase';

// Componente de métrica individual optimizado
const OptimizedMetric = React.memo(({ 
  metric, 
  index, 
  getTrendIcon, 
  getStatusColor,
  thresholds 
}) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={bg}
      _hover={{ 
        borderColor: 'brand.400', 
        transform: 'translateY(-2px)',
        boxShadow: 'md'
      }}
      transition="all 0.3s ease"
      opacity={metric.isLoading ? 0.7 : 1}
    >
      <VStack spacing={3} align="start" w="full">
        <HStack justify="space-between" w="full">
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {metric.title}
          </Text>
          <HStack spacing={1}>
            {getTrendIcon(metric.trend)}
            <Text fontSize="xs" color="gray.500">
              {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
            </Text>
          </HStack>
        </HStack>

        <HStack justify="space-between" w="full">
          <Text fontWeight="bold" fontSize="xl" color={metric.isLoading ? 'gray.400' : 'inherit'}>
            {metric.isLoading ? (
              <Skeleton height="24px" width="80px" />
            ) : (
              metric.value
            )}
          </Text>
          {metric.status && !metric.isLoading && (
            <Badge
              colorScheme={metric.status === 'good' ? 'green' : metric.status === 'warning' ? 'orange' : 'red'}
              variant="subtle"
              fontSize="xs"
            >
              {metric.statusText}
            </Badge>
          )}
        </HStack>

        {metric.progress && metric.thresholds && !metric.isLoading && (
          <VStack spacing={2} w="full">
            <Progress
              value={metric.progress}
              size="sm"
              colorScheme={getStatusColor(metric.progress, metric.thresholds)}
              borderRadius="full"
              w="full"
              hasStripe
              isAnimated={metric.progress > thresholds.warning}
            />
            <HStack justify="space-between" w="full">
              <Text fontSize="xs" color="gray.500">
                {metric.progress}% usado
              </Text>
              <Text fontSize="xs" color="gray.500">
                {metric.progress > thresholds.warning ? 'Alto' : 
                 metric.progress > thresholds.good ? 'Medio' : 'Normal'}
              </Text>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
});

OptimizedMetric.displayName = 'OptimizedMetric';

// Componente principal optimizado
function OptimizedRealTimeStats() {
  const [previousStats, setPreviousStats] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Usar el hook optimizado para estadísticas
  const { data: stats, isLoading, error, refetch } = useRealTimeStats();

  // Memoizar el cálculo de tendencias para evitar recálculos innecesarios
  const trends = useMemo(() => {
    if (!stats || !previousStats) {
      return {
        activeUsers: 'stable',
        revenue: 'stable',
        conversionRate: 'stable',
        serverLoad: 'stable',
        memoryUsage: 'stable',
        networkLatency: 'stable',
      };
    }

    const calculateTrend = (current, previous) => {
      const diff = current - previous;
      const percentageChange = Math.abs(diff / previous) * 100;
      
      if (percentageChange < 1) return 'stable';
      return diff > 0 ? 'up' : 'down';
    };

    return {
      activeUsers: calculateTrend(stats.activeUsers, previousStats.activeUsers),
      revenue: calculateTrend(stats.revenue, previousStats.revenue),
      conversionRate: calculateTrend(stats.conversionRate, previousStats.conversionRate),
      serverLoad: calculateTrend(stats.serverLoad, previousStats.serverLoad),
      memoryUsage: calculateTrend(stats.memoryUsage, previousStats.memoryUsage),
      networkLatency: calculateTrend(stats.networkLatency, previousStats.networkLatency),
    };
  }, [stats, previousStats]);

  // Actualizar estadísticas anteriores cuando cambian los datos
  useEffect(() => {
    if (stats && !isLoading) {
      setPreviousStats(stats);
    }
  }, [stats, isLoading]);

  // Intersection Observer para pausar actualizaciones cuando no es visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('realtime-stats');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  // Funciones auxiliares memoizadas
  const getTrendIcon = useCallback((trend) => {
    switch (trend) {
      case 'up':
        return <Box as={MdTrendingUp} color="green.500" />;
      case 'down':
        return <Box as={MdTrendingDown} color="red.500" />;
      default:
        return <Box as={MdRemove} color="gray.500" />;
    }
  }, []);

  const getStatusColor = useCallback((value, thresholds) => {
    if (value <= thresholds.good) return 'green';
    if (value <= thresholds.warning) return 'orange';
    return 'red';
  }, []);

  // Memoizar las métricas para evitar recálculos
  const metrics = useMemo(() => {
    const baseMetrics = [
      {
        title: 'Usuarios Activos',
        value: stats ? stats.activeUsers.toLocaleString() : '---',
        trend: trends.activeUsers,
        status: stats?.activeUsers > 1000 ? 'good' : stats?.activeUsers > 500 ? 'warning' : 'error',
        statusText: stats?.activeUsers > 1000 ? 'Excelente' : stats?.activeUsers > 500 ? 'Bueno' : 'Bajo',
        isLoading,
      },
      {
        title: 'Ingresos',
        value: stats ? `$${stats.revenue.toLocaleString()}` : '---',
        trend: trends.revenue,
        status: stats?.revenue > 50000 ? 'good' : stats?.revenue > 20000 ? 'warning' : 'error',
        statusText: stats?.revenue > 50000 ? 'Creciendo' : stats?.revenue > 20000 ? 'Estable' : 'Bajo',
        isLoading,
      },
      {
        title: 'Tasa de Conversión',
        value: stats ? `${stats.conversionRate.toFixed(1)}%` : '---',
        trend: trends.conversionRate,
        status: stats?.conversionRate > 5 ? 'good' : stats?.conversionRate > 2 ? 'warning' : 'error',
        statusText: stats?.conversionRate > 5 ? 'Excelente' : stats?.conversionRate > 2 ? 'Buena' : 'Baja',
        isLoading,
      },
      {
        title: 'Carga del Servidor',
        value: stats ? `${stats.serverLoad}%` : '---',
        trend: trends.serverLoad,
        progress: stats?.serverLoad,
        thresholds: { good: 70, warning: 85 },
        isLoading,
      },
      {
        title: 'Uso de Memoria',
        value: stats ? `${stats.memoryUsage}%` : '---',
        trend: trends.memoryUsage,
        progress: stats?.memoryUsage,
        thresholds: { good: 60, warning: 80 },
        isLoading,
      },
      {
        title: 'Latencia de Red',
        value: stats ? `${stats.networkLatency}ms` : '---',
        trend: trends.networkLatency,
        status: stats?.networkLatency < 50 ? 'good' : stats?.networkLatency < 100 ? 'warning' : 'error',
        statusText: stats?.networkLatency < 50 ? 'Excelente' : stats?.networkLatency < 100 ? 'Buena' : 'Alta',
        isLoading,
      },
    ];

    return baseMetrics;
  }, [stats, trends, isLoading]);

  // Manejo de errores
  if (error) {
    return (
      <Box bg={bg} borderRadius="lg" boxShadow="sm" p={6}>
        <VStack spacing={4}>
          <Text color="red.500" fontWeight="medium">
            Error al cargar estadísticas
          </Text>
          <Text fontSize="sm" color="gray.600">
            {error.message}
          </Text>
          <button 
            onClick={() => refetch()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      id="realtime-stats"
      bg={bg} 
      borderRadius="lg" 
      boxShadow="sm" 
      p={6} 
      className="widget-card"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" w="full">
          <Text fontWeight="medium" fontSize="lg">
            Métricas en Tiempo Real
          </Text>
          <HStack spacing={2}>
            <Badge 
              colorScheme={isVisible ? "green" : "gray"} 
              variant="subtle"
            >
              {isVisible ? 'Activo' : 'Pausado'}
            </Badge>
            {isLoading && (
              <Badge colorScheme="blue" variant="subtle">
                Actualizando...
              </Badge>
            )}
          </HStack>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {metrics.map((metric, index) => (
            <OptimizedMetric
              key={metric.title}
              metric={metric}
              index={index}
              getTrendIcon={getTrendIcon}
              getStatusColor={getStatusColor}
              thresholds={metric.thresholds || { good: 70, warning: 85 }}
            />
          ))}
        </SimpleGrid>

        {/* Resumen del Sistema */}
        <Box
          p={4}
          bg="gray.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <VStack spacing={2} align="start">
            <Text fontSize="sm" fontWeight="medium">
              Resumen del Sistema
            </Text>
            <HStack spacing={4} fontSize="xs" flexWrap="wrap">
              <HStack spacing={1}>
                <Box as={MdSpeed} size={12} color="green.500" />
                <Text>Performance: {stats?.serverLoad < 70 ? 'Óptima' : stats?.serverLoad < 85 ? 'Buena' : 'Crítica'}</Text>
              </HStack>
              <HStack spacing={1}>
                <Box as={MdMemory} size={12} color="blue.500" />
                <Text>Memoria: {stats?.memoryUsage < 60 ? 'Normal' : stats?.memoryUsage < 80 ? 'Alta' : 'Crítica'}</Text>
              </HStack>
              <HStack spacing={1}>
                <Box as={MdNetworkCheck} size={12} color="purple.500" />
                <Text>Red: {stats?.networkLatency < 50 ? 'Excelente' : stats?.networkLatency < 100 ? 'Buena' : 'Lenta'}</Text>
              </HStack>
              <Text color="gray.500">•</Text>
              <Text color="gray.600">
                Última actualización: {new Date().toLocaleTimeString()}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export default OptimizedRealTimeStats;