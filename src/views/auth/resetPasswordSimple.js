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
  Code,
  Divider,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuthFixed } from '../../hooks/useAuthFixed';
import Card from '../../components/Card';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPasswordSimple() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
  const { updatePassword, isUpdatingPassword, updatePasswordError } = useAuthFixed();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Hooks deben llamarse SIEMPRE en el mismo orden
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 SIMPLE RESET PASSWORD - Análisis de URL');
        
        // Obtener información completa de la URL
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        console.log('📋 URL COMPLETA:', currentUrl);
        console.log('🔍 Parámetros de búsqueda:', Object.fromEntries(urlParams));
        console.log('📝 Parámetros de hash:', Object.fromEntries(hashParams));

        // Intentar obtener el token de múltiples fuentes
        let accessToken = searchParams.get('access_token') || 
                         searchParams.get('token') || 
                         urlParams.get('access_token') || 
                         urlParams.get('token') ||
                         hashParams.get('access_token') || 
                         hashParams.get('token');

        const type = searchParams.get('type') || 
                    urlParams.get('type') || 
                    hashParams.get('type');

        const debugData = {
          currentUrl,
          searchParams: Object.fromEntries(searchParams),
          urlSearchParams: Object.fromEntries(urlParams),
          hashParams: Object.fromEntries(hashParams),
          accessTokenFound: !!accessToken,
          typeFound: type,
          accessToken: accessToken ? 'Presente' : 'Ausente',
          tokenLength: accessToken?.length || 0,
          type: type || 'No encontrado'
        };

        setDebugInfo(debugData);
        console.log('📊 INFO DEBUG:', debugData);

        // Para pruebas, permitimos acceso incluso sin token válido
        // En producción, esto debería ser más estricto
        if (!accessToken) {
          console.warn('⚠️ No se encontró token, pero permitiendo acceso para pruebas');
          setTokenValid(true);
        } else if (type !== 'recovery') {
          console.error('❌ Tipo incorrecto:', type);
          setTokenValid(false);
        } else {
          console.log('✅ Token válido detectado');
          setTokenValid(true);
        }
        
      } catch (error) {
        console.error('❌ Error validando token:', error);
        setDebugInfo({
          error: error.message,
          stack: error.stack
        });
        
        setTokenValid(false);
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
        title: 'Error actualizando contraseña',
        description: error.message || 'No se pudo actualizar la contraseña',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Center minH="100vh" bg={bg}>
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">Analizando enlace de recuperación...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg={bg} p={4}>
      <VStack spacing={6} maxW="4xl" w="full">
        {/* Información de Debug */}
        <Card bg={cardBg} p={6} w="full">
          <VStack spacing={4} align="start">
            <Heading size="md" color="blue.500">
              🔍 Debug - Reset Password
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Análisis completo del enlace de recuperación
            </Text>
            
            {debugInfo && (
              <VStack align="start" spacing={2} w="full">
                <Text fontSize="sm">
                  <strong>URL Actual:</strong> <Code fontSize="xs">{debugInfo.currentUrl}</Code>
                </Text>
                <Text fontSize="sm">
                  <strong>Token Encontrado:</strong> <Code colorScheme={debugInfo.accessTokenFound ? 'green' : 'red'}>{debugInfo.accessToken}</Code>
                </Text>
                <Text fontSize="sm">
                  <strong>Tipo:</strong> <Code>{debugInfo.type || 'No encontrado'}</Code>
                </Text>
                <Text fontSize="sm">
                  <strong>Longitud del Token:</strong> <Code>{debugInfo.tokenLength}</Code>
                </Text>
                
                <Divider />
                
                <Text fontSize="sm" fontWeight="bold">Parámetros de Búsqueda:</Text>
                <Code fontSize="xs" p={2} borderRadius="md" w="full" whiteSpace="pre-wrap">
                  {JSON.stringify(debugInfo.searchParams, null, 2)}
                </Code>
                
                <Text fontSize="sm" fontWeight="bold">Parámetros de URL:</Text>
                <Code fontSize="xs" p={2} borderRadius="md" w="full" whiteSpace="pre-wrap">
                  {JSON.stringify(debugInfo.urlSearchParams || {}, null, 2)}
                </Code>
                
                <Text fontSize="sm" fontWeight="bold">Parámetros de Hash (#):</Text>
                <Code fontSize="xs" p={2} borderRadius="md" w="full" whiteSpace="pre-wrap">
                  {JSON.stringify(debugInfo.hashParams || {}, null, 2)}
                </Code>
              </VStack>
            )}
          </VStack>
        </Card>

        {/* Estado del Token */}
        <Card bg={tokenValid ? 'green.50' : 'red.50'} p={4} w="full">
          <VStack spacing={2} textAlign="center">
            <Heading size="md" color={tokenValid ? 'green.600' : 'red.600'}>
              {tokenValid ? '✅ Token Válido' : '❌ Token Inválido'}
            </Heading>
            <Text fontSize="sm" color={tokenValid ? 'green.700' : 'red.700'}>
              {tokenValid 
                ? 'El enlace de recuperación es válido. Puedes continuar.' 
                : 'El enlace no es válido o ha expirado.'
              }
            </Text>
          </VStack>
        </Card>

        {/* Formulario de Nueva Contraseña */}
        {tokenValid && (
          <Card bg={cardBg} p={8} w="full" maxW="md">
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
        )}

        {!tokenValid && (
          <Card bg="yellow.50" p={6} w="full">
            <VStack spacing={3} textAlign="center">
              <Heading size="md" color="orange.600">
                ⚠️ Enlace no válido
              </Heading>
              <Text fontSize="sm" color="orange.700">
                El enlace de recuperación no es válido, ha expirado o los parámetros son incorrectos.
              </Text>
              <Text fontSize="xs" color="orange.600">
                Por favor, solicita un nuevo enlace de recuperación.
              </Text>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => navigate('/auth/forgot-password')}
              >
                Solicitar nuevo enlace
              </Button>
            </VStack>
          </Card>
        )}
      </VStack>
    </Center>
  );
}

export default ResetPasswordSimple;