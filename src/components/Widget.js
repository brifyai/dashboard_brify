import React from 'react';
import { Box, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, useColorModeValue } from '@chakra-ui/react';

function Widget({ title, value, percentage, trend }) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p="6"
      boxShadow="sm"
      className="widget-card slide-up"
      transition="all 0.3s ease"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
    >
      <Stat>
        <StatLabel fontSize="sm" color="gray.600">{title}</StatLabel>
        <StatNumber fontSize="2xl" fontWeight="bold" color="brand.500">{value}</StatNumber>
        <StatHelpText>
          <StatArrow type={trend} />
          {percentage}%
        </StatHelpText>
      </Stat>
    </Box>
  );
}

export default Widget;