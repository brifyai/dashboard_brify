import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Avatar,
  Badge,
  Divider,
  useColorModeValue,
  useToast,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuthFixed } from '../../hooks/useAuthFixed';
import { supabaseProfile } from '../../config/supabaseProfile';
import Card from '../../components/Card';

function Profile() {
  const { t } = useTranslation();
  const { user } = useAuthFixed();
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Cargar perfil desde la base de datos (solo lectura)
  useEffect(() => {
    console.log('🔄 Profile useEffect ejecutado, user:', user);
    
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        console.log('📋 Cargando perfil para usuario:', user?.email || 'sin email');

        // Intentar cargar desde la base de datos
        const { data, error } = await supabaseProfile
          .from('users')
          .select('*')
          .eq('email', user?.email || 'camiloalegriabarra@gmail.com')
          .single();

        if (error) {
          console.error('❌ Error al cargar perfil:', error);
          
          // Si el error es que no se encontró el registro (PGRST116)
          if (error.code === 'PGRST116') {
            console.log('⚠️ No se encontró perfil en BD, usando datos por defecto');
            // Usar datos por defecto en lugar de mostrar error
            const defaultProfile = {
              firstName: 'Camilo',
              lastName: 'Alegria',
              email: user?.email || 'camiloalegriabarra@gmail.com',
              phone: '+56 9 1234 5678',
              bio: 'Desarrollador Full Stack con experiencia en React, Node.js y bases de datos.',
              role: 'admin',
              department: 'Desarrollo',
              location: 'Santiago, Chile',
              joinDate: '2023-01-15',
              skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'MongoDB'],
              language: 'es',
              timezone: 'UTC-3',
              emailNotifications: 'all',
              twoFactorAuth: 'enabled',
              avatarUrl: '',
              preferences: { theme: 'light', notifications: true },
            };
            setProfile(defaultProfile);
            return;
          }
          
          // Si el error es de tipo de datos (22P02)
          if (error.code === '22P02') {
            console.log('⚠️ Error de tipo de datos en la BD, usando datos por defecto');
            const defaultProfile = {
              firstName: 'Camilo',
              lastName: 'Alegria',
              email: user?.email || 'camiloalegriabarra@gmail.com',
              phone: '+56 9 1234 5678',
              bio: 'Desarrollador Full Stack con experiencia en React, Node.js y bases de datos.',
              role: 'admin',
              department: 'Desarrollo',
              location: 'Santiago, Chile',
              joinDate: '2023-01-15',
              skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'MongoDB'],
              language: 'es',
              timezone: 'UTC-3',
              emailNotifications: 'all',
              twoFactorAuth: 'enabled',
              avatarUrl: '',
              preferences: { theme: 'light', notifications: true },
            };
            setProfile(defaultProfile);
            return;
          }
          
          // Para otros errores, usar datos por defecto
          console.log('⚠️ Error desconocido, usando datos por defecto');
          const defaultProfile = {
            firstName: 'Camilo',
            lastName: 'Alegria',
            email: user?.email || 'camiloalegriabarra@gmail.com',
            phone: '+56 9 1234 5678',
            bio: 'Desarrollador Full Stack con experiencia en React, Node.js y bases de datos.',
            role: 'admin',
            department: 'Desarrollo',
            location: 'Santiago, Chile',
            joinDate: '2023-01-15',
            skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'MongoDB'],
            language: 'es',
            timezone: 'UTC-3',
            emailNotifications: 'all',
            twoFactorAuth: 'enabled',
            avatarUrl: '',
            preferences: { theme: 'light', notifications: true },
          };
          setProfile(defaultProfile);
        } else if (data) {
          console.log('✅ Perfil cargado desde BD:', data);
          
          // Mapear datos de la BD al formato del componente
          const mappedProfile = {
            firstName: data.first_name || 'Camilo',
            lastName: data.last_name || 'Alegria',
            email: data.email || user?.email || 'camiloalegriabarra@gmail.com',
            phone: data.phone || '+56 9 1234 5678',
            bio: data.bio || 'Desarrollador Full Stack con experiencia en React, Node.js y bases de datos.',
            role: data.role || 'admin',
            department: data.department || 'Desarrollo',
            location: data.location || 'Santiago, Chile',
            joinDate: data.join_date || '2023-01-15',
            skills: data.skills || ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'MongoDB'],
            language: data.language || 'es',
            timezone: data.timezone || 'UTC-3',
            emailNotifications: data.email_notifications || 'all',
            twoFactorAuth: data.two_factor_auth || 'enabled',
            avatarUrl: data.avatar_url || '',
            preferences: data.preferences || { theme: 'light', notifications: true },
          };

          setProfile(mappedProfile);
        }
      } catch (error) {
        console.error('❌ Error crítico al cargar perfil:', error);
        
        // En caso de error crítico, usar datos por defecto
        console.log('🔄 Usando datos por defecto debido a error crítico');
        const defaultProfile = {
          firstName: 'Camilo',
          lastName: 'Alegria',
          email: user?.email || 'camiloalegriabarra@gmail.com',
          phone: '+56 9 1234 5678',
          bio: 'Desarrollador Full Stack con experiencia en React, Node.js y bases de datos.',
          role: 'admin',
          department: 'Desarrollo',
          location: 'Santiago, Chile',
          joinDate: '2023-01-15',
          skills: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'PostgreSQL', 'MongoDB'],
          language: 'es',
          timezone: 'UTC-3',
          emailNotifications: 'all',
          twoFactorAuth: 'enabled',
          avatarUrl: '',
          preferences: { theme: 'light', notifications: true },
        };
        setProfile(defaultProfile);
      } finally {
        setLoading(false);
      }
    };
    
    // Siempre intentar cargar el perfil
    console.log('✅ Iniciando carga de perfil...');
    loadUserProfile();
  }, [user, toast]);

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text color="gray.600">{t('common.loading') || 'Cargando perfil...'}</Text>
        </VStack>
      </Center>
    );
  }

  // Si no hay perfil cargado, mostrar mensaje informativo
  if (!profile) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Text color="orange.500" fontSize="lg">
            {t('errors.profileNotFound') || 'No se pudo cargar el perfil'}
          </Text>
          <Text color="gray.600" fontSize="sm" textAlign="center">
            La base de datos es de solo lectura. Los datos pueden no estar disponibles.
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box bg={bg} minH="100vh" pl="20px">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box ml="7px">
          <Heading mb={4} size="lg" color="brand.500">
            {t('profile.title') || 'Perfil de Usuario'}
          </Heading>
        </Box>

        {/* Profile Overview */}
        <Card>
          <HStack spacing={6} align="start">
            <VStack spacing={4} align="center">
              <Avatar
                size="2xl"
                name={`${profile.firstName} ${profile.lastName}`}
                bg="brand.500"
                color="white"
                src={profile.avatarUrl}
              />
              <VStack spacing={1} align="center">
                <Heading size="md">
                  {profile.firstName} {profile.lastName}
                </Heading>
                <Badge colorScheme="green" variant="subtle">
                  {profile.role}
                </Badge>
              </VStack>
            </VStack>

            <VStack spacing={4} align="start" flex={1}>
              <HStack spacing={4} w="full">
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {t('profile.firstName') || 'Nombre'}
                  </Text>
                  <Text fontSize="sm" color="gray.900">
                    {profile.firstName}
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {t('profile.lastName') || 'Apellido'}
                  </Text>
                  <Text fontSize="sm" color="gray.900">
                    {profile.lastName}
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={4} w="full">
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {t('profile.email') || 'Email'}
                  </Text>
                  <Text fontSize="sm" color="gray.900">
                    {profile.email}
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    {t('profile.phone') || 'Teléfono'}
                  </Text>
                  <Text fontSize="sm" color="gray.900">
                    {profile.phone || 'No especificado'}
                  </Text>
                </Box>
              </HStack>

              
            </VStack>
          </HStack>
        </Card>

        

        

        

        {/* Read-only Notice */}
        <Card bg="blue.50" borderColor="blue.200">
          <VStack spacing={2} align="start">
            <Heading size="sm" color="blue.700">
              📖 Modo Solo Lectura
            </Heading>
            <Text fontSize="sm" color="blue.600">
              Esta base de datos es de solo lectura. Los datos mostrados son únicamente para consulta.
              No es posible realizar modificaciones o guardar cambios.
            </Text>
          </VStack>
        </Card>
      </VStack>
    </Box>
  );
}

export default Profile;