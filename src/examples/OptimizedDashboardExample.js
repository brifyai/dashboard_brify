import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import VirtualizedDataTable from '../components/VirtualizedDataTable';
import OptimizedRealTimeStats from '../components/OptimizedRealTimeStats';
import { useUsers } from '../hooks/useSupabase';

// Ejemplo de columnas para la tabla de usuarios
const userColumns = [
  {
    Header: 'ID',
    accessor: 'id',
    sortable: true,
    minWidth: '80px',
  },
  {
    Header: 'Nombre',
    accessor: 'name',
    sortable: true,
    minWidth: '150px',
  },
  {
    Header: 'Email',
    accessor: 'email',
    sortable: true,
    minWidth: '200px',
  },
  {
    Header: 'Estado',
    accessor: 'status',
    type: 'badge',
    sortable: true,
    colorScheme: (value) => {
      switch (value) {
        case 'active': return 'green';
        case 'inactive': return 'red';
        case 'pending': return 'yellow';
        default: return 'gray';
      }
    },
    minWidth: '100px',
  },
  {
    Header: 'Fecha de Registro',
    accessor: 'created_at',
    type: 'date',
    sortable: true,
    minWidth: '150px',
  },
];

// Hook para manejar paginación infinita
const useInfiniteUsers = () => {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const { data, isLoading, error } = useUsers(page, 50);

  const fetchMoreData = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      setIsFetchingNextPage(true);
      setPage(prev => prev + 1);
      setIsFetchingNextPage(false);
    }
  };

  // Combinar datos cuando cambian
  React.useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setHasNextPage(data.hasNextPage);
    }
  }, [data, page]);

  return {
    data: allData,
    isLoading: isLoading && page === 1,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchMoreData,
    totalCount: data?.totalCount || 0,
  };
};

function OptimizedDashboardExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [enableServerSide, setEnableServerSide] = useState(true);
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Usar el hook optimizado para usuarios
  const {
    data: users,
    isLoading,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchMoreData,
    totalCount
  } = useInfiniteUsers();

  const handleRowClick = (user) => {
    console.log('Usuario seleccionado:', user);
    // Aquí puedes abrir un modal, navegar a detalles, etc.
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // En una implementación real, esto dispararía una nueva query
  };

  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="7xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
            <HStack justify="space-between" align="center">
              <Heading size="lg">Dashboard Optimizado para 50,000 Usuarios</Heading>
              <HStack spacing={4}>
                <Select
                  value={enableServerSide ? 'server' : 'client'}
                  onChange={(e) => setEnableServerSide(e.target.value === 'server')}
                  w="200px"
                >
                  <option value="server">Lado del Servidor</option>
                  <option value="client">Lado del Cliente</option>
                </Select>
                <Button colorScheme="blue" size="sm">
                  Exportar Datos
                </Button>
              </HStack>
            </HStack>
          </Box>

          {/* Estadísticas en Tiempo Real */}
          <OptimizedRealTimeStats />

          {/* Tabla Virtualizada */}
          <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="center">
                <Heading size="md">Gestión de Usuarios</Heading>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.reload()}
                    isDisabled={isLoading}
                  >
                    Actualizar
                  </Button>
                  <Button size="sm" colorScheme="green">
                    Nuevo Usuario
                  </Button>
                </HStack>
              </HStack>

              {error ? (
                <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                  <Heading size="sm" color="red.600" mb={2}>
                    Error al cargar datos
                  </Heading>
                  <p style={{ color: '#e53e3e', fontSize: '14px' }}>
                    {error.message}
                  </p>
                </Box>
              ) : (
                <VirtualizedDataTable
                  columns={userColumns}
                  data={users}
                  loading={isLoading}
                  onRowClick={handleRowClick}
                  searchable={true}
                  pageSize={50}
                  rowHeight={60}
                  enableServerSide={enableServerSide}
                  fetchMoreData={fetchMoreData}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  totalCount={totalCount}
                />
              )}
            </VStack>
          </Box>

          {/* Información de Rendimiento */}
          <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="sm">
            <Heading size="md" mb={4}>Información de Rendimiento</Heading>
            <VStack spacing={3} align="start">
              <HStack spacing={4}>
                <Box w={3} h={3} bg="green.500" borderRadius="full" />
                <Text fontSize="sm">
                  <strong>Virtualización:</strong> Solo renderiza elementos visibles
                </Text>
              </HStack>
              <HStack spacing={4}>
                <Box w={3} h={3} bg="blue.500" borderRadius="full" />
                <Text fontSize="sm">
                  <strong>Paginación Infinita:</strong> Carga datos bajo demanda
                </Text>
              </HStack>
              <HStack spacing={4}>
                <Box w={3} h={3} bg="purple.500" borderRadius="full" />
                <Text fontSize="sm">
                  <strong>React Query:</strong> Cache inteligente y sincronización
                </Text>
              </HStack>
              <HStack spacing={4}>
                <Box w={3} h={3} bg="orange.500" borderRadius="full" />
                <Text fontSize="sm">
                  <strong>Supabase:</strong> Base de datos escalable en la nube
                </Text>
              </HStack>
              <HStack spacing={4}>
                <Box w={3} h={3} bg="red.500" borderRadius="full" />
                <Text fontSize="sm">
                  <strong>Optimizaciones:</strong> Memoización y debouncing
                </Text>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}

export default OptimizedDashboardExample;