import React, { useState } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  SimpleGrid,
  Text,
  IconButton,
  Button,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';

function DatePicker({ value, onChange, placeholder = "Select date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const today = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    onChange(selectedDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  const handleYearChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(currentYear + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <Box key={`empty-${i}`} h={8} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() && 
                     currentMonth === today.getMonth() && 
                     currentYear === today.getFullYear();
      const isSelected = value && 
                        new Date(value).getDate() === day && 
                        new Date(value).getMonth() === currentMonth && 
                        new Date(value).getFullYear() === currentYear;

      days.push(
        <IconButton
          key={day}
          size="sm"
          variant={isSelected ? 'solid' : isToday ? 'outline' : 'ghost'}
          colorScheme={isSelected ? 'brand' : 'gray'}
          aria-label={`Day ${day}`}
          onClick={() => handleDateClick(day)}
          h={8}
          w={8}
          fontSize="sm"
          borderRadius="md"
        >
          {day}
        </IconButton>
      );
    }

    return days;
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <PopoverTrigger>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <MdCalendarToday color="gray.400" />
          </InputLeftElement>
          <Input
            value={formatDate(value)}
            onClick={() => setIsOpen(!isOpen)}
            readOnly
            placeholder={placeholder}
            cursor="pointer"
            bg={bg}
            borderColor={borderColor}
          />
        </InputGroup>
      </PopoverTrigger>
      <PopoverContent w="300px" bg={bg} borderColor={borderColor}>
        <PopoverArrow />
        <VStack spacing={3} p={3}>
          {/* Month and Year Navigation */}
          <HStack justify="space-between" w="full">
            <HStack spacing={1}>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<MdChevronLeft />}
                onClick={() => handleYearChange(-1)}
                aria-label="Previous year"
              />
              <IconButton
                size="sm"
                variant="ghost"
                icon={<MdChevronLeft />}
                onClick={() => handleMonthChange(-1)}
                aria-label="Previous month"
              />
            </HStack>
            <Text fontWeight="medium" fontSize="sm">
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <HStack spacing={1}>
              <IconButton
                size="sm"
                variant="ghost"
                icon={<MdChevronRight />}
                onClick={() => handleMonthChange(1)}
                aria-label="Next month"
              />
              <IconButton
                size="sm"
                variant="ghost"
                icon={<MdChevronRight />}
                onClick={() => handleYearChange(1)}
                aria-label="Next year"
              />
            </HStack>
          </HStack>

          {/* Day Headers */}
          <SimpleGrid columns={7} spacing={2} w="full">
            {dayNames.map((day) => (
              <Text key={day} fontSize="xs" color="gray.500" textAlign="center" fontWeight="medium">
                {day}
              </Text>
            ))}
          </SimpleGrid>

          {/* Calendar Grid */}
          <SimpleGrid columns={7} spacing={2} w="full">
            {renderCalendar()}
          </SimpleGrid>

          {/* Today Button */}
          <Button
            size="sm"
            variant="ghost"
            w="full"
            onClick={() => {
              const today = new Date();
              onChange(today.toISOString().split('T')[0]);
              setCurrentDate(today);
              setIsOpen(false);
            }}
          >
            Today
          </Button>
        </VStack>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;