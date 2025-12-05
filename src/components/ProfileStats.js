import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Heading,
  Alert,
  AlertIcon,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { MdPeople, MdSchedule, MdToday, MdTrendingUp, MdToken } from 'react-icons/md';
import { supabaseProfile } from '../config/supabaseProfile';

function ProfileStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    last30Days: 0,
    last7Days: 0,
    todayUsers: 0,
    totalTokens: 0,
    planDistribution: {},
    recentUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Obteniendo estadísticas reales de la base de datos...');

      // Obtener todos los usuarios
      const { data: allUsers, error: usersError } = await supabaseProfile
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw new Error(`Error al obtener usuarios: ${usersError.message}`);
      }

      if (!allUsers || allUsers.length === 0) {
        setStats({
          totalUsers: 0,
          last30Days: 0,
          last7Days: 0,
          todayUsers: 0,
          totalTokens: 0,
          planDistribution: {},
          recentUsers: []
        });
        return;
      }

      // Calcular estadísticas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      let todayCount = 0;
      let last7DaysCount = 0;
      let last30DaysCount = 0;
      let totalTokens = 0;
      const planDistribution = {};
      const recentUsers = [];

      allUsers.forEach((user, index) => {
        const createdAt = new Date(user.created_at);
        
        // Contar por períodos
        if (createdAt >= today) todayCount++;
        if (createdAt >= last7Days) last7DaysCount++;
        if (createdAt >= last30Days) last30DaysCount++;
        
        // Sumar tokens
        totalTokens += user.tokens_consumed || 0;
        
        // Distribución de planes
        const plan = user.plan || 'Free';
        planDistribution[plan] = (planDistribution[plan] || 0) + 1;
        
        // Usuarios recientes (últimos 5)
        if (index < 5) {
          recentUsers.push({
            email: user.email,
            created_at: user.created_at,
            plan: plan,
            tokens_consumed: user.tokens_consumed || 0
          });
        }
      });

      setStats({
        totalUsers: allUsers.length,
        last30Days: last30DaysCount,
        last7Days: last7DaysCount,
        todayUsers: todayCount,
        totalTokens,
        planDistribution,
        recentUsers
      });

      console.log('✅ Estadísticas obtenidas exitosamente:', {
        totalUsers: allUsers.length,
        last30Days: last30DaysCount,
        last7Days: last7DaysCount,
        todayUsers: todayCount,
        totalTokens
      });

    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'premium': return 'purple';
      case 'basic': return 'blue';
      case 'free': return 'gray';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Box p={6} bg="white" borderRadius="lg" shadow="sm">
        <Center h="200px">
          <VStack spacing={4}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">Cargando estadísticas...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} bg="white" borderRadius="lg" shadow="sm">
        <Alert status="error">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error al cargar estadísticas</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} bg="white" borderRadius="lg" shadow="sm">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="lg" color="blue.600" mb={2}>
              📊 Estadísticas de Usuarios
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Datos en tiempo real de la base de datos
            </Text>
          </Box>
          <Badge colorScheme="green" variant="subtle" fontSize="sm">
            🔄 Actualizado
          </Badge>
        </HStack>

        {/* Main Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Box p={4} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
            <HStack spacing={3} mb={2}>
              <Box p={2} bg="blue.500" borderRadius="md">
                <MdPeople color="white" size={20} />
              </Box>
              <Text fontSize="sm" color="blue.700" fontWeight="medium">
                Total Usuarios
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="blue.800">
              {stats.totalUsers.toLocaleString()}
            </Text>
          </Box>

          <Box p={4} bg="green.50" borderRadius="lg" border="1px" borderColor="green.200">
            <HStack spacing={3} mb={2}>
              <Box p={2} bg="green.500" borderRadius="md">
                <MdSchedule color="white" size={20} />
              </Box>
              <Text fontSize="sm" color="green.700" fontWeight="medium">
                Últimos 30 Días
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="green.800">
              {stats.last30Days}
            </Text>
          </Box>

          <Box p={4} bg="orange.50" borderRadius="lg" border="1px" borderColor="orange.200">
            <HStack spacing={3} mb={2}>
              <Box p={2} bg="orange.500" borderRadius="md">
                <MdTrendingUp color="white" size={20} />
              </Box>
              <Text fontSize="sm" color="orange.700" fontWeight="medium">
                Últimos 7 Días
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="orange.800">
              {stats.last7Days}
            </Text>
          </Box>

          <Box p={4} bg="purple.50" borderRadius="lg" border="1px" borderColor="purple.200">
            <HStack spacing={3} mb={2}>
              <Box p={2} bg="purple.500" borderRadius="md">
                <MdToday color="white" size={20} />
              </Box>
              <Text fontSize="sm" color="purple.700" fontWeight="medium">
                Registrados Hoy
              </Text>
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="purple.800">
              {stats.todayUsers}
            </Text>
          </Box>
        </SimpleGrid>

        {/* Tokens and Plan Distribution */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Tokens Consumed */}
          <Box p={6} bg="gray.50" borderRadius="lg">
            <HStack spacing={3} mb={4}>
              <Box p={2} bg="red.500" borderRadius="md">
                <MdToken color="white" size={20} />
              </Box>
              <Text fontSize="lg" fontWeight="bold" color="gray.800">
                Tokens Consumidos
              </Text>
            </HStack>
            <Text fontSize="3xl" fontWeight="bold" color="red.600" mb={2}>
              {stats.totalTokens.toLocaleString()}
            </Text>
            <Progress 
              value={Math.min((stats.totalTokens / 100000) * 100, 100)} 
              colorScheme="red" 
              size="lg" 
              borderRadius="full" 
            />
            <Text fontSize="sm" color="gray.600" mt={2}>
              Progreso hacia 100K tokens
            </Text>
          </Box>

          {/* Plan Distribution */}
          <Box p={6} bg="gray.50" borderRadius="lg">
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
              Distribución de Planes
            </Text>
            <VStack spacing={3} align="stretch">
              {Object.entries(stats.planDistribution).map(([plan, count]) => {
                const percentage = ((count / stats.totalUsers) * 100).toFixed(1);
                return (
                  <HStack key={plan} justify="space-between" p={3} bg="white" borderRadius="md">
                    <HStack spacing={2}>
                      <Badge colorScheme={getPlanColor(plan)} variant="solid">
                        {plan}
                      </Badge>
                      <Text fontSize="sm" color="gray.700">
                        {count} usuarios
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold" color="gray.800">
                      {percentage}%
                    </Text>
                  </HStack>
                );
              })}
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Recent Users */}
        <Box p={6} bg="gray.50" borderRadius="lg">
          <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={4}>
            Registros Recientes
          </Text>
          <VStack spacing={3} align="stretch">
            {stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user, index) => (
                <HStack key={index} justify="space-between" p={3} bg="white" borderRadius="md">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.800">
                      {user.email || 'Email no disponible'}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {formatDate(user.created_at)}
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <Badge colorScheme={getPlanColor(user.plan)} variant="outline">
                      {user.plan}
                    </Badge>
                    <Text fontSize="xs" color="gray.600">
                      {user.tokens_consumed} tokens
                    </Text>
                  </HStack>
                </HStack>
              ))
            ) : (
              <Text color="gray.600" textAlign="center" py={4}>
                No hay usuarios registrados
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export default ProfileStats;