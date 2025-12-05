import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import {
  ChakraProvider,
} from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './config/queryClient';
import { AuthProviderFixed } from './hooks/useAuthFixed';
import SweetNotifications from './components/SweetNotifications';

export default function Main() {
  const [currentTheme] = useState(initialTheme);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={currentTheme}>
        <AuthProviderFixed>
          <Routes>
            <Route path="/auth/*" element={<AuthLayout />} />
            <Route path="/admin/*" element={<AdminLayout />} />
            <Route path="/rtl/*" element={<RTLLayout />} />
            <Route path="/" element={<Navigate to="/admin/default" replace />} />
          </Routes>
        </AuthProviderFixed>
      </ChakraProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
