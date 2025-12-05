import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useColorModeValue,
  useToast,
  Center,
  Card,
  Divider,
  HStack,
  Badge,
  Code,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { EmailIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';

function TestRecovery() {
  const [testEmail, setTestEmail] = useState('');
  const { resetPassword, isResettingPassword, resetPasswordError } = useAuth();
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const handleTestRecovery = async (e) => {
    e.preventDefault();
    
    if (!testEmail) {
      toast({
        title: 'Email requerido',
        description: 'Por favor ingresa un email para probar',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    console.log('🧪 INICIANDO PRUEBA DE RECUPERACIÓN');
    console.log('📧 Email de prueba:', testEmail);
    console.log('🔧 Estado actual del hook useAuth:', {
      isResettingPassword,
      resetPasswordError: resetPasswordError?.message || 'Ninguno'
    });

    try {
      console.log('📤 Llamando a resetPassword...');
      await resetPassword(testEmail);
      console.log('✅ Prueba exitosa - Email enviado');
      
      toast({
        title: '¡Prueba exitosa!',
        description: 'El email de recuperación se envió correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Error en prueba:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack
      });
      
      toast({
        title: 'Error en prueba',
        description: error.message || 'Error desconocido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = () => {
    if (isResettingPassword) return 'blue';
    if (resetPasswordError) return 'red';
    return 'green';
  };

  const getStatusIcon = () => {
    if (isResettingPassword) return <WarningIcon />;
    if (resetPasswordError) return <WarningIcon />;
    return <CheckIcon />;
  };

  return (
    <Center minH="100vh" bg={bg}>
      <VStack spacing={6} maxW="4xl" w="full" mx={4}>
        <Card bg={cardBg} p={6} w="full">
          <VStack spacing={4} align="start">
            <Heading size="lg" color="brand.500">
              🧪 Prueba de Recuperación de Contraseña
            </Heading>
            <Text color="gray.600">
              Esta página te permite probar el flujo completo de recuperación de contraseña
            </Text>
            
            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={2}>📊 Estado del Sistema:</Text>
              <VStack align="start" spacing={2}>
                <HStack>
                  <Badge colorScheme={getStatusColor()}>
                    {getStatusIcon()} Estado: {isResettingPassword ? 'Enviando...' : resetPasswordError ? 'Error' : 'Listo'}
                  </Badge>
                </HStack>
                
                {resetPasswordError && (
                  <Box bg="red.50" p={3} borderRadius="md" w="full">
                    <Text fontSize="sm" color="red.700">
                      <strong>Último error:</strong> {resetPasswordError.message}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>

            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={2}>🔧 Información del Hook:</Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">
                  <Code>isResettingPassword:</Code> {isResettingPassword ? 'true' : 'false'}
                </Text>
                <Text fontSize="sm">
                  <Code>resetPasswordError:</Code> {resetPasswordError ? resetPasswordError.message : 'null'}
                </Text>
              </VStack>
            </Box>

            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={2}>🧪 Formulario de Prueba:</Text>
              <form onSubmit={handleTestRecovery}>
                <VStack spacing={4} align="start">
                  <FormControl>
                    <FormLabel>Email de prueba</FormLabel>
                    <InputGroup>
                      <Input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                      />
                      <InputRightElement>
                        <EmailIcon color="gray.400" />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={isResettingPassword}
                    loadingText="Enviando..."
                  >
                    Probar Recuperación
                  </Button>
                </VStack>
              </form>
            </Box>

            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={2}>📋 Instrucciones:</Text>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm">1. Ingresa un email válido en el campo de prueba</Text>
                <Text fontSize="sm">2. Haz clic en "Probar Recuperación"</Text>
                <Text fontSize="sm">3. Revisa la consola del navegador para ver logs detallados</Text>
                <Text fontSize="sm">4. Si hay errores, se mostrarán aquí y en notificaciones</Text>
              </VStack>
            </Box>

            <Divider />
            
            <Box w="full" bg="yellow.50" p={4} borderRadius="md">
              <Text fontSize="sm" color="yellow.800">
                <strong>💡 Nota:</strong> Esta es una página de prueba. En producción, el usuario debería:
              </Text>
              <VStack align="start" spacing={1} mt={2}>
                <Text fontSize="xs" color="yellow.700">• Ir a /auth/sign-in</Text>
                <Text fontSize="xs" color="yellow.700">• Hacer clic en "¿Olvidaste tu contraseña?"</Text>
                <Text fontSize="xs" color="yellow.700">• Ingresar su email en el formulario de recuperación</Text>
              </VStack>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}

export default TestRecovery;