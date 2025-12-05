import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdSettings,
} from 'react-icons/md';

// Admin Imports
import CRMView from 'views/admin/crm';
import Profile from 'views/admin/profile';
import Settings from 'views/admin/settings';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignInCenteredFixed from 'views/auth/signInFixed';
import ForgotPasswordFixedFinal from 'views/auth/forgotPasswordFixedFinal';
import ResetPasswordSimple from 'views/auth/resetPasswordSimple';
import TestRecoveryFixed from 'views/auth/test-recovery-fixed';
import DebugAuth from 'views/auth/debug-auth';

const routes = [
  {
    name: 'Panel Principal',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <CRMView />,
  },
  {
    name: 'BrifyAI',
    layout: '/admin',
    path: '/crm',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: <CRMView />,
  },
  {
    name: 'Mi Perfil',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
  {
    name: 'Configuración',
    layout: '/admin',
    path: '/settings',
    icon: <Icon as={MdSettings} width="20px" height="20px" color="inherit" />,
    component: <Settings />,
  },
  {
    name: 'Iniciar Sesión',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCenteredFixed />,
  },
  {
    name: 'Iniciar Sesión (Original)',
    layout: '/auth',
    path: '/sign-in-original',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
  {
    name: 'Recuperar Contraseña',
    layout: '/auth',
    path: '/forgot-password',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <ForgotPasswordFixedFinal />,
  },
  {
    name: '🔐 Reset Password',
    layout: '/auth',
    path: '/reset-password',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <ResetPasswordSimple />,
  },
  {
    name: '🧪 Prueba FIXED',
    layout: '/auth',
    path: '/test-recovery-fixed',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <TestRecoveryFixed />,
  },
  {
    name: '🔍 Debug Auth',
    layout: '/auth',
    path: '/debug-auth',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <DebugAuth />,
  },
];

export default routes;
