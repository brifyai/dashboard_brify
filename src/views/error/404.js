import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdHome, MdArrowBack, MdErrorOutline } from 'react-icons/md';
import Card from '../../components/Card';

function Error404() {
  const navigate = useNavigate();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      minH="100vh"
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Card maxW="lg" w="full" textAlign="center" className="fade-in">
        <VStack spacing={8} py={12}>
          {/* Error Icon */}
          <Box
            fontSize="8xl"
            color="brand.500"
            animation="pulse 2s infinite"
            className="error-icon"
          >
            <Icon as={MdErrorOutline} />
          </Box>

          {/* Error Code */}
          <VStack spacing={2}>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, brand.500, brand.600)"
              bgClip="text"
              fontWeight="bold"
            >
              404
            </Heading>
            <Heading size="lg" color="gray.700">
              Página No Encontrada
            </Heading>
          </VStack>

          {/* Error Message */}
          <VStack spacing={4} maxW="md">
            <Text fontSize="lg" color={textColor}>
              ¡Ups! La página que buscas no existe.
            </Text>
            <Text fontSize="md" color={textColor}>
              Puede que haya sido movida, eliminada, o hayas ingresado la URL incorrecta.
            </Text>
          </VStack>

          {/* Suggestions */}
          <VStack spacing={3} w="full" maxW="sm">
            <Text fontWeight="medium" color="gray.700">
              Prueba con esto en su lugar:
            </Text>
            <VStack spacing={2} w="full">
              <HStack spacing={2} fontSize="sm" color={textColor}>
                <Box w={2} h={2} bg="brand.500" borderRadius="full" />
                <Text>Revisa la URL por errores tipográficos</Text>
              </HStack>
              <HStack spacing={2} fontSize="sm" color={textColor}>
                <Box w={2} h={2} bg="brand.500" borderRadius="full" />
                <Text>Regresa a la página anterior</Text>
              </HStack>
              <HStack spacing={2} fontSize="sm" color={textColor}>
                <Box w={2} h={2} bg="brand.500" borderRadius="full" />
                <Text>Visita nuestra página principal</Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Action Buttons */}
          <HStack spacing={4} pt={4}>
            <Button
              colorScheme="brand"
              leftIcon={<MdArrowBack />}
              onClick={() => navigate(-1)}
              size="md"
              className="slide-up"
            >
              Regresar
            </Button>
            <Button
              variant="outline"
              leftIcon={<MdHome />}
              onClick={() => navigate('/admin/default')}
              size="md"
              className="slide-up"
            >
              Ir al Inicio
            </Button>
          </HStack>

          {/* Additional Help */}
          <VStack spacing={3} pt={6} borderTop="1px solid" borderColor="gray.200">
            <Text fontSize="sm" color={textColor}>
              ¿Necesitas más ayuda?
            </Text>
            <HStack spacing={4} fontSize="sm">
              <Text
                color="brand.500"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => window.open('mailto:support@horizon-ui.com')}
              >
                Contactar Soporte
              </Text>
              <Box w={1} h={1} bg="gray.400" borderRadius="full" />
              <Text
                color="brand.500"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => window.open('/docs', '_blank')}
              >
                Ver Documentación
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Card>

      {/* Animated Background Elements */}
      <Box
        position="absolute"
        top="10%"
        left="10%"
        w="100px"
        h="100px"
        bg="brand.100"
        borderRadius="full"
        opacity="0.3"
        animation="float 6s ease-in-out infinite"
        className="floating-element"
      />
      <Box
        position="absolute"
        bottom="20%"
        right="15%"
        w="150px"
        h="150px"
        bg="brand.200"
        borderRadius="full"
        opacity="0.2"
        animation="float 8s ease-in-out infinite reverse"
        className="floating-element"
      />
    </Box>
  );
}

export default Error404;