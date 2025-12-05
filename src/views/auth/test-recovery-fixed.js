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
import { useAuthFixed } from '../../hooks/useAuthFixed';
import ForgotPasswordFixed from './forgotPasswordFixed';
import { EmailIcon, CheckIcon, WarningIcon } from '@chakra-ui/icons';

function TestRecoveryFixed() {
  const [testEmail, setTestEmail] = useState('');
  const { resetPassword, isResettingPassword, resetPasswordError } = useAuthFixed();
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const testResetPassword = async () => {
    console.log('🧪 PROBANDO resetPassword con hook FIXED');
    console.log('📧 Email de prueba:', testEmail);
    console.log('🔧 Estado del hook:', {
      resetPassword: typeof resetPassword,
      isResettingPassword,
      resetPasswordError
    });
    
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

    try {
      console.log('📤 Llamando a resetPassword...');
      const result = await resetPassword(testEmail);
      console.log('✅ resetPassword ejecutado exitosamente:', result);
      
      toast({
        title: '¡Éxito!',
        description: 'El email de recuperación se envió correctamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('❌ Error en resetPassword:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      toast({
        title: 'Error en resetPassword',
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
    <Center minH="100vh" bg={bg} p={4}>
      <VStack spacing={6} maxW="4xl" w="full">
        <Card bg={cardBg} p={6} w="full">
          <VStack spacing={4} align="start">
            <Heading size="lg" color="brand.500">
              🧪 Prueba de Recuperación de Contraseña (FIXED)
            </Heading>
            <Text color="gray.600">
              Esta página usa el hook useAuthFixed con implementación directa
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
              <Text fontWeight="bold" mb={2}>🔧 Información del Hook Fixed:</Text>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm">
                  <Code>resetPassword:</Code> {typeof resetPassword}
                </Text>
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
              <form onSubmit={(e) => { e.preventDefault(); testResetPassword(); }}>
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
                    Probar Recuperación (FIXED)
                  </Button>
                </VStack>
              </form>
            </Box>

            <Divider />
            
            <Box w="full">
              <Text fontWeight="bold" mb={2}>🔄 Formulario Completo:</Text>
              <Text fontSize="sm" color="gray.600" mb={3}>
                Aquí está el componente completo de recuperación usando el hook fixed:
              </Text>
              <ForgotPasswordFixed />
            </Box>

            <Divider />
            
            <Box w="full" bg="green.50" p={4} borderRadius="md">
              <Text fontSize="sm" color="green.800">
                <strong>✅ Ventajas del hook fixed:</strong>
              </Text>
              <VStack align="start" spacing={1} mt={2}>
                <Text fontSize="xs" color="green.700">• Implementación directa sin mutaciones complejas</Text>
                <Text fontSize="xs" color="green.700">• Logging detallado en consola</Text>
                <Text fontSize="xs" color="green.700">• Manejo de estados simplificado</Text>
                <Text fontSize="xs" color="green.700">• Funciones expuestas directamente</Text>
              </VStack>
            </Box>
          </VStack>
        </Card>
      </VStack>
    </Center>
  );
}

export default TestRecoveryFixed;