import { useState, useRef, useCallback } from 'react';
import { readAndCompressImage } from 'browser-image-resizer';
// ICO conversion will be handled with canvas
import { Dropzone } from '@mantine/dropzone';
import { 
  Button, 
  Select, 
  Group, 
  Text, 
  Container, 
  Image, 
  Stack, 
  Title, 
  Box, 
  TextInput, 
  NumberInput, 
  Tooltip, 
  Card,
  Grid,
  ThemeIcon,
  Center,
  MantineProvider,
  createTheme
} from '@mantine/core';
import { IconUpload, IconPhoto, IconX, IconDownload, IconInfoCircle, IconSettings } from '@tabler/icons-react';
import { notifications, Notifications } from '@mantine/notifications';
import './App.css';

type ConversionFormat = 'jpeg' | 'png' | 'webp' | 'ico';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];

function App() {
  const [file, setFile] = useState<File | null>(null);
  interface ConvertedFile {
    preview: string;
    download: string;
  }
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const [format, setFormat] = useState<ConversionFormat>('jpeg');
  const [selectedFormat, setSelectedFormat] = useState<string>('jpeg');
  const [isConverting, setIsConverting] = useState(false);
  const [filename, setFilename] = useState('converted');
  const [fileSizeLimit, setFileSizeLimit] = useState<number>(500);
  const [fileSizeUnit, setFileSizeUnit] = useState<'KB' | 'MB'>('KB');
  const openRef = useRef<() => void>(null);

  const onDrop = useCallback((files: File[]) => {
    const imageFile = files[0];
    if (!imageFile) return;

    if (imageFile.size > MAX_FILE_SIZE) {
      notifications.show({
        title: 'File too large',
        message: 'Image must be smaller than 5MB',
        color: 'red',
      });
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
      notifications.show({
        title: 'Invalid file type',
        message: 'Please upload a valid image file (JPEG, PNG, WebP, GIF, or BMP)',
        color: 'red',
      });
      return;
    }

    setFile(imageFile);
    setConvertedFile(null);
  }, [setFile, setConvertedFile]);

  const handleFormatChange = (value: string | null) => {
    if (value && (value === 'jpeg' || value === 'png' || value === 'webp' || value === 'ico')) {
      setFormat(value);
      setSelectedFormat(value);
    }
  };

  // Calculate quality to achieve target file size
  const getQualityForTargetSize = (currentSize: number, targetSizeBytes: number, currentQuality: number = 0.9): number => {
    // If already below target size, return current quality
    if (currentSize <= targetSizeBytes) {
      return currentQuality;
    }
    
    // Reduce quality by 10% and ensure it doesn't go below 0.1
    const newQuality = Math.max(0.1, currentQuality - 0.1);
    
    // If we've hit the minimum quality, return it
    if (newQuality <= 0.1) {
      return 0.1;
    }
    
    // Estimate new size based on quality reduction
    const estimatedNewSize = (currentSize * newQuality) / currentQuality;
    
    // If we're close enough to the target, return the new quality
    if (estimatedNewSize <= targetSizeBytes * 1.1) {
      return newQuality;
    }
    
    // Otherwise, recurse with the new quality
    return getQualityForTargetSize(estimatedNewSize, targetSizeBytes, newQuality);
  };

  const convertImage = async () => {
    if (!file) return;

    setIsConverting(true);
    try {
      // Calculate target size in bytes
      const targetSizeBytes = fileSizeUnit === 'KB' 
        ? fileSizeLimit * 1024 
        : fileSizeLimit * 1024 * 1024;
      // Special handling for ICO format
      if (format === 'ico') {
        // Create a promise to get the original image as data URL for preview
        const previewUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        
        // Create the ICO file for download
        const img = new window.Image();
        img.src = URL.createObjectURL(file);
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to load image'));
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create canvas context');
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to ICO data URL for download
        const icoUrl = canvas.toDataURL('image/png');
        
        setConvertedFile({
          preview: previewUrl,
          download: icoUrl
        });
        return;
      } else {
        // For other formats, use quality control to hit target size
        // Start with high quality and reduce as needed
        let quality = 0.9;
        let resultBlob: Blob;
        
        // Try up to 5 times to get under the target size
        for (let i = 0; i < 5; i++) {
          const config = {
            quality: quality,
            maxWidth: 2560,
            maxHeight: 2560,
            mimeType: `image/${format}`,
            autoRotate: true,
            debug: false,
          };
          
          const resizedImage = await readAndCompressImage(file, config);
          
          // If we're under the target size or at minimum quality, we're done
          if (resizedImage.size <= targetSizeBytes || quality <= 0.1) {
            resultBlob = resizedImage;
            break;
          }
          
          // Otherwise, reduce quality and try again
          quality = getQualityForTargetSize(resizedImage.size, targetSizeBytes, quality);
        }
        
        const url = URL.createObjectURL(resultBlob!);
        setConvertedFile({
          preview: url,
          download: url
        });
      }
    } catch (error) {
      console.error('Error converting image:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to convert image. Please try again.',
        color: 'red',
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    const cleanFilename = filename.trim() || 'converted';
    link.href = convertedFile.download;
    link.download = `${cleanFilename}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [convertedFile, format, filename]);

  const reset = () => {
    setFile(null);
    setConvertedFile(null);
  };

  const theme = createTheme({
    // You can customize your theme here if needed
  });

  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-center" />
      <Container fluid style={{ minHeight: '100vh', padding: '0 1rem 0.5rem', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Stack align="flex-start" gap={0} style={{ width: 'auto', margin: 0, padding: '1rem 0' }}>
          <Box
            style={{
              width: '120px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '-10px',
              marginTop: '-5px'
            }}
          >
            <img 
              src="./assets/sleepyfox-D0vGDUeh.ico"
              alt="SleepyFox"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              draggable="false"
              onDragStart={(e) => e.preventDefault()}
            />
          </Box>
          <Title order={1} fw={700} style={{ fontFamily: 'sans-serif', letterSpacing: '-0.5px', margin: '-36px 0 0 0', lineHeight: 1, fontSize: '1.8rem' }}>
            sleepyfox
          </Title>
        </Stack>
        
        <Stack gap="sm" style={{ marginTop: '2rem', flex: 1, justifyContent: 'center' }}>
          
        </Stack>

        {/* Main Content */}
        <Card withBorder radius="lg" shadow="sm" p={0} style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <Grid gutter={0} style={{ flex: 1, width: '100%' }}>
            {/* Left Side - Upload Area */}
            <Grid.Col span={{ base: 12, md: 4 }} p="xl" style={{ 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRight: '1px solid var(--mantine-color-gray-3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              {!file ? (
                <Dropzone
                  onDrop={onDrop}
                  onReject={() => {
                    notifications.show({
                      title: 'Error',
                      message: 'File type not supported',
                      color: 'red',
                    });
                  }}
                  maxSize={MAX_FILE_SIZE}
                  accept={ACCEPTED_IMAGE_TYPES}
                  openRef={openRef}
                  style={{ 
                    border: '2px dashed var(--mantine-color-gray-4)',
                    background: 'white',
                    borderRadius: 'var(--mantine-radius-md)',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Group justify="center" gap="md" mih={220} style={{ pointerEvents: 'none' }}>
                    <Dropzone.Accept>
                      <ThemeIcon color="blue" variant="light" size="xl" radius="xl">
                        <IconUpload size="1.5rem" stroke={2} />
                      </ThemeIcon>
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <ThemeIcon color="red" variant="light" size="xl" radius="xl">
                        <IconX size="1.5rem" stroke={2} />
                      </ThemeIcon>
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <ThemeIcon color="gray" variant="light" size="xl" radius="xl">
                        <IconPhoto size="1.5rem" stroke={2} />
                      </ThemeIcon>
                    </Dropzone.Idle>

                    <div style={{ textAlign: 'center' }}>
                      <Text size="lg" fw={500} mb={5}>
                        Drop your image here
                      </Text>
                      <Text size="sm" c="dimmed">
                        or click to browse files
                      </Text>
                      <Text size="xs" c="dimmed" mt="sm">
                        Supports: JPG, PNG, WebP, GIF, BMP, ICO
                      </Text>
                      <Text size="xs" c="dimmed">
                        Max size: 5MB
                      </Text>
                    </div>
                  </Group>
                </Dropzone>
              ) : (
                <Stack h="100%" justify="space-between">
                  <div>
                    <Text fw={600} mb="xs">Selected Image</Text>
                    <Card withBorder p="md" radius="md" mb="md">
                      <Stack gap="sm">
                        <Box style={{ 
                          width: '100%', 
                          height: '200px', 
                          borderRadius: 'var(--mantine-radius-md)', 
                          overflow: 'hidden',
                          background: 'var(--mantine-color-gray-1)'
                        }}>
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'contain' 
                            }} 
                          />
                        </Box>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Text size="sm" fw={500} truncate>{file.name}</Text>
                          <Text size="xs" c="dimmed">
                            {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1].toUpperCase()}
                          </Text>
                        </div>
                        <Button 
                          variant="subtle" 
                          color="red" 
                          size="xs" 
                          onClick={reset}
                          px={8}
                        >
                          <IconX size={16} />
                        </Button>
                      </Stack>
                    </Card>

                    <Text fw={600} mb="xs" mt="xl">Output Settings</Text>
                    <Stack gap="md">
                      <Select
                        label="Convert to format"
                        value={selectedFormat}
                        onChange={handleFormatChange}
                        data={[
                          { value: 'jpeg', label: 'JPEG' },
                          { value: 'png', label: 'PNG' },
                          { value: 'webp', label: 'WebP' },
                          { value: 'ico', label: 'ICO' },
                        ]}
                        disabled={isConverting}
                        leftSection={<IconSettings size={18} />}
                      />

                      <TextInput
                        label="File name"
                        placeholder="Enter file name (without extension)"
                        value={filename}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilename(e.target.value)}
                        disabled={isConverting}
                      />

                      <div>
                        <Group mb={5} justify="space-between">
                          <Text component="label" size="sm" fw={500}>
                            Maximum file size
                          </Text>
                          <Tooltip 
                            label="The app will optimize the image to be at or below this size"
                            withArrow
                            position="top"
                            maw={250}
                            multiline
                          >
                            <Box component="span" style={{ display: 'inline-flex', cursor: 'help' }}>
                              <IconInfoCircle size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
                            </Box>
                          </Tooltip>
                        </Group>
                        <Group gap="xs">
                          <NumberInput
                            value={fileSizeLimit}
                            onChange={(value: number | string) => setFileSizeLimit(Number(value) || 100)}
                            min={1}
                            max={fileSizeUnit === 'KB' ? 1024 : 10}
                            step={10}
                            disabled={isConverting}
                            style={{ flex: 1 }}
                          />
                          <Select
                            value={fileSizeUnit}
                            onChange={(value: string | null) => setFileSizeUnit(value as 'KB' | 'MB')}
                            data={[
                              { value: 'KB', label: 'KB' },
                              { value: 'MB', label: 'MB' },
                            ]}
                            disabled={isConverting}
                            style={{ width: '100px' }}
                          />
                        </Group>
                      </div>
                    </Stack>
                  </div>

                  <Button
                    onClick={convertImage}
                    loading={isConverting}
                    size="lg"
                    fullWidth
                    mt="20px"
                    style={{
                      backgroundColor: '#E0773C',
                      color: 'white',
                      border: 'none',
                      '&:hover': {
                        backgroundColor: '#d06b33'
                      }
                    }}
                  >
                    {isConverting ? 'Processing...' : 'Convert Image'}
                  </Button>
                </Stack>
              )}
            </Grid.Col>

            {/* Right Side - Preview */}
            <Grid.Col span={{ base: 12, md: 8 }} p="xl">
              <Stack h="100%" justify="center">
                {!convertedFile ? (
                  <Center h="100%" style={{ minHeight: '400px' }}>
                    <Stack align="center" gap="xs">
                      <ThemeIcon variant="light" color="gray" size="xl" radius="xl">
                        <IconPhoto size="2rem" />
                      </ThemeIcon>
                      <Text c="dimmed" ta="center">
                        {file ? 'Configure settings and click "Convert Image"' : 'Your converted image will appear here'}
                      </Text>
                    </Stack>
                  </Center>
                ) : (
                  <Stack h="100%" style={{ minHeight: '400px' }}>
                    <Group justify="space-between" mb="md">
                      <div>
                        <Text fw={600}>
                          Converted Image
                        </Text>
                        <Text size="sm" c="dimmed">
                          {filename}.{format} • {format.toUpperCase()}
                        </Text>
                      </div>
                      <Button
                        leftSection={<IconDownload size={18} />}
                        onClick={handleDownload}
                        size="sm"
                        style={{
                          backgroundColor: '#E0773C',
                          color: 'white',
                          border: 'none',
                          '&:hover': {
                            backgroundColor: '#d06b33'
                          }
                        }}
                      >
                        Download
                      </Button>
                    </Group>
                    
                    <Box
                      style={{
                        flex: 1,
                        borderRadius: 'var(--mantine-radius-md)',
                        border: '1px dashed var(--mantine-color-gray-4)',
                        background: 'var(--mantine-color-gray-0)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 'var(--mantine-spacing-md)',
                        overflow: 'auto'
                      }}
                    >
                      <Image 
                        src={typeof convertedFile === 'string' ? convertedFile : convertedFile.preview} 
                        alt="Converted preview" 
                        fit="contain"
                        style={{ 
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: 'var(--mantine-radius-sm)'
                        }}
                      />
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Footer */}
        <Text size="sm" c="dimmed" ta="center" mt="xl">
          made by simi • v1.0.0
        </Text>
      </Container>
    </MantineProvider>
  );
};

export default App;
