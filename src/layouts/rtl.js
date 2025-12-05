import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Box, Flex, Button, Heading } from '@chakra-ui/react';
import routes from '../routes';

function RTLLayout() {
  const rtlRoutes = routes.filter(route => route.layout === '/rtl');

  return (
    <Box dir="rtl">
      <Flex as="nav" p={4} bg="gray.100" mb={4} alignItems="center">
        <Heading size="md" mr={4}>RTL Layout</Heading>
        {rtlRoutes.map((route, index) => (
          <Button as={Link} to={`/rtl${route.path}`} key={index} variant="ghost" mr={2}>
            {route.name}
          </Button>
        ))}
      </Flex>
      <Routes>
        {rtlRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Box>
  );
}

export default RTLLayout;