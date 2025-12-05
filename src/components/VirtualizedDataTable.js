import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { List } from 'react-window';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
  Button,
  IconButton,
  Input,
  Select,
  HStack,
  VStack,
  Badge,
  useColorModeValue,
  Skeleton,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
  MdSearch,
  MdFilterList,
} from 'react-icons/md';

// Componente de fila virtualizada
const VirtualizedRow = React.memo(({ 
  index, 
  style, 
  data 
}) => {
  const { 
    items, 
    columns, 
    onRowClick, 
    rowHeight,
    bg,
    borderColor 
  } = data;
  
  const row = items[index];
  
  if (!row) {
    return (
      <Box style={style} h={`${rowHeight}px`}>
        <Skeleton height={`${rowHeight}px`} />
      </Box>
    );
  }

  const renderCell = (column, row) => {
    const value = row[column.accessor];
    
    if (column.Cell) {
      return column.Cell({ value, row });
    }
    
    if (column.type === 'badge') {
      const colorScheme = typeof column.colorScheme === 'function' 
        ? column.colorScheme(value) 
        : column.colorScheme || 'blue';
      return (
        <Badge colorScheme={colorScheme}>
          {value}
        </Badge>
      );
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    if (column.type === 'currency') {
      return `$${Number(value).toLocaleString()}`;
    }
    
    return value;
  };

  return (
    <Box
      style={style}
      h={`${rowHeight}px`}
      bg={bg}
      borderBottom="1px solid"
      borderColor={borderColor}
      _hover={{ bg: 'gray.50' }}
      cursor={onRowClick ? 'pointer' : 'default'}
      onClick={() => onRowClick && onRowClick(row)}
    >
      <Table variant="simple" size="sm">
        <Tbody>
          <Tr>
            {columns.map((column) => (
              <Td key={column.accessor} py={2}>
                {renderCell(column, row)}
              </Td>
            ))}
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

// Componente principal de tabla virtualizada
function VirtualizedDataTable({ 
  columns, 
  data, 
  loading = false, 
  onRowClick, 
  searchable = true,
  pageSize = 50,
  rowHeight = 60,
  enableServerSide = false,
  fetchMoreData,
  hasNextPage,
  isFetchingNextPage,
  totalCount = 0
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);
  
  const listRef = useRef();
  const debounceRef = useRef();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Filtrado y ordenamiento optimizado
  const processedData = useMemo(() => {
    if (loading || !data) return [];

    let filtered = [...data];

    // Búsqueda
    if (searchTerm && !enableServerSide) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((row) =>
        columns.some((column) =>
          String(row[column.accessor] || '')
            .toLowerCase()
            .includes(searchLower)
        )
      );
    }

    // Ordenamiento
    if (sortField && !enableServerSide) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortField, sortDirection, columns, loading, enableServerSide]);

  // Debounce para búsqueda
  const debouncedSearch = useCallback((value) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      setSearchTerm(value);
      setCurrentPage(1);
    }, 300);
  }, []);

  // Paginación
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = enableServerSide ? processedData : processedData.slice(startIndex, startIndex + pageSize);

  // Cargar más datos cuando se llega al final
  const handleItemsRendered = useCallback((visibleRowStartIndex, visibleRowStopIndex) => {
    if (enableServerSide && hasNextPage && !isFetchingNextPage) {
      const threshold = 10;
      const itemsNeedToFetch = totalCount - visibleRowStopIndex;
      
      if (itemsNeedToFetch <= threshold) {
        fetchMoreData();
      }
    }
  }, [enableServerSide, hasNextPage, isFetchingNextPage, fetchMoreData, totalCount]);

  // Reset scroll cuando cambian los datos
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(0);
    }
  }, [searchTerm, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <Box bg={bg} borderRadius="lg" boxShadow="sm" p={6}>
        <VStack spacing={4}>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} height="40px" width="full" borderRadius="md" />
          ))}
        </VStack>
      </Box>
    );
  }

  const itemData = {
    items: paginatedData,
    columns,
    onRowClick,
    rowHeight,
    bg,
    borderColor
  };

  return (
    <Box bg={bg} borderRadius="lg" boxShadow="sm" overflow="hidden">
      {/* Search and Filters */}
      {searchable && (
        <Flex p={4} borderBottom="1px solid" borderColor={borderColor} justify="space-between" align="center">
          <HStack spacing={4}>
            <Box position="relative">
              <Input
                placeholder="Buscar..."
                onChange={(e) => debouncedSearch(e.target.value)}
                pl={10}
                size="sm"
                w="300px"
              />
              <Box position="absolute" left={3} top={2.5}>
                <MdSearch size={16} color="gray" />
              </Box>
            </Box>
            <IconButton
              icon={<MdFilterList />}
              size="sm"
              variant="ghost"
              aria-label="Filtrar"
            />
          </HStack>
          
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Mostrar:
            </Text>
            <Select
              size="sm"
              value={pageSize}
              onChange={(e) => {
                // Actualizar pageSize si es necesario
                setCurrentPage(1);
              }}
              w="80px"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </Select>
          </HStack>
        </Flex>
      )}

      {/* Table Header */}
      <Box overflowX="auto" borderBottom="1px solid" borderColor={borderColor}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.accessor}
                  cursor={column.sortable ? 'pointer' : 'default'}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  userSelect="none"
                  minW={column.minWidth || '120px'}
                >
                  <Flex align="center" gap={2}>
                    {column.Header}
                    {column.sortable && (
                      <Text as="span" fontSize="xs">
                        {getSortIcon(column.accessor)}
                      </Text>
                    )}
                  </Flex>
                </Th>
              ))}
            </Tr>
          </Thead>
        </Table>
      </Box>

      {/* Virtualized Table Body */}
      <Box position="relative" h="600px">
        {processedData.length === 0 ? (
          <Center h="200px">
            <VStack spacing={2}>
              <Text color="gray.500">No se encontraron datos</Text>
              {searchTerm && (
                <Text fontSize="sm" color="gray.400">
                  Intenta con otros términos de búsqueda
                </Text>
              )}
            </VStack>
          </Center>
        ) : (
          <List
            ref={listRef}
            height={600}
            itemCount={paginatedData.length}
            itemSize={rowHeight}
            itemData={itemData}
            onItemsRendered={({ visibleStartIndex, visibleStopIndex }) => {
              handleItemsRendered(visibleStartIndex, visibleStopIndex);
            }}
          >
            {VirtualizedRow}
          </List>
        )}
        
        {/* Loading indicator for infinite scroll */}
        {isFetchingNextPage && (
          <Center position="absolute" bottom={0} left={0} right={0} bg="white" py={2}>
            <HStack spacing={2}>
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.600">Cargando más datos...</Text>
            </HStack>
          </Center>
        )}
      </Box>

      {/* Pagination Info */}
      <Flex p={4} borderTop="1px solid" borderColor={borderColor} justify="space-between" align="center">
        <Text fontSize="sm" color="gray.600">
          {enableServerSide ? (
            `Mostrando ${processedData.length} de ${totalCount} registros`
          ) : (
            `Mostrando ${startIndex + 1} a ${Math.min(startIndex + pageSize, processedData.length)} de ${processedData.length} registros`
          )}
        </Text>
        
        {!enableServerSide && (
          <HStack spacing={2}>
            <IconButton
              icon={<MdFirstPage />}
              size="sm"
              onClick={() => setCurrentPage(1)}
              isDisabled={currentPage === 1}
              aria-label="Primera página"
            />
            <IconButton
              icon={<MdChevronLeft />}
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              isDisabled={currentPage === 1}
              aria-label="Página anterior"
            />
            
            <Text fontSize="sm" color="gray.600">
              Página {currentPage} de {totalPages}
            </Text>
            
            <IconButton
              icon={<MdChevronRight />}
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              isDisabled={currentPage === totalPages}
              aria-label="Siguiente página"
            />
            <IconButton
              icon={<MdLastPage />}
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              isDisabled={currentPage === totalPages}
              aria-label="Última página"
            />
          </HStack>
        )}
      </Flex>
    </Box>
  );
}

export default VirtualizedDataTable;