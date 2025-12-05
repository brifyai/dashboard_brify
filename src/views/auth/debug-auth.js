import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  useColorModeValue,
  useToast,
  Center,
  Card,
  Divider,
  HStack,
  Badge,
  Code,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { CheckIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';

function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Obtener todo del hook useAuth
  const auth = useAuth();

  useEffect(() => {
    console.log('🔍 DEBUG AUTH - Analizando hook completo');
    console.log('📊 Auth object:', auth);
    console.log('🔑 Object keys:', Object.keys(auth));
    
    // Analizar cada propiedad
    const analysis = {
      timestamp: new Date().toISOString(),
      authObject: auth,
      functions: {},
      values: {},
      errors: {}
    };

    // Analizar funciones
    Object.keys(auth).forEach(key => {
      const value = auth[key];
      if (typeof value === 'function') {
        analysis.functions[key] = {
          type: 'function',
          name: value.name || 'anonymous',
          toString: value.toString().substring(0, 200) + '...'
        };
      } else if (typeof value === 'boolean') {
        analysis.values[key] = {
          type: 'boolean',
          value: value
        };
      } else if (value instanceof Error) {
        analysis.errors[key] = {
          type: 'error',
          message: value.message,
          stack: value.stack
        };
      } else {
        analysis.values[key] = {
          type: typeof value,
          value: value
        };
      }
    });

    setDebugInfo(analysis);
    setLoading(false);
  }, [auth]);

  const testResetPassword = async () => {
    console.log('🧪 PROBANDO resetPassword');
    
    try {
      // Verificar si resetPassword existe
      if (!auth.resetPassword) {
        console.error('❌ resetPassword no existe en el hook');
        toast({
          title: 'Error crítico',
          description: 'resetPassword no está disponible en el hook useAuth',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      console.log('✅ resetPassword encontrado:', typeof auth.resetPassword);
      console.log('📋 Tipo de resetPassword:', auth.resetPassword.constructor.name);
      
      // Intentar llamar a resetPassword
      console.log('📤 Llamando a resetPassword con email de prueba...');
      const result = await auth.resetPassword('test@example.com');
      console.log('✅ Resultado de resetPassword:', result);
      
      toast({
        title: '¡Éxito!',
        description: 'resetPassword funcionó correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Error llamando resetPassword:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      toast({
        title: 'Error en resetPassword',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center h="100vh" bg={bg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Analizando hook useAuth...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg={bg} p={4}>
      <VStack spacing={6} maxW="6xl" w="full">
        <Card bg={cardBg} p={6} w="full">
          <VStack spacing={4} align="start">
            <Heading size="lg" color="brand.500">
              🔍 Debug Auth Hook - Análisis Completo
            </Heading>
            <Text color="gray.600">
              Análisis detallado del hook useAuth y sus funciones
            </Text>
            
            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={3}>📊 Resumen General:</Text>
              <HStack spacing={4} wrap="wrap">
                <Badge colorScheme="blue">
                  <InfoIcon mr={1} />
                  Funciones: {Object.keys(debugInfo.functions).length}
                </Badge>
                <Badge colorScheme="green">
                  <CheckIcon mr={1} />
                  Valores: {Object.keys(debugInfo.values).length}
                </Badge>
                <Badge colorScheme="red">
                  <WarningIcon mr={1} />
                  Errores: {Object.keys(debugInfo.errors).length}
                </Badge>
              </HStack>
            </Box>

            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={3}>🔧 Funciones Disponibles:</Text>
              <TableContainer>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nombre</Th>
                      <Th>Tipo</Th>
                      <Th>Función Name</Th>
                      <Th>Preview</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(debugInfo.functions).map(([key, func]) => (
                      <Tr key={key}>
                        <Td>
                          <Code colorScheme={key === 'resetPassword' ? 'green' : 'blue'}>
                            {key}
                          </Code>
                        </Td>
                        <Td>{func.type}</Td>
                        <Td>{func.name}</Td>
                        <Td>
                          <Code fontSize="xs">{func.toString}</Code>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>

            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={3}>📋 Valores y Estados:</Text>
              <VStack align="start" spacing={2}>
                {Object.entries(debugInfo.values).map(([key, value]) => (
                  <HStack key={key} w="full" justify="space-between">
                    <Code>{key}</Code>
                    <Text fontSize="sm">
                      {value.type === 'boolean' ? (value.value ? '✅ true' : '❌ false') : String(value.value)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={3}>🧪 Prueba de Funciones:</Text>
              <VStack align="start" spacing={3}>
                <Button
                  colorScheme="blue"
                  onClick={testResetPassword}
                  leftIcon={<WarningIcon />}
                >
                  Probar resetPassword
                </Button>
                <Text fontSize="sm" color="gray.600">
                  Esta prueba intentará llamar a resetPassword con un email de prueba
                </Text>
              </VStack>
            </Box>

            <Divider />
            
            <Box w="full" bg="yellow.50" p={4} borderRadius="md">
              <Text fontWeight="bold" color="yellow.800" mb={2}>
                💡 Instrucciones de Diagnóstico:
              </Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="yellow.700">
                  1. Abre la consola del navegador (F12)
                </Text>
                <Text fontSize="sm" color="yellow.700">
                  2. Haz clic en "Probar resetPassword"
                </Text>
                <Text fontSize="sm" color="yellow.700">
                  3. Observa los logs detallados en la consola
                </Text>
                <Text fontSize="sm" color="yellow.700">
                  4. Si hay errores, se mostrarán aquí y en notificaciones
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}

export default DebugAuth;