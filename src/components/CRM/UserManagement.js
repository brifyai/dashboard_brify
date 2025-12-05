import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
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
  Tooltip,
  Flex,
  Icon,
} from '@chakra-ui/react';
import { 
  MdSearch, 
  MdFilterList, 
  MdMoreVert, 
  MdEdit, 
  MdDelete, 
  MdVisibility,
  MdEmail,
  MdPerson,
  MdCalendarToday,
  MdPayment,
  MdAdminPanelSettings,
  MdCheckCircle,
  MdPending,
  MdCancel
} from 'react-icons/md';
import { supabaseProfile } from '../../config/supabaseProfile';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [storageFilter, setStorageFilter] = useState('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onClose: onFiltersClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, planFilter, dateFrom, dateTo, activeFilter, storageFilter]);

  // Escuchar cuando se selecciona un usuario desde el dashboard
  useEffect(() => {
    const checkForSelectedUser = () => {
      const selectedUserData = localStorage.getItem('selectedUserProfile');
      if (selectedUserData) {
        try {
          const userData = JSON.parse(selectedUserData);
          // Buscar el usuario en la lista actual
          const user = users.find(u => u.id === userData.id);
          if (user) {
            setSelectedUser(user);
            onOpen();
            // Limpiar el localStorage después de usar
            localStorage.removeItem('selectedUserProfile');
          }
        } catch (error) {
          console.error('Error parsing selected user data:', error);
          localStorage.removeItem('selectedUserProfile');
        }
      }
    };

    // Verificar inmediatamente
    checkForSelectedUser();

    // También verificar cuando cambien los usuarios
    if (users.length > 0) {
      checkForSelectedUser();
    }
  }, [users, onOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Obtener usuarios con información de planes
      const { data: usersData, error: usersError } = await supabaseProfile
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Obtener información de planes
      const { data: plansData, error: plansError } = await supabaseProfile
        .from('plans')
        .select('*');

      if (plansError) throw plansError;

      // Obtener información de pagos
      const { data: paymentsData, error: paymentsError } = await supabaseProfile
        .from('payments')
        .select('*');

      if (paymentsError) throw paymentsError;

      // Combinar datos
      const enrichedUsers = usersData.map(user => {
        const plan = plansData.find(p => p.id === user.current_plan_id);
        const payment = paymentsData.find(p => p.user_id === user.id);
        
        return {
          ...user,
          plan_name: plan?.name || 'Sin Plan',
          plan_price: plan?.price || 0,
          payment_status: payment?.payment_status || 'Sin Pago',
          payment_provider: payment?.payment_provider || 'N/A',
          paid_at: payment?.paid_at || null
        };
      });

      setUsers(enrichedUsers);
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

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.onboarding_status === statusFilter);
    }

    // Filtro por plan
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.plan_name === planFilter);
    }

    // Filtros adicionales
    if (activeFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (activeFilter === 'active') return user.is_active;
        if (activeFilter === 'inactive') return !user.is_active;
        if (activeFilter === 'admin') return user.admin;
        if (activeFilter === 'verified') return user.email_confirmed_at;
        return true;
      });
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      filtered = filtered.filter(user => {
        const userDate = new Date(user.created_at);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;
        
        if (fromDate && userDate < fromDate) return false;
        if (toDate && userDate > toDate) return false;
        return true;
      });
    }

    // Filtro por almacenamiento
    if (storageFilter !== 'all') {
      filtered = filtered.filter(user => {
        const storageBytes = user.used_storage_bytes || 0;
        if (storageFilter === 'low') return storageBytes < 1000000; // < 1MB
        if (storageFilter === 'medium') return storageBytes >= 1000000 && storageBytes < 100000000; // 1MB - 100MB
        if (storageFilter === 'high') return storageBytes >= 100000000; // > 100MB
        return true;
      });
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calcular usuarios paginados
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleExportCSV = () => {
    console.log('🔄 Iniciando exportación de usuarios...');
    
    try {
      // Preparar datos para exportar
      const exportData = {
        fecha: new Date().toISOString().split('T')[0],
        usuarios: filteredUsers,
        estadisticas: stats,
        resumen: {
          totalUsuarios: stats.total,
          usuariosActivos: stats.active,
          usuariosPendientes: stats.pending,
          usuariosCompletados: stats.completed,
          administradores: stats.admins
        }
      };

      console.log('📊 Datos de usuarios preparados para exportación:', exportData);

      // Convertir a CSV con formato de usuarios
      const csvContent = [
        // Header del reporte
        `Reporte de Usuarios BrifyAI - ${exportData.fecha}`,
        `Generado por: Sistema BrifyAI`,
        '',
        // Resumen ejecutivo
        'RESUMEN EJECUTIVO',
        `Total Usuarios,${exportData.resumen.totalUsuarios}`,
        `Usuarios Activos,${exportData.resumen.usuariosActivos}`,
        `Usuarios Pendientes,${exportData.resumen.usuariosPendientes}`,
        `Usuarios Completados,${exportData.resumen.usuariosCompletados}`,
        `Administradores,${exportData.resumen.administradores}`,
        '',
        // Detalle de usuarios
        'DETALLE DE USUARIOS',
        'Nombre,Email,Plan,Precio Plan,Estado Onboarding,Estado Pago,Proveedor Pago,Fecha Registro,Activo,Admin',
        ...exportData.usuarios.map(user => 
          `${user.name || 'Sin nombre'},${user.email || 'N/A'},${user.plan_name},${user.plan_price},${user.onboarding_status},${user.payment_status},${user.payment_provider},${formatDate(user.created_at)},${user.is_active ? 'Sí' : 'No'},${user.admin ? 'Sí' : 'No'}`
        ),
        '',
        '=== FIN DEL REPORTE DE USUARIOS ==='
      ].join('\n');

      console.log('📄 Contenido CSV de usuarios generado, iniciando descarga...');

      // Método 1: Usar Blob y URL.createObjectURL
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `reporte-usuarios-brifyai-${exportData.fecha}.csv`;
      link.style.display = 'none';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL del objeto
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Reporte de usuarios exportado exitosamente');
      
      // Mostrar confirmación al usuario
      toast({
        title: '¡Reporte exportado!',
        description: `reporte-usuarios-brifyai-${exportData.fecha}.csv descargado exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('❌ Error al exportar reporte de usuarios:', error);
      
      // Método alternativo si falla el primero
      try {
        console.log('🔄 Intentando método alternativo de descarga de usuarios...');
        
        const exportData = {
          fecha: new Date().toISOString().split('T')[0]
        };
        
        const csvContent = `Reporte de Usuarios BrifyAI - ${exportData.fecha}\n\nResumen\nTotal Usuarios,${stats.total}\nUsuarios Activos,${stats.active}\nUsuarios Pendientes,${stats.pending}\n\n=== REPORTE BÁSICO DE USUARIOS ===`;
        
        // Método alternativo usando data URL
        const dataUrl = 'text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement('a');
        
        link.href = dataUrl;
        link.download = `reporte-usuarios-brifyai-${exportData.fecha}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Reporte de usuarios exportado usando método alternativo');
        toast({
          title: '¡Reporte exportado!',
          description: 'Reporte de usuarios descargado (método alternativo)',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
      } catch (fallbackError) {
        console.error('❌ Error también en método alternativo de usuarios:', fallbackError);
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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      default: return 'gray';
    }
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

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    onOpen();
  };

  const handleViewPayments = (user) => {
    // Guardar el usuario seleccionado para filtrar pagos
    localStorage.setItem('selectedUserForPayments', JSON.stringify(user));
    
    // Disparar evento para navegar a la gestión de pagos
    window.dispatchEvent(new CustomEvent('crmNavigation', { detail: { view: 'payments' } }));
    
    toast({
      title: 'Navegando a Pagos',
      description: `Abriendo pagos de ${user.name || user.email}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Estadísticas rápidas
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    pending: users.filter(u => u.onboarding_status === 'pending').length,
    completed: users.filter(u => u.onboarding_status === 'terminado' || u.onboarding_status === 'completed').length,
    admins: users.filter(u => u.admin).length,
  };

  return (
    <Box p={{ base: 3, md: 6 }} bg="gray.50" minH="100vh">
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Header */}
        <Box>
          <Heading size={{ base: 'md', md: 'lg' }} color="blue.600" mb={2}>
            Gestión de Usuarios
          </Heading>
          <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
            Administra todos los usuarios, sus planes y estados de onboarding
          </Text>
        </Box>

        {/* Estadísticas Rápidas */}
        <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={3}>
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Total Usuarios</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                  {stats.total}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Activos</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {stats.active}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Pendientes</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                  {stats.pending}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Completados</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {stats.completed}
                </Text>
              </VStack>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.600">Administradores</Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                  {stats.admins}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Box flex={1} minW={{ base: '100%', md: '300px' }}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <MdSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar por email o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size={{ base: 'sm', md: 'md' }}
                  />
                </InputGroup>
              </Box>
              
              <HStack spacing={2} wrap="wrap">
                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  w={{ base: '48%', md: '200px' }}
                  size={{ base: 'sm', md: 'md' }}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="terminado">Terminados</option>
                  <option value="completed">Completados</option>
                </Select>
                
                <Select 
                  value={planFilter} 
                  onChange={(e) => setPlanFilter(e.target.value)}
                  w={{ base: '48%', md: '200px' }}
                  size={{ base: 'sm', md: 'md' }}
                >
                  <option value="all">Todos los planes</option>
                  <option value="Plan Brify">Plan Brify</option>
                  <option value="Sin Plan">Sin Plan</option>
                </Select>
                
                <Button 
                  leftIcon={<MdFilterList />} 
                  variant="outline" 
                  onClick={onFiltersOpen}
                  size={{ base: 'sm', md: 'md' }}
                  flex={{ base: '1', md: 'auto' }}
                >
                  Más Filtros
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabla de Usuarios */}
        <Card>
          <CardHeader>
            <HStack justify="space-between" flexWrap="wrap" gap={2}>
              <Heading size="md">Lista de Usuarios ({filteredUsers.length})</Heading>
              <Button colorScheme="blue" size="sm" onClick={handleExportCSV}>
                Exportar CSV
              </Button>
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
                      <Th>Email</Th>
                      <Th>Plan</Th>
                      <Th>Estado</Th>
                      <Th>Pago</Th>
                      <Th>Registro</Th>
                      <Th>Almacenamiento</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedUsers.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <HStack spacing={3}>
                            <Avatar 
                              size="sm" 
                              name={user.name} 
                              src={user.avatar_url}
                            />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">
                                {user.name || 'Sin nombre'}
                              </Text>
                              <HStack spacing={1}>
                                {user.admin && (
                                  <Badge colorScheme="purple" size="sm">
                                    <MdAdminPanelSettings style={{ marginRight: '2px' }} />
                                    Admin
                                  </Badge>
                                )}
                                {user.is_active ? (
                                  <Badge colorScheme="green" size="sm">Activo</Badge>
                                ) : (
                                  <Badge colorScheme="red" size="sm">Inactivo</Badge>
                                )}
                              </HStack>
                            </VStack>
                          </HStack>
                        </Td>
                        
                        <Td>
                          <Text fontSize="sm">{user.email || 'N/A'}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {user.registered_via}
                          </Text>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {user.plan_name}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              ${user.plan_price} CLP
                            </Text>
                          </VStack>
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
                            <Badge 
                              colorScheme={getPaymentStatusColor(user.payment_status)} 
                              variant="outline"
                              size="sm"
                            >
                              {user.payment_status}
                            </Badge>
                            <Text fontSize="xs" color="gray.500">
                              {user.payment_provider}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">{formatDate(user.created_at)}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {user.plan_expiration && `Exp: ${formatDate(user.plan_expiration)}`}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="sm">
                              {formatBytes(user.used_storage_bytes)}
                            </Text>
                            <Progress 
                              value={(user.used_storage_bytes / 100000000) * 100} 
                              size="sm" 
                              colorScheme="blue" 
                              w="60px"
                            />
                          </VStack>
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
                                onClick={() => openUserDetails(user)}
                              >
                                Ver Detalles
                              </MenuItem>
                              <MenuItem 
                                icon={<MdPayment />}
                                onClick={() => handleViewPayments(user)}
                              >
                                Ver Pagos
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
            <VStack display={{ base: 'flex', lg: 'none' }} spacing={4} align="stretch">
              {paginatedUsers.map((user) => (
                <Card key={user.id} variant="outline" size="sm">
                  <CardBody p={4}>
                    <VStack spacing={4} align="stretch">
                      {/* Header del usuario */}
                      <HStack spacing={3} align="start">
                        <Avatar size="md" name={user.name} src={user.avatar_url} />
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="md" fontWeight="bold">
                            {user.name || 'Sin nombre'}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {user.email || 'N/A'}
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {user.admin && (
                              <Badge colorScheme="purple" size="sm">
                                <MdAdminPanelSettings style={{ marginRight: '2px' }} />
                                Admin
                              </Badge>
                            )}
                            {user.is_active ? (
                              <Badge colorScheme="green" size="sm">Activo</Badge>
                            ) : (
                              <Badge colorScheme="red" size="sm">Inactivo</Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Información del plan y estado */}
                      <SimpleGrid columns={2} spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Plan</Text>
                          <Text fontSize="sm" fontWeight="medium">{user.plan_name}</Text>
                          <Text fontSize="xs" color="gray.500">${user.plan_price} CLP</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Estado</Text>
                          <Badge 
                            colorScheme={getStatusColor(user.onboarding_status)} 
                            variant="subtle"
                            size="sm"
                          >
                            {user.onboarding_status}
                          </Badge>
                        </VStack>
                      </SimpleGrid>

                      {/* Información de pago */}
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.600">Pago</Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge 
                            colorScheme={getPaymentStatusColor(user.payment_status)} 
                            variant="outline"
                            size="sm"
                          >
                            {user.payment_status}
                          </Badge>
                          <Text fontSize="xs" color="gray.500">
                            {user.payment_provider}
                          </Text>
                        </HStack>
                      </VStack>

                      {/* Registro y almacenamiento */}
                      <SimpleGrid columns={2} spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Registro</Text>
                          <Text fontSize="sm">{formatDate(user.created_at)}</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Almacenamiento</Text>
                          <Text fontSize="sm">{formatBytes(user.used_storage_bytes)}</Text>
                        </VStack>
                      </SimpleGrid>

                      {/* Acciones */}
                      <HStack spacing={2} justify="flex-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          leftIcon={<MdVisibility />}
                          onClick={() => openUserDetails(user)}
                        >
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          colorScheme="blue" 
                          leftIcon={<MdPayment />}
                          onClick={() => handleViewPayments(user)}
                        >
                          Pagos
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
            
            {/* Controles de Paginación - Desktop */}
            {totalPages > 1 && (
              <Box display={{ base: 'none', lg: 'block' }}>
                <Flex justify="space-between" align="center" mt={4}>
                  <Text fontSize="sm" color="gray.600">
                    Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      isDisabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          variant={currentPage === pageNum ? "solid" : "outline"}
                          colorScheme={currentPage === pageNum ? "blue" : "gray"}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      isDisabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            )}

            {/* Controles de Paginación - Mobile */}
            {totalPages > 1 && (
              <Box display={{ base: 'block', lg: 'none' }} mt={6}>
                <VStack spacing={4}>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Página {currentPage} de {totalPages}
                  </Text>
                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, filteredUsers.length)} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
                  </Text>
                  
                  <HStack spacing={2} justify="center" flexWrap="wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      isDisabled={currentPage === 1}
                    >
                      ← Anterior
                    </Button>
                    
                    {/* Números de página en móvil */}
                    <HStack spacing={1}>
                      {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage === 1) {
                          pageNum = i + 1;
                        } else if (currentPage === totalPages) {
                          pageNum = totalPages - 2 + i;
                        } else {
                          pageNum = currentPage - 1 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            size="sm"
                            variant={currentPage === pageNum ? "solid" : "outline"}
                            colorScheme={currentPage === pageNum ? "blue" : "gray"}
                            onClick={() => handlePageChange(pageNum)}
                            minW="40px"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </HStack>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      isDisabled={currentPage === totalPages}
                    >
                      Siguiente →
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de Filtros Avanzados */}
      <Modal isOpen={isFiltersOpen} onClose={onFiltersClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Icon as={MdFilterList} />
              <Text>Filtros Avanzados</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Filtro de Estado de Actividad */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>Estado de Actividad</Text>
                <Select 
                  value={activeFilter} 
                  onChange={(e) => setActiveFilter(e.target.value)}
                >
                  <option value="all">Todos los usuarios</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                  <option value="admin">Solo administradores</option>
                  <option value="verified">Solo verificados</option>
                </Select>
              </Box>

              {/* Filtro de Rango de Fechas */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>Rango de Fechas de Registro</Text>
                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Desde</Text>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Hasta</Text>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </Box>
                </HStack>
              </Box>

              {/* Filtro de Almacenamiento */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>Uso de Almacenamiento</Text>
                <Select 
                  value={storageFilter} 
                  onChange={(e) => setStorageFilter(e.target.value)}
                >
                  <option value="all">Todos los usuarios</option>
                  <option value="low">Bajo uso ({'< 1MB'})</option>
                  <option value="medium">Uso medio (1MB - 100MB)</option>
                  <option value="high">Alto uso ({'>'} 100MB)</option>
                </Select>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => {
              setActiveFilter('all');
              setDateFrom('');
              setDateTo('');
              setStorageFilter('all');
              filterUsers();
            }}>
              Limpiar Filtros
            </Button>
            <Button variant="ghost" mr={3} onClick={onFiltersClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={() => {
              filterUsers();
              onFiltersClose();
              toast({
                title: 'Filtros aplicados',
                description: 'Los filtros avanzados han sido aplicados a la lista de usuarios',
                status: 'success',
                duration: 2000,
                isClosable: true,
              });
            }}>
              Aplicar Filtros
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Detalles de Usuario */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <Avatar size="sm" name={selectedUser?.name} />
              <VStack align="start" spacing={0}>
                <Text>{selectedUser?.name || 'Usuario sin nombre'}</Text>
                <Text fontSize="sm" color="gray.600">{selectedUser?.email}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedUser && (
              <VStack spacing={6} align="stretch">
                {/* Información Personal */}
                <Box>
                  <Heading size="sm" mb={3}>Información Personal</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">ID</Text>
                      <Text fontSize="sm" fontFamily="mono">{selectedUser.id}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Email</Text>
                      <Text fontSize="sm">{selectedUser.email}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Nombre</Text>
                      <Text fontSize="sm">{selectedUser.name || 'N/A'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Telegram ID</Text>
                      <Text fontSize="sm">{selectedUser.telegram_id || 'N/A'}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Estado del Plan */}
                <Box>
                  <Heading size="sm" mb={3}>Estado del Plan</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Plan Actual</Text>
                      <Text fontSize="sm">{selectedUser.plan_name}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Precio</Text>
                      <Text fontSize="sm">${selectedUser.plan_price} CLP</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Fecha de Expiración</Text>
                      <Text fontSize="sm">{formatDate(selectedUser.plan_expiration)}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Almacenamiento Usado</Text>
                      <Text fontSize="sm">{formatBytes(selectedUser.used_storage_bytes)}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Estado del Onboarding */}
                <Box>
                  <Heading size="sm" mb={3}>Progreso de Onboarding</Heading>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">Estado: {selectedUser.onboarding_status}</Text>
                      <Badge colorScheme={getStatusColor(selectedUser.onboarding_status)}>
                        {selectedUser.onboarding_status}
                      </Badge>
                    </HStack>
                    
                    {selectedUser.completando_primera && (
                      <Box>
                        <Text fontSize="sm" color="gray.600" mb={2}>Progreso Detallado:</Text>
                        <VStack spacing={2} align="stretch">
                          {JSON.parse(selectedUser.completando_primera).map((item, index) => (
                            <HStack key={index} justify="space-between">
                              <Text fontSize="sm">{index}</Text>
                              <Badge colorScheme={item ? 'green' : 'red'}>
                                {item ? 'Completado' : 'Pendiente'}
                              </Badge>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </Box>

                {/* Información de Pago */}
                <Box>
                  <Heading size="sm" mb={3}>Información de Pago</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Estado del Pago</Text>
                      <Badge colorScheme={getPaymentStatusColor(selectedUser.payment_status)}>
                        {selectedUser.payment_status}
                      </Badge>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Proveedor</Text>
                      <Text fontSize="sm">{selectedUser.payment_provider}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Fecha de Pago</Text>
                      <Text fontSize="sm">{formatDate(selectedUser.paid_at)}</Text>
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
    </Box>
  );
}

export default UserManagement;