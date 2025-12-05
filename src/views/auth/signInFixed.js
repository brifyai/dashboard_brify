import React from 'react';
import { Flex, useColorModeValue } from '@chakra-ui/react';
import LoginFormFixed from '../../components/auth/LoginFormFixed';

function SignInCenteredFixed() {
  const bg = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg}>
      <LoginFormFixed />
    </Flex>
  );
}

export default SignInCenteredFixed;