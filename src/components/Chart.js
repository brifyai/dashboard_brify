import React, { useState, useEffect } from 'react';
import { Box, useColorModeValue, Skeleton } from '@chakra-ui/react';
import ReactApexChart from 'react-apexcharts';

function Chart({ options, series, type = 'line', height = 350, loading = false }) {
  const bg = useColorModeValue('white', 'gray.800');
  const [chartData, setChartData] = useState({ options, series });
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setIsLoading(false);
        setChartData({ options, series });
      }, 1500);
    } else {
      setChartData({ options, series });
    }
  }, [options, series, loading]);

  const defaultOptions = {
    chart: {
      type: type,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    xaxis: {
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    grid: {
      show: true,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
    },
    tooltip: {
      theme: useColorModeValue('light', 'dark'),
      y: {
        formatter: (value) => `${value.toLocaleString()}`,
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...chartData.options };

  if (isLoading) {
    return (
      <Box p={6} bg={bg} borderRadius="lg" boxShadow="sm">
        <Skeleton height="300px" borderRadius="lg" />
      </Box>
    );
  }

  return (
    <Box p={6} bg={bg} borderRadius="lg" boxShadow="sm" className="widget-card">
      <ReactApexChart
        options={mergedOptions}
        series={chartData.series}
        type={type}
        height={height}
      />
    </Box>
  );
}

export default Chart;