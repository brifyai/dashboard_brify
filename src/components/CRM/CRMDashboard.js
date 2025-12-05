import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  useDisclosure,
} from '@chakra-ui/react';
import { 
  MdPeople, 
  MdPayment, 
  MdDiamond, 
  MdTrendingUp,
  MdTrendingDown,
  MdMoreVert,
  MdEmail,
  MdVisibility,
  MdAdd,
  MdFilterList,
  MdDownload,
  MdNotifications
} from 'react-icons/md';
import { supabaseProfile } from '../../config/supabaseProfile';

function CRMDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
    activePlans: 0,
    pendingOnboarding: 0,
    completedOnboarding: 0,
    thisMonthUsers: 0,
    thisMonthRevenue: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [topPlans, setTopPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      setLoading(true);

      // Obtener usuarios
      const { data: users, error: usersError } = await supabaseProfile
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Obtener pagos
      const { data: payments, error: paymentsError } = await supabaseProfile
        .from('payments')
        .select(`
          *,
          users(email, name),
          plans(name, price)
        `)
        .order('paid_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Obtener planes
      const { data: plans, error: plansError } = await supabaseProfile
        .from('plans')
        .select('*');

      if (plansError) throw plansError;

      // Calcular estadísticas
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const thisMonthUsers = users.filter(user => 
        new Date(user.created_at) >= thisMonth
      ).length;

      const thisMonthRevenue = payments
        .filter(payment => new Date(payment.paid_at) >= thisMonth)
        .reduce((sum, payment) => sum + (payment.amount_usd || 0), 0);

      const pendingOnboarding = users.filter(user => 
        user.onboarding_status === 'pending'
      ).length;

      const completedOnboarding = users.filter(user => 
        user.onboarding_status === 'terminado' || user.onboarding_status === 'completed'
      ).length;

      // Estadísticas de planes
      const planStats = plans.map(plan => {
        const planUsers = users.filter(user => user.current_plan_id === plan.id);
        const planRevenue = payments
          .filter(payment => payment.plan_id === plan.id)
          .reduce((sum, payment) => sum + (payment.amount_usd || 0), 0);
        
        return {
          ...plan,
          user_count: planUsers.length,
          revenue: planRevenue
        };
      }).sort((a, b) => b.user_count - a.user_count);

      setStats({
        totalUsers: users.length,
        totalPayments: payments.length,
        totalRevenue: payments.reduce((sum, p) => sum + (p.amount_usd || 0), 0),
        activePlans: plans.length,
        pendingOnboarding,
        completedOnboarding,
        thisMonthUsers,
        thisMonthRevenue
      });

      setRecentUsers(users.slice(0, 5));
      setRecentPayments(payments.slice(0, 5));
      setTopPlans(planStats);

    } catch (error) {
      console.error('Error fetching CRM data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del CRM',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'terminado': return 'green';
      case 'completed': return 'blue';
      case 'paid': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const handleViewProfile = (user) => {
    // Guardar el usuario seleccionado en localStorage para que UserManagement lo pueda leer
    localStorage.setItem('selectedUserProfile', JSON.stringify(user));
    
    // Disparar evento para navegar a la gestión de usuarios
    window.dispatchEvent(new CustomEvent('crmNavigation', { detail: { view: 'users' } }));
    
    toast({
      title: 'Navegando a Usuarios',
      description: `Abriendo perfil de ${user.name || user.email}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleSendEmail = (user) => {
    // Simular envío de email
    toast({
      title: 'Email enviado',
      description: `Se ha enviado un email a ${user.email}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleViewAllUsers = () => {
    // Disparar evento para navegar a la gestión de usuarios
    window.dispatchEvent(new CustomEvent('crmNavigation', { detail: { view: 'users' } }));
    
    toast({
      title: 'Navegando a Usuarios',
      description: 'Abriendo la lista completa de usuarios',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleViewAllPayments = () => {
    // Disparar evento para navegar a la gestión de pagos
    window.dispatchEvent(new CustomEvent('crmNavigation', { detail: { view: 'payments' } }));
    
    toast({
      title: 'Navegando a Pagos',
      description: 'Abriendo la lista completa de pagos',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleExportCRMReport = () => {
    console.log('🔄 Iniciando exportación de reporte CRM...');
    
    try {
      // Preparar datos para exportar
      const exportData = {
        fecha: new Date().toISOString().split('T')[0],
        estadisticas: stats,
        usuariosRecientes: recentUsers,
        pagosRecientes: recentPayments,
        planesTop: topPlans,
        resumen: {
          totalUsuarios: stats.totalUsers,
          totalPagos: stats.totalPayments,
          ingresosTotales: stats.totalRevenue,
          planesActivos: stats.activePlans,
          onboardingPendiente: stats.pendingOnboarding,
          onboardingCompletado: stats.completedOnboarding
        }
      };

      console.log('📊 Datos CRM preparados para exportación:', exportData);

      // Convertir a CSV con formato CRM
      const csvContent = [
        // Header del reporte
        `Reporte CRM BrifyAI - ${exportData.fecha}`,
        `Generado por: Sistema BrifyAI`,
        '',
        // Resumen ejecutivo
        'RESUMEN EJECUTIVO',
        `Total Usuarios,${exportData.resumen.totalUsuarios}`,
        `Total Pagos,${exportData.resumen.totalPagos}`,
        `Ingresos Totales,${formatCurrency(exportData.resumen.ingresosTotales)}`,
        `Planes Activos,${exportData.resumen.planesActivos}`,
        `Onboarding Pendiente,${exportData.resumen.onboardingPendiente}`,
        `Onboarding Completado,${exportData.resumen.onboardingCompletado}`,
        '',
        // Usuarios recientes
        'USUARIOS RECIENTES',
        'Nombre,Email,Estado,Fecha Registro',
        ...exportData.usuariosRecientes.map(user => 
          `${user.name || 'Sin nombre'},${user.email},${user.onboarding_status},${formatDate(user.created_at)}`
        ),
        '',
        // Pagos recientes
        'PAGOS RECIENTES',
        'Usuario,Plan,Monto,Estado,Fecha',
        ...exportData.pagosRecientes.map(payment => 
          `${payment.users?.name || 'Usuario'},${payment.plans?.name || 'Plan'},${formatCurrency(payment.amount_usd)},${payment.payment_status},${formatDate(payment.paid_at)}`
        ),
        '',
        // Planes top
        'PLANES MÁS POPULARES',
        'Plan,Usuarios,Ingresos',
        ...exportData.planesTop.map(plan => 
          `${plan.name},${plan.user_count},${formatCurrency(plan.revenue)}`
        ),
        '',
        '=== FIN DEL REPORTE CRM ==='
      ].join('\n');

      console.log('📄 Contenido CSV CRM generado, iniciando descarga...');

      // Método 1: Usar Blob y URL.createObjectURL
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `reporte-crm-brifyai-${exportData.fecha}.csv`;
      link.style.display = 'none';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL del objeto
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Reporte CRM exportado exitosamente');
      
      // Mostrar confirmación al usuario
      toast({
        title: '¡Reporte exportado!',
        description: `reporte-crm-brifyai-${exportData.fecha}.csv descargado exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('❌ Error al exportar reporte CRM:', error);
      
      // Método alternativo si falla el primero
      try {
        console.log('🔄 Intentando método alternativo de descarga CRM...');
        
        const exportData = {
          fecha: new Date().toISOString().split('T')[0]
        };
        
        const csvContent = `Reporte CRM BrifyAI - ${exportData.fecha}\n\nResumen\nTotal Usuarios,${stats.totalUsers}\nTotal Pagos,${stats.totalPayments}\nIngresos Totales,${formatCurrency(stats.totalRevenue)}\nPlanes Activos,${stats.activePlans}\n\n=== REPORTE BÁSICO CRM ===`;
        
        // Método alternativo usando data URL
        const dataUrl = 'text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement('a');
        
        link.href = dataUrl;
        link.download = `reporte-crm-brifyai-${exportData.fecha}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Reporte CRM exportado usando método alternativo');
        toast({
          title: '¡Reporte exportado!',
          description: 'Reporte CRM descargado (método alternativo)',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
      } catch (fallbackError) {
        console.error('❌ Error también en método alternativo CRM:', fallbackError);
        toast({
          title: 'Error al exportar',
          description: 'No se pudo generar el reporte. Intenta nuevamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box p={6} bg={bg} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="lg" color="blue.600" mb={2}>
              Resumen
            </Heading>
            <Text color="gray.600">
              Panel de control integral para gestión de usuarios, pagos y planes
            </Text>
          </Box>
          <HStack spacing={2}>
            <Button leftIcon={<MdDownload />} variant="outline" size="sm" onClick={handleExportCRMReport}>
              Exportar Reporte
            </Button>
          </HStack>
        </HStack>

        {/* Estadísticas Principales */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>
                  <HStack spacing={2} justify="center">
                    <MdPeople color="blue" />
                    <Text>Total Usuarios</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="blue.600">{stats.totalUsers}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.thisMonthUsers} este mes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>
                  <HStack spacing={2} justify="center">
                    <MdPayment color="green" />
                    <Text>Total Pagos</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="green.600">{stats.totalPayments}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {formatCurrency(stats.thisMonthRevenue)} este mes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>
                  <HStack spacing={2} justify="center">
                    <MdTrendingUp color="purple" />
                    <Text>Ingresos Totales</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="purple.600">
                  {formatCurrency(stats.totalRevenue)}
                </StatNumber>
                <StatHelpText>
                  De todos los planes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>
                  <HStack spacing={2} justify="center">
                    <MdDiamond color="orange" />
                    <Text>Planes Activos</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="orange.600">{stats.activePlans}</StatNumber>
                <StatHelpText>
                  Planes disponibles
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Métricas de Onboarding */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Progreso de Onboarding</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Usuarios Pendientes</Text>
                    <Text fontSize="sm" fontWeight="bold">{stats.pendingOnboarding}</Text>
                  </HStack>
                  <Progress 
                    value={(stats.pendingOnboarding / stats.totalUsers) * 100} 
                    colorScheme="orange" 
                    size="lg" 
                    borderRadius="full"
                  />
                </Box>
                
                <Box>
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color="gray.600">Usuarios Completados</Text>
                    <Text fontSize="sm" fontWeight="bold">{stats.completedOnboarding}</Text>
                  </HStack>
                  <Progress 
                    value={(stats.completedOnboarding / stats.totalUsers) * 100} 
                    colorScheme="green" 
                    size="lg" 
                    borderRadius="full"
                  />
                </Box>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Planes Más Populares</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {topPlans.slice(0, 3).map((plan, index) => (
                  <HStack key={plan.id} justify="space-between">
                    <HStack spacing={3}>
                      <Badge colorScheme="purple" variant="solid">
                        #{index + 1}
                      </Badge>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">{plan.name}</Text>
                        <Text fontSize="xs" color="gray.500">{plan.user_count} usuarios</Text>
                      </VStack>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                      {formatCurrency(plan.revenue)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Tablas de Datos Recientes */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Usuarios Recientes */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Usuarios Recientes</Heading>
                <Button size="sm" variant="ghost" onClick={handleViewAllUsers}>Ver Todos</Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {/* Desktop: Tabla tradicional */}
              <Box display={{ base: 'none', lg: 'block' }}>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Usuario</Th>
                        <Th>Estado</Th>
                        <Th>Fecha</Th>
                        <Th>Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentUsers.map((user) => (
                        <Tr key={user.id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={user.name} />
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {user.name || 'Sin nombre'}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {user.email}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={getStatusColor(user.onboarding_status)} 
                              variant="subtle"
                              size="sm"
                            >
                              {user.onboarding_status}
                            </Badge>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{formatDate(user.created_at)}</Text>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<MdMoreVert />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem 
                                  icon={<MdVisibility />}
                                  onClick={() => handleViewProfile(user)}
                                >
                                  Ver Perfil
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
              
              {/* Mobile: Cards sin scroll */}
              <VStack display={{ base: 'flex', lg: 'none' }} spacing={3} align="stretch">
                {recentUsers.map((user) => (
                  <Card key={user.id} variant="outline" size="sm">
                    <CardBody p={4}>
                      <HStack spacing={3} mb={3}>
                        <Avatar size="md" name={user.name} />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {user.name || 'Sin nombre'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {user.email}
                          </Text>
                        </VStack>
                        <Badge 
                          colorScheme={getStatusColor(user.onboarding_status)} 
                          variant="subtle"
                          size="sm"
                        >
                          {user.onboarding_status}
                        </Badge>
                      </HStack>
                      
                      <HStack justify="space-between" align="center">
                        <Text fontSize="xs" color="gray.600">
                          {formatDate(user.created_at)}
                        </Text>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          leftIcon={<MdVisibility />}
                          onClick={() => handleViewProfile(user)}
                        >
                          Ver Perfil
                        </Button>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Pagos Recientes */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Pagos Recientes</Heading>
                <Button size="sm" variant="ghost" onClick={handleViewAllPayments}>Ver Todos</Button>
              </HStack>
            </CardHeader>
            <CardBody>
              {/* Desktop: Tabla tradicional */}
              <Box display={{ base: 'none', lg: 'block' }}>
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Usuario</Th>
                        <Th>Plan</Th>
                        <Th>Monto</Th>
                        <Th>Estado</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentPayments.map((payment) => (
                        <Tr key={payment.id}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {payment.users?.name || 'Usuario'}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {payment.users?.email}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontSize="sm">{payment.plans?.name || 'Plan'}</Text>
                          </Td>
                          <Td>
                            <Text fontSize="sm" fontWeight="bold" color="green.600">
                              {formatCurrency(payment.amount_usd)}
                            </Text>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={getStatusColor(payment.payment_status)} 
                              variant="subtle"
                              size="sm"
                            >
                              {payment.payment_status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
              
              {/* Mobile: Cards sin scroll */}
              <VStack display={{ base: 'flex', lg: 'none' }} spacing={3} align="stretch">
                {recentPayments.map((payment) => (
                  <Card key={payment.id} variant="outline" size="sm">
                    <CardBody p={4}>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1} flex={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {payment.users?.name || 'Usuario'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {payment.users?.email}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {payment.plans?.name || 'Plan'}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" fontWeight="bold" color="green.600">
                              {formatCurrency(payment.amount_usd)}
                            </Text>
                            <Badge 
                              colorScheme={getStatusColor(payment.payment_status)} 
                              variant="subtle"
                              size="sm"
                            >
                              {payment.payment_status}
                            </Badge>
                          </VStack>
                        </HStack>
                        
                        <Text fontSize="xs" color="gray.600" textAlign="right">
                          {formatDate(payment.paid_at)}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        
      </VStack>
    </Box>
  );
}

export default CRMDashboard;