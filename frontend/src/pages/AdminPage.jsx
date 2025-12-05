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
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
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
                        color="#5f6368"
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
                    <Text color="#5f6368" fontSize="sm" textAlign="center">
                        Direktorat INTIKAMI - BKN
                    </Text>
                </VStack>

                {/* Form Card */}
                <Box
                    bg="white"
                    borderRadius="12px"
                    p={8}
                    boxShadow="0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)"
                >
                    <VStack spacing={5}>
                        {/* NIK */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#5f6368" fontWeight="500">
                                NIK / NIP
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="48px">
                                    <FaIdCard color="#5f6368" />
                                </InputLeftElement>
                                <Input
                                    name="nik"
                                    placeholder="Masukkan NIK atau NIP"
                                    value={formData.nik}
                                    onChange={handleChange}
                                    h="48px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Nama */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#5f6368" fontWeight="500">
                                Nama Lengkap
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="48px">
                                    <FaUserPlus color="#5f6368" />
                                </InputLeftElement>
                                <Input
                                    name="full_name"
                                    placeholder="Nama sesuai identitas"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    h="48px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Instansi */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#5f6368" fontWeight="500">
                                Instansi / Perusahaan
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="48px">
                                    <FaBuilding color="#5f6368" />
                                </InputLeftElement>
                                <Input
                                    name="institution"
                                    placeholder="Contoh: Kementerian PANRB"
                                    value={formData.institution}
                                    onChange={handleChange}
                                    h="48px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Phone */}
                        <FormControl>
                            <FormLabel fontSize="sm" color="#5f6368" fontWeight="500">
                                No. Telepon (Opsional)
                            </FormLabel>
                            <InputGroup>
                                <InputLeftElement h="48px">
                                    <FaPhone color="#5f6368" />
                                </InputLeftElement>
                                <Input
                                    name="phone"
                                    placeholder="08xxxxxxxxxx"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    h="48px"
                                    border="1px solid #dadce0"
                                    borderRadius="8px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                />
                            </InputGroup>
                        </FormControl>

                        {/* Photo Upload */}
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="#5f6368" fontWeight="500">
                                Foto Wajah
                            </FormLabel>
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
                                        h="48px"
                                        bg="#e8f0fe"
                                        borderRadius="full"
                                        align="center"
                                        justify="center"
                                    >
                                        <FaCamera color="#1a73e8" size="20px" />
                                    </Flex>
                                    <Text color="#1a73e8" fontWeight="500" fontSize="sm">
                                        {file ? file.name : "Klik untuk upload foto"}
                                    </Text>
                                    <Text color="#5f6368" fontSize="xs">
                                        JPG atau PNG (Max 2MB)
                                    </Text>
                                </VStack>
                                <Input
                                    id="file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    display="none"
                                />
                            </Box>
                        </FormControl>

                        {/* Submit Button */}
                        <Button
                            w="full"
                            h="48px"
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
            </Container>
        </Box>
    );
}

export default AdminPage;