import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  IconButton,
  Card,
  CardBody,
  Progress,
  Badge,
  useColorModeValue,
  useToast,
  SimpleGrid,
  Divider,
  Avatar,
  Icon,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import {
  MdCloudUpload,
  MdDelete,
  MdDownload,
  MdFolder,
  MdImage,
  MdInsertDriveFile,
  MdMovie,
  MdMusicNote,
  MdPictureAsPdf,
  MdSearch,
  MdUpload,
  MdViewList,
  MdGridView,
} from 'react-icons/md';

function FileUpload() {
  const [files, setFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const toast = useToast();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type, name) => {
    const extension = name.split('.').pop().toLowerCase();
    
    if (type.startsWith('image/')) return MdImage;
    if (type.startsWith('video/')) return MdMovie;
    if (type.startsWith('audio/')) return MdMusicNote;
    if (extension === 'pdf') return MdPictureAsPdf;
    if (['doc', 'docx'].includes(extension)) return MdInsertDriveFile;
    if (['xls', 'xlsx'].includes(extension)) return MdInsertDriveFile;
    if (['ppt', 'pptx'].includes(extension)) return MdInsertDriveFile;
    if (['zip', 'rar', '7z'].includes(extension)) return MdFolder;
    
    return MdInsertDriveFile;
  };

  const getFileColor = (type) => {
    if (type.startsWith('image/')) return 'green';
    if (type.startsWith('video/')) return 'purple';
    if (type.startsWith('audio/')) return 'blue';
    if (type === 'application/pdf') return 'red';
    if (type.includes('document')) return 'orange';
    if (type.includes('spreadsheet')) return 'green';
    if (type.includes('presentation')) return 'purple';
    if (type.includes('zip')) return 'gray';
    
    return 'gray';
  };

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0,
      status: 'pending',
      uploadedAt: new Date(),
      url: URL.createObjectURL(file),
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Simular carga de archivos
    newFiles.forEach(file => {
      simulateUpload(file);
    });

    toast({
      title: 'Archivos añadidos',
      description: `${acceptedFiles.length} archivo(s) listos para subir.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const simulateUpload = (file) => {
    setUploadingFiles(prev => [...prev, file.id]);
    
    const interval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === file.id && f.uploadProgress < 100) {
          const newProgress = Math.min(f.uploadProgress + Math.random() * 20, 100);
          return { ...f, uploadProgress: newProgress, status: newProgress === 100 ? 'completed' : 'uploading' };
        }
        return f;
      }));
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setFiles(prev => prev.map(f => 
        f.id === file.id 
          ? { ...f, uploadProgress: 100, status: 'completed' }
          : f
      ));
      setUploadingFiles(prev => prev.filter(id => id !== file.id));
      
      toast({
        title: 'Archivo subido',
        description: `${file.name} se ha subido exitosamente.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }, 3000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
      'audio/*': ['.mp3', '.wav', '.flac'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.ms-excel': ['.xls', '.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt', '.pptx'],
      'application/zip': ['.zip', '.rar', '.7z'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const deleteFile = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este archivo?')) {
      setFiles(files.filter(f => f.id !== id));
      toast({
        title: 'Archivo eliminado',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Descarga iniciada',
      description: `${file.name} se está descargando.`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fileStats = {
    total: files.length,
    completed: files.filter(f => f.status === 'completed').length,
    uploading: files.filter(f => f.status === 'uploading').length,
    pending: files.filter(f => f.status === 'pending').length,
    totalSize: files.reduce((acc, file) => acc + file.size, 0),
  };

  return (
    <Box bg={bg} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading mb={4} size="lg" color="brand.500">
            Gestión de Archivos
          </Heading>
          <Text color="gray.600">
            Sube, organiza y gestiona tus archivos de forma segura
          </Text>
        </Box>

        {/* Estadísticas */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {fileStats.total}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Total Archivos
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {fileStats.completed}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Completados
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {fileStats.uploading}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Subiendo
                </Text>
              </VStack>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <VStack spacing={2} align="center">
                <Text fontSize="sm" fontWeight="bold" color="purple.500">
                  {formatFileSize(fileStats.totalSize)}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Espacio Usado
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Área de Carga */}
        <Card>
          <CardBody>
            <Box
              {...getRootProps()}
              border="2px dashed"
              borderColor={isDragActive ? 'brand.500' : borderColor}
              borderRadius="lg"
              p={8}
              textAlign="center"
              cursor="pointer"
              bg={isDragActive ? 'brand.50' : 'transparent'}
              transition="all 0.3s"
              _hover={{ borderColor: 'brand.500', bg: 'brand.50' }}
            >
              <input {...getInputProps()} />
              <VStack spacing={4}>
                <Icon
                  as={MdCloudUpload}
                  w={12}
                  h={12}
                  color={isDragActive ? 'brand.500' : 'gray.400'}
                />
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="medium">
                    {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra y suelta archivos aquí'}
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    o haz clic para seleccionar archivos
                  </Text>
                  <Text color="gray.500" fontSize="xs">
                    Formatos admitidos: Imágenes, Videos, Audio, PDF, Office, ZIP (máx. 50MB)
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </CardBody>
        </Card>

        {/* Controles de Vista */}
        {files.length > 0 && (
          <Card>
            <CardBody>
              <HStack justify="space-between" wrap="wrap" spacing={4}>
                <HStack spacing={4}>
                  <Input
                    placeholder="Buscar archivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    maxW="300px"
                    leftIcon={<MdSearch />}
                  />
                  
                  <HStack spacing={2}>
                    <IconButton
                      icon={<MdGridView />}
                      onClick={() => setViewMode('grid')}
                      colorScheme={viewMode === 'grid' ? 'brand' : 'gray'}
                      aria-label="Vista de cuadrícula"
                    />
                    <IconButton
                      icon={<MdViewList />}
                      onClick={() => setViewMode('list')}
                      colorScheme={viewMode === 'list' ? 'brand' : 'gray'}
                      aria-label="Vista de lista"
                    />
                  </HStack>
                </HStack>

                <HStack spacing={2}>
                  <Text fontSize="sm" color="gray.600">
                    {filteredFiles.length} de {files.length} archivos
                  </Text>
                  <Button
                    leftIcon={<MdDelete />}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que quieres eliminar todos los archivos?')) {
                        setFiles([]);
                        toast({
                          title: 'Todos los archivos eliminados',
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                  >
                    Limpiar Todo
                  </Button>
                </HStack>
              </HStack>
            </CardBody>
          </Card>
        )}

        {/* Lista de Archivos */}
        {filteredFiles.length > 0 && (
          <VStack spacing={4} align="stretch">
            {viewMode === 'grid' ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={4}>
                {filteredFiles.map((file) => {
                  const IconComponent = getFileIcon(file.type, file.name);
                  const colorScheme = getFileColor(file.type);
                  
                  return (
                    <Card key={file.id} variant="outline">
                      <CardBody>
                        <VStack spacing={3} align="stretch">
                          <HStack justify="space-between" align="start">
                            <Icon
                              as={IconComponent}
                              w={8}
                              h={8}
                              color={colorScheme + '.500'}
                            />
                            <HStack spacing={1}>
                              <IconButton
                                icon={<MdDownload />}
                                size="sm"
                                variant="ghost"
                                onClick={() => downloadFile(file)}
                                aria-label="Descargar archivo"
                              />
                              <IconButton
                                icon={<MdDelete />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => deleteFile(file.id)}
                                aria-label="Eliminar archivo"
                              />
                            </HStack>
                          </HStack>

                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm" noOfLines={2}>
                              {file.name}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {formatFileSize(file.size)}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {file.uploadedAt.toLocaleDateString('es-ES')}
                            </Text>
                          </VStack>

                          {file.status === 'uploading' && (
                            <VStack spacing={1} align="stretch">
                              <Progress
                                value={file.uploadProgress}
                                colorScheme="brand"
                                size="sm"
                                borderRadius="full"
                              />
                              <Text fontSize="xs" color="gray.600" textAlign="center">
                                {Math.round(file.uploadProgress)}%
                              </Text>
                            </VStack>
                          )}

                          <Badge
                            colorScheme={colorScheme}
                            variant="subtle"
                            size="sm"
                          >
                            {file.type || 'Archivo'}
                          </Badge>
                        </VStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Card>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {filteredFiles.map((file) => {
                      const IconComponent = getFileIcon(file.type, file.name);
                      const colorScheme = getFileColor(file.type);
                      
                      return (
                        <HStack
                          key={file.id}
                          spacing={4}
                          p={3}
                          borderRadius="md"
                          _hover={{ bg: 'gray.50' }}
                          transition="all 0.2s"
                        >
                          <Icon
                            as={IconComponent}
                            w={6}
                            h={6}
                            color={colorScheme + '.500'}
                          />
                          
                          <VStack flex={1} align="start" spacing={1}>
                            <Text fontWeight="medium" fontSize="sm">
                              {file.name}
                            </Text>
                            <HStack spacing={4}>
                              <Text fontSize="xs" color="gray.600">
                                {formatFileSize(file.size)}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {file.uploadedAt.toLocaleDateString('es-ES')}
                              </Text>
                              <Badge
                                colorScheme={colorScheme}
                                variant="subtle"
                                size="sm"
                              >
                                {file.type || 'Archivo'}
                              </Badge>
                              {file.status === 'completed' && (
                                <Badge colorScheme="green" variant="subtle" size="sm">
                                  Completado
                                </Badge>
                              )}
                            </HStack>
                            {file.status === 'uploading' && (
                              <HStack w="full" spacing={2}>
                                <Progress
                                  value={file.uploadProgress}
                                  colorScheme="brand"
                                  size="sm"
                                  flex={1}
                                  borderRadius="full"
                                />
                                <Text fontSize="xs" color="gray.600" minW="40px">
                                  {Math.round(file.uploadProgress)}%
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                          
                          <HStack spacing={1}>
                            <IconButton
                              icon={<MdDownload />}
                              size="sm"
                              variant="ghost"
                              onClick={() => downloadFile(file)}
                              aria-label="Descargar archivo"
                            />
                            <IconButton
                              icon={<MdDelete />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => deleteFile(file.id)}
                              aria-label="Eliminar archivo"
                            />
                          </HStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default FileUpload;