import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdNotificationsNone, MdCheckCircle, MdInfo, MdWarning, MdError } from 'react-icons/md';

function NotificationBell() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'New Feature Available',
      message: 'Check out the new dashboard analytics features',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Storage Limit',
      message: 'You are approaching your storage limit',
      time: '3 hours ago',
      read: true,
    },
    {
      id: 4,
      type: 'error',
      title: 'Payment Failed',
      message: 'Your last payment attempt was unsuccessful',
      time: '1 day ago',
      read: true,
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <MdCheckCircle color="#52c41a" />;
      case 'info':
        return <MdInfo color="#1890ff" />;
      case 'warning':
        return <MdWarning color="#faad14" />;
      case 'error':
        return <MdError color="#f5222d" />;
      default:
        return <MdInfo color="#1890ff" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            icon={<MdNotificationsNone size={20} />}
            variant="ghost"
            aria-label="Notifications"
            onClick={() => setIsOpen(!isOpen)}
            position="relative"
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-5px"
              right="-5px"
              fontSize="xs"
              minW="18px"
              h="18px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      <PopoverContent w="400px" bg={bg} borderColor={borderColor}>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader borderBottom="1px solid" borderColor={borderColor}>
          <HStack justify="space-between" align="center">
            <Text fontWeight="medium">Notifications</Text>
            <HStack spacing={2}>
              {unreadCount > 0 && (
                <Button size="xs" variant="ghost" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button size="xs" variant="ghost" onClick={clearAll}>
                  Clear all
                </Button>
              )}
            </HStack>
          </HStack>
        </PopoverHeader>
        <PopoverBody p={0}>
          {notifications.length === 0 ? (
            <VStack p={6} spacing={4} align="center">
              <MdNotificationsNone size={48} color="#d9d9d9" />
              <Text color="gray.500" textAlign="center">
                No notifications yet
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                When you have notifications, they'll appear here
              </Text>
            </VStack>
          ) : (
            <VStack spacing={0} maxH="400px" overflowY="auto">
              {notifications.map((notification, index) => (
                <Box
                  key={notification.id}
                  w="full"
                  p={4}
                  cursor="pointer"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => markAsRead(notification.id)}
                  bg={!notification.read ? 'blue.50' : 'transparent'}
                  borderLeft={!notification.read ? '3px solid' : 'none'}
                  borderLeftColor="brand.500"
                >
                  <HStack spacing={3} align="start">
                    <Box mt={1}>
                      {getIcon(notification.type)}
                    </Box>
                    <VStack spacing={1} align="start" flex={1}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="medium" fontSize="sm">
                          {notification.title}
                        </Text>
                        {!notification.read && (
                          <Box
                            w={2}
                            h={2}
                            borderRadius="full"
                            bg="brand.500"
                          />
                        )}
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {notification.message}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {notification.time}
                      </Text>
                    </VStack>
                  </HStack>
                  {index < notifications.length - 1 && (
                    <Divider mt={3} />
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;