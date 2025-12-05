import React, { useState, useEffect } from 'react';
import { Box, HStack, VStack, Text, Badge, Progress, useColorModeValue, SimpleGrid } from '@chakra-ui/react';
import { MdTrendingUp, MdTrendingDown, MdRemove } from 'react-icons/md';

function RealTimeStats() {
  const [stats, setStats] = useState({
    activeUsers: 1234,
    revenue: 45678,
    conversionRate: 3.2,
    serverLoad: 45,
    memoryUsage: 72,
    networkLatency: 23,
  });

  const [trends, setTrends] = useState({
    activeUsers: 'up',
    revenue: 'up',
    conversionRate: 'down',
    serverLoad: 'up',
    memoryUsage: 'up',
    networkLatency: 'down',
  });

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 20 - 10)),
        revenue: Math.max(0, prev.revenue + Math.floor(Math.random() * 1000 - 500)),
        conversionRate: Math.max(0, Math.min(10, prev.conversionRate + (Math.random() * 0.4 - 0.2))),
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + Math.floor(Math.random() * 10 - 5))),
        memoryUsage: Math.max(0, Math.min(100, prev.memoryUsage + Math.floor(Math.random() * 10 - 5))),
        networkLatency: Math.max(0, prev.networkLatency + Math.floor(Math.random() * 4 - 2)),
      }));

      setTrends(prev => ({
        activeUsers: Math.random() > 0.5 ? 'up' : 'down',
        revenue: Math.random() > 0.5 ? 'up' : 'down',
        conversionRate: Math.random() > 0.5 ? 'up' : 'down',
        serverLoad: Math.random() > 0.5 ? 'up' : 'down',
        memoryUsage: Math.random() > 0.5 ? 'up' : 'down',
        networkLatency: Math.random() > 0.5 ? 'up' : 'down',
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <Box as={MdTrendingUp} color="green.500" />;
      case 'down':
        return <Box as={MdTrendingDown} color="red.500" />;
      default:
        return <Box as={MdRemove} color="gray.500" />;
    }
  };

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'green';
    if (value <= thresholds.warning) return 'orange';
    return 'red';
  };

  const metrics = [
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      trend: trends.activeUsers,
      status: 'good',
      statusText: 'Online',
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue.toLocaleString()}`,
      trend: trends.revenue,
      status: 'good',
      statusText: 'Growing',
    },
    {
      title: 'Conversion Rate',
      value: `${stats.conversionRate.toFixed(1)}%`,
      trend: trends.conversionRate,
      status: 'warning',
      statusText: 'Stable',
    },
    {
      title: 'Server Load',
      value: `${stats.serverLoad}%`,
      progress: stats.serverLoad,
      trend: trends.serverLoad,
      thresholds: { good: 70, warning: 85 },
    },
    {
      title: 'Memory Usage',
      value: `${stats.memoryUsage}%`,
      progress: stats.memoryUsage,
      trend: trends.memoryUsage,
      thresholds: { good: 60, warning: 80 },
    },
    {
      title: 'Network Latency',
      value: `${stats.networkLatency}ms`,
      trend: trends.networkLatency,
      status: stats.networkLatency < 50 ? 'good' : stats.networkLatency < 100 ? 'warning' : 'error',
      statusText: stats.networkLatency < 50 ? 'Excellent' : stats.networkLatency < 100 ? 'Good' : 'High',
    },
  ];

  return (
    <Box bg={bg} borderRadius="lg" boxShadow="sm" p={6} className="widget-card">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" w="full">
          <Text fontWeight="medium" fontSize="lg">
            Real-time Metrics
          </Text>
          <Badge colorScheme="green" variant="subtle">
            Live
          </Badge>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {metrics.map((metric, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
              _hover={{ borderColor: 'brand.400', transform: 'translateY(-2px)' }}
              transition="all 0.3s ease"
            >
              <VStack spacing={3} align="start" w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">
                    {metric.title}
                  </Text>
                  <HStack spacing={1}>
                    {getTrendIcon(metric.trend)}
                    <Text fontSize="xs" color="gray.500">
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                    </Text>
                  </HStack>
                </HStack>

                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" fontSize="xl">
                    {metric.value}
                  </Text>
                  {metric.status && (
                    <Badge
                      colorScheme={metric.status === 'good' ? 'green' : metric.status === 'warning' ? 'orange' : 'red'}
                      variant="subtle"
                    >
                      {metric.statusText}
                    </Badge>
                  )}
                </HStack>

                {metric.progress && metric.thresholds && (
                  <VStack spacing={2} w="full">
                    <Progress
                      value={metric.progress}
                      size="sm"
                      colorScheme={getStatusColor(metric.progress, metric.thresholds)}
                      borderRadius="full"
                      w="full"
                    />
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color="gray.500">
                        {metric.progress}% used
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {metric.progress > metric.thresholds.warning ? 'High' : 
                         metric.progress > metric.thresholds.good ? 'Medium' : 'Normal'}
                      </Text>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        {/* Additional Stats */}
        <Box
          p={4}
          bg="gray.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
        >
          <VStack spacing={2} align="start">
            <Text fontSize="sm" fontWeight="medium">
              System Status Summary
            </Text>
            <HStack spacing={4} fontSize="xs">
              <HStack spacing={1}>
                <Box w={2} h={2} bg="green.500" borderRadius="full" />
                <Text>All systems operational</Text>
              </HStack>
              <Text color="gray.500">•</Text>
              <Text color="gray.600">
                Last updated: {new Date().toLocaleTimeString()}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}

export default RealTimeStats;