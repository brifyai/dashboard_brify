import React from 'react';
import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdOpenInNew } from 'react-icons/md';

function Modal({ isOpen, onClose, title, children, size = 'md', footer = null }) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} size={size} isCentered>
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <ModalContent bg={bg} borderColor={borderColor} borderWidth="1px" borderRadius="lg">
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {children}
        </ModalBody>
        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </ChakraModal>
  );
}

// Hook para usar el modal fácilmente
export function useModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return { isOpen, onOpen, onClose };
}

// Botón para abrir el modal
export function ModalTrigger({ onOpen, icon = MdOpenInNew, ...props }) {
  return (
    <IconButton
      icon={<Icon as={icon} />}
      onClick={onOpen}
      variant="ghost"
      size="sm"
      {...props}
    />
  );
}

export default Modal;