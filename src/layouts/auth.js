import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import routes from '../routes';

function AuthLayout() {
  const authRoutes = routes.filter(route => route.layout === '/auth');
  
  return (
    <Box p={4}>
      <Routes>
        {authRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.component} />
        ))}
      </Routes>
    </Box>
  );
}

export default AuthLayout;