import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Flex, Center, Spinner, VStack, Text } from '@chakra-ui/react';
import routes from '../routes';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuthFixed as useAuth } from '../hooks/useAuthFixed';

function AdminLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const adminRoutes = routes.filter(route => route.layout === '/admin');

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      console.log('🚪 Usuario no autenticado, redirigiendo al login...');
      navigate('/auth/sign-in', { replace: true });
    }
  }, [user, loading, navigate]);

  // Mostrar loading mientras se carga la autenticación
  if (loading) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Cargando...</Text>
        </VStack>
      </Center>
    );
  }

  // Si no hay usuario autenticado, no renderizar nada (ya se redirigió)
  if (!user) {
    return null;
  }
  
  return (
    <Flex minH="100vh" bg="gray.50">
      <Sidebar />
      <Box ml="250px" flex="1">
        <Header />
        <Box p={6}>
          <Routes>
            {adminRoutes.map((route, index) => (
              <Route key={index} path={route.path} element={route.component} />
            ))}
          </Routes>
        </Box>
      </Box>
    </Flex>
  );
}

export default AdminLayout;