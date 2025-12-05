import React from 'react';
import {
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { MdBrightness4, MdBrightness7 } from 'react-icons/md';

function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  const bg = useColorModeValue('white', 'gray.800');
  const color = useColorModeValue('gray.800', 'white');
  
  return (
    <Tooltip
      label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      placement="bottom"
      hasArrow
    >
      <IconButton
        icon={colorMode === 'light' ? <MdBrightness4 /> : <MdBrightness7 />}
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle theme"
        size="sm"
        bg={bg}
        color={color}
        borderRadius="full"
        _hover={{
          bg: useColorModeValue('gray.100', 'gray.700'),
          transform: 'rotate(180deg)',
        }}
        transition="all 0.3s ease"
      />
    </Tooltip>
  );
}

export default ThemeToggle;