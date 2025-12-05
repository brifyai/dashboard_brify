import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Link,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  InputGroup,
  InputRightElement,
  IconButton,
  Checkbox,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon } from '@chakra-ui/icons';
import { useAuthFixed as useAuth } from '../../hooks/useAuthFixed';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validaciones adicionales para registro
    if (!isLogin) {
      if (!formData.fullName) {
        newErrors.fullName = 'El nombre completo es requerido';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        console.log('🔐 Iniciando login con:', formData.email);
        await signIn(formData.email, formData.password);
        console.log('✅ Login exitoso');
        toast({
          title: '¡Bienvenido!',
          description: 'Has iniciado sesión exitosamente',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // Navegar al dashboard después del login exitoso
        navigate('/admin/default?view=dashboard');
      } else {
        // Para registro, por ahora solo mostrar mensaje
        toast({
          title: 'Registro',
          description: 'Funcionalidad de registro en desarrollo',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      toast({
        title: 'Error',
        description: error.message || 'Ocurrió un error inesperado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar cambios en los campos
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Mostrar loading durante autenticación
  if (isLoading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">
            {isLogin ? 'Iniciando sesión...' : 'Procesando...'}
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box
      bg={bg}
      p={8}
      borderRadius="xl"
      boxShadow="2xl"
      border="1px solid"
      borderColor={borderColor}
      w="full"
      maxW="md"
      mx="auto"
    >
      <VStack spacing={6} as="form" onSubmit={handleSubmit}>
        {/* Header */}
        <VStack spacing={2}>
          <Heading size="lg" textAlign="center">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </Heading>
          <Text color="gray.600" textAlign="center" fontSize="sm">
            {isLogin 
              ? 'Accede a tu dashboard optimizado' 
              : 'Únete a nuestra plataforma'
            }
          </Text>
        </VStack>

        {/* Campo de Nombre Completo (solo para registro) */}
        {!isLogin && (
          <FormControl isInvalid={!!errors.fullName}>
            <FormLabel>Nombre Completo</FormLabel>
            <InputGroup>
              <Input
                placeholder="Tu nombre completo"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                bg={inputBg}
                border="none"
                _focus={{ bg: 'white', boxShadow: 'md' }}
              />
            </InputGroup>
            <FormErrorMessage>{errors.fullName}</FormErrorMessage>
          </FormControl>
        )}

        {/* Campo de Email */}
        <FormControl isInvalid={!!errors.email}>
          <FormLabel>Email</FormLabel>
          <InputGroup>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              bg={inputBg}
              border="none"
              _focus={{ bg: 'white', boxShadow: 'md' }}
            />
            <InputRightElement>
              <EmailIcon color="gray.400" />
            </InputRightElement>
          </InputGroup>
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>

        {/* Campo de Contraseña */}
        <FormControl isInvalid={!!errors.password}>
          <FormLabel>Contraseña</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Tu contraseña"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              bg={inputBg}
              border="none"
              _focus={{ bg: 'white', boxShadow: 'md' }}
              autoComplete="current-password"
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
          <FormErrorMessage>{errors.password}</FormErrorMessage>
        </FormControl>

        {/* Campo de Confirmar Contraseña (solo para registro) */}
        {!isLogin && (
          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel>Confirmar Contraseña</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                bg={inputBg}
                border="none"
                _focus={{ bg: 'white', boxShadow: 'md' }}
                autoComplete="new-password"
              />
              <InputRightElement>
                <LockIcon color="gray.400" />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
          </FormControl>
        )}

        {/* Recordar sesión */}
        {isLogin && (
          <HStack justify="space-between" w="full">
            <Checkbox
              isChecked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              colorScheme="blue"
            >
              <Text fontSize="sm">Recordar sesión</Text>
            </Checkbox>
          </HStack>
        )}

        {/* Botón de Submit */}
        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          w="full"
          isLoading={isLoading}
          loadingText={isLogin ? 'Iniciando sesión...' : 'Procesando...'}
        >
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Button>

        {/* Divider */}
        <HStack w="full">
          <Divider />
          <Text fontSize="sm" color="gray.500" px={3}>
            o
          </Text>
          <Divider />
        </HStack>

        
      </VStack>
    </Box>
  );
}

export default LoginForm;