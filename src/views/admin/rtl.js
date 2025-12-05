import React from 'react';
import { Box, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react';

function RTL() {
  return (
    <Box p={6} dir="rtl">
      <Heading mb={6}>RTL Dashboard</Heading>
      <Text mb={6}>Welcome to the RTL (Right-to-Left) Dashboard</Text>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Stat>
          <StatLabel>إجمالي المستخدمين</StatLabel>
          <StatNumber>1,234</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>الجلسات</StatLabel>
          <StatNumber>5,678</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            12.00%
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>معدل الارتداد</StatLabel>
          <StatNumber>32.5%</StatNumber>
          <StatHelpText>
            <StatArrow type="decrease" />
            3.00%
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>مشاهدات الصفحة</StatLabel>
          <StatNumber>45.2K</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            18.30%
          </StatHelpText>
        </Stat>
      </SimpleGrid>
    </Box>
  );
}

export default RTL;