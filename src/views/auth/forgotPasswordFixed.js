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
  Spinner,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { EmailIcon } from '@chakra-ui/icons';
import { useAuthFixed } from '../../hooks/useAuthFixed';
import Card from '../../components/Card';

function ForgotPasswordFixed() {
  const [email, setEmail] = useState('');
  const { resetPassword, isResettingPassword, resetPasswordError } = useAuthFixed();
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 FORGOT PASSWORD FIXED - Iniciando proceso');
    console.log('📧 Email a procesar:', email);
    console.log('🔧 Estado del hook:', {
      resetPassword: typeof resetPassword,
      isResettingPassword,
      resetPasswordError
    });
    
    if (!email) {
      toast({
        title: 'Email requerido',
        description: 'Por favor ingresa tu email',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingresa un email válido',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('📤 Llamando a resetPassword...');
      await resetPassword(email);
      console.log('✅ resetPassword ejecutado exitosamente');
      
      toast({
        title: '¡Email enviado!',
        description: 'Revisa tu bandeja de entrada para recuperar tu contraseña',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setEmail('');
      
    } catch (error) {
      console.error('❌ Error en forgotPasswordFixed:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el email de recuperación',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isResettingPassword) {
    return (
      <Center h="100vh" bg={bg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Enviando email de recuperación...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg={bg}>
      <Card maxW="md" w="full" mx="4" p={8}>
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="brand.500">
              🔧 Recuperación de Contraseña (FIXED)
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña
            </Text>
          </VStack>

          {resetPasswordError && (
            <Box bg="red.50" p={3} borderRadius="md" w="full">
              <Text fontSize="sm" color="red.700">
                <strong>Último error:</strong> {resetPasswordError.message}
              </Text>
            </Box>
          )}

          <FormControl>
            <FormLabel>Email</FormLabel>
            <InputGroup>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
              />
              <InputRightElement>
                <EmailIcon color="gray.400" />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            w="full"
            isLoading={isResettingPassword}
            loadingText="Enviando..."
          >
            Enviar instrucciones
          </Button>

          <VStack spacing={2} textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.600">
              ¿Recuerdas tu contraseña?{' '}
              <Button
                variant="link"
                colorScheme="blue"
                size="sm"
                onClick={() => window.history.back()}
              >
                Volver al login
              </Button>
            </Text>
          </VStack>

          <Box textAlign="center" pt={4}>
            <Text fontSize="xs" color="gray.500">
              Si no recibes el email en unos minutos, revisa tu carpeta de spam
            </Text>
          </Box>
        </VStack>
      </Card>
    </Center>
  );
}

export default ForgotPasswordFixed;