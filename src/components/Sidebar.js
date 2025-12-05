import React, { useState, useEffect } from 'react';
import { Box, VStack, Text, Icon, Link, useColorModeValue, Image, useBreakpointValue, Button, Flex } from '@chakra-ui/react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { MdHome, MdBarChart, MdPeople, MdPayment, MdDiamond, MdAssignment, MdMenu, MdClose } from 'react-icons/md';

function Sidebar() {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeBg = useColorModeValue('brand.50', 'brand.900');
  const activeColor = useColorModeValue('brand.600', 'brand.200');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Escuchar evento para abrir menú móvil desde el Header
  useEffect(() => {
    const handleOpenMobileMenu = () => {
      setIsMobileMenuOpen(true);
    };

    window.addEventListener('openMobileMenu', handleOpenMobileMenu);
    return () => {
      window.removeEventListener('openMobileMenu', handleOpenMobileMenu);
    };
  }, []);
  
  // Responsive values
  const sidebarWidth = useBreakpointValue({ base: 'full', md: '280px' });
  const sidebarPosition = useBreakpointValue({ base: 'absolute', md: 'fixed' });
  const sidebarZIndex = useBreakpointValue({ base: '9999', md: 'auto' });
  const padding = useBreakpointValue({ base: '3', md: '4' });
  const imageMaxWidth = useBreakpointValue({ base: '150px', md: '200px' });

  // Navegación interna del CRM
  const crmNavItems = [
    { name: 'Dashboard', view: 'dashboard', icon: MdBarChart },
    { name: 'Usuarios', view: 'users', icon: MdPeople },
    { name: 'Pagos', view: 'payments', icon: MdPayment },
    { name: 'Planes', view: 'plans', icon: MdDiamond },
    { name: 'Onboarding', view: 'onboarding', icon: MdAssignment },
  ];

  // Sincronizar estado activo con la URL
  useEffect(() => {
    if (location.pathname.includes('/admin/crm') || location.pathname.includes('/admin/default')) {
      const urlParams = new URLSearchParams(location.search);
      const viewFromUrl = urlParams.get('view');
      if (viewFromUrl) {
        setActiveView(viewFromUrl);
      } else if (location.pathname.includes('/admin/default')) {
        // Si estamos en /admin/default sin view, por defecto es dashboard
        setActiveView('dashboard');
      }
    }
  }, [location]);

  const handleCRMNavigation = (view) => {
    setActiveView(view);
    // Actualizar la URL sin recargar la página
    navigate(`/admin/crm?view=${view}`);
    // Disparar un evento personalizado para que el CRM view escuche
    window.dispatchEvent(new CustomEvent('crmNavigation', { detail: { view } }));
  };

  const isCRMPath = location.pathname.includes('/admin/crm') || location.pathname.includes('/admin/default') || location.pathname.includes('/admin/profile') || location.pathname.includes('/admin/settings');

  // Responsive value for overlay z-index
  const overlayZIndex = useBreakpointValue({ base: '9998', md: 'auto' });

  return (
    <>
      {/* Overlay para cerrar menú móvil */}
      {isMobileMenuOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex={overlayZIndex}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <Box
        bg={bg}
        borderRight="1px solid"
        borderColor={borderColor}
        w={sidebarWidth}
        h="100vh"
        p={padding}
        position={sidebarPosition}
        left="0"
        top="0"
        overflowY="auto"
        zIndex={sidebarZIndex}
        display={{ base: isMobileMenuOpen ? 'block' : 'none', md: 'block' }}
      >
      <Flex justify="space-between" align="center" mb={{ base: '4', md: '8' }}>
        <Image 
          src="https://brifyai.com/images/logobrify24.png" 
          alt="BrifyAI" 
          maxW={imageMaxWidth} 
          h="auto"
          cursor="pointer"
          _hover={{ opacity: 0.8 }}
          onClick={() => {
            navigate('/admin/default');
            setIsMobileMenuOpen(false);
          }}
        />
        <Button
          display={{ base: 'flex', md: 'none' }}
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <Icon as={MdClose} />
        </Button>
      </Flex>
      
      <VStack align="stretch" spacing="2">
        {/* Navegación CRM */}
        {isCRMPath && (
          <>
            <Text fontSize="sm" fontWeight="bold" color="gray.500" mb="2" textTransform="uppercase">
              Módulos
            </Text>
            {crmNavItems.map((item) => (
              <Link
                key={item.name}
                onClick={() => {
                  handleCRMNavigation(item.view);
                  setIsMobileMenuOpen(false);
                }}
                p="3"
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: activeBg, textDecoration: 'none' }}
                bg={activeView === item.view ? activeBg : 'transparent'}
                color={activeView === item.view ? activeColor : 'inherit'}
                display="flex"
                alignItems="center"
                gap="3"
              >
                <Icon as={item.icon} boxSize="5" />
                <Text>{item.name}</Text>
              </Link>
            ))}
          </>
        )}
      </VStack>
    </Box>
    </>
  );
}

export default Sidebar;