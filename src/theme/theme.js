import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: true,
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#bae7ff',
      200: '#91d5ff',
      300: '#69c0ff',
      400: '#40a9ff',
      500: '#1890ff',
      600: '#096dd9',
      700: '#0050b3',
      800: '#003a8c',
      900: '#002766',
    },
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'gray.50',
        fontFamily: 'Inter, sans-serif',
      },
      '*': {
        boxSizing: 'border-box',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
        borderRadius: '8px',
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '12px',
          boxShadow: 'sm',
        },
      },
    },
  },
});

export default theme;