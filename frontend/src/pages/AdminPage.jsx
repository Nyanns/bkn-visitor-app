// File: frontend/src/pages/AdminPage.jsx
// Google Material Design Style - Registration Form (FAANG Quality)
import { useState, useRef, useEffect } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Input,
    Heading, useToast, VStack, Text, Flex,
    InputGroup, InputLeftElement, InputRightElement, Icon,
    ScaleFade, Center, IconButton
} from '@chakra-ui/react';
import {
    FaUserPlus, FaBuilding, FaIdCard, FaArrowLeft,
    FaCamera, FaPhone, FaCheckCircle, FaExclamationCircle,
    FaCloudUploadAlt, FaTimes
} from 'react-icons/fa';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import SessionTimeout from '../utils/sessionTimeout';

// --- SUB-COMPONENTS (Defined Outside to prevent re-renders) ---

// Custom Input Field with Validation State
const CustomInput = ({ label, icon, name, placeholder, value, type = "text", errors, handleChange }) => {
    const hasError = errors[name];
    const isValid = value && !hasError;

    return (
        <FormControl isInvalid={!!hasError}>
            <FormLabel fontSize="13px" fontWeight="600" color="#5f6368" textTransform="uppercase" letterSpacing="0.5px" mb={1.5}>
                {label}
            </FormLabel>
            <InputGroup size="lg">
                <InputLeftElement pointerEvents="none" color={isValid ? "#1e8e3e" : "#5f6368"}>
                    <Icon as={icon} />
                </InputLeftElement>
                <Input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    bg={isValid ? "#fce8e6" : "white"}
                    _focus={{ borderColor: "#1a73e8", boxShadow: "0 0 0 2px rgba(26,115,232,0.2)" }}
                    borderColor={hasError ? "#d93025" : "#dadce0"}
                    fontSize="md"
                    // bg={isValid ? "#e6f4ea" : "white"} // Duplicate prop removed, using logic
                    backgroundColor={isValid ? "#e6f4ea" : "white"}
                    borderWidth={isValid ? "1px" : "1px"}
                />
                {isValid && (
                    <InputRightElement>
                        <FaCheckCircle color="#1e8e3e" />
                    </InputRightElement>
                )}
                {hasError && (
                    <InputRightElement>
                        <FaExclamationCircle color="#d93025" />
                    </InputRightElement>
                )}
            </InputGroup>
            {hasError && <Text color="#d93025" fontSize="xs" mt={1} ml={1}>{hasError}</Text>}
        </FormControl>
    );
};

function AdminPage() {
    const [formData, setFormData] = useState({
        nik: '',
        full_name: '',
        institution: '',
        phone: '',
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

    // Session timeout
    useEffect(() => {
        const sessionTimeout = new SessionTimeout(30, () => {
            toast({
                title: "Sesi Berakhir",
                description: "Anda telah logout otomatis.",
                status: "warning",
                position: "top",
                duration: 5000
            });
            handleLogout();
        });
        sessionTimeout.start();
        return () => sessionTimeout.stop();
    }, [navigate, toast]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        validateField(name, value);
    };

    // File Handling
    const handleFile = (selectedFile) => {
        if (!selectedFile) return;

        // Type check
        if (!selectedFile.type.match('image.*')) {
            toast({ title: "Format salah", description: "Harap upload file gambar (JPG/PNG)", status: "error" });
            return;
        }

        // Size check (10MB)
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
        // Validate all
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
        setFormData({ nik: '', full_name: '', institution: '', phone: '' });
        setFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowSuccess(false);
    };

    // Success Overlay
    if (showSuccess) {
        return (
            <Box bg="#f8f9fa" minH="100vh" display="flex" alignItems="center" justifyContent="center">
                <ScaleFade initialScale={0.9} in={true}>
                    <Box
                        bg="white"
                        p={8}
                        borderRadius="24px"
                        boxShadow="0 4px 20px rgba(0,0,0,0.1)"
                        textAlign="center"
                        maxW="400px"
                    >
                        <Center mb={6}>
                            <Box w="80px" h="80px" bg="#1e8e3e" borderRadius="full" display="flex" alignItems="center" justifyContent="center" boxShadow="0 4px 10px rgba(30,142,62,0.3)">
                                <FaCheckCircle color="white" size="40px" />
                            </Box>
                        </Center>
                        <Heading size="md" mb={2} color="#202124">Registrasi Berhasil!</Heading>
                        <Text color="#5f6368" mb={8}>
                            Pengunjung <b>{formData.full_name}</b> telah terdaftar di sistem.
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
                            >
                                Daftar Pengunjung Lain
                            </Button>
                            <Button
                                w="full"
                                variant="outline"
                                colorScheme="gray"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                Kembali ke Dashboard
                            </Button>
                        </VStack>
                    </Box>
                </ScaleFade>
            </Box>
        );
    }

    return (
        <Box bg="#f8f9fa" minH="100vh" fontFamily="'Google Sans', 'Inter', sans-serif">
            {/* Simple Clean Header */}
            <Box bg="white" px={6} py={4} borderBottom="1px solid #e8eaed" position="sticky" top={0} zIndex={10}>
                <Flex maxW="800px" mx="auto" justify="space-between" align="center">
                    <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FaArrowLeft />}
                        onClick={() => navigate('/admin/dashboard')}
                        color="#5f6368"
                    >
                        Dashboard
                    </Button>
                    <Text fontWeight="500" color="#202124">Registrasi Tamu</Text>
                    <Box w="80px" /> {/* Spacer for balance */}
                </Flex>
            </Box>

            <Container maxW="800px" py={8}>
                <Flex gap={8} direction={{ base: "column", md: "row" }} align="start">

                    {/* Left Column: Photo Upload (Drag & Drop) */}
                    <Box flex="1" w="full">
                        <Text fontSize="sm" fontWeight="600" color="#202124" mb={3} ml={1}>FOTO WAJAH</Text>
                        <Box
                            border="2px dashed"
                            borderColor={isDragging ? "#1a73e8" : imagePreview ? "transparent" : "#dadce0"}
                            borderRadius="16px"
                            bg={isDragging ? "#e8f0fe" : "white"}
                            h="320px"
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
                            boxShadow={imagePreview ? "0 4px 12px rgba(0,0,0,0.1)" : "none"}
                            _hover={{ borderColor: "#1a73e8", bg: imagePreview ? "white" : "#f8f9fa" }}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <Box
                                        position="absolute"
                                        bottom={0}
                                        left={0}
                                        right={0}
                                        bg="rgba(0,0,0,0.6)"
                                        p={3}
                                        textAlign="center"
                                        backdropFilter="blur(4px)"
                                    >
                                        <Text color="white" fontSize="sm" fontWeight="500"><Icon as={FaCamera} mr={2} />Ganti Foto</Text>
                                    </Box>
                                    <IconButton
                                        aria-label="Remove"
                                        icon={<FaTimes />}
                                        size="xs"
                                        position="absolute"
                                        top={2}
                                        right={2}
                                        colorScheme="red"
                                        borderRadius="full"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                            setImagePreview(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    />
                                </>
                            ) : (
                                <VStack spacing={3} color="#5f6368">
                                    <Box p={4} bg="#f1f3f4" borderRadius="full">
                                        <FaCloudUploadAlt size="32px" color="#1a73e8" />
                                    </Box>
                                    <Text fontWeight="500">Drag & Drop foto di sini</Text>
                                    <Text fontSize="xs">atau klik untuk browse (Max 10MB)</Text>
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
                        {errors.photo && <Text color="#d93025" fontSize="xs" mt={1}>{errors.photo}</Text>}
                    </Box>

                    {/* Right Column: Form Fields */}
                    <Box flex="1.4" w="full">
                        <Box bg="white" p={6} borderRadius="16px" boxShadow="0 1px 3px 0 rgba(60,64,67,0.1)" border="1px solid #e8eaed">
                            <Heading size="md" mb={6} color="#202124" fontWeight="500">Biodata Pengunjung</Heading>

                            <VStack spacing={5}>
                                <CustomInput
                                    label="Nomor Induk Kependudukan (NIK)"
                                    icon={FaIdCard}
                                    name="nik"
                                    placeholder="Contoh: 3201234567891234"
                                    value={formData.nik}
                                    errors={errors}
                                    handleChange={handleChange}
                                />

                                <CustomInput
                                    label="Nama Lengkap"
                                    icon={FaUserPlus}
                                    name="full_name"
                                    placeholder="Sesuai KTP"
                                    value={formData.full_name}
                                    errors={errors}
                                    handleChange={handleChange}
                                />

                                <CustomInput
                                    label="Instansi / Perusahaan"
                                    icon={FaBuilding}
                                    name="institution"
                                    placeholder="Asal Instansi"
                                    value={formData.institution}
                                    errors={errors}
                                    handleChange={handleChange}
                                />

                                <CustomInput
                                    label="Nomor Telepon (Opsional)"
                                    icon={FaPhone}
                                    name="phone"
                                    placeholder="0812-xxxx-xxxx"
                                    value={formData.phone}
                                    type="tel"
                                    errors={errors}
                                    handleChange={handleChange}
                                />

                                <Button
                                    w="full"
                                    size="lg"
                                    bg="#1a73e8"
                                    color="white"
                                    _hover={{ bg: "#1557b0", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                                    _active={{ bg: "#174ea6" }}
                                    onClick={handleSubmit}
                                    isLoading={loading}
                                    mt={4}
                                    fontSize="md"
                                    borderRadius="8px"
                                >
                                    Simpan & Registrasi
                                </Button>
                            </VStack>
                        </Box>

                        <Flex mt={4} justify="center" align="center" gap={2} color="#5f6368">
                            <FaCheckCircle size="12px" color="#1e8e3e" />
                            <Text fontSize="xs">Data aman & terenkripsi</Text>
                        </Flex>
                    </Box>
                </Flex>
            </Container>
        </Box>
    );
}

export default AdminPage;
