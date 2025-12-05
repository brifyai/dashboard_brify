import React, { useState, useEffect } from 'react';
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
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuthFixed } from '../../hooks/useAuthFixed';
import Card from '../../components/Card';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  
  const { updatePassword, isUpdatingPassword, updatePasswordError } = useAuthFixed();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 Validando token de reseteo...');
        
        // Obtener el token de la URL
        const accessToken = searchParams.get('access_token') || searchParams.get('token');
        const type = searchParams.get('type');
        
        console.log('📋 Parámetros de URL:', {
          accessToken: accessToken ? 'Presente' : 'Ausente',
          type: type,
          fullParams: Object.fromEntries(searchParams)
        });

        if (!accessToken || type !== 'recovery') {
          console.error('❌ Token inválido o ausente');
          toast({
            title: 'Enlace inválido',
            description: 'Este enlace de recuperación no es válido o ha expirado',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          setTimeout(() => navigate('/auth/sign-in'), 3000);
          return;
        }

        // En lugar de verificar el token, confiamos en que Supabase lo hará
        // cuando intentemos actualizar la contraseña
        console.log('✅ Token presente, permitiendo acceso al formulario');
        setTokenValid(true);
        
      } catch (error) {
        console.error('❌ Error validando token:', error);
        toast({
          title: 'Error',
          description: 'No se pudo validar el enlace de recuperación',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => navigate('/auth/sign-in'), 3000);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando actualización de contraseña...');
    
    if (!password || !confirmPassword) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor ingresa y confirma tu nueva contraseña',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Contraseña muy corta',
        description: 'La contraseña debe tener al menos 6 caracteres',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Contraseñas no coinciden',
        description: 'Las contraseñas ingresadas no coinciden',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('📤 Actualizando contraseña...');
      await updatePassword(password);
      console.log('✅ Contraseña actualizada exitosamente');
      
      toast({
        title: '¡Contraseña actualizada!',
        description: 'Tu contraseña ha sido cambiada exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirigir al login después de unos segundos
      setTimeout(() => {
        navigate('/auth/sign-in');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error actualizando contraseña:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la contraseña',
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
          <Text color="gray.600">Validando enlace de recuperación...</Text>
        </VStack>
      </Center>
    );
  }

  if (!tokenValid) {
    return (
      <Center h="100vh" bg={bg}>
        <Card maxW="md" w="full" mx="4" p={8}>
          <VStack spacing={4} textAlign="center">
            <Heading size="lg" color="red.500">
              Enlace Inválido
            </Heading>
            <Text color="gray.600">
              Este enlace de recuperación no es válido o ha expirado.
            </Text>
            <Text fontSize="sm" color="gray.500">
              Serás redirigido al login en unos momentos...
            </Text>
          </VStack>
        </Card>
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg={bg}>
      <Card maxW="md" w="full" mx="4" p={8}>
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <VStack spacing={2} textAlign="center">
            <Heading size="lg" color="brand.500">
              🔐 Nueva Contraseña
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Ingresa tu nueva contraseña para recuperar tu cuenta
            </Text>
          </VStack>

          {updatePasswordError && (
            <Box bg="red.50" p={3} borderRadius="md" w="full">
              <Text fontSize="sm" color="red.700">
                <strong>Error:</strong> {updatePasswordError.message}
              </Text>
            </Box>
          )}

          {/* Campo de Nueva Contraseña */}
          <FormControl>
            <FormLabel>Nueva Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingresa tu nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Campo de Confirmar Contraseña */}
          <FormControl>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirma tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          {/* Requisitos de contraseña */}
          <Box w="full" bg="blue.50" p={3} borderRadius="md">
            <Text fontSize="sm" color="blue.700">
              <strong>Requisitos:</strong>
            </Text>
            <VStack align="start" spacing={1} mt={1}>
              <Text fontSize="xs" color={password.length >= 6 ? 'green.600' : 'gray.600'}>
                {password.length >= 6 ? '✅' : '○'} Mínimo 6 caracteres
              </Text>
              <Text fontSize="xs" color={password === confirmPassword && password ? 'green.600' : 'gray.600'}>
                {password === confirmPassword && password ? '✅' : '○'} Las contraseñas coinciden
              </Text>
            </VStack>
          </Box>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            w="full"
            isLoading={isUpdatingPassword}
            loadingText="Actualizando..."
          >
            Actualizar Contraseña
          </Button>

          <VStack spacing={2} textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.600">
              ¿Recuerdas tu contraseña?{' '}
              <Button
                variant="link"
                colorScheme="blue"
                size="sm"
                onClick={() => navigate('/auth/sign-in')}
              >
                Volver al login
              </Button>
            </Text>
          </VStack>
        </VStack>
      </Card>
    </Center>
  );
}

export default ResetPassword;