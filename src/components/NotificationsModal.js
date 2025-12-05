import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  IconButton,
  useToast,
  Divider,
  Avatar,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdNotifications,
  MdCheckCircle,
  MdWarning,
  MdError,
  MdInfo,
  MdDelete,
  MdDoneAll,
  MdRefresh,
} from 'react-icons/md';
import { useNotifications } from '../hooks/useNotifications';

function NotificationsModal({ isOpen, onClose }) {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();
  const toast = useToast();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <MdCheckCircle color="green" />;
      case 'warning':
        return <MdWarning color="orange" />;
      case 'error':
        return <MdError color="red" />;
      default:
        return <MdInfo color="blue" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'red';
      case 'high':
        return 'orange';
      case 'normal':
        return 'blue';
      case 'low':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
    toast({
      title: 'Notificación',
      description: 'Marcada como leída',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteNotification = async (notificationId) => {
    await deleteNotification(notificationId);
    toast({
      title: 'Notificación',
      description: 'Eliminada correctamente',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleRefresh = async () => {
    await fetchNotifications();
    toast({
      title: 'Notificaciones',
      description: 'Actualizadas correctamente',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays}d`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack justify="space-between">
            <HStack spacing={3}>
              <MdNotifications size={24} />
              <Text>Notificaciones</Text>
              {unreadCount > 0 && (
                <Badge colorScheme="red" borderRadius="full">
                  {unreadCount}
                </Badge>
              )}
            </HStack>
            <HStack spacing={2}>
              <Tooltip label="Actualizar">
                <IconButton
                  icon={<MdRefresh />}
                  size="sm"
                  variant="ghost"
                  onClick={handleRefresh}
                />
              </Tooltip>
              {unreadCount > 0 && (
                <Tooltip label="Marcar todas como leídas">
                  <Button
                    leftIcon={<MdDoneAll />}
                    size="sm"
                    variant="outline"
                    onClick={handleMarkAllAsRead}
                  >
                    Marcar todas
                  </Button>
                </Tooltip>
              )}
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {loading ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">Cargando notificaciones...</Text>
            </Box>
          ) : notifications.length === 0 ? (
            <Box textAlign="center" py={8}>
              <MdNotifications size={48} color="gray" />
              <Text color="gray.500" mt={4}>
                No hay notificaciones
              </Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {notifications.map((notification, index) => (
                <Box key={notification.id}>
                  <HStack
                    spacing={4}
                    p={4}
                    bg={notification.is_read ? 'transparent' : 'blue.50'}
                    borderLeft={notification.is_read ? 'none' : '4px solid'}
                    borderLeftColor="blue.500"
                    _hover={{ bg: 'gray.50' }}
                    cursor="pointer"
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <Avatar
                      size="sm"
                      icon={getNotificationIcon(notification.type)}
                      bg={notification.is_read ? 'gray.100' : 'blue.100'}
                    />
                    
                    <Box flex={1}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={2}>
                            <Text
                              fontWeight={notification.is_read ? 'normal' : 'bold'}
                              fontSize="sm"
                            >
                              {notification.title}
                            </Text>
                            <Badge
                              colorScheme={getPriorityColor(notification.priority)}
                              size="sm"
                            >
                              {notification.priority}
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="sm"
                            color="gray.600"
                            noOfLines={2}
                          >
                            {notification.message}
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="gray.500">
                              {formatDate(notification.created_at)}
                            </Text>
                            <Badge size="xs" variant="outline">
                              {notification.category}
                            </Badge>
                          </HStack>
                        </VStack>
                        
                        <VStack spacing={1}>
                          {!notification.is_read && (
                            <Box
                              w={2}
                              h={2}
                              bg="blue.500"
                              borderRadius="full"
                            />
                          )}
                          <Tooltip label="Eliminar">
                            <IconButton
                              icon={<MdDelete />}
                              size="xs"
                              variant="ghost"
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNotification(notification.id);
                              }}
                            />
                          </Tooltip>
                        </VStack>
                      </HStack>
                    </Box>
                  </HStack>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default NotificationsModal;