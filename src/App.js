"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var browser_image_resizer_1 = require("browser-image-resizer");
// ICO conversion will be handled with canvas
var dropzone_1 = require("@mantine/dropzone");
var core_1 = require("@mantine/core");
var icons_react_1 = require("@tabler/icons-react");
var notifications_1 = require("@mantine/notifications");
require("./App.css");
var MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
var ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/x-icon',
    'image/vnd.microsoft.icon',
];
function App() {
    var _this = this;
    var _a = (0, react_1.useState)(null), file = _a[0], setFile = _a[1];
    var _b = (0, react_1.useState)(null), convertedFile = _b[0], setConvertedFile = _b[1];
    var _c = (0, react_1.useState)('jpeg'), format = _c[0], setFormat = _c[1];
    var _d = (0, react_1.useState)('jpeg'), selectedFormat = _d[0], setSelectedFormat = _d[1];
    var _e = (0, react_1.useState)(false), isConverting = _e[0], setIsConverting = _e[1];
    var _f = (0, react_1.useState)('converted'), filename = _f[0], setFilename = _f[1];
    var _g = (0, react_1.useState)(500), fileSizeLimit = _g[0], setFileSizeLimit = _g[1];
    var _h = (0, react_1.useState)('KB'), fileSizeUnit = _h[0], setFileSizeUnit = _h[1];
    var openRef = (0, react_1.useRef)(null);
    var onDrop = (0, react_1.useCallback)(function (files) {
        var imageFile = files[0];
        if (!imageFile)
            return;
        if (imageFile.size > MAX_FILE_SIZE) {
            notifications_1.notifications.show({
                title: 'File too large',
                message: 'Image must be smaller than 5MB',
                color: 'red',
            });
            return;
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
            notifications_1.notifications.show({
                title: 'Invalid file type',
                message: 'Please upload a valid image file (JPEG, PNG, WebP, GIF, or BMP)',
                color: 'red',
            });
            return;
        }
        setFile(imageFile);
        setConvertedFile(null);
    }, [setFile, setConvertedFile]);
    var handleFormatChange = function (value) {
        if (value && (value === 'jpeg' || value === 'png' || value === 'webp' || value === 'ico')) {
            setFormat(value);
            setSelectedFormat(value);
        }
    };
    // Calculate quality to achieve target file size
    var getQualityForTargetSize = function (currentSize, targetSizeBytes, currentQuality) {
        if (currentQuality === void 0) { currentQuality = 0.9; }
        // If already below target size, return current quality
        if (currentSize <= targetSizeBytes) {
            return currentQuality;
        }
        // Reduce quality by 10% and ensure it doesn't go below 0.1
        var newQuality = Math.max(0.1, currentQuality - 0.1);
        // If we've hit the minimum quality, return it
        if (newQuality <= 0.1) {
            return 0.1;
        }
        // Estimate new size based on quality reduction
        var estimatedNewSize = (currentSize * newQuality) / currentQuality;
        // If we're close enough to the target, return the new quality
        if (estimatedNewSize <= targetSizeBytes * 1.1) {
            return newQuality;
        }
        // Otherwise, recurse with the new quality
        return getQualityForTargetSize(estimatedNewSize, targetSizeBytes, newQuality);
    };
    var convertImage = function () { return __awaiter(_this, void 0, void 0, function () {
        var targetSizeBytes, previewUrl, img_1, canvas, ctx, icoUrl, quality, resultBlob, i, config, resizedImage, url, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file)
                        return [2 /*return*/];
                    setIsConverting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, 11, 12]);
                    targetSizeBytes = fileSizeUnit === 'KB'
                        ? fileSizeLimit * 1024
                        : fileSizeLimit * 1024 * 1024;
                    if (!(format === 'ico')) return [3 /*break*/, 4];
                    return [4 /*yield*/, new Promise(function (resolve) {
                            var reader = new FileReader();
                            reader.onload = function (e) { var _a; return resolve((_a = e.target) === null || _a === void 0 ? void 0 : _a.result); };
                            reader.readAsDataURL(file);
                        })];
                case 2:
                    previewUrl = _a.sent();
                    img_1 = new window.Image();
                    img_1.src = URL.createObjectURL(file);
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            img_1.onload = function () { return resolve(); };
                            img_1.onerror = function () { return reject(new Error('Failed to load image')); };
                        })];
                case 3:
                    _a.sent();
                    canvas = document.createElement('canvas');
                    canvas.width = img_1.width;
                    canvas.height = img_1.height;
                    ctx = canvas.getContext('2d');
                    if (!ctx)
                        throw new Error('Could not create canvas context');
                    ctx.drawImage(img_1, 0, 0);
                    icoUrl = canvas.toDataURL('image/png');
                    setConvertedFile({
                        preview: previewUrl,
                        download: icoUrl
                    });
                    return [2 /*return*/];
                case 4:
                    quality = 0.9;
                    resultBlob = void 0;
                    i = 0;
                    _a.label = 5;
                case 5:
                    if (!(i < 5)) return [3 /*break*/, 8];
                    config = {
                        quality: quality,
                        maxWidth: 2560,
                        maxHeight: 2560,
                        mimeType: "image/".concat(format),
                        autoRotate: true,
                        debug: false,
                    };
                    return [4 /*yield*/, (0, browser_image_resizer_1.readAndCompressImage)(file, config)];
                case 6:
                    resizedImage = _a.sent();
                    // If we're under the target size or at minimum quality, we're done
                    if (resizedImage.size <= targetSizeBytes || quality <= 0.1) {
                        resultBlob = resizedImage;
                        return [3 /*break*/, 8];
                    }
                    // Otherwise, reduce quality and try again
                    quality = getQualityForTargetSize(resizedImage.size, targetSizeBytes, quality);
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 5];
                case 8:
                    url = URL.createObjectURL(resultBlob);
                    setConvertedFile({
                        preview: url,
                        download: url
                    });
                    _a.label = 9;
                case 9: return [3 /*break*/, 12];
                case 10:
                    error_1 = _a.sent();
                    console.error('Error converting image:', error_1);
                    notifications_1.notifications.show({
                        title: 'Error',
                        message: 'Failed to convert image. Please try again.',
                        color: 'red',
                    });
                    return [3 /*break*/, 12];
                case 11:
                    setIsConverting(false);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    }); };
    var handleDownload = (0, react_1.useCallback)(function () {
        if (!convertedFile)
            return;
        var link = document.createElement('a');
        var cleanFilename = filename.trim() || 'converted';
        link.href = convertedFile.download;
        link.download = "".concat(cleanFilename, ".").concat(format);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [convertedFile, format, filename]);
    var reset = function () {
        setFile(null);
        setConvertedFile(null);
    };
    var theme = (0, core_1.createTheme)({
    // You can customize your theme here if needed
    });
    return (<core_1.MantineProvider theme={theme}>
      <notifications_1.Notifications position="top-center"/>
      <core_1.Container fluid style={{ minHeight: '100vh', padding: '0 1rem 0.5rem', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <core_1.Stack align="flex-start" gap={0} style={{ width: 'auto', margin: 0, padding: '1rem 0' }}>
          <core_1.Box style={{
            width: '120px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '-10px',
            marginTop: '-5px'
        }}>
            <img src="./assets/sleepyfox-D0vGDUeh.ico" alt="SleepyFox" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" onDragStart={function (e) { return e.preventDefault(); }}/>
          </core_1.Box>
          <core_1.Title order={1} fw={700} style={{ fontFamily: 'sans-serif', letterSpacing: '-0.5px', margin: '-36px 0 0 0', lineHeight: 1, fontSize: '1.8rem' }}>
            sleepyfox
          </core_1.Title>
        </core_1.Stack>
        
        <core_1.Stack gap="sm" style={{ marginTop: '2rem', flex: 1, justifyContent: 'center' }}>
          
        </core_1.Stack>

        {/* Main Content */}
        <core_1.Card withBorder radius="lg" shadow="sm" p={0} style={{ overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
          <core_1.Grid gutter={0} style={{ flex: 1, width: '100%' }}>
            {/* Left Side - Upload Area */}
            <core_1.Grid.Col span={{ base: 12, md: 4 }} p="xl" style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRight: '1px solid var(--mantine-color-gray-3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
              {!file ? (<dropzone_1.Dropzone onDrop={onDrop} onReject={function () {
                notifications_1.notifications.show({
                    title: 'Error',
                    message: 'File type not supported',
                    color: 'red',
                });
            }} maxSize={MAX_FILE_SIZE} accept={ACCEPTED_IMAGE_TYPES} openRef={openRef} style={{
                border: '2px dashed var(--mantine-color-gray-4)',
                background: 'white',
                borderRadius: 'var(--mantine-radius-md)',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                  <core_1.Group justify="center" gap="md" mih={220} style={{ pointerEvents: 'none' }}>
                    <dropzone_1.Dropzone.Accept>
                      <core_1.ThemeIcon color="blue" variant="light" size="xl" radius="xl">
                        <icons_react_1.IconUpload size="1.5rem" stroke={2}/>
                      </core_1.ThemeIcon>
                    </dropzone_1.Dropzone.Accept>
                    <dropzone_1.Dropzone.Reject>
                      <core_1.ThemeIcon color="red" variant="light" size="xl" radius="xl">
                        <icons_react_1.IconX size="1.5rem" stroke={2}/>
                      </core_1.ThemeIcon>
                    </dropzone_1.Dropzone.Reject>
                    <dropzone_1.Dropzone.Idle>
                      <core_1.ThemeIcon color="gray" variant="light" size="xl" radius="xl">
                        <icons_react_1.IconPhoto size="1.5rem" stroke={2}/>
                      </core_1.ThemeIcon>
                    </dropzone_1.Dropzone.Idle>

                    <div style={{ textAlign: 'center' }}>
                      <core_1.Text size="lg" fw={500} mb={5}>
                        Drop your image here
                      </core_1.Text>
                      <core_1.Text size="sm" c="dimmed">
                        or click to browse files
                      </core_1.Text>
                      <core_1.Text size="xs" c="dimmed" mt="sm">
                        Supports: JPG, PNG, WebP, GIF, BMP, ICO
                      </core_1.Text>
                      <core_1.Text size="xs" c="dimmed">
                        Max size: 5MB
                      </core_1.Text>
                    </div>
                  </core_1.Group>
                </dropzone_1.Dropzone>) : (<core_1.Stack h="100%" justify="space-between">
                  <div>
                    <core_1.Text fw={600} mb="xs">Selected Image</core_1.Text>
                    <core_1.Card withBorder p="md" radius="md" mb="md">
                      <core_1.Stack gap="sm">
                        <core_1.Box style={{
                width: '100%',
                height: '200px',
                borderRadius: 'var(--mantine-radius-md)',
                overflow: 'hidden',
                background: 'var(--mantine-color-gray-1)'
            }}>
                          <img src={URL.createObjectURL(file)} alt="Preview" style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }}/>
                        </core_1.Box>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <core_1.Text size="sm" fw={500} truncate>{file.name}</core_1.Text>
                          <core_1.Text size="xs" c="dimmed">
                            {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1].toUpperCase()}
                          </core_1.Text>
                        </div>
                        <core_1.Button variant="subtle" color="red" size="xs" onClick={reset} px={8}>
                          <icons_react_1.IconX size={16}/>
                        </core_1.Button>
                      </core_1.Stack>
                    </core_1.Card>

                    <core_1.Text fw={600} mb="xs" mt="xl">Output Settings</core_1.Text>
                    <core_1.Stack gap="md">
                      <core_1.Select label="Convert to format" value={selectedFormat} onChange={handleFormatChange} data={[
                { value: 'jpeg', label: 'JPEG' },
                { value: 'png', label: 'PNG' },
                { value: 'webp', label: 'WebP' },
                { value: 'ico', label: 'ICO' },
            ]} disabled={isConverting} leftSection={<icons_react_1.IconSettings size={18}/>}/>

                      <core_1.TextInput label="File name" placeholder="Enter file name (without extension)" value={filename} onChange={function (e) { return setFilename(e.target.value); }} disabled={isConverting}/>

                      <div>
                        <core_1.Group mb={5} justify="space-between">
                          <core_1.Text component="label" size="sm" fw={500}>
                            Maximum file size
                          </core_1.Text>
                          <core_1.Tooltip label="The app will optimize the image to be at or below this size" withArrow position="top" maw={250} multiline>
                            <core_1.Box component="span" style={{ display: 'inline-flex', cursor: 'help' }}>
                              <icons_react_1.IconInfoCircle size={16} style={{ color: 'var(--mantine-color-dimmed)' }}/>
                            </core_1.Box>
                          </core_1.Tooltip>
                        </core_1.Group>
                        <core_1.Group gap="xs">
                          <core_1.NumberInput value={fileSizeLimit} onChange={function (value) { return setFileSizeLimit(Number(value) || 100); }} min={1} max={fileSizeUnit === 'KB' ? 1024 : 10} step={10} disabled={isConverting} style={{ flex: 1 }}/>
                          <core_1.Select value={fileSizeUnit} onChange={function (value) { return setFileSizeUnit(value); }} data={[
                { value: 'KB', label: 'KB' },
                { value: 'MB', label: 'MB' },
            ]} disabled={isConverting} style={{ width: '100px' }}/>
                        </core_1.Group>
                      </div>
                    </core_1.Stack>
                  </div>

                  <core_1.Button onClick={convertImage} loading={isConverting} size="lg" fullWidth mt="20px" style={{
                backgroundColor: '#E0773C',
                color: 'white',
                border: 'none',
                '&:hover': {
                    backgroundColor: '#d06b33'
                }
            }}>
                    {isConverting ? 'Processing...' : 'Convert Image'}
                  </core_1.Button>
                </core_1.Stack>)}
            </core_1.Grid.Col>

            {/* Right Side - Preview */}
            <core_1.Grid.Col span={{ base: 12, md: 8 }} p="xl">
              <core_1.Stack h="100%" justify="center">
                {!convertedFile ? (<core_1.Center h="100%" style={{ minHeight: '400px' }}>
                    <core_1.Stack align="center" gap="xs">
                      <core_1.ThemeIcon variant="light" color="gray" size="xl" radius="xl">
                        <icons_react_1.IconPhoto size="2rem"/>
                      </core_1.ThemeIcon>
                      <core_1.Text c="dimmed" ta="center">
                        {file ? 'Configure settings and click "Convert Image"' : 'Your converted image will appear here'}
                      </core_1.Text>
                    </core_1.Stack>
                  </core_1.Center>) : (<core_1.Stack h="100%" style={{ minHeight: '400px' }}>
                    <core_1.Group justify="space-between" mb="md">
                      <div>
                        <core_1.Text fw={600}>
                          Converted Image
                        </core_1.Text>
                        <core_1.Text size="sm" c="dimmed">
                          {filename}.{format} • {format.toUpperCase()}
                        </core_1.Text>
                      </div>
                      <core_1.Button leftSection={<icons_react_1.IconDownload size={18}/>} onClick={handleDownload} size="sm" style={{
                backgroundColor: '#E0773C',
                color: 'white',
                border: 'none',
                '&:hover': {
                    backgroundColor: '#d06b33'
                }
            }}>
                        Download
                      </core_1.Button>
                    </core_1.Group>
                    
                    <core_1.Box style={{
                flex: 1,
                borderRadius: 'var(--mantine-radius-md)',
                border: '1px dashed var(--mantine-color-gray-4)',
                background: 'var(--mantine-color-gray-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--mantine-spacing-md)',
                overflow: 'auto'
            }}>
                      <core_1.Image src={typeof convertedFile === 'string' ? convertedFile : convertedFile.preview} alt="Converted preview" fit="contain" style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                borderRadius: 'var(--mantine-radius-sm)'
            }}/>
                    </core_1.Box>
                  </core_1.Stack>)}
              </core_1.Stack>
            </core_1.Grid.Col>
          </core_1.Grid>
        </core_1.Card>

        {/* Footer */}
        <core_1.Text size="sm" c="dimmed" ta="center" mt="xl">
          made by simi • v1.0.0
        </core_1.Text>
      </core_1.Container>
    </core_1.MantineProvider>);
}
;
exports.default = App;
