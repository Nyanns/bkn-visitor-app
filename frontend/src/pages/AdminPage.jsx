// File: frontend/src/pages/AdminPage.jsx
// FAANG Quality Redesign - Visitor Registration (Matches Dashboard Theme)
import { useState, useRef, useEffect, useCallback } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Input,
    Heading, useToast, VStack, Text, Flex,
    InputGroup, InputLeftElement, InputRightElement, Icon,
    ScaleFade, Center, IconButton, Card, CardBody, useColorModeValue,
    HStack, Image, Badge
} from '@chakra-ui/react';
import {
    FaUserPlus, FaBuilding, FaIdCard, FaArrowLeft,
    FaCamera, FaPhone, FaCheckCircle, FaExclamationCircle,
    FaCloudUploadAlt, FaTimes, FaSave
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

function AdminPage() {
    const [formData, setFormData] = useState({
        nik: '',
        full_name: '',
        institution: '',
        phone: '',
        auto_checkin: false,
    });
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Errors
    const [errors, setErrors] = useState({});

    const toast = useToast();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // Theme Tokens
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const pageBg = "#f8f9fa";



    const handleLogout = useCallback(() => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    }, [navigate]);

    // Session timeout
    useEffect(() => {
        const sessionTimeout = new SessionTimeout(30, () => {
            toast({
                title: "Sesi Berakhir",
                description: "Logout otomatis karena tidak aktif.",
                status: "warning",
                position: "top",
                duration: 5000
            });
            handleLogout();
        });
        sessionTimeout.start();
        return () => sessionTimeout.stop();
    }, [navigate, toast, handleLogout]);

    // Validation Logic
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

    // File Handling
    const handleFile = (selectedFile) => {
        if (!selectedFile) return;

        if (!selectedFile.type.match('image.*')) {
            toast({ title: "Format salah", description: "Harap upload file gambar (JPG/PNG)", status: "error" });
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast({ title: "File terlalu besar", description: "Maksimal 10MB", status: "error" });
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(selectedFile);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };

    // Submit
    const handleSubmit = async () => {
        const nikValid = validateField('nik', formData.nik);
        const nameValid = validateField('full_name', formData.full_name);
        const instValid = validateField('institution', formData.institution);

        if (!nikValid || !nameValid || !instValid) {
            toast({ title: "Data belum lengkap", status: "warning", position: "top" });
            return;
        }
        if (!file) {
            toast({ title: "Foto wajib diupload", status: "warning", position: "top" });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
            dataToSend.append('photo', file);

            await api.post('/visitors/', dataToSend);
            setShowSuccess(true);

        } catch (error) {
            toast({
                title: "Gagal Registrasi",
                description: error.response?.data?.detail || "Terjadi kesalahan server",
                status: "error",
                position: "top"
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ nik: '', full_name: '', institution: '', phone: '', auto_checkin: false });
        setFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowSuccess(false);
    };

    // Success Overlay (Modal Style)
    if (showSuccess) {
        return (
            <Center minH="100vh" bg="blackAlpha.600" backdropFilter="blur(5px)" position="fixed" top={0} left={0} w="full" zIndex={200}>
                <ScaleFade initialScale={0.9} in={true}>
                    <Card
                        bg="white"
                        borderRadius="24px"
                        boxShadow="2xl"
                        textAlign="center"
                        w="400px"
                    >
                        <CardBody p={8}>
                            <Center mb={6}>
                                <Box w="80px" h="80px" bg="green.100" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
                                    <Icon as={FaCheckCircle} color="green.500" w={10} h={10} />
                                </Box>
                            </Center>
                            <Heading size="md" mb={2} color="gray.800" fontWeight="700">Visitor Registered!</Heading>
                            <Text color="gray.500" mb={8} fontSize="sm">
                                <b>{formData.full_name}</b> has been successfully added to the database.
                            </Text>
                            <VStack spacing={3} w="full">
                                <Button
                                    w="full"
                                    bg="#1a73e8"
                                    color="white"
                                    size="lg"
                                    _hover={{ bg: "#1557b0" }}
                                    onClick={resetForm}
                                    leftIcon={<FaUserPlus />}
                                    fontWeight="600"
                                    borderRadius="full"
                                >
                                    Register Another
                                </Button>
                                <Button
                                    w="full"
                                    variant="ghost"
                                    color="gray.600"
                                    onClick={() => navigate('/admin/dashboard')}
                                    fontWeight="600"
                                >
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
            {/* Header Navigation */}
            <Box
                bg="white"
                h="64px"
                px={{ base: 4, md: 8 }}
                borderBottom="1px solid"
                borderColor={borderColor}
                position="sticky"
                top={0}
                zIndex={100}
                boxShadow="sm"
            >
                <Flex h="100%" justify="space-between" align="center" maxW="1200px" mx="auto">
                    <HStack spacing={4}>
                        <Button
                            leftIcon={<FaArrowLeft />}
                            variant="ghost"
                            onClick={() => navigate('/admin/dashboard')}
                            color="gray.600"
                            size="sm"
                            fontWeight="600"
                            _hover={{ bg: "gray.100", color: "gray.900" }}
                        >
                            Back to Dashboard
                        </Button>
                        <Box w="1px" h="24px" bg="gray.200" display={{ base: "none", md: "block" }} />
                        <Text fontSize="sm" fontWeight="600" color="gray.500" display={{ base: "none", md: "block" }}>
                            New Visitor Registration
                        </Text>
                    </HStack>
                </Flex>
            </Box>

            <Container maxW="1200px" py={12}>
                <GridTemplate formData={formData} setFormData={setFormData} />

                {/* 
                     Using standard Grid layout here directly to allow for proper responsive behavior
                     instead of a separate component if it helps with state management scope 
                */}
                <Flex gap={8} direction={{ base: "column", lg: "row" }} align="start">

                    {/* Left Column: Photo Upload */}
                    <Box flex="1" w="full">
                        <Card
                            bg={cardBg}
                            borderRadius="xl"
                            boxShadow="sm"
                            border="1px solid"
                            borderColor={borderColor}
                            p={6}
                        >
                            <Heading size="xs" color="gray.500" fontWeight="700" textTransform="uppercase" mb={4} letterSpacing="0.5px">
                                Capture Photo
                            </Heading>

                            <Box
                                border="2px dashed"
                                borderColor={isDragging ? "#1a73e8" : imagePreview ? "transparent" : "gray.300"}
                                borderRadius="xl"
                                bg={isDragging ? "blue.50" : "gray.50"}
                                h="400px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                                cursor="pointer"
                                position="relative"
                                overflow="hidden"
                                transition="all 0.2s"
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current.click()}
                                _hover={{ borderColor: "#1a73e8", bg: imagePreview ? "white" : "gray.100" }}
                            >
                                {imagePreview ? (
                                    <>
                                        <Image src={imagePreview} alt="Preview" w="100%" h="100%" objectFit="cover" />
                                        <Box
                                            position="absolute"
                                            bottom={0}
                                            left={0}
                                            right={0}
                                            bg="blackAlpha.700"
                                            p={4}
                                            textAlign="center"
                                            backdropFilter="blur(4px)"
                                        >
                                            <Flex justify="center" align="center" color="white">
                                                <Icon as={FaCamera} mr={2} />
                                                <Text fontSize="sm" fontWeight="600">Change Photo</Text>
                                            </Flex>
                                        </Box>
                                        <IconButton
                                            aria-label="Remove"
                                            icon={<FaTimes />}
                                            size="sm"
                                            position="absolute"
                                            top={4}
                                            right={4}
                                            colorScheme="red"
                                            borderRadius="full"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                setImagePreview(null);
                                                if (fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                            boxShadow="lg"
                                        />
                                    </>
                                ) : (
                                    <VStack spacing={4} color="gray.400">
                                        <Center w="80px" h="80px" bg="white" borderRadius="full" boxShadow="sm">
                                            <Icon as={FaCloudUploadAlt} boxSize={8} color="#1a73e8" />
                                        </Center>
                                        <Box textAlign="center">
                                            <Text fontWeight="600" color="gray.600" fontSize="lg">Drag & Drop photo here</Text>
                                            <Text fontSize="sm">or click to browse</Text>
                                        </Box>
                                        <Badge colorScheme="gray" variant="subtle" px={2} borderRadius="md">Max 10MB • JPG/PNG</Badge>
                                    </VStack>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/png, image/jpeg, image/jpg"
                                    onChange={(e) => handleFile(e.target.files[0])}
                                />
                            </Box>
                            {errors.photo && <Text color="red.500" fontSize="xs" mt={2} fontWeight="600">{errors.photo}</Text>}
                        </Card>
                    </Box>

                    {/* Right Column: Form Fields */}
                    <Box flex="1.5" w="full">
                        <Card
                            bg={cardBg}
                            borderRadius="xl"
                            boxShadow="sm"
                            border="1px solid"
                            borderColor={borderColor}
                        >
                            <CardBody p={8}>
                                <Heading size="md" mb={2} color="gray.800" fontWeight="700">Visitor Details</Heading>
                                <Text color="gray.500" fontSize="sm" mb={8}>
                                    Please ensure all information matches the visitor's ID card (KTP/Passport).
                                </Text>

                                <VStack spacing={6}>
                                    <FormInput
                                        label="ID Card Number (NIK)"
                                        icon={FaIdCard}
                                        name="nik"
                                        placeholder="e.g. 3201234567891234"
                                        value={formData.nik}
                                        error={errors.nik}
                                        handleChange={handleChange}
                                    />

                                    <FormInput
                                        label="Full Name"
                                        icon={FaUserPlus}
                                        name="full_name"
                                        placeholder="As shown on ID"
                                        value={formData.full_name}
                                        error={errors.full_name}
                                        handleChange={handleChange}
                                    />

                                    <FormInput
                                        label="Institution / Company"
                                        icon={FaBuilding}
                                        name="institution"
                                        placeholder="Visitor's Agency"
                                        value={formData.institution}
                                        error={errors.institution}
                                        handleChange={handleChange}
                                    />

                                    <FormInput
                                        label="Phone Number (Optional)"
                                        icon={FaPhone}
                                        name="phone"
                                        placeholder="0812-xxxx-xxxx"
                                        value={formData.phone}
                                        type="tel"
                                        error={errors.phone}
                                        handleChange={handleChange}
                                    />

                                    <FormControl display="flex" alignItems="center">
                                        <input
                                            type="checkbox"
                                            name="auto_checkin"
                                            id="auto_checkin"
                                            checked={formData.auto_checkin}
                                            onChange={handleChange}
                                            style={{ width: '20px', height: '20px', marginRight: '10px' }}
                                        />
                                        <FormLabel htmlFor="auto_checkin" mb={0} fontSize="sm" color="gray.600" fontWeight="600">
                                            Check In Immediately?
                                        </FormLabel>
                                    </FormControl>

                                    <Box w="full" pt={4}>
                                        <Button
                                            w="full"
                                            size="lg"
                                            bg="#1a73e8"
                                            color="white"
                                            _hover={{ bg: "#1557b0", boxShadow: "md" }}
                                            _active={{ bg: "#174ea6" }}
                                            onClick={handleSubmit}
                                            isLoading={loading}
                                            loadingText="Registering..."
                                            leftIcon={<FaSave />}
                                            borderRadius="full"
                                            fontWeight="600"
                                            fontSize="md"
                                            h="50px"
                                        >
                                            Complete Registration
                                        </Button>
                                    </Box>
                                </VStack>
                            </CardBody>
                        </Card>

                        <Flex mt={6} justify="center" align="center" gap={2} color="gray.500">
                            <Icon as={FaCheckCircle} color="green.500" />
                            <Text fontSize="xs" fontWeight="500">Secure connection protected by SSL/TLS</Text>
                        </Flex>
                    </Box>
                </Flex>
            </Container>
        </Box>
    );
}

const GridTemplate = () => <></>; // Dummy component to fixing variable scope if I were using grid in separate component, but I inliend it.

export default AdminPage;
