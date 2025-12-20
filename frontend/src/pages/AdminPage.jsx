// File: frontend/src/pages/AdminPage.jsx
// FAANG Quality Redesign - Visitor Registration (Matches Dashboard Theme)
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Input,
    Heading, useToast, VStack, Text, Flex,
    InputGroup, InputLeftElement, InputRightElement, Icon,
    ScaleFade, Center, IconButton, Card, CardBody, useColorModeValue,
    HStack, Image, Badge, Switch
} from '@chakra-ui/react';
import {
    FaUserPlus, FaBuilding, FaIdCard, FaArrowLeft,
    FaCamera, FaPhone, FaCheckCircle, FaExclamationCircle,
    FaCloudUploadAlt, FaTimes, FaSave, FaFilePdf, FaImage, FaFileUpload
} from 'react-icons/fa';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import SessionTimeout from '../utils/sessionTimeout';

// --- Custom Components ---

const FormInput = ({ label, icon, name, placeholder, value, type = "text", error, handleChange, ...props }) => {
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel
                fontSize="xs"
                fontWeight="700"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="0.5px"
                mb={2}
            >
                {label}
            </FormLabel>
            <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                    <Icon as={icon} color={value ? "#1a73e8" : "gray.400"} />
                </InputLeftElement>
                <Input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    bg="gray.50"
                    fontSize="sm"
                    fontWeight="500"
                    border="1px solid"
                    borderColor="gray.200"
                    _focus={{ bg: "white", borderColor: "#1a73e8", boxShadow: "none" }}
                    _hover={{ borderColor: "gray.300" }}
                    {...props}
                />
                {value && !error && (
                    <InputRightElement>
                        <Icon as={FaCheckCircle} color="green.500" />
                    </InputRightElement>
                )}
                {error && (
                    <InputRightElement>
                        <Icon as={FaExclamationCircle} color="red.500" />
                    </InputRightElement>
                )}
            </InputGroup>
            {error && <Text color="red.500" fontSize="xs" mt={1} fontWeight="500">{error}</Text>}
        </FormControl>
    );
};

// Reusable File Upload Component
const FileUploadArea = ({ label, file, preview, onFileSelect, onRemove, error, isRequired = false, accept = "image/*" }) => {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDrag = (e, dragging) => {
        e.preventDefault();
        setIsDragging(dragging);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const isPdf = file?.type === "application/pdf";

    return (
        <FormControl isInvalid={!!error} mb={6}>
            <FormLabel fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={2}>
                {label} {isRequired && <Text as="span" color="red.500">*</Text>}
            </FormLabel>
            <Box
                border="2px dashed"
                borderColor={error ? "red.300" : isDragging ? "#1a73e8" : file ? "transparent" : "gray.300"}
                borderRadius="xl"
                bg={error ? "red.50" : isDragging ? "blue.50" : "gray.50"}
                h="200px" // Compact height
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                cursor="pointer"
                position="relative"
                overflow="hidden"
                transition="all 0.2s"
                onDragOver={(e) => handleDrag(e, true)}
                onDragLeave={(e) => handleDrag(e, false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
                _hover={{ borderColor: "#1a73e8", bg: file ? "white" : "gray.100" }}
            >
                {file ? (
                    <>
                        {isPdf ? (
                            <VStack color="red.500">
                                <Icon as={FaFilePdf} boxSize={10} />
                                <Text fontSize="sm" fontWeight="600" color="gray.700">{file.name}</Text>
                            </VStack>
                        ) : (
                            <Image src={preview} alt="Preview" w="100%" h="100%" objectFit="cover" />
                        )}

                        <Box
                            position="absolute"
                            bottom={0} left={0} right={0}
                            bg="blackAlpha.700"
                            p={2}
                            textAlign="center"
                            backdropFilter="blur(4px)"
                        >
                            <Flex justify="center" align="center" color="white">
                                <Icon as={FaCamera} mr={2} />
                                <Text fontSize="xs" fontWeight="600">Change File</Text>
                            </Flex>
                        </Box>
                        <IconButton
                            aria-label="Remove"
                            icon={<FaTimes />}
                            size="sm"
                            position="absolute"
                            top={2} right={2}
                            colorScheme="red"
                            borderRadius="full"
                            onClick={(e) => { e.stopPropagation(); onRemove(); }}
                            boxShadow="lg"
                        />
                    </>
                ) : (
                    <VStack spacing={2} color="gray.400">
                        <Center w="50px" h="50px" bg="white" borderRadius="full" boxShadow="sm">
                            <Icon as={FaCloudUploadAlt} boxSize={5} color="#1a73e8" />
                        </Center>
                        <Box textAlign="center">
                            <Text fontWeight="600" color="gray.600" fontSize="sm">Click to Upload</Text>
                            <Text fontSize="xs">or drag and drop</Text>
                        </Box>
                        <Badge colorScheme={error ? "red" : "gray"} variant="subtle" px={2} borderRadius="md" fontSize="xs">
                            {accept === "image/*" ? "Images Only" : "PDF / Images"}
                        </Badge>
                    </VStack>
                )}
                <input
                    type="file"
                    ref={inputRef}
                    style={{ display: 'none' }}
                    accept={accept}
                    onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
                />
            </Box>
            {error && <Text color="red.500" fontSize="xs" mt={1} fontWeight="600">{error}</Text>}
        </FormControl>
    );
};

function AdminPage() {
    const [formData, setFormData] = useState({
        nik: '',
        full_name: '',
        institution: '',
        phone: '',
        auto_checkin: false,
    });

    // File States
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const [ktpFile, setKtpFile] = useState(null);
    const [ktpPreview, setKtpPreview] = useState(null);

    const [taskLetterFile, setTaskLetterFile] = useState(null);
    const [taskLetterPreview, setTaskLetterPreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState({});

    const toast = useToast();
    const navigate = useNavigate();

    // Theme Tokens
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const pageBg = "#f8f9fa";

    const handleLogout = useCallback(() => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    }, [navigate]);

    useEffect(() => {
        const sessionTimeout = new SessionTimeout(30, () => {
            toast({ title: "Sesi Berakhir", description: "Logout otomatis.", status: "warning", duration: 5000 });
            handleLogout();
        });
        sessionTimeout.start();
        return () => sessionTimeout.stop();
    }, [navigate, toast, handleLogout]);

    const validateField = (name, value) => {
        let error = '';
        if (name === 'nik') {
            if (!value) error = 'NIK wajib diisi';
            else if (!/^\d+$/.test(value)) error = 'NIK hanya boleh angka';
            else if (value.length < 16) error = 'NIK minimal 16 digit';
        }
        if (name === 'full_name' && !value) error = 'Nama wajib diisi';
        if (name === 'institution' && !value) error = 'Instansi wajib diisi';

        setErrors(prev => ({ ...prev, [name]: error }));
        return error === '';
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
        if (type !== 'checkbox') validateField(name, finalValue);
    };

    // Generic File Handler
    const processFile = (file, setFileState, setPreviewState, isImageOnly = false) => {
        if (!file) return;

        if (isImageOnly && !file.type.match('image.*')) {
            toast({ title: "Format salah", description: "Harap upload gambar (JPG/PNG)", status: "error" });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({ title: "File terlalu besar", description: "Maksimal 10MB", status: "error" });
            return;
        }

        setFileState(file);

        if (file.type.match('image.*')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewState(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreviewState(null); // No preview for PDF
        }
    };

    const handleSubmit = async () => {
        const nikValid = validateField('nik', formData.nik);
        const nameValid = validateField('full_name', formData.full_name);
        const instValid = validateField('institution', formData.institution);

        // KTP REQUIRED validation
        if (!ktpFile) {
            setErrors(prev => ({ ...prev, ktp: "Foto KTP wajib diupload" }));
            toast({ title: "KTP Wajib", status: "warning", position: "top" });
            return;
        } else {
            setErrors(prev => ({ ...prev, ktp: "" }));
        }

        // PHOTO OPTIONAL check -> No validation needed

        if (!nikValid || !nameValid || !instValid) {
            toast({ title: "Data belum lengkap", status: "warning", position: "top" });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));

            // Append files
            if (photoFile) dataToSend.append('photo', photoFile);
            dataToSend.append('ktp', ktpFile); // Required
            if (taskLetterFile) dataToSend.append('task_letter', taskLetterFile);

            await api.post('/visitors/', dataToSend);
            setShowSuccess(true);
        } catch (error) {
            console.error("Registration Error:", error);
            let errorMessage = "Terjadi kesalahan server";
            const detail = error.response?.data?.detail;

            if (detail) {
                if (typeof detail === 'string') {
                    errorMessage = detail;
                } else if (Array.isArray(detail)) {
                    // Pydantic validation error is an array of objects
                    errorMessage = detail.map(err => `${err.loc[1] || 'Field'}: ${err.msg}`).join(", ");
                } else {
                    errorMessage = JSON.stringify(detail);
                }
            }

            toast({
                title: "Gagal Registrasi (Error 422/500)",
                description: errorMessage,
                status: "error",
                position: "top",
                duration: 9000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ nik: '', full_name: '', institution: '', phone: '', auto_checkin: false });
        setPhotoFile(null); setPhotoPreview(null);
        setKtpFile(null); setKtpPreview(null);
        setTaskLetterFile(null); setTaskLetterPreview(null);
        setErrors({});
        setShowSuccess(false);
    };

    if (showSuccess) {
        return (
            <Center minH="100vh" bg="blackAlpha.600" backdropFilter="blur(5px)" position="fixed" top={0} left={0} w="full" zIndex={200}>
                <ScaleFade initialScale={0.9} in={true}>
                    <Card bg="white" borderRadius="24px" boxShadow="2xl" textAlign="center" w="400px">
                        <CardBody p={8}>
                            <Center mb={6}>
                                <Box w="80px" h="80px" bg="green.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                                    <Icon as={FaCheckCircle} color="green.500" w={10} h={10} />
                                </Box>
                            </Center>
                            <Heading size="md" mb={2} color="gray.800" fontWeight="700">Visitor Registered!</Heading>
                            <Text color="gray.500" mb={8} fontSize="sm">
                                <b>{formData.full_name}</b> has been successfully added.
                            </Text>
                            <VStack spacing={3} w="full">
                                <Button w="full" bg="#1a73e8" color="white" size="lg" _hover={{ bg: "#1557b0" }} onClick={resetForm} leftIcon={<FaUserPlus />} fontWeight="600" borderRadius="full">
                                    Register Another
                                </Button>
                                <Button w="full" variant="ghost" color="gray.600" onClick={() => navigate('/admin/dashboard')} fontWeight="600">
                                    Return to Dashboard
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </ScaleFade>
            </Center>
        );
    }

    return (
        <Box bg={pageBg} minH="100vh" fontFamily="'Inter', sans-serif">
            {/* Header */}
            <Box bg="white" h="64px" px={{ base: 4, md: 8 }} borderBottom="1px solid" borderColor={borderColor} position="sticky" top={0} zIndex={100} boxShadow="sm">
                <Flex h="100%" justify="space-between" align="center" maxW="1200px" mx="auto">
                    <HStack spacing={4}>
                        <Button leftIcon={<FaArrowLeft />} variant="ghost" onClick={() => navigate('/admin/dashboard')} color="gray.600" size="sm" fontWeight="600">
                            Back to Dashboard
                        </Button>
                        <Box w="1px" h="24px" bg="gray.200" display={{ base: "none", md: "block" }} />
                        <Text fontSize="sm" fontWeight="600" color="gray.500" display={{ base: "none", md: "block" }}>New Visitor Registration</Text>
                    </HStack>
                </Flex>
            </Box>

            <Container maxW="1200px" py={12}>
                <Flex gap={8} direction={{ base: "column", lg: "row" }} align="start">

                    {/* LEFT COLUMN: UPLOADS (33%) */}
                    <Box w={{ base: "full", lg: "400px" }}>
                        <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor} p={6}>
                            <VStack spacing={0} align="stretch">
                                <Heading size="xs" color="gray.500" fontWeight="700" textTransform="uppercase" mb={4} letterSpacing="0.5px">
                                    Documents & Photo
                                </Heading>

                                {/* 1. KTP (REQUIRED) */}
                                <FileUploadArea
                                    label="Upload KTP (Wajib)"
                                    file={ktpFile} preview={ktpPreview}
                                    onFileSelect={(f) => processFile(f, setKtpFile, setKtpPreview)}
                                    onRemove={() => { setKtpFile(null); setKtpPreview(null); }}
                                    error={errors.ktp}
                                    isRequired={true}
                                    accept="image/*,application/pdf"
                                />

                                {/* 2. PHOTO (OPTIONAL) */}
                                <FileUploadArea
                                    label="Visitor Photo (Optional)"
                                    file={photoFile} preview={photoPreview}
                                    onFileSelect={(f) => processFile(f, setPhotoFile, setPhotoPreview, true)}
                                    onRemove={() => { setPhotoFile(null); setPhotoPreview(null); }}
                                    error={errors.photo}
                                    accept="image/*"
                                />

                                {/* 3. SURAT TUGAS (OPTIONAL) */}
                                <FileUploadArea
                                    label="Surat Tugas (Optional)"
                                    file={taskLetterFile} preview={taskLetterPreview}
                                    onFileSelect={(f) => processFile(f, setTaskLetterFile, setTaskLetterPreview)}
                                    onRemove={() => { setTaskLetterFile(null); setTaskLetterPreview(null); }}
                                    error={errors.taskLetter}
                                    accept="image/*,application/pdf"
                                />
                            </VStack>
                        </Card>
                    </Box>

                    {/* RIGHT COLUMN: FORM (66%) */}
                    <Box flex="1" w="full">
                        <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
                            <CardBody p={8}>
                                <Heading size="md" mb={2} color="gray.800" fontWeight="700">Visitor Details</Heading>
                                <Text color="gray.500" fontSize="sm" mb={8}>
                                    Please ensure all information matches the documents.
                                </Text>

                                <VStack spacing={6}>
                                    <FormInput label="ID Card Number (NIK)" icon={FaIdCard} name="nik" placeholder="e.g. 3201..." value={formData.nik} error={errors.nik} handleChange={handleChange} />
                                    <FormInput label="Full Name" icon={FaUserPlus} name="full_name" placeholder="As shown on ID" value={formData.full_name} error={errors.full_name} handleChange={handleChange} />
                                    <FormInput label="Institution / Company" icon={FaBuilding} name="institution" placeholder="Visitor's Agency" value={formData.institution} error={errors.institution} handleChange={handleChange} />
                                    <FormInput label="Phone Number (Optional)" icon={FaPhone} name="phone" placeholder="0812-xxxx-xxxx" value={formData.phone} type="tel" error={errors.phone} handleChange={handleChange} />

                                    <FormControl display="flex" alignItems="center" bg="blue.50" p={4} borderRadius="lg">
                                        <Switch
                                            id="auto_checkin"
                                            isChecked={formData.auto_checkin}
                                            onChange={handleChange}
                                            size="lg"
                                            colorScheme="blue"
                                            mr={4}
                                        />
                                        <Box>
                                            <FormLabel htmlFor="auto_checkin" mb={0} fontSize="sm" fontWeight="700" color="blue.700">
                                                Check In Immediately?
                                            </FormLabel>
                                            <Text fontSize="xs" color="blue.600">Visitor will be marked as "Active" in dashboard.</Text>
                                        </Box>
                                    </FormControl>

                                    <Box w="full" pt={4}>
                                        <Button w="full" size="lg" bg="#1a73e8" color="white" _hover={{ bg: "#1557b0" }} onClick={handleSubmit} isLoading={loading} loadingText="Registering..." leftIcon={<FaSave />} borderRadius="full" fontWeight="600" h="50px">
                                            Complete Registration
                                        </Button>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>
                    </Box>
                </Flex>
            </Container>
        </Box>
    );
}

export default AdminPage;
