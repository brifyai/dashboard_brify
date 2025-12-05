import React from 'react';
import { Box, Heading, Text, SimpleGrid, Image, Button, Flex } from '@chakra-ui/react';
import Card from '../../components/Card';

function NFTMarketplace() {
  const nfts = [
    { id: 1, name: 'Arte Digital #001', price: '2.5 ETH', image: 'https://via.placeholder.com/300x200', description: 'Obra de arte digital única creada por artista reconocido.' },
    { id: 2, name: 'Coleccionable Cripto', price: '1.8 ETH', image: 'https://via.placeholder.com/300x200', description: 'Coleccionable raro de la serie blockchain.' },
    { id: 3, name: 'Bienes Raíces Virtuales', price: '5.2 ETH', image: 'https://via.placeholder.com/300x200', description: 'Ubicación privilegiada en el metaverso.' },
  ];

  return (
    <Box>
      <Heading mb={6} size="lg" color="brand.500">
        Mercado NFT
      </Heading>
      <Text mb={8} color="gray.600" fontSize="lg">
        Explora y comercia activos digitales
      </Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {nfts.map((nft) => (
          <Card key={nft.id} overflow="hidden" transition="all 0.3s" _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}>
            <Image src={nft.image} alt={nft.name} h="200px" w="full" objectFit="cover" />
            <Box p={4}>
              <Heading size="md" mb={2}>{nft.name}</Heading>
              <Text color="gray.600" mb={4} fontSize="sm">{nft.description}</Text>
              <Flex justify="space-between" align="center">
                <Text fontWeight="bold" color="brand.500" fontSize="xl">{nft.price}</Text>
                <Button size="sm" colorScheme="brand">
                  Comprar Ahora
                </Button>
              </Flex>
            </Box>
          </Card>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default NFTMarketplace;