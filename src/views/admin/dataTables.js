import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, VStack, SimpleGrid, useColorModeValue } from '@chakra-ui/react';
import DataTable from '../../components/DataTable';
import Card from '../../components/Card';
import Chart from '../../components/Chart';

function DataTables() {
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('gray.50', 'gray.900');

  // Datos de ejemplo para la tabla
  const tableData = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@ejemplo.com',
      role: 'Administrador',
      status: 'Activo',
      joinDate: '2023-01-15',
      revenue: 5420,
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@ejemplo.com',
      role: 'Usuario',
      status: 'Activo',
      joinDate: '2023-02-20',
      revenue: 3210,
    },
    {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos@ejemplo.com',
      role: 'Gerente',
      status: 'Inactivo',
      joinDate: '2023-03-10',
      revenue: 7890,
    },
    {
      id: 4,
      name: 'Ana López',
      email: 'ana@ejemplo.com',
      role: 'Usuario',
      status: 'Activo',
      joinDate: '2023-04-05',
      revenue: 4560,
    },
    {
      id: 5,
      name: 'Pedro González',
      email: 'pedro@ejemplo.com',
      role: 'Administrador',
      status: 'Activo',
      joinDate: '2023-05-12',
      revenue: 6780,
    },
    {
      id: 6,
      name: 'Laura Martínez',
      email: 'laura@ejemplo.com',
      role: 'Usuario',
      status: 'Activo',
      joinDate: '2023-06-18',
      revenue: 2340,
    },
  ];

  // Configuración de columnas de la tabla
  const columns = [
    {
      Header: 'Nombre',
      access: 'name',
      sortable: true,
    },
    {
      Header: 'Correo Electrónico',
      access: 'email',
      sortable: true,
    },
    {
      Header: 'Rol',
      access: 'role',
      sortable: true,
      type: 'badge',
      colorScheme: (value) => {
        switch (value) {
          case 'Administrador': return 'red';
          case 'Gerente': return 'orange';
          default: return 'blue';
        }
      },
    },
    {
      Header: 'Estado',
      access: 'status',
      sortable: true,
      type: 'badge',
      colorScheme: (value) => value === 'Activo' ? 'green' : 'gray',
    },
    {
      Header: 'Fecha de Registro',
      access: 'joinDate',
      sortable: true,
      type: 'date',
    },
    {
      Header: 'Ingresos',
      access: 'revenue',
      sortable: true,
      type: 'currency',
    },
  ];

  // Chart data
  const chartOptions = {
    chart: {
      type: 'line',
      height: 350,
    },
    xaxis: {
    categories: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  },
    colors: ['#1890ff'],
    stroke: {
      curve: 'smooth',
      width: 3,
    },
  };

  const chartSeries = [
    {
      name: 'Ingresos',
      data: [5420, 3210, 7890, 4560, 6780, 2340],
    },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box bg={bg} minH="100vh">
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading mb={4} size="lg" color="brand.500">
            Tablas de Datos
          </Heading>
          <Text color="gray.600">
            Gestión avanzada de datos con ordenamiento, filtrado y paginación
          </Text>
        </Box>

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <Text fontSize="sm" color="gray.600">Total de Usuarios</Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.500">6</Text>
            <Text fontSize="xs" color="green.500">+12% desde el mes pasado</Text>
          </Card>
          <Card>
            <Text fontSize="sm" color="gray.600">Usuarios Activos</Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.500">5</Text>
            <Text fontSize="xs" color="green.500">+8% desde el mes pasado</Text>
          </Card>
          <Card>
            <Text fontSize="sm" color="gray.600">Ingresos Totales</Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.500">$30,200</Text>
            <Text fontSize="xs" color="green.500">+25% desde el mes pasado</Text>
          </Card>
          <Card>
            <Text fontSize="sm" color="gray.600">Ingreso Promedio</Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.500">$5,033</Text>
            <Text fontSize="xs" color="red.500">-3% desde el mes pasado</Text>
          </Card>
        </SimpleGrid>

        {/* Chart */}
        <Card>
          <Heading size="md" mb={4}>Análisis de Ingresos</Heading>
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={300}
            loading={loading}
          />
        </Card>

        {/* Data Table */}
        <Card>
          <Heading size="md" mb={4}>Gestión de Usuarios</Heading>
          <DataTable
            columns={columns}
            data={tableData}
            loading={loading}
            searchable={true}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </Card>
      </VStack>
    </Box>
  );
}

export default DataTables;