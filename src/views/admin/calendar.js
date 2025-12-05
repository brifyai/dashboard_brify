import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  IconButton,
  Card,
  CardBody,
  Badge,
  useColorModeValue,
  useToast,
  Input,
  Select,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
  Divider,
} from '@chakra-ui/react';
import {
  MdChevronLeft,
  MdChevronRight,
  MdToday,
  MdAdd,
  MdEdit,
  MdDelete,
  MdEvent,
} from 'react-icons/md';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'meeting',
    color: 'blue',
  });

  const toast = useToast();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const coloresEvento = {
    blue: 'blue.500',
    green: 'green.500',
    red: 'red.500',
    purple: 'purple.500',
    orange: 'orange.500',
    yellow: 'yellow.500',
  };

  const tiposEvento = {
    meeting: { label: 'Reunión', icon: '🤝' },
    reminder: { label: 'Recordatorio', icon: '⏰' },
    task: { label: 'Tarea', icon: '✅' },
    event: { label: 'Evento', icon: '📅' },
    deadline: { label: 'Fecha Límite', icon: '⏳' },
  };

  useEffect(() => {
    // Cargar eventos de ejemplo
    const eventosEjemplo = [
      {
        id: 1,
        title: 'Reunión de Equipo',
        description: 'Reunión semanal del equipo de desarrollo',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        type: 'meeting',
        color: 'blue',
      },
      {
        id: 2,
        title: 'Entrega de Proyecto',
        description: 'Fecha límite para la entrega del proyecto',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '23:59',
        type: 'deadline',
        color: 'red',
      },
      {
        id: 3,
        title: 'Revisión de Código',
        description: 'Revisión del código del nuevo módulo',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:00',
        type: 'task',
        color: 'green',
      },
    ];
    setEvents(eventosEjemplo);
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Días del mes siguiente
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: selectedDate.toISOString().split('T')[0],
      time: '',
      type: 'meeting',
      color: 'blue',
    });
    setIsModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      type: event.type,
      color: event.color,
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: 'Evento eliminado',
        description: 'El evento ha sido eliminado exitosamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un título para el evento.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editingEvent) {
      // Actualizar evento existente
      setEvents(events.map(event => 
        event.id === editingEvent.id 
          ? { ...newEvent, id: editingEvent.id }
          : event
      ));
      toast({
        title: 'Evento actualizado',
        description: 'El evento ha sido actualizado exitosamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Crear nuevo evento
      const event = {
        ...newEvent,
        id: Date.now(),
      };
      setEvents([...events, event]);
      toast({
        title: 'Evento creado',
        description: 'El evento ha sido creado exitosamente.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }

    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading mb={4} size="lg" color="brand.500">
            Calendario
          </Heading>
          <Text color="gray.600">
            Gestiona tus eventos y actividades
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Calendario Principal */}
          <Card gridColumn={{ lg: 'span 2' }}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Controles del Calendario */}
                <HStack justify="space-between" align="center">
                  <HStack spacing={2}>
                    <IconButton
                      icon={<MdChevronLeft />}
                      onClick={() => navigateMonth(-1)}
                      size="sm"
                      aria-label="Mes anterior"
                    />
                    <IconButton
                      icon={<MdChevronRight />}
                      onClick={() => navigateMonth(1)}
                      size="sm"
                      aria-label="Mes siguiente"
                    />
                    <Button
                      leftIcon={<MdToday />}
                      onClick={goToToday}
                      size="sm"
                      variant="outline"
                    >
                      Hoy
                    </Button>
                  </HStack>
                  <Heading size="md" textAlign="center">
                    {meses[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </Heading>
                  <Button
                    leftIcon={<MdAdd />}
                    onClick={handleAddEvent}
                    colorScheme="brand"
                    size="sm"
                  >
                    Añadir Evento
                  </Button>
                </HStack>

                <Divider />

                {/* Días de la semana */}
                <SimpleGrid columns={7} spacing={1}>
                  {diasSemana.map((dia) => (
                    <Box key={dia} textAlign="center" py={2}>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600">
                        {dia}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>

                {/* Días del mes */}
                <SimpleGrid columns={7} spacing={1}>
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    return (
                      <Box
                        key={index}
                        minH="80px"
                        p={2}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        cursor="pointer"
                        bg={isSelected(day.date) ? 'brand.50' : day.isCurrentMonth ? cardBg : 'gray.50'}
                        _hover={{ bg: 'brand.100' }}
                        onClick={() => handleDateClick(day.date)}
                        position="relative"
                      >
                        <VStack align="start" spacing={1} h="full">
                          <Text
                            fontSize="sm"
                            fontWeight={isToday(day.date) ? 'bold' : 'normal'}
                            color={!day.isCurrentMonth ? 'gray.400' : isToday(day.date) ? 'brand.500' : 'inherit'}
                          >
                            {day.date.getDate()}
                          </Text>
                          {dayEvents.slice(0, 2).map((event, idx) => (
                            <Box
                              key={idx}
                              w="full"
                              px={1}
                              py={0.5}
                              bg={coloresEvento[event.color] + '20'}
                              borderRadius="sm"
                              fontSize="xs"
                              color={coloresEvento[event.color]}
                              fontWeight="medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event);
                              }}
                              _hover={{ bg: coloresEvento[event.color] + '30' }}
                            >
                              {event.title}
                            </Box>
                          ))}
                          {dayEvents.length > 2 && (
                            <Text fontSize="xs" color="gray.500">
                              +{dayEvents.length - 2} más
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Panel de Eventos */}
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">
                  Eventos del {selectedDate.toLocaleDateString('es-ES')}
                </Heading>
                
                {selectedDateEvents.length === 0 ? (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No hay eventos para este día
                  </Text>
                ) : (
                  <VStack spacing={3} align="stretch">
                    {selectedDateEvents.map((event) => (
                      <Card key={event.id} size="sm" variant="outline">
                        <CardBody>
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="full">
                              <HStack spacing={2}>
                                <Text fontSize="lg">{tiposEvento[event.type].icon}</Text>
                                <Text fontWeight="medium">{event.title}</Text>
                              </HStack>
                              <HStack spacing={1}>
                                <IconButton
                                  icon={<MdEdit />}
                                  size="xs"
                                  onClick={() => handleEditEvent(event)}
                                  aria-label="Editar evento"
                                />
                                <IconButton
                                  icon={<MdDelete />}
                                  size="xs"
                                  colorScheme="red"
                                  onClick={() => handleDeleteEvent(event.id)}
                                  aria-label="Eliminar evento"
                                />
                              </HStack>
                            </HStack>
                            {event.description && (
                              <Text fontSize="sm" color="gray.600">
                                {event.description}
                              </Text>
                            )}
                            {event.time && (
                              <HStack spacing={1}>
                                <MdEvent />
                                <Text fontSize="sm" color="gray.600">
                                  {event.time}
                                </Text>
                              </HStack>
                            )}
                            <Badge colorScheme={event.color} variant="subtle">
                              {tiposEvento[event.type].label}
                            </Badge>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>

      {/* Modal de Evento */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingEvent ? 'Editar Evento' : 'Nuevo Evento'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Título</FormLabel>
                <Input
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Ingresa el título del evento"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Descripción</FormLabel>
                <Textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Ingresa una descripción (opcional)"
                  rows={3}
                />
              </FormControl>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Fecha</FormLabel>
                  <Input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Hora</FormLabel>
                  <Input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </FormControl>
              </SimpleGrid>
              
              <SimpleGrid columns={2} spacing={4} w="full">
                <FormControl>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  >
                    {Object.entries(tiposEvento).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Color</FormLabel>
                  <Select
                    value={newEvent.color}
                    onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                  >
                    {Object.keys(coloresEvento).map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button colorScheme="brand" onClick={handleSaveEvent}>
                {editingEvent ? 'Actualizar' : 'Crear'}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Calendar;