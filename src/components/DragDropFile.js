import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Progress,
  useColorModeValue,
  HStack,
  Badge,
  IconButton,
  Input,
} from '@chakra-ui/react';
import { MdCloudUpload, MdFileUpload, MdClose, MdCheckCircle } from 'react-icons/md';

function DragDropFile({ onFileSelect, accept = '*', maxSize = 10 * 1024 * 1024, multiple = false }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processFiles = (fileList) => {
    const validFiles = fileList.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      
      // Check file type
      if (accept !== '*' && !file.type.match(accept.replace('*', '.*'))) {
        alert(`File type ${file.type} is not accepted. Accepted types: ${accept}`);
        return false;
      }
      
      return true;
    });

    if (multiple) {
      setFiles(prev => [...prev, ...validFiles]);
    } else {
      setFiles(validFiles.slice(0, 1));
    }

    // Simulate upload
    validFiles.forEach(file => {
      simulateUpload(file);
    });
  };

  const simulateUpload = (file) => {
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
    setUploadStatus(prev => ({ ...prev, [file.name]: 'uploading' }));

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = (prev[file.name] || 0) + Math.random() * 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          setUploadStatus(prev => ({ ...prev, [file.name]: 'completed' }));
          onFileSelect && onFileSelect(file);
          return { ...prev, [file.name]: 100 };
        }
        return { ...prev, [file.name]: newProgress };
      });
    }, 200);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
  };

  return (
    <VStack spacing={4} w="full">
      {/* Drag and Drop Area */}
      <Box
        w="full"
        p={8}
        border="2px dashed"
        borderColor={isDragOver ? 'brand.400' : borderColor}
        borderRadius="lg"
        bg={isDragOver ? 'brand.50' : bg}
        textAlign="center"
        cursor="pointer"
        transition="all 0.3s ease"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
        _hover={{ borderColor: 'brand.400', bg: 'brand.50' }}
      >
        <VStack spacing={4}>
          <Icon as={isDragOver ? MdFileUpload : MdCloudUpload} w={12} h={12} color="brand.500" />
          <VStack spacing={2}>
            <Text fontWeight="medium" fontSize="lg">
              {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
            </Text>
            <Text fontSize="sm" color="gray.600">
              or click to select files
            </Text>
            <Text fontSize="xs" color="gray.500">
              Max file size: {formatFileSize(maxSize)} | Accepted: {accept}
            </Text>
          </VStack>
        </VStack>
        
        <Input
          id="file-input"
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          display="none"
        />
      </Box>

      {/* File List */}
      {files.length > 0 && (
        <VStack spacing={3} w="full" align="stretch">
          {files.map((file) => (
            <Box
              key={file.name}
              p={4}
              bg={bg}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
            >
              <VStack spacing={3} w="full">
                <HStack justify="space-between" w="full">
                  <HStack spacing={3} flex={1}>
                    <Icon
                      as={uploadStatus[file.name] === 'completed' ? MdCheckCircle : MdFileUpload}
                      color={uploadStatus[file.name] === 'completed' ? 'green.500' : 'brand.500'}
                    />
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="medium" fontSize="sm">
                          {file.name}
                        </Text>
                        <Badge colorScheme="blue" fontSize="xs">
                          {formatFileSize(file.size)}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        {file.type || 'Unknown type'}
                      </Text>
                    </VStack>
                  </HStack>
                  
                  <IconButton
                    icon={<MdClose />}
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFile(file.name)}
                    aria-label="Remove file"
                  />
                </HStack>

                {/* Upload Progress */}
                {uploadProgress[file.name] && uploadProgress[file.name] < 100 && (
                  <VStack spacing={2} w="full">
                    <Progress
                      value={uploadProgress[file.name]}
                      size="sm"
                      colorScheme="brand"
                      borderRadius="full"
                      w="full"
                    />
                    <HStack justify="space-between" w="full">
                      <Text fontSize="xs" color="gray.600">
                        {uploadStatus[file.name] === 'completed' ? 'Completed' : 'Uploading...'}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {Math.round(uploadProgress[file.name])}%
                      </Text>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      )}
    </VStack>
  );
}

export default DragDropFile;