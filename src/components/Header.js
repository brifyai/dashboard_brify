import React, { useState, useEffect } from 'react';
import { Box, Flex, Text, useColorModeValue, Avatar, HStack, Menu, MenuButton, MenuList, MenuItem, Icon, useToast } from '@chakra-ui/react';
import { MdLogout, MdPerson, MdSettings } from 'react-icons/md';
import { supabase } from '../config/supabase';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthFixed as useAuth } from '../hooks/useAuthFixed';
import { useNavigate } from 'react-router-dom';

function Header() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [displayText, setDisplayText] = useState('Panel de Control');

  // Obtener nombre del usuario desde la tabla users
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) {
        setDisplayText('Panel de Control');
        return;
      }

      try {
        console.log('🔍 Obteniendo nombre del usuario desde BD...', user.id);
        
        let query = supabase
          .from('users')
          .select('name');
        
        // Si el ID parece UUID (Supabase Auth), buscar por email
        if (user.id && typeof user.id === 'string' && user.id.includes('-')) {
          console.log('🔍 Usuario de Supabase Auth, buscando por email...');
          query = query.eq('email', user.email);
        } else {
          // Si es BIGINT (tabla users), buscar por ID
          console.log('🔍 Usuario de tabla users, buscando por ID...');
          query = query.eq('id', user.id);
        }
        
        const { data, error } = await query.single();

        if (error) {
          console.error('❌ Error obteniendo nombre:', error.message);
          // Fallback a metadata si no hay nombre en BD
          const fallbackName = user?.user_metadata?.full_name || user?.name || '';
          setDisplayText(fallbackName || 'Panel de Control');
          return;
        }

        if (data && data.name) {
          console.log('✅ Nombre obtenido desde BD:', data.name);
          setDisplayText(data.name);
        } else {
          console.log('⚠️ No hay nombre en BD, usando metadata');
          const fallbackName = user?.user_metadata?.full_name || user?.name || '';
          setDisplayText(fallbackName || 'Panel de Control');
        }
      } catch (error) {
        console.error('❌ Error general:', error.message);
        // Fallback a metadata
        const fallbackName = user?.user_metadata?.full_name || user?.name || '';
        setDisplayText(fallbackName || 'Panel de Control');
      }
    };

    fetchUserName();
  }, [user]);

  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando cierre de sesión...');
      console.log('👤 Usuario actual:', user?.email);
      
      // Verificar si hay un usuario autenticado
      if (!user) {
        console.log('⚠️ No hay usuario autenticado, redirigiendo al login');
        navigate('/auth/sign-in');
        return;
      }
      
      // Intentar cierre de sesión con manejo robusto
      let signOutResult;
      try {
        signOutResult = await signOut();
        console.log('✅ Resultado del cierre de sesión:', signOutResult);
      } catch (signOutError) {
        console.error('❌ Error en signOut:', signOutError);
        
        // Si el error es de Supabase, intentar cierre forzado
        if (signOutError.message?.includes('supabase') || signOutError.code) {
          console.log('🔄 Intentando cierre de sesión alternativo...');
          try {
            await supabase.auth.signOut();
            console.log('✅ Cierre alternativo exitoso');
          } catch (altError) {
            console.error('❌ Error en cierre alternativo:', altError);
            throw signOutError; // Lanzar el error original
          }
        } else {
          throw signOutError;
        }
      }
      
      // Limpiar caché y datos locales
      console.log('🧹 Limpiando caché y datos locales...');
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      
      // Mostrar notificación de éxito
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirigir con un pequeño delay para procesar el cierre
      console.log('🔄 Redirigiendo al login...');
      setTimeout(() => {
        // Forzar la redirección incluso si hay errores
        window.location.href = '/auth/sign-in';
      }, 300);
      
    } catch (error) {
      console.error('❌ Error crítico al cerrar sesión:', error);
      console.error('📄 Detalles completos:', {
        message: error.message,
        code: error.code,
        name: error.name,
        stack: error.stack,
        user: user?.email
      });
      
      // Intentar limpieza de todos modos
      try {
        queryClient.clear();
        localStorage.clear();
        sessionStorage.clear();
      } catch (cleanupError) {
        console.error('❌ Error al limpiar datos:', cleanupError);
      }
      
      // Determinar mensaje de error específico
      let userFriendlyMessage = 'Error al cerrar sesión';
      
      if (error.code === 'JWT_EXPIRED') {
        userFriendlyMessage = 'Tu sesión ha expirado. Redirigiendo al login...';
      } else if (error.code === 'NETWORK_ERROR') {
        userFriendlyMessage = 'Error de conexión. Serás redirigido al login...';
      } else if (error.message?.includes('session')) {
        userFriendlyMessage = 'Problema con la sesión. Serás redirigido al login...';
      } else if (error.message) {
        userFriendlyMessage = `${error.message}. Serás redirigido al login...`;
      }
      
      // Mostrar notificación de error pero intentar redirigir de todos modos
      toast({
        title: 'Error al cerrar sesión',
        description: userFriendlyMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Intentar redirigir incluso con error
      setTimeout(() => {
        window.location.href = '/auth/sign-in';
      }, 1000);
    }
  };

  const handleProfile = () => {
    navigate('/admin/profile');
  };

  const handleSettings = () => {
    navigate('/admin/settings');
  };
  
  return (
    <Box
      bg={bg}
      borderBottom="1px solid"
      borderColor={borderColor}
      px="6"
      py="4"
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Flex justify="space-between" align="center">
        <Box 
          pt="8px"
          style={{
            transform: 'translateY(5px)',
            marginTop: '5px',
            paddingTop: '5px'
          }}
        >
          <Text 
            fontSize="lg" 
            fontWeight="bold" 
            color="blue.600"
            style={{
              marginTop: '5px',
              paddingTop: '5px',
              marginLeft: '3px',
              transform: 'translateY(5px)',
              display: 'block',
              lineHeight: '1.2'
            }}
          >
            {displayText === 'Panel de Control' ? displayText : `Bienvenido ${displayText}`}
          </Text>
        </Box>
        
        <HStack spacing="4">
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                name={user?.user_metadata?.full_name || 'User'}
                cursor="pointer"
                _hover={{ opacity: 0.8 }}
              />
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Icon as={MdPerson} />} onClick={handleProfile}>
                Mi Perfil
              </MenuItem>
              <MenuItem icon={<Icon as={MdSettings} />} onClick={handleSettings}>
                Configuración
              </MenuItem>
              <MenuItem icon={<Icon as={MdLogout} />} onClick={handleLogout} color="red.500">
                Cerrar Sesión
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;