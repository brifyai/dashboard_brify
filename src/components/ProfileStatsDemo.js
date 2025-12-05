import React from 'react';
import {
  Box,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Badge,
  Heading,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdPeople, MdTrendingUp, MdSchedule, MdToday, MdToken } from 'react-icons/md';
import Widget from './Widget';
import Card from './Card';
import Chart from './Chart';

function ProfileStatsDemo() {
  const bg = useColorModeValue('white', 'gray.800');

  // Datos de prueba para demostrar funcionalidad
  const demoStats = {
    totalUsers: 1247,
    usersLast30Days: 156,
    usersLast7Days: 43,
    usersToday: 7,
    totalTokens: 45678,
    plansDistribution: {
      'Premium': 45,
      'Basic': 30,
      'Free': 25
    },
    recentRegistrations: [
      {
        id: 1,
        email: 'usuario1@ejemplo.com',
        created_at: '2024-12-04T15:30:00Z',
        plan: 'Premium',
        status: 'active'
      },
      {
        id: 2,
        email: 'usuario2@ejemplo.com',
        created_at: '2024-12-04T14:15:00Z',
        plan: 'Basic',
        status: 'active'
      },
      {
        id: 3,
        email: 'usuario3@ejemplo.com',
        created_at: '2024-12-04T13:45:00Z',
        plan: 'Free',
        status: 'active'
      },
      {
        id: 4,
        email: 'usuario4@ejemplo.com',
        created_at: '2024-12-04T12:20:00Z',
        plan: 'Premium',
        status: 'active'
      },
      {
        id: 5,
        email: 'usuario5@ejemplo.com',
        created_at: '2024-12-04T11:10:00Z',
        plan: 'Basic',
        status: 'pending'
      }
    ]
  };

  // Preparar datos para gráficos
  const planChartOptions = {
    chart: {
      type: 'donut',
      height: 300,
    },
    labels: Object.keys(demoStats.plansDistribution),
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#eb2f96'],
  };

  const planChartSeries = Object.values(demoStats.plansDistribution);

  // Calcular porcentajes de crecimiento
  const growth30Days = demoStats.totalUsers > 0 ? 
    ((demoStats.usersLast30Days / demoStats.totalUsers) * 100).toFixed(1) : 0;
  const growth7Days = demoStats.totalUsers > 0 ? 
    ((demoStats.usersLast7Days / demoStats.totalUsers) * 100).toFixed(1) : 0;
  const todayGrowth = demoStats.totalUsers > 0 ? 
    ((demoStats.usersToday / demoStats.totalUsers) * 100).toFixed(1) : 0;

  return (
    <Box>
      <Heading size="md" mb={4}>📊 Estadísticas de Usuarios (DEMO)</Heading>
      
      {/* Nota explicativa */}
      <Card bg="blue.50" borderColor="blue.200" mb={6}>
        <VStack align="start" spacing={2}>
          <Heading size="sm" color="blue.700">ℹ️ Modo Demostración</Heading>
          <Text fontSize="sm" color="blue.600">
            Esta sección muestra datos de ejemplo para demostrar la funcionalidad. 
            Los datos reales se cargarán desde la base de datos de lectura cuando esté disponible.
          </Text>
        </VStack>
      </Card>
      
      {/* Métricas principales */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={6}>
        <Widget
          title="Total de Usuarios"
          value={demoStats.totalUsers.toLocaleString()}
          percentage={growth30Days}
          trend="increase"
          icon={MdPeople}
        />
        <Widget
          title="Últimos 30 Días"
          value={demoStats.usersLast30Days.toLocaleString()}
          percentage={growth30Days}
          trend="increase"
          icon={MdTrendingUp}
        />
        <Widget
          title="Últimos 7 Días"
          value={demoStats.usersLast7Days.toLocaleString()}
          percentage={growth7Days}
          trend="increase"
          icon={MdSchedule}
        />
        <Widget
          title="Registrados Hoy"
          value={demoStats.usersToday.toLocaleString()}
          percentage={todayGrowth}
          trend="increase"
          icon={MdToday}
        />
      </SimpleGrid>

      {/* Tokens y Planes */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        <Card>
          <VStack align="start" spacing={4} w="full">
            <HStack justify="space-between" w="full">
              <HStack>
                <MdToken size={20} color="#1890ff" />
                <Heading size="md">Tokens Consumidos</Heading>
              </HStack>
              <Badge colorScheme="blue" variant="subtle">
                {demoStats.totalTokens.toLocaleString()}
              </Badge>
            </HStack>
            
            <Box w="full">
              <Text fontSize="sm" color="gray.600" mb={2}>
                Total de tokens consumidos por todos los usuarios
              </Text>
              <Progress 
                value={Math.min((demoStats.totalTokens / 100000) * 100, 100)} 
                size="lg" 
                colorScheme="blue" 
                borderRadius="full" 
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {demoStats.totalTokens.toLocaleString()} / 100,000 tokens
              </Text>
            </Box>
          </VStack>
        </Card>

        <Card>
          <VStack align="start" spacing={4} w="full">
            <Heading size="md">Distribución de Planes</Heading>
            <Chart
              options={planChartOptions}
              series={planChartSeries}
              type="donut"
              height={250}
            />
            <HStack justify="space-around" w="full" mt={2}>
              {Object.entries(demoStats.plansDistribution).map(([plan, count]) => (
                <VStack key={plan} spacing={1}>
                  <Text fontSize="xs" color="gray.600">{plan}</Text>
                  <Text fontWeight="bold" fontSize="sm">{count}</Text>
                </VStack>
              ))}
            </HStack>
          </VStack>
        </Card>
      </SimpleGrid>

      {/* Registros recientes */}
      <Card>
        <VStack align="start" spacing={4} w="full">
          <HStack justify="space-between" w="full">
            <Heading size="md">Registros Recientes</Heading>
            <Badge colorScheme="green" variant="subtle">
              Últimos {demoStats.recentRegistrations.length} registros
            </Badge>
          </HStack>
          
          <VStack spacing={2} w="full" align="stretch">
            {demoStats.recentRegistrations.length > 0 ? (
              demoStats.recentRegistrations.map((registration, index) => (
                <HStack 
                  key={registration.id} 
                  justify="space-between" 
                  p={3} 
                  bg={bg} 
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize="sm">
                      {registration.email}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {new Date(registration.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <Badge 
                      colorScheme={registration.plan === 'Premium' ? 'purple' : 'blue'} 
                      variant="subtle"
                      fontSize="xs"
                    >
                      {registration.plan}
                    </Badge>
                    <Badge 
                      colorScheme={registration.status === 'active' ? 'green' : 'orange'} 
                      variant="subtle"
                      fontSize="xs"
                    >
                      {registration.status}
                    </Badge>
                  </HStack>
                </HStack>
              ))
            ) : (
              <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                No hay registros recientes disponibles
              </Text>
            )}
          </VStack>
        </VStack>
      </Card>
    </Box>
  );
}

export default ProfileStatsDemo;