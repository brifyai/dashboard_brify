import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  MdDashboard,
  MdPeople,
  MdPayment,
  MdDiamond,
  MdPersonAdd
} from 'react-icons/md';
import { CRMDashboard, UserManagement, PaymentManagement, PlanManagement, OnboardingManagement } from './index';

function CRMContainer() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [breadcrumb, setBreadcrumb] = useState([
    { label: 'Dashboard', view: 'dashboard', icon: MdDashboard }
  ]);
  const bg = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    // Verificar parámetros de URL al cargar
    const urlParams = new URLSearchParams(window.location.search);
    const viewFromUrl = urlParams.get('view');
    if (viewFromUrl && ['dashboard', 'users', 'payments', 'plans', 'onboarding'].includes(viewFromUrl)) {
      setCurrentView(viewFromUrl);
      
      // Actualizar breadcrumb basado en URL
      const breadcrumbMap = {
        dashboard: { label: 'Dashboard', view: 'dashboard', icon: MdDashboard },
        users: { label: 'Gestión de Usuarios', view: 'users', icon: MdPeople },
        payments: { label: 'Gestión de Pagos', view: 'payments', icon: MdPayment },
        plans: { label: 'Gestión de Planes', view: 'plans', icon: MdDiamond },
        onboarding: { label: 'Gestión de Onboarding', view: 'onboarding', icon: MdPersonAdd }
      };
      
      setBreadcrumb([breadcrumbMap.dashboard, breadcrumbMap[viewFromUrl]]);
    }

    // Escuchar eventos de navegación del CRM
    const handleNavigation = (event) => {
      const { view, user } = event.detail;
      setCurrentView(view);
      
      // Actualizar URL sin recargar página
      const newUrl = `${window.location.pathname}?view=${view}`;
      window.history.pushState(null, '', newUrl);
      
      // Actualizar breadcrumb
      const breadcrumbMap = {
        dashboard: { label: 'Dashboard', view: 'dashboard', icon: MdDashboard },
        users: { label: 'Gestión de Usuarios', view: 'users', icon: MdPeople },
        payments: { label: 'Gestión de Pagos', view: 'payments', icon: MdPayment },
        plans: { label: 'Gestión de Planes', view: 'plans', icon: MdDiamond },
        onboarding: { label: 'Gestión de Onboarding', view: 'onboarding', icon: MdPersonAdd }
      };
      
      setBreadcrumb([breadcrumbMap.dashboard, breadcrumbMap[view]]);
      
      // Si hay un usuario seleccionado, guardarlo para que el componente lo pueda usar
      if (user) {
        localStorage.setItem('selectedUserForCRM', JSON.stringify(user));
      }
    };

    window.addEventListener('crmNavigation', handleNavigation);
    
    return () => {
      window.removeEventListener('crmNavigation', handleNavigation);
    };
  }, []);

  const handleBreadcrumbClick = (view) => {
    setCurrentView(view);
    
    // Actualizar breadcrumb
    const breadcrumbMap = {
      dashboard: { label: 'Dashboard', view: 'dashboard', icon: MdDashboard },
      users: { label: 'Gestión de Usuarios', view: 'users', icon: MdPeople },
      payments: { label: 'Gestión de Pagos', view: 'payments', icon: MdPayment },
      plans: { label: 'Gestión de Planes', view: 'plans', icon: MdDiamond },
      onboarding: { label: 'Gestión de Onboarding', view: 'onboarding', icon: MdPersonAdd }
    };
    
    setBreadcrumb([breadcrumbMap.dashboard, breadcrumbMap[view]]);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'users':
        return <UserManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'plans':
        return <PlanManagement />;
      case 'onboarding':
        return <OnboardingManagement />;
      case 'dashboard':
      default:
        return <CRMDashboard />;
    }
  };

  return (
    <Box bg={bg} minH="100vh">
      {/* Breadcrumb Navigation */}
      <Box bg={useColorModeValue('white', 'gray.800')} px={6} py={3} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
        <Breadcrumb>
          {breadcrumb.map((item, index) => (
            <BreadcrumbItem key={item.view} isCurrentPage={index === breadcrumb.length - 1}>
              <BreadcrumbLink
                onClick={() => handleBreadcrumbClick(item.view)}
                cursor={index === breadcrumb.length - 1 ? 'default' : 'pointer'}
                color={index === breadcrumb.length - 1 ? 'blue.600' : 'gray.600'}
                fontWeight={index === breadcrumb.length - 1 ? 'semibold' : 'normal'}
              >
                <HStack spacing={2}>
                  <item.icon size={16} />
                  <Text>{item.label}</Text>
                </HStack>
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      </Box>

      {/* Contenido Principal */}
      <Box>
        {renderCurrentView()}
      </Box>
    </Box>
  );
}

export default CRMContainer;