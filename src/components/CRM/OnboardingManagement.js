import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Checkbox,
  CheckboxGroup,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  Divider,
  FormControl,
  FormLabel,
  useBreakpointValue,
} from '@chakra-ui/react';
import { 
  MdSearch, 
  MdFilterList, 
  MdMoreVert, 
  MdVisibility,
  MdEdit,
  MdCheckCircle,
  MdPending,
  MdCancel,
  MdPlayArrow,
  MdDone,
  MdPersonAdd,
  MdEmail,
  MdSchedule,
  MdTrendingUp,
  MdAssignment,
  MdTrackChanges
} from 'react-icons/md';
import { supabaseProfile } from '../../config/supabaseProfile';

function OnboardingManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    progressRange: 'all',
    hasCompletedSteps: 'all'
  });
  const toast = useToast();

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerPadding = useBreakpointValue({ base: 4, md: 6 });
  const headerSize = useBreakpointValue({ base: "md", lg: "lg" });
  const statsColumns = useBreakpointValue({ base: 1, md: 2, lg: 4 });
  const cardPadding = useBreakpointValue({ base: 4, md: 6 });
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });
  const inputSize = useBreakpointValue({ base: "sm", md: "md" });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: usersData, error: usersError } = await supabaseProfile
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Procesar datos de onboarding
      const processedUsers = usersData.map(user => {
        let onboardingProgress = {};
        let completionPercentage = 0;

        if (user.completando_primera) {
          try {
            const onboardingData = typeof user.completando_primera === 'string' 
              ? JSON.parse(user.completando_primera) 
              : user.completando_primera;
            
            onboardingProgress = onboardingData;
            
            // Calcular porcentaje de completitud
            const totalSteps = Object.keys(onboardingData).filter(key => key !== 'status').length;
            const completedSteps = Object.values(onboardingData).filter(value => value === true).length;
            completionPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
          } catch (e) {
            console.error('Error parsing onboarding data:', e);
          }
        }

        return {
          ...user,
          onboarding_progress: onboardingProgress,
          completion_percentage: completionPercentage
        };
      });

      setUsers(processedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.onboarding_status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'terminado': return 'green';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <MdPending />;
      case 'terminado': return <MdCheckCircle />;
      case 'completed': return <MdCheckCircle />;
      default: return <MdCancel />;
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'green';
    if (percentage >= 50) return 'orange';
    return 'red';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openOnboardingDetails = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleGenerateReport = () => {
    try {
      // Crear datos para el reporte
      const reportData = filteredUsers.map(user => ({
        'Nombre': user.name || 'Sin nombre',
        'Email': user.email,
        'Estado': user.onboarding_status,
        'Progreso (%)': user.completion_percentage.toFixed(1),
        'Fecha Registro': formatDate(user.created_at),
        'Última Actividad': user.ultima_interaccion ? formatDate(user.ultima_interaccion) : 'N/A',
        'Pasos Completados': user.onboarding_progress ? Object.values(user.onboarding_progress).filter(v => v === true).length : 0,
        'Total Pasos': user.onboarding_progress ? Object.keys(user.onboarding_progress).filter(k => k !== 'status').length : 0
      }));

      // Convertir a CSV
      const csvContent = [
        Object.keys(reportData[0] || {}).join(','),
        ...reportData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `reporte-onboarding-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Reporte generado',
        description: 'El reporte de onboarding se ha descargado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el reporte',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const applyAdvancedFilters = () => {
    let filtered = users;

    // Filtro por rango de fechas
    if (filters.dateFrom) {
      filtered = filtered.filter(user => new Date(user.created_at) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(user => new Date(user.created_at) <= new Date(filters.dateTo));
    }

    // Filtro por rango de progreso
    if (filters.progressRange !== 'all') {
      switch (filters.progressRange) {
        case 'low':
          filtered = filtered.filter(user => user.completion_percentage < 50);
          break;
        case 'medium':
          filtered = filtered.filter(user => user.completion_percentage >= 50 && user.completion_percentage < 80);
          break;
        case 'high':
          filtered = filtered.filter(user => user.completion_percentage >= 80);
          break;
      }
    }

    // Filtro por pasos completados
    if (filters.hasCompletedSteps !== 'all') {
      filtered = filtered.filter(user => {
        if (!user.onboarding_progress) return false;
        const completedSteps = Object.values(user.onboarding_progress).filter(v => v === true).length;
        return filters.hasCompletedSteps === 'some' ? completedSteps > 0 : completedSteps === 0;
      });
    }

    // Aplicar filtros básicos también
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.onboarding_status === statusFilter);
    }

    setFilteredUsers(filtered);
    onFilterClose();
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      progressRange: 'all',
      hasCompletedSteps: 'all'
    });
    setSearchTerm('');
    setStatusFilter('all');
    setFilteredUsers(users);
  };

  // Estadísticas de onboarding
  const stats = {
    total: users.length,
    pending: users.filter(u => u.onboarding_status === 'pending').length,
    completed: users.filter(u => u.onboarding_status === 'terminado' || u.onboarding_status === 'completed').length,
    averageProgress: users.length > 0 ? users.reduce((sum, u) => sum + u.completion_percentage, 0) / users.length : 0,
    highProgress: users.filter(u => u.completion_percentage >= 80).length,
    lowProgress: users.filter(u => u.completion_percentage < 50).length,
  };

  return (
    <Box p={containerPadding} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size={headerSize} color="purple.600" mb={2}>
            Gestión de Onboarding
          </Heading>
          <Text color="gray.600">
            Administra el progreso de onboarding de todos los usuarios
          </Text>
        </Box>

        {/* Estadísticas de Onboarding */}
        <SimpleGrid columns={statsColumns} spacing={4}>
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Total Usuarios</StatLabel>
                <StatNumber color="blue.600">{stats.total}</StatNumber>
                <StatHelpText>En proceso de onboarding</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Pendientes</StatLabel>
                <StatNumber color="orange.600">{stats.pending}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  Requieren atención
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Completados</StatLabel>
                <StatNumber color="green.600">{stats.completed}</StatNumber>
                <StatHelpText>
                  {((stats.completed / stats.total) * 100).toFixed(1)}% del total
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Progreso Promedio</StatLabel>
                <StatNumber color="purple.600">{stats.averageProgress.toFixed(1)}%</StatNumber>
                <StatHelpText>
                  <StatArrow type={stats.averageProgress >= 50 ? "increase" : "decrease"} />
                  {stats.highProgress} con alto progreso
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Alertas */}
        {stats.lowProgress > 0 && (
          <Alert status="warning">
            <AlertIcon />
            <Box>
              <AlertTitle>Usuarios con Bajo Progreso!</AlertTitle>
              <AlertDescription>
                {stats.lowProgress} usuarios tienen menos del 50% de progreso en su onboarding.
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Filtros y Búsqueda */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box flex={1}>
                <Input
                  size={inputSize}
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
              
              <HStack spacing={4} wrap="wrap">
                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  flex={1}
                  minW="150px"
                  size={inputSize}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="terminado">Terminados</option>
                  <option value="completed">Completados</option>
                </Select>
                
                <Button 
                  leftIcon={<MdFilterList />} 
                  variant="outline"
                  size={buttonSize}
                  onClick={onFilterOpen}
                >
                  Más Filtros
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabla de Onboarding */}
        <Card>
          <CardHeader>
            <HStack justify="space-between" wrap="wrap">
              <Heading size={headerSize}>Progreso de Onboarding ({filteredUsers.length})</Heading>
              <Button 
                leftIcon={<MdAssignment />} 
                colorScheme="purple" 
                size={buttonSize}
                onClick={handleGenerateReport}
              >
                Generar Reporte
              </Button>
            </HStack>
          </CardHeader>
          
          <CardBody>
            {isMobile ? (
              /* Vista de Cards para Móvil */
              <VStack spacing={4}>
                {filteredUsers.slice(0, 20).map((user) => (
                  <Card key={user.id} w="full" border="1px" borderColor="gray.200">
                    <CardBody p={cardPadding}>
                      <VStack spacing={3} align="stretch">
                        {/* Usuario */}
                        <HStack spacing={3}>
                          <Avatar size="sm" name={user.name} />
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              {user.name || 'Sin nombre'}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {user.email}
                            </Text>
                          </VStack>
                        </HStack>
                        
                        {/* Estado y Progreso */}
                        <HStack justify="space-between">
                          <Badge 
                            colorScheme={getStatusColor(user.onboarding_status)} 
                            variant="subtle"
                            size="sm"
                          >
                            {getStatusIcon(user.onboarding_status)}
                            <Text ml={1}>{user.onboarding_status}</Text>
                          </Badge>
                          
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" fontWeight="bold">
                              {user.completion_percentage.toFixed(1)}%
                            </Text>
                            <Progress 
                              value={user.completion_percentage} 
                              size="sm" 
                              colorScheme={getProgressColor(user.completion_percentage)} 
                              w="80px"
                              borderRadius="full"
                            />
                          </VStack>
                        </HStack>
                        
                        {/* Fechas */}
                        <VStack spacing={1} align="stretch">
                          <Text fontSize="xs" color="gray.600">
                            <strong>Registro:</strong> {formatDate(user.created_at)}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            <strong>Última Actividad:</strong> {user.ultima_interaccion ? formatDate(user.ultima_interaccion) : 'N/A'}
                          </Text>
                        </VStack>
                        
                        {/* Acciones */}
                        <Button 
                          leftIcon={<MdVisibility />}
                          size={buttonSize}
                          variant="outline"
                          onClick={() => openOnboardingDetails(user)}
                        >
                          Ver Detalles
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
                
                {filteredUsers.length > 20 && (
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Mostrando los primeros 20 de {filteredUsers.length} usuarios
                  </Text>
                )}
              </VStack>
            ) : (
              /* Vista de Tabla para Desktop */
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Usuario</Th>
                      <Th>Estado</Th>
                      <Th>Progreso</Th>
                      <Th>Pasos Completados</Th>
                      <Th>Fecha Registro</Th>
                      <Th>Última Actividad</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredUsers.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar size="sm" name={user.name} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">
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
                          >
                            {getStatusIcon(user.onboarding_status)}
                            <Text ml={1}>{user.onboarding_status}</Text>
                          </Badge>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="bold">
                              {user.completion_percentage.toFixed(1)}%
                            </Text>
                            <Progress 
                              value={user.completion_percentage} 
                              size="sm" 
                              colorScheme={getProgressColor(user.completion_percentage)} 
                              w="80px"
                              borderRadius="full"
                            />
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            {user.onboarding_progress && Object.entries(user.onboarding_progress).map(([step, completed]) => (
                              <HStack key={step} spacing={2}>
                                {completed ? (
                                  <MdCheckCircle color="green" size={16} />
                                ) : (
                                  <MdPending color="orange" size={16} />
                                )}
                                <Text fontSize="xs" color={completed ? 'green.600' : 'orange.600'}>
                                  {step}
                                </Text>
                              </HStack>
                            ))}
                          </VStack>
                        </Td>
                        
                        <Td>
                          <Text fontSize="sm">{formatDate(user.created_at)}</Text>
                        </Td>
                        
                        <Td>
                          <Tooltip label="Última interacción registrada">
                            <Text fontSize="sm" color="gray.600">
                              {user.ultima_interaccion ? formatDate(user.ultima_interaccion) : 'N/A'}
                            </Text>
                          </Tooltip>
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
                                onClick={() => openOnboardingDetails(user)}
                              >
                                Ver Detalles
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de Detalles de Onboarding */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <MdAssignment color="purple" />
              <VStack align="start" spacing={0}>
                <Text>Progreso de Onboarding</Text>
                <Text fontSize="sm" color="gray.600">{selectedUser?.name}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedUser && (
              <VStack spacing={6} align="stretch">
                {/* Estado General */}
                <Box>
                  <Heading size="sm" mb={3}>Estado General</Heading>
                  <SimpleGrid columns={3} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Estado Actual</Text>
                      <Badge colorScheme={getStatusColor(selectedUser.onboarding_status)}>
                        {selectedUser.onboarding_status}
                      </Badge>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Progreso Total</Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedUser.completion_percentage.toFixed(1)}%
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Fecha de Registro</Text>
                      <Text fontSize="sm">{formatDate(selectedUser.created_at)}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                <Divider />

                {/* Progreso Detallado */}
                <Box>
                  <Heading size="sm" mb={3}>Progreso Detallado</Heading>
                  <VStack spacing={3} align="stretch">
                    {selectedUser.onboarding_progress && Object.entries(selectedUser.onboarding_progress).map(([step, completed]) => (
                      <HStack key={step} justify="space-between" p={3} bg={completed ? 'green.50' : 'orange.50'} borderRadius="md">
                        <HStack spacing={3}>
                          {completed ? (
                            <MdCheckCircle color="green" size={24} />
                          ) : (
                            <MdPending color="orange" size={24} />
                          )}
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" textTransform="capitalize">
                              {step.replace('_', ' ')}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {completed ? 'Completado' : 'Pendiente'}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge colorScheme={completed ? 'green' : 'orange'}>
                          {completed ? '✓' : '⏳'}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Información Adicional */}
                <Box>
                  <Heading size="sm" mb={3}>Información Adicional</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Registro Previo</Text>
                      <Text fontSize="sm">{selectedUser.registro_previo ? 'Sí' : 'No'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Telegram Pendiente</Text>
                      <Text fontSize="sm">{selectedUser.telegram_pending ? 'Sí' : 'No'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Extensión Habilitada</Text>
                      <Text fontSize="sm">{selectedUser.extension_habilitada ? 'Sí' : 'No'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Plataforma Activa</Text>
                      <Text fontSize="sm">{selectedUser.plataforma_activa || 'N/A'}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Filtros Avanzados */}
      <Modal isOpen={isFilterOpen} onClose={onFilterClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <MdFilterList color="purple" />
              <Text>Filtros Avanzados</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {/* Filtro por rango de fechas */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={3}>Rango de Fechas</Text>
                <SimpleGrid columns={2} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Desde</FormLabel>
                    <Input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Hasta</FormLabel>
                    <Input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Filtro por progreso */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={3}>Rango de Progreso</Text>
                <Select
                  value={filters.progressRange}
                  onChange={(e) => setFilters({...filters, progressRange: e.target.value})}
                >
                  <option value="all">Todos los rangos</option>
                  <option value="low">Bajo (0-49%)</option>
                  <option value="medium">Medio (50-79%)</option>
                  <option value="high">Alto (80-100%)</option>
                </Select>
              </Box>

              <Divider />

              {/* Filtro por pasos completados */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={3}>Estado de Pasos</Text>
                <Select
                  value={filters.hasCompletedSteps}
                  onChange={(e) => setFilters({...filters, hasCompletedSteps: e.target.value})}
                >
                  <option value="all">Todos</option>
                  <option value="some">Con pasos completados</option>
                  <option value="none">Sin pasos completados</option>
                </Select>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={resetFilters}>
              Limpiar Filtros
            </Button>
            <Button variant="ghost" mr={3} onClick={onFilterClose}>
              Cancelar
            </Button>
            <Button colorScheme="purple" onClick={applyAdvancedFilters}>
              Aplicar Filtros
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
    </Box>
  );
}

export default OnboardingManagement;