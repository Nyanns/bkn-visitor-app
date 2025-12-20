// File: frontend/src/pages/AdminMasterDataPage.jsx
// Admin page for managing Master Data (Rooms & Companions)

import {
    Box, Container, Heading, Text, Button, HStack, Flex,
    IconButton, Card, CardBody, useColorModeValue, Image
} from '@chakra-ui/react';
import { FaArrowLeft, FaSignOutAlt, FaCog, FaFileExcel } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import api from '../api';
import AdminMasterData from '../components/AdminMasterData';
import SessionTimeout from '../utils/sessionTimeout';
import { useEffect } from 'react';
import bknLogo from '../assets/Logo_Badan_Kepegawaian_Negara.png';

function AdminMasterDataPage() {
    const navigate = useNavigate();
    const toast = useToast();
    const token = localStorage.getItem('adminToken');

    const borderColor = useColorModeValue('gray.200', 'gray.700');

    useEffect(() => {
        // Initialize session timeout (30 minutes idle = auto logout)
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
        return () => {
            sessionTimeout.stop();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        toast({ title: "Logout Berhasil", status: "info", position: "top" });
        navigate('/admin/login');
    };




    return (
        <Box bg="#f8f9fa" minH="100vh" fontFamily="'Inter', sans-serif">
            {/* Top Navigation Bar */}
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
                <Flex h="100%" justify="space-between" align="center" maxW="1600px" mx="auto">
                    <HStack spacing={4}>
                        <Image src={bknLogo} h="36px" alt="Logo BKN" />
                        <Box w="1px" h="24px" bg="gray.200" display={{ base: "none", md: "block" }} />
                        <Heading size="sm" color="gray.700" fontWeight="600" display={{ base: "none", md: "block" }}>
                            Master Data
                        </Heading>
                    </HStack>

                    <HStack spacing={3}>


                        <Button
                            leftIcon={<FaArrowLeft />}
                            variant="outline"
                            colorScheme="gray"
                            size="sm"
                            borderRadius="full"
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            Kembali
                        </Button>
                        <IconButton
                            icon={<FaSignOutAlt />}
                            aria-label="Logout"
                            variant="ghost"
                            color="red.500"
                            size="sm"
                            borderRadius="full"
                            onClick={handleLogout}
                            _hover={{ bg: "red.50" }}
                        />
                    </HStack>
                </Flex>
            </Box>

            {/* Main Content */}
            <Container maxW="1200px" py={8} px={{ base: 4, md: 8 }}>
                {/* Header Section */}
                <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                        <Heading size="lg" color="gray.800" fontWeight="800" letterSpacing="-0.5px">
                            Master Data
                        </Heading>
                        <Text color="gray.500" fontSize="md" mt={1}>
                            Kelola daftar ruangan dan pendamping untuk kunjungan
                        </Text>
                    </Box>
                </Flex>

                {/* Master Data Component */}
                <Card
                    bg="white"
                    borderRadius="xl"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <CardBody p={6}>
                        <AdminMasterData token={token} />
                    </CardBody>
                </Card>

                {/* Footer */}
                <Text textAlign="center" mt={12} fontSize="xs" color="gray.400" fontWeight="500">
                    &copy; 2025 BKN Visitor System • Direktorat INTIKAMI • v1.6.0
                </Text>
            </Container>
        </Box>
    );
}

export default AdminMasterDataPage;
