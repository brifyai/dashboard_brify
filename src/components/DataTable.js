import React, { useState, useMemo } from 'react';
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
} from '@chakra-ui/react';
import {
  MdChevronLeft,
  MdChevronRight,
  MdFirstPage,
  MdLastPage,
  MdSearch,
  MdFilterList,
} from 'react-icons/md';

function DataTable({ columns, data, loading = false, onRowClick, searchable = true }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        columns.some((column) =>
          String(row[column.accessor] || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        )
      );
    }

    // Sort data
    if (sortField) {
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
  }, [data, searchTerm, sortField, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

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

  if (loading) {
    return (
      <Box bg={bg} borderRadius="lg" boxShadow="sm" p={6}>
        <VStack spacing={4}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} height="40px" width="full" borderRadius="md" />
          ))}
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bg} borderRadius="lg" boxShadow="sm" overflow="hidden">
      {/* Search and Filters */}
      {searchable && (
        <Flex p={4} borderBottom="1px solid" borderColor={borderColor} justify="space-between" align="center">
          <HStack spacing={4}>
            <Box position="relative">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              w="80px"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Select>
          </HStack>
        </Flex>
      )}

      {/* Table */}
      <Box overflowX="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.accessor}
                  cursor={column.sortable ? 'pointer' : 'default'}
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  userSelect="none"
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
          <Tbody>
            {paginatedData.map((row, rowIndex) => (
              <Tr
                key={row.id || row._id || `${rowIndex}-${JSON.stringify(row).slice(0, 20)}`}
                _hover={{ bg: 'gray.50' }}
                cursor={onRowClick ? 'pointer' : 'default'}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <Td key={column.accessor}>
                    {renderCell(column, row)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Flex p={4} borderTop="1px solid" borderColor={borderColor} justify="space-between" align="center">
        <Text fontSize="sm" color="gray.600">
          Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, filteredData.length)} de {filteredData.length} registros
        </Text>
        
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
          
          <HStack spacing={1}>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  size="sm"
                  variant={currentPage === pageNum ? 'solid' : 'ghost'}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </HStack>
          
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
      </Flex>
    </Box>
  );
}

export default DataTable;