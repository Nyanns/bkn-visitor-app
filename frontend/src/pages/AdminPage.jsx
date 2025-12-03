// File: frontend/src/pages/AdminPage.jsx
import { useState } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Input,
    Heading, useToast, VStack, Card, CardBody, Text, Divider,
    InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FaUserPlus, FaBuilding, FaIdCard, FaCamera, FaArrowLeft } from 'react-icons/fa';
import api from '../api';
import { useNavigate } from 'react-router-dom'; // <--- Wajib ada!

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
    const navigate = useNavigate(); // <--- Wajib ada!

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!formData.nik || !formData.full_name || !file) {
            toast({ title: "NIK, Nama, dan Foto Wajib diisi!", status: "error", position: "top" });
            return;
        }

        setLoading(true);
        try {
            const dataToSend = new FormData();
            Object.keys(formData).forEach(key => dataToSend.append(key, formData[key]));
            dataToSend.append('photo', file);

            await api.post('/visitors/', dataToSend);

            toast({ title: "Registrasi Berhasil!", status: "success", position: "top" });

            // Reset Form
            setFormData({ nik: '', full_name: '', institution: '', phone: '' });
            setFile(null);
            document.getElementById("file-input").value = "";

        } catch (error) {
            toast({
                title: "Gagal",
                description: error.response?.data?.detail || "Terjadi kesalahan",
                status: "error",
                position: "top"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box bg="blue.50" minH="100vh" py={10}>
            <Container maxW="md">
                {/* --- TAMBAHKAN TOMBOL INI DI ATAS --- */}
                <Button
                    variant="ghost"
                    mb={4}
                    leftIcon={<FaArrowLeft />}
                    onClick={() => navigate('/admin/dashboard')}
                >
                    Kembali ke Dashboard
                </Button>
                {/* ------------------------------------ */}
                <VStack spacing={6}>
                    <Box textAlign="center">
                        <Heading color="blue.700" size="lg">Panel Admin BKN</Heading>
                        <Text color="gray.500" fontSize="sm">Registrasi Tamu Baru</Text>
                    </Box>

                    <Card w="full" boxShadow="xl" borderRadius="2xl" bg="white">
                        <CardBody p={8}>
                            <VStack spacing={4}>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">NIK / NIP</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none"><FaIdCard color="gray" /></InputLeftElement>
                                        <Input name="nik" placeholder="12345..." value={formData.nik} onChange={handleChange} bg="gray.50" />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Nama Lengkap</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none"><FaUserPlus color="gray" /></InputLeftElement>
                                        <Input name="full_name" placeholder="Nama Tamu" value={formData.full_name} onChange={handleChange} bg="gray.50" />
                                    </InputGroup>
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Instansi</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement pointerEvents="none"><FaBuilding color="gray" /></InputLeftElement>
                                        <Input name="institution" placeholder="Asal Instansi" value={formData.institution} onChange={handleChange} bg="gray.50" />
                                    </InputGroup>
                                </FormControl>

                                <Divider my={2} />

                                <FormControl isRequired>
                                    <FormLabel fontSize="sm" fontWeight="bold" color="gray.600">Foto Wajah</FormLabel>
                                    <Box border="2px dashed" borderColor="gray.300" borderRadius="md" p={4} textAlign="center" bg="gray.50">
                                        <Input
                                            id="file-input"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            variant="unstyled"
                                            pt={1}
                                        />
                                        <Text fontSize="xs" color="gray.400" mt={1}>Format: JPG/PNG (Max 2MB)</Text>
                                    </Box>
                                </FormControl>

                                <Button
                                    colorScheme="blue" size="lg" w="full" mt={4}
                                    onClick={handleSubmit}
                                    isLoading={loading}
                                    loadingText="Menyimpan..."
                                    leftIcon={<FaUserPlus />}
                                    boxShadow="md"
                                >
                                    Simpan Data Tamu
                                </Button>

                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
        </Box>
    );
}

export default AdminPage;