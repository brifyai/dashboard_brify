import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';
import { MdPeople, MdBarChart, MdSettings, MdNotifications, MdBackup, MdSecurity } from 'react-icons/md';

import Card from '../../components/Card';
import Chart from '../../components/Chart';
import DataTable from '../../components/DataTable';
import RealTimeStats from '../../components/RealTimeStats';
import DragDropFile from '../../components/DragDropFile';
import ProfileStats from '../../components/ProfileStats';
import { useTranslation } from '../../hooks/useTranslation';

function MainDashboard() {
  const [loading, setLoading] = useState(true);
  const bg = useColorModeValue('gray.50', 'gray.900');
  const { t } = useTranslation();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Sample data for charts
  const salesChartOptions = {
    chart: {
      type: 'area',
      height: 350,
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    },
    colors: ['#1890ff'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
  };

  const salesChartSeries = [
    {
      name: 'Sales',
      data: [30, 40, 35, 50, 49, 60],
    },
  ];

  const trafficChartOptions = {
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: ['Directo', 'Social', 'Correo', 'Orgánico'],
    colors: ['#1890ff', '#52c41a', '#faad14', '#f5222d'],
  };

  const trafficChartSeries = [44, 55, 13, 43];

  // Datos de actividad reciente
  const recentActivity = [
    {
      id: 1,
      user: 'Juan Pérez',
      action: 'actualizó su perfil',
      time: 'hace 2 minutos',
      status: 'success',
    },
    {
      id: 2,
      user: 'María García',
      action: 'compró NFT #123',
      time: 'hace 15 minutos',
      status: 'info',
    },
    {
      id: 3,
      user: 'Carlos Rodríguez',
      action: 'completó tarea',
      time: 'hace 1 hora',
      status: 'success',
    },
    {
      id: 4,
      user: 'Ana López',
      action: 'reportó problema',
      time: 'hace 2 horas',
      status: 'warning',
    },
  ];

  // Datos de transacciones recientes
  const transactionColumns = [
    {
      Header: 'Cliente',
      access: 'customer',
      sortable: true,
    },
    {
      Header: 'Fecha',
      access: 'date',
      sortable: true,
      type: 'date',
    },
    {
      Header: 'Monto',
      access: 'amount',
      sortable: true,
      type: 'currency',
    },
    {
      Header: 'Estado',
      access: 'status',
      sortable: true,
      type: 'badge',
      colorScheme: (value) => {
        switch (value) {
          case 'Completado': return 'green';
          case 'Pendiente': return 'orange';
          case 'Fallido': return 'red';
          default: return 'blue';
        }
      },
    },
  ];

  const transactionData = [
    {
      id: 1,
      customer: 'Juan Pérez',
      date: '2023-12-01',
      amount: 1250,
      status: 'Completado',
    },
    {
      id: 2,
      customer: 'María García',
      date: '2023-12-02',
      amount: 890,
      status: 'Pendiente',
    },
    {
      id: 3,
      customer: 'Carlos Rodríguez',
      date: '2023-12-03',
      amount: 2100,
      status: 'Completado',
    },
    {
      id: 4,
      customer: 'Ana López',
      date: '2023-12-04',
      amount: 750,
      status: 'Fallido',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Box w={2} h={2} borderRadius="full" bg="green.500" />;
      case 'warning':
        return <Box w={2} h={2} borderRadius="full" bg="orange.500" />;
      case 'info':
        return <Box w={2} h={2} borderRadius="full" bg="blue.500" />;
      default:
        return <Box w={2} h={2} borderRadius="full" bg="gray.500" />;
    }
  };

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (file) => {
    setSelectedFiles(prev => [...prev, file]);
    console.log('File selected:', file);
  };

  // Función para exportar datos del dashboard
  const handleExportData = () => {
    console.log('🔄 Iniciando exportación de datos...');
    
    try {
      // Preparar datos para exportar
      const exportData = {
        fecha: new Date().toISOString().split('T')[0],
        resumenVentas: {
          categorias: salesChartOptions.xaxis.categories,
          datos: salesChartSeries[0].data,
          totalVentas: salesChartSeries[0].data.reduce((a, b) => a + b, 0)
        },
        trafico: {
          fuentes: trafficChartOptions.labels,
          porcentajes: trafficChartSeries,
          total: trafficChartSeries.reduce((a, b) => a + b, 0)
        },
        transacciones: transactionData,
        actividadReciente: recentActivity,
        metricas: {
          online: '85%',
          memoria: '72%',
          almacenamiento: '45%',
          red: '92%'
        }
      };

      console.log('📊 Datos preparados para exportación:', exportData);

      // Convertir a CSV con mejor formato
      const csvContent = [
        // Header del reporte
        `Reporte de Dashboard - ${exportData.fecha}`,
        `Generado por: Camilo Alegria`,
        '',
        // Resumen de ventas
        'RESUMEN DE VENTAS',
        'Mes,Ventas',
        ...exportData.resumenVentas.categorias.map((mes, index) => 
          `${mes},${exportData.resumenVentas.datos[index]}`
        ),
        `Total,${exportData.resumenVentas.totalVentas}`,
        '',
        // Fuentes de tráfico
        'FUENTES DE TRÁFICO',
        'Fuente,Porcentaje',
        ...exportData.trafico.fuentes.map((fuente, index) => 
          `${fuente},${exportData.trafico.porcentajes[index]}%`
        ),
        '',
        // Transacciones recientes
        'TRANSACCIONES RECIENTES',
        'Cliente,Fecha,Monto,Estado',
        ...exportData.transacciones.map(t => 
          `${t.customer},${t.date},${t.amount},${t.status}`
        ),
        '',
        // Actividad reciente
        'ACTIVIDAD RECIENTE',
        'Usuario,Acción,Tiempo,Estado',
        ...exportData.actividadReciente.map(a => 
          `${a.user},${a.action},${a.time},${a.status}`
        ),
        '',
        // Métricas del sistema
        'MÉTRICAS DEL SISTEMA',
        'Métrica,Valor',
        `Usuarios Online,${exportData.metricas.online}`,
        `Uso de Memoria,${exportData.metricas.memoria}`,
        `Almacenamiento,${exportData.metricas.almacenamiento}`,
        `Red,${exportData.metricas.red}`,
        '',
        '=== FIN DEL REPORTE ==='
      ].join('\n');

      console.log('📄 Contenido CSV generado, iniciando descarga...');

      // Método 1: Usar Blob y URL.createObjectURL
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `reporte-dashboard-${exportData.fecha}.csv`;
      link.style.display = 'none';
      
      // Agregar al DOM, hacer clic y remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL del objeto
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ Reporte exportado exitosamente usando Blob + URL.createObjectURL');
      
      // Mostrar confirmación al usuario
      alert(`¡Reporte exportado exitosamente!\n\nArchivo: reporte-dashboard-${exportData.fecha}.csv\n\nEl archivo se ha descargado a tu carpeta de descargas.`);
      
    } catch (error) {
      console.error('❌ Error al exportar reporte:', error);
      
      // Método alternativo si falla el primero
      try {
        console.log('🔄 Intentando método alternativo de descarga...');
        
        const exportData = {
          fecha: new Date().toISOString().split('T')[0]
        };
        
        const csvContent = `Reporte de Dashboard - ${exportData.fecha}\n\nResumen de Ventas\nMes,Ventas\nJan,30\nFeb,40\nMar,35\nApr,50\nMay,49\nJun,60\nTotal,264\n\nFuentes de Tráfico\nFuente,Porcentaje\nDirecto,44%\nSocial,55%\nCorreo,13%\nOrgánico,43%\n\n=== REPORTE BÁSICO ===`;
        
        // Método alternativo usando data URL
        const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        const link = document.createElement('a');
        
        link.href = dataUrl;
        link.download = `reporte-dashboard-${exportData.fecha}.csv`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Reporte exportado usando método alternativo (data URL)');
        alert('¡Reporte exportado exitosamente (método alternativo)!');
        
      } catch (fallbackError) {
        console.error('❌ Error también en método alternativo:', fallbackError);
        alert('Error al exportar el reporte. Por favor, intenta nuevamente o contacta al soporte técnico.');
      }
    }
  };

  // Función para ver reportes detallados
  const handleViewReports = () => {
    try {
      // Simular navegación a una página de reportes
      console.log('🔍 Navegando a reportes detallados...');
      
      // Crear un reporte detallado en formato JSON
      const detailedReport = {
        fechaGeneracion: new Date().toISOString(),
        usuario: 'Camilo Alegria',
        resumenEjecutivo: {
          totalVentas: salesChartSeries[0].data.reduce((a, b) => a + b, 0),
          promedioVentas: Math.round(salesChartSeries[0].data.reduce((a, b) => a + b, 0) / salesChartSeries[0].data.length),
          mejorMes: salesChartOptions.xaxis.categories[salesChartSeries[0].data.indexOf(Math.max(...salesChartSeries[0].data))],
          peorMes: salesChartOptions.xaxis.categories[salesChartSeries[0].data.indexOf(Math.min(...salesChartSeries[0].data))]
        },
        analisisTrafico: {
          fuentePrincipal: trafficChartOptions.labels[trafficChartSeries.indexOf(Math.max(...trafficChartSeries))],
          porcentajePrincipal: Math.max(...trafficChartSeries),
          diversificacion: trafficChartSeries.length > 2 ? 'Buena' : 'Limitada'
        },
        metricasRendimiento: {
          uptime: '99.9%',
          tiempoRespuesta: '120ms',
          satisfaccionUsuario: '4.8/5'
        },
        recomendaciones: [
          'Incrementar inversión en marketing digital',
          'Optimizar proceso de conversión',
          'Mejorar tiempo de respuesta del servidor',
          'Implementar análisis predictivo'
        ]
      };

      // Mostrar reporte en una nueva ventana o modal (simulado con alert)
      const reportText = `
REPORTE DETALLADO - ${detailedReport.fechaGeneracion.split('T')[0]}
================================================

RESUMEN EJECUTIVO:
• Total de Ventas: ${detailedReport.resumenEjecutivo.totalVentas}
• Promedio Mensual: ${detailedReport.resumenEjecutivo.promedioVentas}
• Mejor Mes: ${detailedReport.resumenEjecutivo.mejorMes}
• Peor Mes: ${detailedReport.resumenEjecutivo.peorMes}

ANÁLISIS DE TRÁFICO:
• Fuente Principal: ${detailedReport.analisisTrafico.fuentePrincipal} (${detailedReport.analisisTrafico.porcentajePrincipal}%)
• Diversificación: ${detailedReport.analisisTrafico.diversificacion}

MÉTRICAS DE RENDIMIENTO:
• Uptime: ${detailedReport.metricasRendimiento.uptime}
• Tiempo de Respuesta: ${detailedReport.metricasRendimiento.tiempoRespuesta}
• Satisfacción: ${detailedReport.metricasRendimiento.satisfaccionUsuario}

RECOMENDACIONES:
${detailedReport.recomendaciones.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}
      `;

      alert(reportText);
      
      console.log('✅ Reporte detallado generado y mostrado');
    } catch (error) {
      console.error('❌ Error al generar reporte detallado:', error);
      alert('Error al generar el reporte detallado. Por favor, intenta nuevamente.');
    }
  };

  return (
    <Box p={6} bg={bg} minH="100vh">
      <VStack spacing={6} align="stretch">
        

        

        {/* Profile Statistics Section */}
        <ProfileStats />

        {/* Charts Section */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <VStack align="start" spacing={4} w="full">
              <HStack justify="space-between" w="full">
                <Heading size="md">Resumen de Ventas</Heading>
                <Badge colorScheme="green">+12.5%</Badge>
              </HStack>
              <Chart
                options={salesChartOptions}
                series={salesChartSeries}
                type="area"
                height={300}
                loading={loading}
              />
            </VStack>
          </Card>

          <Card>
            <VStack align="start" spacing={4} w="full">
              <HStack justify="space-between" w="full">
                <Heading size="md">Fuentes de Tráfico</Heading>
                <Badge colorScheme="blue">{t('common.live')}</Badge>
              </HStack>
              <Chart
                options={trafficChartOptions}
                series={trafficChartSeries}
                type="donut"
                height={300}
                loading={loading}
              />
              <HStack justify="space-around" w="full" mt={4}>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600">Directo</Text>
                  <Text fontWeight="bold">44%</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600">Social</Text>
                  <Text fontWeight="bold">55%</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600">Correo</Text>
                  <Text fontWeight="bold">13%</Text>
                </VStack>
                <VStack spacing={1}>
                  <Text fontSize="sm" color="gray.600">Orgánico</Text>
                  <Text fontWeight="bold">43%</Text>
                </VStack>
              </HStack>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Recent Activity & Transactions */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <VStack align="start" spacing={4} w="full">
              <HStack justify="space-between" w="full">
                <Heading size="md">{t('dashboard.recentActivity')}</Heading>
                <Button size="sm" variant="ghost">{t('dashboard.viewAll')}</Button>
              </HStack>
              <VStack spacing={3} w="full" align="stretch">
                {recentActivity.map((activity) => (
                  <HStack key={activity.id} spacing={3} p={3} bg="gray.50" borderRadius="md">
                    {getStatusIcon(activity.status)}
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {activity.user} {activity.action}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {activity.time}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" spacing={4} w="full">
              <HStack justify="space-between" w="full">
                <Heading size="md">{t('dashboard.recentTransactions')}</Heading>
                <Button size="sm" variant="ghost">{t('dashboard.viewAll')}</Button>
              </HStack>
              <DataTable
                columns={transactionColumns}
                data={transactionData}
                loading={loading}
                searchable={false}
              />
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Performance Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card>
            <VStack align="start" spacing={3} w="full">
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">{t('common.online')}</Text>
                <Badge colorScheme="green">{t('common.online')}</Badge>
              </HStack>
              <Progress value={85} size="sm" colorScheme="green" borderRadius="full" />
              <Text fontSize="xs" color="gray.500">85% {t('common.online')}</Text>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" spacing={3} w="full">
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">Uso de Memoria</Text>
                <Badge colorScheme="orange">{t('common.warning')}</Badge>
              </HStack>
              <Progress value={72} size="sm" colorScheme="orange" borderRadius="full" />
              <Text fontSize="xs" color="gray.500">72% RAM {t('common.warning')}</Text>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" spacing={3} w="full">
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">Almacenamiento</Text>
                <Badge colorScheme="blue">{t('common.good')}</Badge>
              </HStack>
              <Progress value={45} size="sm" colorScheme="blue" borderRadius="full" />
              <Text fontSize="xs" color="gray.500">45% Disco {t('common.good')}</Text>
            </VStack>
          </Card>

          <Card>
            <VStack align="start" spacing={3} w="full">
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">Red</Text>
                <Badge colorScheme="green">{t('common.stable')}</Badge>
              </HStack>
              <Progress value={92} size="sm" colorScheme="green" borderRadius="full" />
              <Text fontSize="xs" color="gray.500">92% Ancho de Banda {t('common.stable')}</Text>
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Real-time Stats Section */}
        <Card>
          <VStack align="start" spacing={4} w="full">
            <HStack justify="space-between" w="full">
              <Heading size="md">{t('dashboard.systemMetrics')}</Heading>
              <Badge colorScheme="green" variant="subtle">{t('common.live')}</Badge>
            </HStack>
            <RealTimeStats />
          </VStack>
        </Card>

        {/* File Upload Section */}
        <Card>
          <VStack align="start" spacing={4} w="full">
            <HStack justify="space-between" w="full">
              <Heading size="md">{t('dashboard.fileUploadManager')}</Heading>
              <Badge colorScheme="blue" variant="subtle">Arrastrar y Soltar</Badge>
            </HStack>
            <Text color="gray.600" fontSize="sm">
              {t('dashboard.uploadFiles')}
            </Text>
            <DragDropFile
              onFileSelect={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx"
              maxSize={5 * 1024 * 1024} // 5MB
              multiple={true}
            />
            {selectedFiles.length > 0 && (
              <VStack spacing={2} w="full" align="start">
                <Text fontWeight="medium" fontSize="sm">Uploaded Files:</Text>
                {selectedFiles.map((file, index) => (
                  <HStack key={index} spacing={2} p={2} bg="gray.50" borderRadius="md" w="full">
                    <Box w={2} h={2} bg="green.500" borderRadius="full" />
                    <Text fontSize="sm">{file.name}</Text>
                    <Text fontSize="xs" color="gray.600">({(file.size / 1024 / 1024).toFixed(2)} MB)</Text>
                  </HStack>
                ))}
              </VStack>
            )}
          </VStack>
        </Card>

        {/* Advanced Analytics Section */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <Card>
            <VStack align="start" spacing={4} w="full">
              <HStack justify="space-between" w="full">
                <Heading size="md">{t('dashboard.advancedAnalytics')}</Heading>
                <Button size="sm" variant="outline" onClick={handleExportData}>
                  Exportar Datos
                </Button>
              </HStack>
              <Chart
                options={{
                  chart: { type: 'bar', height: 300 },
                  xaxis: { categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] },
                  colors: ['#1890ff', '#52c41a'],
                }}
                series={[
                  { name: 'Ventas', data: [44, 55, 41, 67, 22, 43, 21] },
                  { name: 'Ingresos', data: [53, 32, 33, 52, 13, 43, 32] },
                ]}
                type="bar"
                height={300}
                loading={loading}
              />
            </VStack>
          </Card>

          <Card>
            <VStack align="start" spacing={4} w="full">
              <HStack justify="space-between" w="full">
                <Heading size="md">{t('dashboard.performanceRadar')}</Heading>
                <Button size="sm" variant="outline">Ver Detalles</Button>
              </HStack>
              <Chart
                options={{
                  chart: { type: 'radar', height: 300 },
                  xaxis: { categories: ['Velocidad', 'Fiabilidad', 'Comodidad', 'Seguridad', 'Eficiencia'] },
                  colors: ['#1890ff'],
                }}
                series={[
                  { name: 'Rendimiento Actual', data: [80, 90, 70, 85, 75] },
                ]}
                type="radar"
                height={300}
                loading={loading}
              />
            </VStack>
          </Card>
        </SimpleGrid>

        {/* Quick Actions Section */}
        <Card>
          <VStack align="start" spacing={4} w="full">
            <HStack justify="space-between" w="full">
              <Heading size="md">Acciones Rápidas</Heading>
              <Button size="sm" colorScheme="brand">Ver Todas las Acciones</Button>
            </HStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} w="full">
              <Button
                leftIcon={<Box as={MdPeople} />}
                colorScheme="blue"
                variant="outline"
                w="full"
                justifyContent="flex-start"
              >
                Gestionar Usuarios
              </Button>
              <Button
                leftIcon={<Box as={MdBarChart} />}
                colorScheme="green"
                variant="outline"
                w="full"
                justifyContent="flex-start"
                onClick={handleViewReports}
              >
                Ver Reportes
              </Button>
              <Button
                leftIcon={<Box as={MdSettings} />}
                colorScheme="orange"
                variant="outline"
                w="full"
                justifyContent="flex-start"
              >
                Configuración del Sistema
              </Button>
              <Button
                leftIcon={<Box as={MdNotifications} />}
                colorScheme="purple"
                variant="outline"
                w="full"
                justifyContent="flex-start"
              >
                Enviar Notificaciones
              </Button>
              <Button
                leftIcon={<Box as={MdBackup} />}
                colorScheme="teal"
                variant="outline"
                w="full"
                justifyContent="flex-start"
              >
                Respaldar Datos
              </Button>
              <Button
                leftIcon={<Box as={MdSecurity} />}
                colorScheme="red"
                variant="outline"
                w="full"
                justifyContent="flex-start"
              >
                Verificación de Seguridad
              </Button>
            </SimpleGrid>
          </VStack>
        </Card>
      </VStack>
    </Box>
  );
}

export default MainDashboard;