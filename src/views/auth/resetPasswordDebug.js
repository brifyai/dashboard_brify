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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuthFixed } from '../../hooks/useAuthFixed';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Componente Card simple sin hooks internos
const SimpleCard = ({ children, bg, p = 4, w = 'full', maxW, ...props }) => {
  return (
    <Box
      bg={bg}
      p={p}
      w={w}
      maxW={maxW}
      borderRadius="lg"
      boxShadow="md"
      border="1px solid"
      borderColor="gray.200"
      {...props}
    >
      {children}
    </Box>
  );
};

function ResetPasswordDebug() {
  // TODOS los hooks deben llamarse SIEMPRE en el mismo orden - ANTES de cualquier return
  
  // Hooks de React primero
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Hooks de React Router
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Hooks de Chakra UI - TODOS juntos al principio
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const formCardBg = useColorModeValue('white', 'gray.800');
  const errorCardBg = useColorModeValue('yellow.50', 'yellow.900');
  const successCardBg = useColorModeValue('green.50', 'green.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Hooks personalizados
  const { updatePassword, isUpdatingPassword, updatePasswordError } = useAuthFixed();

  useEffect(() => {
    const validateToken = async () => {
      try {
        console.log('🔍 DEBUG RESET PASSWORD - Análisis completo');
        
        // Obtener TODOS los parámetros de la URL
        const allParams = Object.fromEntries(searchParams);
        const currentUrl = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        console.log('📋 URL COMPLETA:', currentUrl);
        console.log('🔍 Parámetros de búsqueda (search):', Object.fromEntries(urlParams));
        console.log('📝 Parámetros de hash (#):', Object.fromEntries(hashParams));
        console.log('📦 searchParams de React Router:', allParams);

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
          searchParams: allParams,
          urlSearchParams: Object.fromEntries(urlParams),
          hashParams: Object.fromEntries(hashParams),
          accessTokenFound: !!accessToken,
          typeFound: type,
          accessToken: accessToken ? 'Presente' : 'Ausente',
          tokenLength: accessToken?.length || 0,
          type: type || 'No encontrado'
        };

        setDebugInfo(debugData);
        console.log('📊 DEBUG INFO:', debugData);

        if (!accessToken || type !== 'recovery') {
          console.error('❌ Token inválido o ausente');
          
          // Mostrar información detallada al usuario
          setTokenValid(false);
          setLoading(false);
          
          toast({
            title: 'Enlace de recuperación inválido',
            description: `Token: ${accessToken ? 'Presente' : 'Ausente'}, Tipo: ${type || 'No encontrado'}`,
            status: 'error',
            duration: 8000,
            isClosable: true,
          });
          
          // No redirigir inmediatamente para que pueda ver el debug
          return;
        }

        console.log('✅ Token presente, permitiendo acceso al formulario');
        setTokenValid(true);
        
      } catch (error) {
        console.error('❌ Error validando token:', error);
        setDebugInfo({
          error: error.message,
          stack: error.stack
        });
        
        toast({
          title: 'Error validando enlace',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
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
    console.log('📊 Estado actual:', {
      password: password ? 'Presente' : 'Ausente',
      confirmPassword: confirmPassword ? 'Presente' : 'Ausente',
      passwordLength: password.length,
      passwordsMatch: password === confirmPassword
    });
    
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
      console.log('🔐 Nueva contraseña:', password.replace(/./g, '*')); // Para seguridad
      
      setIsProcessing(true);
      await updatePassword(password);
      console.log('✅ Contraseña actualizada exitosamente');
      
      toast({
        title: '¡Contraseña actualizada!',
        description: 'Tu contraseña ha sido cambiada exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setIsSuccess(true);
      
      // Redirigir al login después de unos segundos
      setTimeout(() => {
        navigate('/auth/sign-in');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error actualizando contraseña:', error);
      console.error('📋 Detalles del error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      toast({
        title: 'Error actualizando contraseña',
        description: error.message || 'No se pudo actualizar la contraseña',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // RETURN PRINCIPAL - Todo en un solo return sin elementos JSX predefinidos
  return (
    <Center minH="100vh" bg={bg} p={4}>
      {loading ? (
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={mutedTextColor}>Analizando enlace de recuperación...</Text>
        </VStack>
      ) : isProcessing ? (
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color={textColor}>Procesando nueva contraseña...</Text>
        </VStack>
      ) : isSuccess ? (
        <SimpleCard maxW="md" w="full" bg={formCardBg}>
          <VStack spacing={4} textAlign="center">
            <Alert status="success" variant="subtle">
              <AlertIcon />
              <AlertTitle>¡Éxito!</AlertTitle>
            </Alert>
            <AlertDescription color={textColor}>
              Tu contraseña ha sido actualizada correctamente.
            </AlertDescription>
            <Button colorScheme="blue" onClick={() => navigate('/auth/sign-in')}>
              Iniciar Sesión
            </Button>
          </VStack>
        </SimpleCard>
      ) : (
        <VStack spacing={6} maxW="4xl" w="full">
          {/* Información de Debug */}
          <SimpleCard bg={cardBg} p={6} w="full">
            <VStack spacing={4} align="start">
              <Heading size="md" color="blue.500">
                🔍 Debug - Reset Password
              </Heading>
              <Text color={mutedTextColor} fontSize="sm">
                Análisis completo del enlace de recuperación
              </Text>
              
              {debugInfo && (
                <VStack align="start" spacing={3} w="full">
                  <Text fontSize="sm" color={textColor}>
                    <strong>URL Actual:</strong> <Code fontSize="xs">{debugInfo.currentUrl}</Code>
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Token Encontrado:</strong> <Code colorScheme={debugInfo.accessTokenFound ? 'green' : 'red'}>{debugInfo.accessToken}</Code>
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Tipo:</strong> <Code>{debugInfo.type || 'No encontrado'}</Code>
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    <strong>Longitud del Token:</strong> <Code>{debugInfo.tokenLength}</Code>
                  </Text>
                  
                  <Divider />
                  
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>Parámetros de Búsqueda:</Text>
                  <Code fontSize="xs" p={2} borderRadius="md" w="full" whiteSpace="pre-wrap">
                    {JSON.stringify(debugInfo.searchParams, null, 2)}
                  </Code>
                  
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>Parámetros de URL:</Text>
                  <Code fontSize="xs" p={2} borderRadius="md" w="full" whiteSpace="pre-wrap">
                    {JSON.stringify(debugInfo.urlSearchParams || {}, null, 2)}
                  </Code>
                  
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>Parámetros de Hash (#):</Text>
                  <Code fontSize="xs" p={2} borderRadius="md" w="full" whiteSpace="pre-wrap">
                    {JSON.stringify(debugInfo.hashParams || {}, null, 2)}
                  </Code>
                </VStack>
              )}
            </VStack>
          </SimpleCard>

          {/* Estado del Token */}
          <SimpleCard bg={tokenValid ? successCardBg : 'red.50'} p={4} w="full">
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
          </SimpleCard>

          {/* Formulario de Nueva Contraseña */}
          {tokenValid ? (
            <SimpleCard bg={formCardBg} p={8} w="full" maxW="md">
              <VStack spacing={6} as="form" onSubmit={handleSubmit}>
                <VStack spacing={2} textAlign="center">
                  <Heading size="lg" color="blue.500">
                    🔐 Nueva Contraseña
                  </Heading>
                  <Text color={mutedTextColor} fontSize="sm">
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

                <FormControl>
                  <FormLabel color={textColor}>Nueva Contraseña</FormLabel>
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
                      color={textColor}
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

                <FormControl>
                  <FormLabel color={textColor}>Confirmar Contraseña</FormLabel>
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
                      color={textColor}
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
                  <Text fontSize="sm" color={mutedTextColor}>
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
            </SimpleCard>
          ) : (
            <SimpleCard bg={errorCardBg} p={6} w="full">
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
            </SimpleCard>
          )}
        </VStack>
      )}
    </Center>
  );
}

export default ResetPasswordDebug;