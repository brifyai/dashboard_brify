import React from 'react';
import { Flex, useColorModeValue } from '@chakra-ui/react';
import LoginForm from '../../components/auth/LoginForm';

function SignInCentered() {
  const bg = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Flex minH="100vh" align="center" justify="center" bg={bg}>
      <LoginForm />
    </Flex>
  );
}

export default SignInCentered;