import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

function Card(props) {
  const { variant, children, ...rest } = props;
  
  // Background color based on variant
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
      className="widget-card fade-in"
      transition="all 0.3s ease"
      {...rest}
    >
      {children}
    </Box>
  );
}

export default Card;