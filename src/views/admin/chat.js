import React, { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Badge,
  useColorModeValue,
  useToast,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
} from '@chakra-ui/react';
import {
  MdSend,
  MdAttachFile,
  MdEmojiEmotions,
  MdMoreVert,
  MdSearch,
  MdVideoCall,
  MdPhone,
  MdInfo,
  MdBlock,
  MdDelete,
  MdVolumeOff,
  MdVolumeUp,
} from 'react-icons/md';

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();
  // eslint-disable-next-line no-unused-vars

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const messageBg = useColorModeValue('blue.50', 'blue.900');
  const receivedMessageBg = useColorModeValue('gray.100', 'gray.700');

  useEffect(() => {
    // Cargar conversaciones de ejemplo
    const conversacionesEjemplo = [
      {
        id: 1,
        name: 'Juan Pérez',
        avatar: 'https://via.placeholder.com/40/4CAF50/FFFFFF?text=JP',
        lastMessage: 'Perfecto, nos vemos mañana a las 3',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        unread: 2,
        online: true,
        lastSeen: new Date(),
      },
      {
        id: 2,
        name: 'María García',
        avatar: 'https://via.placeholder.com/40/2196F3/FFFFFF?text=MG',
        lastMessage: 'Gracias por la información',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        unread: 0,
        online: false,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 3,
        name: 'Equipo de Desarrollo',
        avatar: 'https://via.placeholder.com/40/9C27B0/FFFFFF?text=ED',
        lastMessage: 'Nueva actualización disponible',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        unread: 5,
        online: true,
        lastSeen: new Date(),
        isGroup: true,
      },
      {
        id: 4,
        name: 'Carlos Rodríguez',
        avatar: 'https://via.placeholder.com/40/FF9800/FFFFFF?text=CR',
        lastMessage: '¿Podemos reprogramar la reunión?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unread: 0,
        online: true,
        lastSeen: new Date(),
      },
    ];
    setConversations(conversacionesEjemplo);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Cargar mensajes de la conversación seleccionada
      const mensajesEjemplo = [
        {
          id: 1,
          text: 'Hola, ¿cómo estás?',
          sender: 'them',
          timestamp: new Date(Date.now() - 60 * 60 * 1000),
          status: 'read',
        },
        {
          id: 2,
          text: '¡Muy bien! ¿Y tú?',
          sender: 'me',
          timestamp: new Date(Date.now() - 55 * 60 * 1000),
          status: 'read',
        },
        {
          id: 3,
          text: 'Todo bien por aquí. ¿Listo para la reunión de mañana?',
          sender: 'them',
          timestamp: new Date(Date.now() - 50 * 60 * 1000),
          status: 'read',
        },
        {
          id: 4,
          text: 'Sí, tengo todo preparado. ¿A qué hora era?',
          sender: 'me',
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          status: 'read',
        },
        {
          id: 5,
          text: 'A las 3 de la tarde en la sala de conferencias',
          sender: 'them',
          timestamp: new Date(Date.now() - 40 * 60 * 1000),
          status: 'read',
        },
        {
          id: 6,
          text: 'Perfecto, nos vemos mañana a las 3',
          sender: 'me',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          status: 'delivered',
        },
      ];
      setMessages(mensajesEjemplo);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastSeen = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'En línea';
    if (diffInMinutes < 60) return `Última vez hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Última vez hace ${diffInHours}h`;
    
    return `Última vez ${date.toLocaleDateString('es-ES')}`;
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        timestamp: new Date(),
        status: 'sent',
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Marcar conversación como leída
      setConversations(conversations.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, unread: 0, lastMessage: newMessage, timestamp: new Date() }
          : conv
      ));

      // Simular respuesta
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          const response = {
            id: Date.now() + 1,
            text: 'Gracias por tu mensaje. Te respondo enseguida.',
            sender: 'them',
            timestamp: new Date(),
            status: 'read',
          };
          setMessages(prev => [...prev, response]);
          setIsTyping(false);
        }, 2000);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading mb={4} size="lg" color="brand.500">
            Mensajería
          </Heading>
          <Text color="gray.600">
            Chatea con tus contactos y equipo
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6} h="70vh">
          {/* Lista de Conversaciones */}
          <Card h="full">
            <CardBody p={0} h="full">
              <VStack h="full" align="stretch" spacing={0}>
                {/* Búsqueda */}
                <Box p={4} borderBottomWidth="1px" borderColor="gray.200">
                  <InputGroup>
                    <Input
                      placeholder="Buscar conversaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="sm"
                    />
                    <InputRightElement>
                      <IconButton
                        icon={<MdSearch />}
                        size="xs"
                        variant="ghost"
                        aria-label="Buscar"
                      />
                    </InputRightElement>
                  </InputGroup>
                </Box>

                {/* Lista de Conversaciones */}
                <VStack
                  flex={1}
                  overflowY="auto"
                  spacing={0}
                  align="stretch"
                >
                  {filteredConversations.map((conversation) => (
                    <Box
                      key={conversation.id}
                      p={4}
                      cursor="pointer"
                      bg={selectedConversation?.id === conversation.id ? 'blue.50' : 'transparent'}
                      borderLeftWidth={selectedConversation?.id === conversation.id ? '4px' : '0'}
                      borderLeftColor="brand.500"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => setSelectedConversation(conversation)}
                      transition="all 0.2s"
                    >
                      <HStack spacing={3}>
                        <Box position="relative">
                          <Avatar
                            size="md"
                            src={conversation.avatar}
                            name={conversation.name}
                          />
                          {conversation.online && (
                            <Box
                              position="absolute"
                              bottom="0"
                              right="0"
                              w="12px"
                              h="12px"
                              bg="green.500"
                              borderRadius="full"
                              border="2px solid"
                              borderColor={cardBg}
                            />
                          )}
                        </Box>
                        
                        <VStack flex={1} align="start" spacing={1}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="medium" fontSize="sm">
                              {conversation.name}
                              {conversation.isGroup && (
                                <Badge ml={2} size="sm" variant="subtle">
                                  Grupo
                                </Badge>
                              )}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {formatTime(conversation.timestamp)}
                            </Text>
                          </HStack>
                          
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {conversation.lastMessage}
                          </Text>
                          
                          {conversation.unread > 0 && (
                            <Badge colorScheme="blue" variant="solid" size="sm">
                              {conversation.unread}
                            </Badge>
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Área de Chat */}
          <Card gridColumn={{ lg: 'span 2' }} h="full">
            <CardBody p={0} h="full">
              {selectedConversation ? (
                <VStack h="full" align="stretch" spacing={0}>
                  {/* Header del Chat */}
                  <HStack
                    p={4}
                    borderBottomWidth="1px"
                    borderColor="gray.200"
                    justify="space-between"
                  >
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        src={selectedConversation.avatar}
                        name={selectedConversation.name}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">
                          {selectedConversation.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {selectedConversation.online 
                            ? 'En línea' 
                            : formatLastSeen(selectedConversation.lastSeen)
                          }
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <HStack spacing={2}>
                      <Tooltip label="Videollamada">
                        <IconButton
                          icon={<MdVideoCall />}
                          size="sm"
                          variant="ghost"
                          aria-label="Videollamada"
                        />
                      </Tooltip>
                      <Tooltip label="Llamada">
                        <IconButton
                          icon={<MdPhone />}
                          size="sm"
                          variant="ghost"
                          aria-label="Llamada"
                        />
                      </Tooltip>
                      <Tooltip label={isMuted ? 'Activar sonido' : 'Silenciar'}>
                        <IconButton
                          icon={isMuted ? <MdVolumeOff /> : <MdVolumeUp />}
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsMuted(!isMuted)}
                          aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                        />
                      </Tooltip>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<MdMoreVert />}
                          size="sm"
                          variant="ghost"
                          aria-label="Más opciones"
                        />
                        <MenuList>
                          <MenuItem icon={<MdInfo />}>
                            Ver información
                          </MenuItem>
                          <MenuItem icon={<MdBlock />}>
                            Bloquear contacto
                          </MenuItem>
                          <MenuItem icon={<MdDelete />} color="red.500">
                            Eliminar conversación
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </HStack>
                  </HStack>

                  {/* Mensajes */}
                  <VStack
                    flex={1}
                    overflowY="auto"
                    p={4}
                    spacing={4}
                    align="stretch"
                  >
                    {messages.map((message) => (
                      <VStack
                        key={message.id}
                        align={message.sender === 'me' ? 'end' : 'start'}
                        spacing={1}
                      >
                        <Box
                          maxW="70%"
                          bg={message.sender === 'me' ? messageBg : receivedMessageBg}
                          p={3}
                          borderRadius="lg"
                          borderTopRightRadius={message.sender === 'me' ? '0' : 'lg'}
                          borderTopLeftRadius={message.sender === 'me' ? 'lg' : '0'}
                        >
                          <Text fontSize="sm">{message.text}</Text>
                        </Box>
                        <HStack spacing={2} fontSize="xs" color="gray.500">
                          <Text>{formatTime(message.timestamp)}</Text>
                          {message.sender === 'me' && (
                            <Text>
                              {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓' : '✓'}
                            </Text>
                          )}
                        </HStack>
                      </VStack>
                    ))}
                    
                    {isTyping && (
                      <VStack align="start" spacing={1}>
                        <Box
                          bg={receivedMessageBg}
                          p={3}
                          borderRadius="lg"
                          borderTopLeftRadius="0"
                        >
                          <HStack spacing={1}>
                            <Text fontSize="sm">Escribiendo</Text>
                            <HStack spacing={1}>
                              <Box w="2px" h="2px" bg="gray.400" borderRadius="full" animation="pulse 1s infinite" />
                              <Box w="2px" h="2px" bg="gray.400" borderRadius="full" animation="pulse 1s infinite 0.2s" />
                              <Box w="2px" h="2px" bg="gray.400" borderRadius="full" animation="pulse 1s infinite 0.4s" />
                            </HStack>
                          </HStack>
                        </Box>
                      </VStack>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </VStack>

                  {/* Input de Mensaje */}
                  <VStack
                    p={4}
                    borderTopWidth="1px"
                    borderColor="gray.200"
                    spacing={3}
                  >
                    <HStack spacing={2}>
                      <Tooltip label="Adjuntar archivo">
                        <IconButton
                          icon={<MdAttachFile />}
                          size="sm"
                          variant="ghost"
                          aria-label="Adjuntar archivo"
                        />
                      </Tooltip>
                      <Input
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        size="sm"
                        flex={1}
                      />
                      <Tooltip label="Añadir emoji">
                        <IconButton
                          icon={<MdEmojiEmotions />}
                          size="sm"
                          variant="ghost"
                          aria-label="Añadir emoji"
                        />
                      </Tooltip>
                      <Button
                        leftIcon={<MdSend />}
                        onClick={sendMessage}
                        colorScheme="brand"
                        size="sm"
                        isDisabled={!newMessage.trim()}
                      >
                        Enviar
                      </Button>
                    </HStack>
                  </VStack>
                </VStack>
              ) : (
                <VStack h="full" justify="center" spacing={4}>
                  <Icon
                    as={MdSend}
                    w={16}
                    h={16}
                    color="gray.300"
                  />
                  <Text color="gray.500" textAlign="center">
                    Selecciona una conversación para comenzar a chatear
                  </Text>
                  <Text color="gray.400" fontSize="sm" textAlign="center">
                    Tus mensajes aparecerán aquí
                  </Text>
                </VStack>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Box>
  );
}

export default Chat;