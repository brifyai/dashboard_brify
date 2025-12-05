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
} from '@chakra-ui/react';
import { 
  MdSearch, 
  MdFilterList, 
  MdMoreVert, 
  MdVisibility,
  MdPayment,
  MdAttachMoney,
  MdTrendingUp,
  MdTrendingDown,
  MdReceipt,
  MdCreditCard,
  MdAccountBalance,
  MdChevronLeft,
  MdChevronRight
} from 'react-icons/md';
import { supabaseProfile } from '../../config/supabaseProfile';

function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isFiltersOpen, onOpen: onFiltersOpen, onClose: onFiltersClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPayments();
    setCurrentPage(1); // Reset to first page when filters change
  }, [payments, searchTerm, statusFilter, providerFilter]);

  // Detectar usuario seleccionado para filtrar pagos
  useEffect(() => {
    const checkForSelectedUser = () => {
      const selectedUserData = localStorage.getItem('selectedUserForPayments');
      if (selectedUserData) {
        try {
          const userData = JSON.parse(selectedUserData);
          setSearchTerm(userData.email || ''); // Filtrar por email del usuario
          setStatusFilter('all'); // Resetear otros filtros
          setProviderFilter('all');
          
          // Mostrar notificación de que se están mostrando pagos filtrados
          toast({
            title: 'Pagos filtrados',
            description: `Mostrando pagos de ${userData.name || userData.email}`,
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
          
          // Limpiar el localStorage después de usar
          setTimeout(() => {
            localStorage.removeItem('selectedUserForPayments');
          }, 1000);
        } catch (error) {
          console.error('Error parsing selected user data:', error);
          localStorage.removeItem('selectedUserForPayments');
        }
      }
    };

    // Verificar inmediatamente
    checkForSelectedUser();

    // También verificar cuando cambien los pagos
    if (payments.length > 0) {
      checkForSelectedUser();
    }
  }, [payments, toast]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener pagos con información relacionada
      const { data: paymentsData, error: paymentsError } = await supabaseProfile
        .from('payments')
        .select(`
          *,
          users(email, name),
          plans(name, price)
        `)
        .order('paid_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Obtener usuarios para referencia
      const { data: usersData, error: usersError } = await supabaseProfile
        .from('users')
        .select('id, email, name');

      if (usersError) throw usersError;

      // Obtener planes para referencia
      const { data: plansData, error: plansError } = await supabaseProfile
        .from('plans')
        .select('*');

      if (plansError) throw plansError;

      setPayments(paymentsData);
      setUsers(usersData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de pagos',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_ref?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_status === statusFilter);
    }

    // Filtro por proveedor
    if (providerFilter !== 'all') {
      filtered = filtered.filter(payment => payment.payment_provider === providerFilter);
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'mercadopago_test': return 'blue';
      case 'mercadopago': return 'blue';
      case 'stripe': return 'purple';
      case 'paypal': return 'green';
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    onOpen();
  };

  // Calcular estadísticas
  const stats = {
    total: payments.length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount_usd || 0), 0),
    paid: payments.filter(p => p.payment_status === 'paid').length,
    pending: payments.filter(p => p.payment_status === 'pending').length,
    failed: payments.filter(p => p.payment_status === 'failed').length,
    thisMonth: payments.filter(p => {
      const paymentDate = new Date(p.paid_at);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    }).length
  };

  const thisMonthAmount = payments
    .filter(p => {
      const paymentDate = new Date(p.paid_at);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount_usd || 0), 0);

  const handleExportPaymentReport = () => {
    console.log('🔄 Iniciando exportación de reporte de pagos...');
    
    try {
      // Preparar datos para exportar
      const exportData = {
        fecha: new Date().toISOString().split('T')[0],
        pagos: filteredPayments,
        estadisticas: stats,
        resumen: {
          totalPagos: stats.total,
          montoTotal: stats.totalAmount,
          pagosExitosos: stats.paid,
          pagosPendientes: stats.pending,
          pagosFallidos: stats.failed,
          pagosEsteMes: stats.thisMonth,
          montoEsteMes: thisMonthAmount
        }
      };

      console.log('📊 Datos de pagos preparados para exportación:', exportData);

      // Convertir a CSV con formato de pagos
      const csvContent = [
        // Header del reporte
        `Reporte de Pagos BrifyAI - ${exportData.fecha}`,
        `Generado por: Sistema BrifyAI`,
        '',
        // Resumen ejecutivo
        'RESUMEN EJECUTIVO',
        `Total Pagos,${exportData.resumen.totalPagos}`,
        `Monto Total,${formatCurrency(exportData.resumen.montoTotal)}`,
        `Pagos Exitosos,${exportData.resumen.pagosExitosos}`,
        `Pagos Pendientes,${exportData.resumen.pagosPendientes}`,
        `Pagos Fallidos,${exportData.resumen.pagosFallidos}`,
        `Pagos Este Mes,${exportData.resumen.pagosEsteMes}`,
        `Monto Este Mes,${formatCurrency(exportData.resumen.montoEsteMes)}`,
        '',
        // Detalle de pagos
        'DETALLE DE PAGOS',
        'Usuario,Email,Plan,Monto,Estado,Proveedor,Referencia,Fecha',
        ...exportData.pagos.map(payment => 
          `${payment.users?.name || 'Sin nombre'},${payment.users?.email || 'N/A'},${payment.plans?.name || 'Plan'},${formatCurrency(payment.amount_usd)},${payment.payment_status},${payment.payment_provider},${payment.payment_ref || 'N/A'},${formatDate(payment.paid_at)}`
        ),
        '',
        '=== FIN DEL REPORTE DE PAGOS ==='
      ].join('\n');

      console.log('📄 Contenido CSV de pagos generado, iniciando descarga...');

      // Método 1: Usar Blob y URL.createObjectURL
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `reporte-pagos-brifyai-${exportData.fecha}.csv`;
      link.style.display = 'none';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL del objeto
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Reporte de pagos exportado exitosamente');
      
      // Mostrar confirmación al usuario
      toast({
        title: '¡Reporte de pagos exportado!',
        description: `reporte-pagos-brifyai-${exportData.fecha}.csv descargado exitosamente`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('❌ Error al exportar reporte de pagos:', error);
      
      // Método alternativo si falla el primero
      try {
        console.log('🔄 Intentando método alternativo de descarga de pagos...');
        
        const exportData = {
          fecha: new Date().toISOString().split('T')[0]
        };
        
        const csvContent = `Reporte de Pagos BrifyAI - ${exportData.fecha}\n\nResumen\nTotal Pagos,${stats.total}\nMonto Total,${formatCurrency(stats.totalAmount)}\nPagos Exitosos,${stats.paid}\nPagos Pendientes,${stats.pending}\n\n=== REPORTE BÁSICO DE PAGOS ===`;
        
        // Método alternativo usando data URL
        const dataUrl = 'text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement('a');
        
        link.href = dataUrl;
        link.download = `reporte-pagos-brifyai-${exportData.fecha}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Reporte de pagos exportado usando método alternativo');
        toast({
          title: '¡Reporte de pagos exportado!',
          description: 'Reporte de pagos descargado (método alternativo)',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
      } catch (fallbackError) {
        console.error('❌ Error también en método alternativo de pagos:', fallbackError);
        toast({
          title: 'Error al exportar',
          description: 'No se pudo generar el reporte de pagos. Intenta nuevamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="green.600" mb={2}>
            Gestión de Pagos
          </Heading>
          <Text color="gray.600">
            Administra todos los pagos, transacciones y estados de facturación
          </Text>
        </Box>

        {/* Estadísticas de Pagos */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Pagos</StatLabel>
                <StatNumber color="blue.600">{stats.total}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {stats.thisMonth} este mes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Monto Total</StatLabel>
                <StatNumber color="green.600">
                  {formatCurrency(stats.totalAmount)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {formatCurrency(thisMonthAmount)} este mes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pagos Exitosos</StatLabel>
                <StatNumber color="green.600">{stats.paid}</StatNumber>
                <StatHelpText>
                  {((stats.paid / stats.total) * 100).toFixed(1)}% del total
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pagos Pendientes</StatLabel>
                <StatNumber color="orange.600">{stats.pending}</StatNumber>
                <StatHelpText>
                  Requieren atención
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <Box flex={1} minW="300px">
                <Input
                  placeholder="Buscar por email o referencia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>
              
              <Select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                w="200px"
              >
                <option value="all">Todos los estados</option>
                <option value="paid">Pagados</option>
                <option value="pending">Pendientes</option>
                <option value="failed">Fallidos</option>
                <option value="cancelled">Cancelados</option>
              </Select>
              
              <Select 
                value={providerFilter} 
                onChange={(e) => setProviderFilter(e.target.value)}
                w="200px"
              >
                <option value="all">Todos los proveedores</option>
                <option value="mercadopago_test">MercadoPago Test</option>
                <option value="mercadopago">MercadoPago</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
              </Select>
              
              <Button leftIcon={<MdFilterList />} variant="outline" onClick={onFiltersOpen}>
                Más Filtros
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Tabla de Pagos */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Historial de Pagos ({filteredPayments.length})</Heading>
              <HStack spacing={2}>
                <Button leftIcon={<MdReceipt />} variant="outline" size="sm">
                  Exportar Reporte
                </Button>
              </HStack>
            </HStack>
          </CardHeader>
          
          <CardBody>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Usuario</Th>
                    <Th>Plan</Th>
                    <Th>Monto</Th>
                    <Th>Estado</Th>
                    <Th>Proveedor</Th>
                    <Th>Referencia</Th>
                    <Th>Fecha</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentPayments.map((payment) => (
                    <Tr key={payment.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {payment.users?.name || 'Usuario sin nombre'}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {payment.users?.email}
                          </Text>
                        </VStack>
                      </Td>
                      
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {payment.plans?.name || 'Plan desconocido'}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatCurrency(payment.plans?.price || 0)}
                        </Text>
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
                        >
                          {payment.payment_status}
                        </Badge>
                      </Td>
                      
                      <Td>
                        <Badge 
                          colorScheme={getProviderColor(payment.payment_provider)} 
                          variant="outline"
                        >
                          {payment.payment_provider}
                        </Badge>
                      </Td>
                      
                      <Td>
                        <Text fontSize="sm" fontFamily="mono">
                          {payment.payment_ref || 'N/A'}
                        </Text>
                      </Td>
                      
                      <Td>
                        <Text fontSize="sm">
                          {formatDate(payment.paid_at)}
                        </Text>
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
                              onClick={() => openPaymentDetails(payment)}
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
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de Detalles de Pago */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <MdPayment size={24} />
              <VStack align="start" spacing={0}>
                <Text>Detalles del Pago</Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedPayment?.payment_ref}
                </Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedPayment && (
              <VStack spacing={6} align="stretch">
                {/* Información del Pago */}
                <Box>
                  <Heading size="sm" mb={3}>Información del Pago</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">ID del Pago</Text>
                      <Text fontSize="sm" fontFamily="mono">{selectedPayment.id}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Estado</Text>
                      <Badge colorScheme={getStatusColor(selectedPayment.payment_status)}>
                        {selectedPayment.payment_status}
                      </Badge>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Monto</Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.600">
                        {formatCurrency(selectedPayment.amount_usd)}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Proveedor</Text>
                      <Badge colorScheme={getProviderColor(selectedPayment.payment_provider)}>
                        {selectedPayment.payment_provider}
                      </Badge>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Información del Usuario */}
                <Box>
                  <Heading size="sm" mb={3}>Información del Usuario</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Nombre</Text>
                      <Text fontSize="sm">{selectedPayment.users?.name || 'N/A'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Email</Text>
                      <Text fontSize="sm">{selectedPayment.users?.email || 'N/A'}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Información del Plan */}
                <Box>
                  <Heading size="sm" mb={3}>Plan Contratado</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Plan</Text>
                      <Text fontSize="sm">{selectedPayment.plans?.name || 'N/A'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Precio del Plan</Text>
                      <Text fontSize="sm">{formatCurrency(selectedPayment.plans?.price || 0)}</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Fechas y Referencias */}
                <Box>
                  <Heading size="sm" mb={3}>Fechas y Referencias</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Fecha de Pago</Text>
                      <Text fontSize="sm">{formatDate(selectedPayment.paid_at)}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Referencia</Text>
                      <Text fontSize="sm" fontFamily="mono">
                        {selectedPayment.payment_ref || 'N/A'}
                      </Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Descripción */}
                {selectedPayment.description && (
                  <Box>
                    <Heading size="sm" mb={3}>Descripción</Heading>
                    <Text fontSize="sm" color="gray.700">
                      {JSON.stringify(selectedPayment.description)}
                    </Text>
                  </Box>
                )}
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
      <Modal isOpen={isFiltersOpen} onClose={onFiltersClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <MdFilterList />
              <Text>Filtros Avanzados</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Filtro de Rango de Fechas */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>Rango de Fechas de Pago</Text>
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

              {/* Filtro de Monto */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3}>Rango de Montos</Text>
                <Select 
                  value={amountFilter} 
                  onChange={(e) => setAmountFilter(e.target.value)}
                >
                  <option value="all">Todos los montos</option>
                  <option value="low">Bajo ($0 - $50)</option>
                  <option value="medium">Medio ($50 - $200)</option>
                  <option value="high">Alto ($200+)</option>
                </Select>
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => {
              setDateFrom('');
              setDateTo('');
              setAmountFilter('all');
              filterPayments();
            }}>
              Limpiar Filtros
            </Button>
            <Button variant="ghost" mr={3} onClick={onFiltersClose}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={() => {
              filterPayments();
              onFiltersClose();
              toast({
                title: 'Filtros aplicados',
                description: 'Los filtros avanzados han sido aplicados a la lista de pagos',
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
    </Box>
  );
}

export default PaymentManagement;