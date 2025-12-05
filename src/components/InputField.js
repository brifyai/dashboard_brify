import React from 'react';
import { FormControl, FormLabel, Input, useColorModeValue } from '@chakra-ui/react';

function InputField({ label, placeholder, type = 'text', ...props }) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="medium" color="gray.700">
        {label}
      </FormLabel>
      <Input
        type={type}
        placeholder={placeholder}
        bg={bg}
        borderColor={borderColor}
        _hover={{ borderColor: 'brand.400' }}
        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #1890ff' }}
        size="md"
        {...props}
      />
    </FormControl>
  );
}

export default InputField;