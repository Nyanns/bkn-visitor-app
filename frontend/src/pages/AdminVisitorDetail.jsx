// File: frontend/src/pages/AdminVisitorDetail.jsx
import { useState, useEffect, useRef } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack, Heading,
    useToast, Spinner, Center, AlertDialog,
    AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay, Container, HStack, Text,
    Grid, GridItem, Flex, Badge, Icon
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTrash, FaSave, FaUser, FaBuilding, FaPhone } from 'react-icons/fa';
import api from '../api';
import AuthenticatedImage from '../components/AuthenticatedImage';

function AdminVisitorDetail() {
    const { nik } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form Data
    const [fullName, setFullName] = useState('');
    const [institution, setInstitution] = useState('');
    const [phone, setPhone] = useState('');
    const [photoPath, setPhotoPath] = useState('');

    // Delete Confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const cancelRef = useRef();

    useEffect(() => {
        const fetchVisitor = async () => {
            try {
                const response = await api.get(`/visitors/${nik}`);
                const data = response.data;

                setFullName(data.full_name);
                setInstitution(data.institution);
                setPhone(data.phone || '');
                setPhotoPath(data.photo_path || '');
            } catch (error) {
                toast({ title: "Gagal memuat data", status: "error" });
                navigate('/admin/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchVisitor();
    }, [nik, navigate, toast]);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('institution', institution);
            if (phone) formData.append('phone', phone);

            await api.put(`/visitors/${nik}`, formData);

            toast({ title: "Data berhasil diperbarui", status: "success" });
            navigate('/admin/dashboard');
        } catch (error) {
            toast({ title: "Gagal update data", description: error.response?.data?.detail, status: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/visitors/${nik}`);
            toast({ title: "Pengunjung berhasil dihapus", status: "success" });
            navigate('/admin/dashboard');
        } catch (error) {
            toast({ title: "Gagal menghapus data", description: error.response?.data?.detail, status: "error" });
        }
    };

    if (loading) {
        return <Center minH="100vh" bg="#f8f9fa"><Spinner size="xl" color="#1a73e8" /></Center>;
    }

    return (
        <Box bg="#f8f9fa" minH="100vh">
            {/* Header */}
            <Box bg="white" borderBottom="1px solid #dadce0" px={{ base: 4, md: 8 }} py={4} position="sticky" top={0} zIndex={10}>
                <Flex justify="space-between" align="center" maxW="7xl" mx="auto">
                    <HStack spacing={4}>
                        <Button
                            leftIcon={<FaArrowLeft />}
                            variant="ghost"
                            onClick={() => navigate('/admin/dashboard')}
                            color="#5f6368"
                            _hover={{ bg: "#f1f3f4", color: "#202124" }}
                        >
                            Kembali
                        </Button>
                        <Heading size="md" color="#202124" display={{ base: "none", md: "block" }}>Detail Data Pengunjung</Heading>
                    </HStack>
                    <HStack spacing={2}>
                        <Button
                            leftIcon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            size="sm"
                        >
                            Hapus
                        </Button>
                        <Button
                            leftIcon={<FaSave />}
                            bg="#1a73e8"
                            color="white"
                            _hover={{ bg: "#1557b0" }}
                            isLoading={saving}
                            onClick={handleUpdate}
                            size="sm"
                            px={6}
                        >
                            Simpan
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            <Container maxW="7xl" py={8}>
                <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
                    {/* Left Column: Photo & Info Card */}
                    <GridItem>
                        <VStack spacing={6} align="stretch">
                            <Box
                                bg="white"
                                p={6}
                                borderRadius="xl"
                                boxShadow="0 1px 3px 0 rgba(60,64,67,0.3)"
                                textAlign="center"
                            >
                                <Center mb={4}>
                                    <Box
                                        w="200px"
                                        h="200px"
                                        borderRadius="xl"
                                        overflow="hidden"
                                        border="4px solid #f1f3f4"
                                        position="relative"
                                    >
                                        {photoPath ? (
                                            <AuthenticatedImage
                                                filename={photoPath.split(/[/\\]/).pop()}
                                                alt="Visitor Photo"
                                                w="100%"
                                                h="100%"
                                                objectFit="cover"
                                            />
                                        ) : (
                                            <Center w="full" h="full" bg="#f8f9fa" flexDirection="column">
                                                <Icon as={FaUser} w={10} h={10} color="#dadce0" mb={2} />
                                                <Text fontSize="sm" color="#5f6368">No Photo</Text>
                                            </Center>
                                        )}
                                    </Box>
                                </Center>
                                <Heading size="md" color="#202124" mb={1}>{fullName}</Heading>
                                <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                                    Visitor
                                </Badge>

                                <VStack spacing={3} mt={6} align="start" divider={<Box w="full" borderBottom="1px solid #f1f3f4" />}>
                                    <HStack>
                                        <Text color="#5f6368" fontSize="sm" w="80px">NIK</Text>
                                        <Text color="#202124" fontWeight="500">{nik}</Text>
                                    </HStack>
                                </VStack>
                            </Box>
                        </VStack>
                    </GridItem>

                    {/* Right Column: Edit Form */}
                    <GridItem>
                        <Box bg="white" p={8} borderRadius="xl" boxShadow="0 1px 3px 0 rgba(60,64,67,0.3)">
                            <Heading size="md" mb={6} color="#202124">Informasi Pribadi & Kontak</Heading>

                            <VStack spacing={5}>
                                <FormControl>
                                    <FormLabel color="#5f6368" fontSize="sm">Nama Lengkap</FormLabel>
                                    <HStack>
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            focusBorderColor="#1a73e8"
                                            size="lg"
                                            fontSize="md"
                                        />
                                        <Icon as={FaUser} color="#dadce0" />
                                    </HStack>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="#5f6368" fontSize="sm">Instansi / Perusahaan</FormLabel>
                                    <HStack>
                                        <Input
                                            value={institution}
                                            onChange={(e) => setInstitution(e.target.value)}
                                            focusBorderColor="#1a73e8"
                                            size="lg"
                                            fontSize="md"
                                        />
                                        <Icon as={FaBuilding} color="#dadce0" />
                                    </HStack>
                                </FormControl>

                                <FormControl>
                                    <FormLabel color="#5f6368" fontSize="sm">Nomor Handphone (WhatsApp)</FormLabel>
                                    <HStack>
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            focusBorderColor="#1a73e8"
                                            size="lg"
                                            fontSize="md"
                                            placeholder="Contoh: 08123456789"
                                        />
                                        <Icon as={FaPhone} color="#dadce0" />
                                    </HStack>
                                </FormControl>
                            </VStack>

                            <Box mt={10} p={4} bg="#e8f0fe" borderRadius="lg">
                                <HStack align="start">
                                    <Icon as={FaSave} color="#1967d2" mt={1} />
                                    <Text fontSize="sm" color="#1967d2">
                                        Pastikan data yang Anda ubah sudah sesuai dengan KTP atau identitas asli pengunjung. Perubahan ini akan tercatat dalam log sistem.
                                    </Text>
                                </HStack>
                            </Box>
                        </Box>
                    </GridItem>
                </Grid>
            </Container>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsDeleteDialogOpen(false)}
                isCentered
            >
                <AlertDialogOverlay bg="rgba(0,0,0,0.4)">
                    <AlertDialogContent borderRadius="xl">
                        <AlertDialogHeader fontSize="lg" fontWeight="bold" borderBottom="1px solid #f1f3f4">
                            Hapus Data Pengunjung?
                        </AlertDialogHeader>

                        <AlertDialogBody py={6}>
                            <Text color="#5f6368">
                                Tindakan ini <b>tidak dapat dibatalkan</b>. Data pengunjung dengan NIK <b>{nik}</b> dan seluruh riwayat kunjungannya akan dihapus permanen dari sistem.
                            </Text>
                        </AlertDialogBody>

                        <AlertDialogFooter borderTop="1px solid #f1f3f4">
                            <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)} variant="ghost">
                                Batal
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3} bg="#d93025" _hover={{ bg: "#b21414" }}>
                                Ya, Hapus Permanen
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}

export default AdminVisitorDetail;
