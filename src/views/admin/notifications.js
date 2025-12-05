import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  useToast,
  SimpleGrid,
  Progress,
  Divider,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import {
  MdNotifications,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfo,
  MdDelete,
  MdMarkEmailRead,
  MdFilterList,
  MdSearch,
  MdSettings,
} from 'react-icons/md';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const tiposNotificacion = {
    success: { icon: MdCheckCircle, color: 'green.500', label: 'Éxito' },
    warning: { icon: MdWarning, color: 'orange.500', label: 'Advertencia' },
    error: { icon: MdError, color: 'red.500', label: 'Error' },
    info: { icon: MdInfo, color: 'blue.500', label: 'Información' },
  };

  const categoriasNotificacion = {
    system: 'Sistema',
    user: 'Usuario',
    security: 'Seguridad',
    update: 'Actualización',
    reminder: 'Recordatorio',
    marketing: 'Marketing',
  };

  useEffect(() => {
    // Simular carga de notificaciones
    setTimeout(() => {
      const notificacionesEjemplo = [
        {
          id: 1,
          title: 'Actualización completada',
          message: 'La actualización del sistema se ha completado exitosamente.',
          type: 'success',
          category: 'system',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          read: false,
          avatar: 'https://via.placeholder.com/40/4CAF50/FFFFFF?text=SC',
        },
        {
          id: 2,
          title: 'Nuevo inicio de sesión',
          message: 'Se detectó un inicio de sesión desde un nuevo dispositivo.',
          type: 'warning',
          category: 'security',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          read: false,
          avatar: 'https://via.placeholder.com/40/FF9800/FFFFFF?text=SG',
        },
        {
          id: 3,
          title: 'Error en la base de datos',
          message: 'Hubo un problema al conectar con la base de datos principal.',
          type: 'error',
          category: 'system',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          read: true,
          avatar: 'https://via.placeholder.com/40/F44336/FFFFFF?text=ER',
        },
        {
          id: 4,
          title: 'Recordatorio de reunión',
          message: 'Tienes una reunión programada para las 3:00 PM.',
          type: 'info',
          category: 'reminder',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          read: true,
          avatar: 'https://via.placeholder.com/40/2196F3/FFFFFF?text=RM',
        },
        {
          id: 5,
          title: 'Nueva función disponible',
          message: 'La función de exportación de datos ya está disponible.',
          type: 'info',
          category: 'update',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          read: true,
          avatar: 'https://via.placeholder.com/40/9C27B0/FFFFFF?text=UP',
        },
        {
          id: 6,
          title: 'Campaña de marketing',
          message: 'La nueva campaña de marketing ha generado un 25% más de conversiones.',
          type: 'success',
          category: 'marketing',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          read: true,
          avatar: 'https://via.placeholder.com/40/4CAF50/FFFFFF?text=MK',
        },
      ];
      setNotifications(notificacionesEjemplo);
      setLoading(false);
    }, 1000);
  }, []);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es-ES');
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    toast({
      title: 'Todas las notificaciones marcadas como leídas',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast({
      title: 'Notificación eliminada',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const clearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las notificaciones?')) {
      setNotifications([]);
      toast({
        title: 'Todas las notificaciones eliminadas',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' || notif.type === filter;
    const matchesSearch = searchTerm === '' || 
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    read: notifications.length - unreadCount,
    success: notifications.filter(n => n.type === 'success').length,
    warning: notifications.filter(n => n.type === 'warning').length,
    error: notifications.filter(n => n.type === 'error').length,
    info: notifications.filter(n => n.type === 'info').length,
  };

  if (loading) {
    return (
      <Box bg={bg} minH="100vh" p={6}>
        <VStack spacing={6} align="stretch">
          <Box>
            <Heading mb={4} size="lg" color="brand.500">
              Notificaciones
            </Heading>
            <Text color="gray.600">
              Gestiona tus notificaciones y alertas del sistema
            </Text>
          </Box>
          <Card>
            <CardBody>
              <VStack spacing={4}>
                <Progress size="xs" isIndeterminate colorScheme="brand" />
                <Text>Cargando notificaciones...</Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading mb={4} size="lg" color="brand.500">
            Notificaciones
          </Heading>
          <Text color="gray.600">
            Gestiona tus notificaciones y alertas del sistema
          </Text>
        </Box>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {stats.total}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Total
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {stats.unread}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  No leídas
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {stats.success}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Éxito
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="red.500">
                  {stats.error}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Errores
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Controles */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" wrap="wrap" spacing={4}>
                <HStack spacing={4} wrap="wrap">
                  <InputGroup maxW="300px">
                    <InputLeftElement pointerEvents="none">
                      <MdSearch />
                    </InputLeftElement>
                    <Input
                      placeholder="Buscar notificaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                  
                  <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    maxW="150px"
                  >
                    <option value="all">Todas</option>
                    <option value="success">Éxito</option>
                    <option value="warning">Advertencia</option>
                    <option value="error">Error</option>
                    <option value="info">Información</option>
                  </Select>
                </HStack>

                <Menu>
                  <MenuButton as={Button} leftIcon={<MdFilterList />} size="sm" variant="outline">
                    Acciones
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<MdMarkEmailRead />} onClick={markAllAsRead}>
                      Marcar todas como leídas
                    </MenuItem>
                    <MenuItem icon={<MdDelete />} onClick={clearAll}>
                      Limpiar todo
                    </MenuItem>
                    <MenuItem icon={<MdSettings />}>
                      Configuración
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>

              <Divider />

              {/* Notificaciones */}
              {filteredNotifications.length === 0 ? (
                <VStack py={8} spacing={4}>
                  <Box fontSize="4xl" color="gray.300">
                    <MdNotifications />
                  </Box>
                  <Text color="gray.500" textAlign="center">
                    {searchTerm || filter !== 'all' 
                      ? 'No se encontraron notificaciones con los filtros aplicados'
                      : 'No tienes notificaciones pendientes'
                    }
                  </Text>
                </VStack>
              ) : (
                <VStack spacing={3} align="stretch">
                  {filteredNotifications.map((notification) => {
                    const IconComponent = tiposNotificacion[notification.type].icon;
                    return (
                      <Card
                        key={notification.id}
                        variant={notification.read ? 'outline' : 'subtle'}
                        bg={notification.read ? cardBg : 'blue.50'}
                        borderColor={notification.read ? 'gray.200' : 'blue.200'}
                      >
                        <CardBody>
                          <HStack spacing={4} align="start">
                            <Avatar
                              size="sm"
                              src={notification.avatar}
                              icon={<IconComponent />}
                              bg={tiposNotificacion[notification.type].color + '.100'}
                              color={tiposNotificacion[notification.type].color}
                            />
                            
                            <VStack flex={1} align="start" spacing={2}>
                              <HStack justify="space-between" w="full">
                                <HStack spacing={2}>
                                  <Text fontWeight="medium" fontSize="sm">
                                    {notification.title}
                                  </Text>
                                  {!notification.read && (
                                    <Badge colorScheme="blue" variant="solid" size="sm">
                                      Nuevo
                                    </Badge>
                                  )}
                                </HStack>
                                <HStack spacing={1}>
                                  <Text fontSize="xs" color="gray.500">
                                    {formatTimeAgo(notification.timestamp)}
                                  </Text>
                                  <Menu>
                                    <MenuButton
                                      as={IconButton}
                                      icon={<MdFilterList />}
                                      size="xs"
                                      variant="ghost"
                                      aria-label="Opciones"
                                    />
                                    <MenuList>
                                      {!notification.read && (
                                        <MenuItem
                                          icon={<MdMarkEmailRead />}
                                          onClick={() => markAsRead(notification.id)}
                                        >
                                          Marcar como leída
                                        </MenuItem>
                                      )}
                                      <MenuItem
                                        icon={<MdDelete />}
                                        onClick={() => deleteNotification(notification.id)}
                                      >
                                        Eliminar
                                      </MenuItem>
                                    </MenuList>
                                  </Menu>
                                </HStack>
                              </HStack>
                              
                              <Text fontSize="sm" color="gray.600">
                                {notification.message}
                              </Text>
                              
                              <HStack spacing={2}>
                                <Badge
                                  colorScheme={notification.type}
                                  variant="subtle"
                                  size="sm"
                                >
                                  {tiposNotificacion[notification.type].label}
                                </Badge>
                                <Badge
                                  colorScheme="gray"
                                  variant="subtle"
                                  size="sm"
                                >
                                  {categoriasNotificacion[notification.category]}
                                </Badge>
                              </HStack>
                            </VStack>
                          </HStack>
                        </CardBody>
                      </Card>
                    );
                  })}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}

export default Notifications;