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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Switch,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Flex,
} from '@chakra-ui/react';
import { 
  MdSearch, 
  MdMoreVert, 
  MdVisibility,
  MdEdit,
  MdDelete,
  MdAdd,
  MdDiamond,
  MdAttachMoney,
  MdSchedule,
  MdStorage,
  MdToken,
  MdStar
} from 'react-icons/md';
import { supabaseProfile } from '../../config/supabaseProfile';

function PlanManagement() {
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [plans, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener planes
      const { data: plansData, error: plansError } = await supabaseProfile
        .from('plans')
        .select('*')
        .order('price', { ascending: true });

      if (plansError) throw plansError;

      // Obtener usuarios con sus planes
      const { data: usersData, error: usersError } = await supabaseProfile
        .from('users')
        .select('id, current_plan_id, email, name, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Obtener pagos
      const { data: paymentsData, error: paymentsError } = await supabaseProfile
        .from('payments')
        .select('*');

      if (paymentsError) throw paymentsError;

      // Enriquecer datos de planes con estadísticas
      const enrichedPlans = plansData.map(plan => {
        const planUsers = usersData.filter(user => user.current_plan_id === plan.id);
        const planPayments = paymentsData.filter(payment => payment.plan_id === plan.id);
        const totalRevenue = planPayments.reduce((sum, payment) => sum + (payment.amount_usd || 0), 0);
        
        return {
          ...plan,
          user_count: planUsers.length,
          total_revenue: totalRevenue,
          payment_count: planPayments.length,
          active_users: planUsers.filter(user => user.current_plan_id === plan.id).length
        };
      });

      setPlans(enrichedPlans);
      setUsers(usersData);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos de planes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPlans = () => {
    let filtered = plans;

    if (searchTerm) {
      filtered = filtered.filter(plan => 
        plan.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.name_es?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.plan_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount || 0);
  };

  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    onOpen();
  };

  const openEditPlan = (plan) => {
    setSelectedPlan(plan);
    onEditOpen();
  };

  const getPlanTypeColor = (serviceType) => {
    switch (serviceType) {
      case 'entrenador': return 'purple';
      case 'premium': return 'gold';
      case 'basic': return 'blue';
      case 'free': return 'gray';
      default: return 'gray';
    }
  };

  // Estadísticas generales
  const totalPlans = plans.length;
  const totalUsers = users.length;
  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount_usd || 0), 0);
  const averagePrice = plans.length > 0 ? plans.reduce((sum, p) => sum + p.price, 0) / plans.length : 0;

  return (
    <Box p={{ base: 3, md: 6 }} bg="gray.50" minH="100vh">
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Header */}
        <Box>
          <Heading size={{ base: 'md', md: 'lg' }} color="purple.600" mb={2}>
            Gestión de Planes
          </Heading>
          <Text color="gray.600" fontSize={{ base: 'sm', md: 'md' }}>
            Administra planes, precios y configuraciones de suscripción
          </Text>
        </Box>

        {/* Estadísticas de Planes */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Total Planes</StatLabel>
                <StatNumber color="purple.600">{totalPlans}</StatNumber>
                <StatHelpText justify="center">
                  Planes activos
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Total Usuarios</StatLabel>
                <StatNumber color="blue.600">{totalUsers}</StatNumber>
                <StatHelpText justify="center">
                  <StatArrow type="increase" />
                  Usuarios con planes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Ingresos Totales</StatLabel>
                <StatNumber color="green.600">
                  {formatCurrency(totalRevenue)}
                </StatNumber>
                <StatHelpText justify="center">
                  De todos los planes
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody>
              <Stat textAlign="center">
                <StatLabel>Precio Promedio</StatLabel>
                <StatNumber color="orange.600">
                  {formatCurrency(averagePrice)}
                </StatNumber>
                <StatHelpText justify="center">
                  Por plan
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Búsqueda */}
        <Card>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Box flex={1}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <MdSearch color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar planes por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size={{ base: 'sm', md: 'md' }}
                  />
                </InputGroup>
              </Box>
              <Button variant="outline" size={{ base: 'sm', md: 'md' }}>
                Filtrar por Tipo
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabla de Planes */}
        <Card>
          <CardHeader>
            <Heading size="md">Catálogo de Planes ({plans.length})</Heading>
          </CardHeader>
          
          <CardBody>
            {/* Desktop: Tabla tradicional */}
            <Box display={{ base: 'none', lg: 'block' }}>
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Plan</Th>
                      <Th>Tipo</Th>
                      <Th>Precio</Th>
                      <Th>Duración</Th>
                      <Th>Almacenamiento</Th>
                      <Th>Tokens</Th>
                      <Th>Usuarios</Th>
                      <Th>Ingresos</Th>
                      <Th>Acciones</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {plans.map((plan) => (
                      <Tr key={plan.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <MdDiamond color="purple" />
                              <Text fontWeight="bold" fontSize="sm">
                                {plan.name}
                              </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {plan.name_es}
                            </Text>
                            <Text fontSize="xs" color="gray.400" fontFamily="mono">
                              {plan.plan_code}
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <Badge 
                            colorScheme={getPlanTypeColor(plan.service_type)} 
                            variant="subtle"
                          >
                            {plan.service_type}
                          </Badge>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(plan.price)}
                            </Text>
                            {plan.prueba_gratis && (
                              <Badge colorScheme="blue" size="sm">
                                Prueba Gratis
                              </Badge>
                            )}
                          </VStack>
                        </Td>
                        
                        <Td>
                          <HStack spacing={1}>
                            <MdSchedule size={16} />
                            <Text fontSize="sm">
                              {plan.duration_days} días
                            </Text>
                          </HStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={1}>
                              <MdStorage size={16} />
                              <Text fontSize="sm">
                                {formatBytes(plan.storage_limit_bytes)}
                              </Text>
                            </HStack>
                            <Progress 
                              value={Math.min((plan.storage_limit_bytes / (1024*1024*1024)) * 10, 100)} 
                              size="sm" 
                              colorScheme="blue" 
                              w="60px"
                            />
                          </VStack>
                        </Td>
                        
                        <Td>
                          <HStack spacing={1}>
                            <MdToken size={16} />
                            <Text fontSize="sm">
                              {plan.token_limit_usage?.toLocaleString() || 'Ilimitado'}
                            </Text>
                          </HStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="blue.600">
                              {plan.user_count}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              usuarios activos
                            </Text>
                          </VStack>
                        </Td>
                        
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(plan.total_revenue)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {plan.payment_count} pagos
                            </Text>
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
                                onClick={() => openPlanDetails(plan)}
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
            </Box>

            {/* Mobile: Cards sin scroll */}
            <VStack display={{ base: 'flex', lg: 'none' }} spacing={4} align="stretch">
              {plans.map((plan) => (
                <Card key={plan.id} variant="outline" size="sm">
                  <CardBody p={4}>
                    <VStack spacing={4} align="stretch">
                      {/* Header del plan */}
                      <HStack spacing={3} align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={2}>
                            <MdDiamond color="purple" />
                            <Text fontSize="md" fontWeight="bold">
                              {plan.name}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {plan.name_es}
                          </Text>
                          <Text fontSize="xs" color="gray.400" fontFamily="mono">
                            {plan.plan_code}
                          </Text>
                        </VStack>
                        <Badge 
                          colorScheme={getPlanTypeColor(plan.service_type)} 
                          variant="subtle"
                          size="sm"
                        >
                          {plan.service_type}
                        </Badge>
                      </HStack>

                      {/* Precio y duración */}
                      <SimpleGrid columns={2} spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Precio</Text>
                          <Text fontSize="md" fontWeight="bold" color="green.600">
                            {formatCurrency(plan.price)}
                          </Text>
                          {plan.prueba_gratis && (
                            <Badge colorScheme="blue" size="sm">
                              Prueba Gratis
                            </Badge>
                          )}
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Duración</Text>
                          <HStack spacing={1}>
                            <MdSchedule size={14} />
                            <Text fontSize="sm">{plan.duration_days} días</Text>
                          </HStack>
                        </VStack>
                      </SimpleGrid>

                      {/* Almacenamiento y tokens */}
                      <SimpleGrid columns={2} spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Almacenamiento</Text>
                          <HStack spacing={1}>
                            <MdStorage size={14} />
                            <Text fontSize="sm">{formatBytes(plan.storage_limit_bytes)}</Text>
                          </HStack>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Tokens</Text>
                          <HStack spacing={1}>
                            <MdToken size={14} />
                            <Text fontSize="sm">
                              {plan.token_limit_usage?.toLocaleString() || 'Ilimitado'}
                            </Text>
                          </HStack>
                        </VStack>
                      </SimpleGrid>

                      {/* Estadísticas */}
                      <SimpleGrid columns={2} spacing={3}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Usuarios</Text>
                          <Text fontSize="md" fontWeight="bold" color="blue.600">
                            {plan.user_count}
                          </Text>
                          <Text fontSize="xs" color="gray.500">usuarios activos</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="xs" color="gray.600">Ingresos</Text>
                          <Text fontSize="md" fontWeight="bold" color="green.600">
                            {formatCurrency(plan.total_revenue)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {plan.payment_count} pagos
                          </Text>
                        </VStack>
                      </SimpleGrid>

                      {/* Acciones */}
                      <HStack justify="flex-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          leftIcon={<MdVisibility />}
                          onClick={() => openPlanDetails(plan)}
                        >
                          Ver Detalles
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de Detalles del Plan */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <MdDiamond color="purple" size={24} />
              <VStack align="start" spacing={0}>
                <Text>{selectedPlan?.name}</Text>
                <Text fontSize="sm" color="gray.600">{selectedPlan?.name_es}</Text>
              </VStack>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedPlan && (
              <VStack spacing={6} align="stretch">
                {/* Información Básica */}
                <Box>
                  <Heading size="sm" mb={3}>Información del Plan</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Código del Plan</Text>
                      <Text fontSize="sm" fontFamily="mono">{selectedPlan.plan_code}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Tipo de Servicio</Text>
                      <Badge colorScheme={getPlanTypeColor(selectedPlan.service_type)}>
                        {selectedPlan.service_type}
                      </Badge>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Precio</Text>
                      <Text fontSize="sm" fontWeight="bold" color="green.600">
                        {formatCurrency(selectedPlan.price)}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Duración</Text>
                      <Text fontSize="sm">{selectedPlan.duration_days} días</Text>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Límites y Recursos */}
                <Box>
                  <Heading size="sm" mb={3}>Límites y Recursos</Heading>
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Almacenamiento</Text>
                      <Text fontSize="sm">{formatBytes(selectedPlan.storage_limit_bytes)}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Límite de Tokens</Text>
                      <Text fontSize="sm">
                        {selectedPlan.token_limit_usage?.toLocaleString() || 'Ilimitado'}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Prueba Gratis</Text>
                      <Badge colorScheme={selectedPlan.prueba_gratis ? 'green' : 'red'}>
                        {selectedPlan.prueba_gratis ? 'Sí' : 'No'}
                      </Badge>
                    </VStack>
                  </SimpleGrid>
                </Box>

                {/* Estadísticas */}
                <Box>
                  <Heading size="sm" mb={3}>Estadísticas</Heading>
                  <SimpleGrid columns={3} spacing={4}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Usuarios Activos</Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        {selectedPlan.user_count}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Total Pagos</Text>
                      <Text fontSize="lg" fontWeight="bold" color="purple.600">
                        {selectedPlan.payment_count}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.600">Ingresos Totales</Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.600">
                        {formatCurrency(selectedPlan.total_revenue)}
                      </Text>
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

      {/* Modal de Edición de Plan */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPlan ? 'Editar Plan' : 'Crear Nuevo Plan'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Nombre del Plan</FormLabel>
                <Input 
                  defaultValue={selectedPlan?.name} 
                  placeholder="Ej: Plan Premium"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Nombre en Español</FormLabel>
                <Input 
                  defaultValue={selectedPlan?.name_es} 
                  placeholder="Ej: Plan Premium"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Código del Plan</FormLabel>
                <Input 
                  defaultValue={selectedPlan?.plan_code} 
                  placeholder="Ej: premium_plan"
                />
              </FormControl>
              
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Precio (CLP)</FormLabel>
                  <NumberInput defaultValue={selectedPlan?.price || 0} min={0}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Duración (días)</FormLabel>
                  <NumberInput defaultValue={selectedPlan?.duration_days || 30} min={1}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>Almacenamiento (bytes)</FormLabel>
                  <NumberInput defaultValue={selectedPlan?.storage_limit_bytes || 0} min={0}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Límite de Tokens</FormLabel>
                  <NumberInput defaultValue={selectedPlan?.token_limit_usage || 0} min={0}>
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>Tipo de Servicio</FormLabel>
                <Input 
                  defaultValue={selectedPlan?.service_type} 
                  placeholder="Ej: entrenador, premium, basic"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea 
                  defaultValue={selectedPlan?.description} 
                  placeholder="Descripción del plan..."
                />
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancelar
            </Button>
            <Button colorScheme="purple">
              {selectedPlan ? 'Actualizar Plan' : 'Crear Plan'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default PlanManagement;