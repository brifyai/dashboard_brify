import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Button,
  Divider,
  Card,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { MdSave, MdRefresh, MdSecurity, MdNotifications, MdPalette, MdStorage, MdPeople, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import InputField from '../../components/InputField';
import { useTranslation } from '../../hooks/useTranslation';
import { supabase } from '../../config/supabase';

function Settings() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    siteName: 'Horizon UI Dashboard',
    siteDescription: 'Modern React Dashboard Template',
    timezone: 'UTC-8',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    security: {
      twoFactor: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
    },
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
      animations: true,
    },
    storage: {
      autoBackup: true,
      backupFrequency: 'daily',
      retention: 30,
    },
  });

  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  
  // Estados para gestión de usuarios
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  });
  const [editingUser, setEditingUser] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formLoading, setFormLoading] = useState(false);

  const handleSave = async (section) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast({
        title: 'Settings saved',
        description: `${section} settings have been updated successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const handleReset = (section) => {
    // Reset to default values
    toast({
      title: 'Settings reset',
      description: `${section} settings have been reset to default values.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Funciones para gestión de usuarios
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const createUser = async (userData) => {
    setFormLoading(true);
    try {
      // Generar un ID único numérico para el usuario (int8)
      const userId = Date.now();
      
      // Crear registro en la tabla users (sin autenticación por ahora)
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Usuario creado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchUsers(); // Recargar lista de usuarios
      return data[0];
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: `No se pudo crear el usuario: ${error.message}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const updateUser = async (userId, userData) => {
    setFormLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Usuario actualizado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchUsers(); // Recargar lista de usuarios
      return data[0];
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el usuario',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      // Eliminar de la tabla users primero
      const { error: dbError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (dbError) throw dbError;

      // Eliminar de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.warn('Error deleting auth user:', authError);
        // Continuar aunque falle la eliminación del auth user
      }

      toast({
        title: 'Éxito',
        description: 'Usuario eliminado exitosamente',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchUsers(); // Recargar lista de usuarios
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Cargar usuarios cuando se monta el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Box bg={bg} minH="100vh" pl="21px">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box ml="6px">
          <Heading mb={4} size="lg" color="brand.500">
            {t('settings.title') || 'Configuración'}
          </Heading>
          <Text color="gray.600">
            {t('settings.subtitle') || 'Gestiona tus preferencias y configuración de la aplicación'}
          </Text>
        </Box>

        {/* User Management Content */}
        <Card>
          <VStack spacing={6} align="start">
            <HStack justify="space-between" w="full">
              <Heading size="md">{t('settings.userManagement') || 'Gestión de Usuarios'}</Heading>
              <Button
                colorScheme="brand"
                leftIcon={<MdAdd />}
                onClick={() => {
                  setEditingUser(null);
                  setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'user',
                    status: 'active'
                  });
                  onOpen();
                }}
                size="sm"
              >
                {t('settings.addUser') || 'Agregar Usuario'}
              </Button>
            </HStack>

            {usersLoading ? (
              <HStack justify="center" w="full" py={8}>
                <Spinner size="lg" />
                <Text>{t('settings.loadingUsers') || 'Cargando usuarios...'}</Text>
              </HStack>
            ) : (
              <Box w="full" overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>{t('settings.name') || 'Nombre'}</Th>
                      <Th>{t('settings.email') || 'Email'}</Th>
                      <Th>{t('settings.role') || 'Rol'}</Th>
                      <Th>{t('settings.status') || 'Estado'}</Th>
                      <Th>{t('settings.createdAt') || 'Fecha Creación'}</Th>
                      <Th>{t('settings.actions') || 'Acciones'}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.id}>
                        <Td>
                          <Text fontWeight="medium">{user.name || 'Sin nombre'}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{user.email}</Text>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={user.role === 'admin' ? 'red' : user.role === 'moderator' ? 'yellow' : 'green'}
                            variant="subtle"
                          >
                            {user.role === 'admin' ? 'Admin' : user.role === 'moderator' ? 'Moderador' : 'Usuario'}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={user.status === 'active' ? 'green' : 'red'}
                            variant="subtle"
                          >
                            {user.status === 'active' ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(user.created_at).toLocaleDateString('es-ES')}
                          </Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme="blue"
                              icon={<MdEdit />}
                              onClick={() => {
                                setEditingUser(user);
                                setNewUser({
                                  name: user.name || '',
                                  email: user.email,
                                  password: '',
                                  role: user.role || 'user',
                                  status: user.status || 'active'
                                });
                                onOpen();
                              }}
                              aria-label={t('settings.editUser') || 'Editar usuario'}
                            />
                            <IconButton
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              icon={<MdDelete />}
                              onClick={() => {
                                if (window.confirm(t('settings.confirmDelete') || '¿Estás seguro de que deseas eliminar este usuario?')) {
                                  deleteUser(user.id);
                                }
                              }}
                              aria-label={t('settings.deleteUser') || 'Eliminar usuario'}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                {users.length === 0 && (
                  <Alert status="info" mt={4}>
                    <AlertIcon />
                    {t('settings.noUsers') || 'No hay usuarios registrados'}
                  </Alert>
                )}
              </Box>
            )}
          </VStack>
        </Card>

        {/* Modal para crear/editar usuario */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editingUser 
                ? (t('settings.editUser') || 'Editar Usuario')
                : (t('settings.addNewUser') || 'Agregar Nuevo Usuario')
              }
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <InputField
                  label={t('settings.name') || 'Nombre'}
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder={t('settings.enterName') || 'Ingresa el nombre'}
                  isRequired
                />
                <InputField
                  label={t('settings.email') || 'Email'}
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder={t('settings.enterEmail') || 'Ingresa el email'}
                  isRequired
                />
                {!editingUser && (
                  <InputField
                    label={t('settings.password') || 'Contraseña'}
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder={t('settings.enterPassword') || 'Ingresa la contraseña'}
                    isRequired
                  />
                )}
                <FormControl>
                  <FormLabel>{t('settings.role') || 'Rol'}</FormLabel>
                  <Select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    size="sm"
                  >
                    <option value="user">{t('settings.user') || 'Usuario'}</option>
                    <option value="moderator">{t('settings.moderator') || 'Moderador'}</option>
                    <option value="admin">{t('settings.admin') || 'Administrador'}</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>{t('settings.status') || 'Estado'}</FormLabel>
                  <Select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    size="sm"
                  >
                    <option value="active">{t('settings.active') || 'Activo'}</option>
                    <option value="inactive">{t('settings.inactive') || 'Inactivo'}</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                {t('settings.cancel') || 'Cancelar'}
              </Button>
              <Button
                colorScheme="brand"
                onClick={async () => {
                  try {
                    if (editingUser) {
                      await updateUser(editingUser.id, {
                        name: newUser.name,
                        email: newUser.email,
                        role: newUser.role,
                        status: newUser.status
                      });
                    } else {
                      await createUser(newUser);
                    }
                    onClose();
                  } catch (error) {
                    console.error('Error saving user:', error);
                  }
                }}
                isLoading={formLoading}
                isDisabled={!newUser.name || !newUser.email || (!editingUser && !newUser.password)}
              >
                {editingUser 
                  ? (t('settings.update') || 'Actualizar')
                  : (t('settings.create') || 'Crear')
                }
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}

export default Settings;