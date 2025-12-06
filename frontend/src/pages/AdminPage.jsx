// File: frontend/src/pages/AdminPage.jsx
// Google Material Design Style - Registration Form
import { useState } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Input,
    Heading, useToast, VStack, Text, Flex, HStack,
    InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FaUserPlus, FaBuilding, FaIdCard, FaArrowLeft, FaCamera, FaPhone } from 'react-icons/fa';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
    const [formData, setFormData] = useState({
        nik: '',
        full_name: '',
        institution: '',
        phone: '',
    });
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Validation error states
    const [nikError, setNikError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [photoError, setPhotoError] = useState('');

    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Validation functions
    const validateNik = (value) => {
        if (!value) {
            setNikError('NIK/NIP wajib diisi');
            return false;
        }
        if (!/^\d+$/.test(value)) {
            setNikError('NIK/NIP hanya boleh berisi angka');
            return false;
        }
        if (value.length !== 16 && value.length !== 18) {
            setNikError('NIK harus 16 digit atau NIP harus 18 digit');
            return false;
        }
        setNikError('');
        return true;
    };

    const validatePhone = (value) => {
        if (!value) {
            setPhoneError('Nomor telepon wajib diisi');
            return false;
        }
        if (!/^\d+$/.test(value)) {
            setPhoneError('Nomor telepon hanya boleh berisi angka');
            return false;
        }
        if (value.length < 10 || value.length > 15) {
            setPhoneError('Nomor telepon harus 10-15 digit');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const validatePhoto = (file) => {
        if (!file) {
            setPhotoError('Foto wajib diunggah');
            return false;
        }

        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setPhotoError('Format file harus JPG, JPEG, atau PNG');
            return false;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setPhotoError('Ukuran file maksimal 10MB');
            return false;
        }

        setPhotoError('');
        return true;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file immediately
            if (validatePhoto(selectedFile)) {
                setFile(selectedFile);

                // Generate preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                // Clear file input if validation fails
                e.target.value = null;
                setFile(null);
                setImagePreview(null);
            }
        }
    };

    const handleNikChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, nik: value });
        if (value) validateNik(value);
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setFormData({ ...formData, phone: value });
        if (value) validatePhone(value);
    };

    const handleSubmit = async () => {
        if (!formData.nik || !formData.full_name || !file) {
            toast({ title: "NIK, Nama, dan Foto Wajib diisi!", status: "error", position: "top", duration: 3000, isClosable: true });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
            dataToSend.append('photo', file);

            await api.post('/visitors/', dataToSend);

            toast({ title: "Registrasi Berhasil!", status: "success", position: "top", duration: 3000, isClosable: true });

            setFormData({ nik: '', full_name: '', institution: '', phone: '' });
            setFile(null);
            setImagePreview(null);
            document.getElementById("file-input").value = "";

        } catch (error) {
            toast({
                title: "Gagal",
                description: error.response?.data?.detail || "Terjadi kesalahan",
                status: "error",
                position: "top",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box bg="#f8f9fa" minH="100vh">
            {/* Top Bar */}
            <Box bg="white" py={4} px={6} borderBottom="1px solid #dadce0">
                <Flex maxW="600px" mx="auto" align="center">
                    <Button
                        variant="ghost"
                        leftIcon={<FaArrowLeft />}
                        onClick={() => navigate('/admin/dashboard')}
                        color="#3c4043"
                        _hover={{ bg: "#f1f3f4" }}
                    >
                        Kembali
                    </Button>
                </Flex>
            </Box>

            <Container maxW="600px" py={8}>
                {/* Header */}
                <VStack spacing={2} mb={8}>
                    <Flex
                        w="64px"
                        h="64px"
                        bg="#1a73e8"
                        borderRadius="16px"
                        align="center"
                        justify="center"
                    >
                        <FaUserPlus color="white" size="28px" />
                    </Flex>
                    <Heading
                        size="lg"
                        color="#202124"
                        fontFamily="'Google Sans', 'Inter', sans-serif"
                        fontWeight="400"
                    >
                        Registrasi Tamu Baru
                    </Heading>
                    <Text color="#3c4043" fontSize="sm" textAlign="center">
                        Direktorat INTIKAMI - BKN
                    </Text>
                </VStack>

                {/* Form Card */}
                <Box
                    bg="white"
                    borderRadius="12px"
                    p={6}
                    boxShadow="0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)"
                >
                    <VStack spacing={5}>
                        {/* NIK */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#3c4043" fontWeight="500">
                                NIK / NIP
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="44px">
                                    <FaIdCard color="#3c4043" />
                                </InputLeftElement>
                                <Input
                                    name="nik"
                                    placeholder="16 digit NIK/18 digit NIP (contoh: 3201234567891234)"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    h="44px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Nama */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#3c4043" fontWeight="500">
                                Nama Lengkap
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="44px">
                                    <FaUserPlus color="#3c4043" />
                                </InputLeftElement>
                                <Input
                                    name="full_name"
                                    placeholder="Nama lengkap sesuai KTP/identitas resmi"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    h="44px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Instansi */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#3c4043" fontWeight="500">
                                Instansi / Perusahaan
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="44px">
                                    <FaBuilding color="#3c4043" />
                                </InputLeftElement>
                                <Input
                                    name="institution"
                                    placeholder="Nama instansi/perusahaan (contoh: Kementerian PANRB)"
                                    value={formData.institution}
                                    onChange={handleChange}
                                    h="44px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Phone */}
                        <FormControl>
                            <FormLabel fontSize="sm" color="#3c4043" fontWeight="500">
                                No. Telepon (Opsional)
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="44px">
                                    <FaPhone color="#3c4043" />
                                </InputLeftElement>
                                <Input
                                    name="phone"
                                    placeholder="08XX-XXXX-XXXX (untuk keperluan darurat)"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    h="44px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Photo Upload */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#3c4043" fontWeight="500">
                                Foto Wajah
                            </FormLabel>
                            {imagePreview ? (
                                <Box position="relative">
                                    <Box
                                        borderRadius="12px"
                                        overflow="hidden"
                                        border="2px solid #1a73e8"
                                    >
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
                                        />
                                    </Box>
                                    <Button
                                        size="sm"
                                        mt={3}
                                        variant="outline"
                                        borderColor="#dadce0"
                                        onClick={() => {
                                            setFile(null);
                                            setImagePreview(null);
                                            document.getElementById('file-input').value = '';
                                        }}
                                    >
                                        Ganti Foto
                                    </Button>
                                </Box>
                            ) : (
                                <Box
                                    border="2px dashed #dadce0"
                                    borderRadius="12px"
                                    p={6}
                                    textAlign="center"
                                    bg="#f8f9fa"
                                    _hover={{ borderColor: "#1a73e8", bg: "#e8f0fe" }}
                                    transition="all 0.2s"
                                    cursor="pointer"
                                    onClick={() => document.getElementById('file-input').click()}
                                >
                                    <VStack spacing={2}>
                                        <Flex
                                            w="48px"
                                            h="44px"
                                            bg="#e8f0fe"
                                            borderRadius="full"
                                            align="center"
                                            justify="center"
                                        >
                                            <FaCamera color="#1a73e8" size="20px" />
                                        </Flex>
                                        <Text color="#1a73e8" fontWeight="500" fontSize="sm">
                                            Klik untuk upload foto
                                        </Text>
                                        <Text color="#3c4043" fontSize="xs">
                                            JPG atau PNG (Max 10MB)
                                        </Text>
                                    </VStack>
                                </Box>
                            )}
                            <Input
                                id="file-input"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                display="none"
                            />
                        </FormControl>

                        {/* Submit Button */}
                        <Button
                            w="full"
                            h="44px"
                            bg="#1a73e8"
                            color="white"
                            borderRadius="8px"
                            fontSize="15px"
                            fontWeight="500"
                            leftIcon={<FaUserPlus />}
                            _hover={{ bg: "#1557b0" }}
                            _active={{ bg: "#174ea6" }}
                            onClick={handleSubmit}
                            isLoading={loading}
                            loadingText="Menyimpan..."
                            mt={4}
                        >
                            Simpan Data Tamu
                        </Button>
                    </VStack>
                </Box>

                {/* Footer */}
                <VStack spacing={1} pt={6}>
                    <Text fontSize="10px" color="#9aa0a6" textAlign="center">
                        BKN Visitor System v1.0.0
                    </Text>
                    <Text fontSize="10px" color="#9aa0a6" textAlign="center">
                        © 2025 Direktorat INTIKAMI - BKN
                    </Text>
                </VStack>
            </Container>
        </Box>
    );
}

export default AdminPage;




