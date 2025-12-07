// File: frontend/src/pages/AdminDashboard.jsx
// Google Material Design Style - Admin Dashboard
import { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Heading,
    Container, Image, Text, Button, HStack, Input, InputGroup,
    InputLeftElement, useToast, Spinner, Center, Flex, VStack,
    IconButton, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Skeleton, SkeletonCircle, SkeletonText,
    Avatar
} from '@chakra-ui/react';
import { FaSearch, FaSync, FaUserPlus, FaSignOutAlt, FaFileExcel, FaUsers, FaUserCheck, FaCalendarAlt, FaEdit, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthenticatedImage from '../components/AuthenticatedImage';
import SessionTimeout from '../utils/sessionTimeout';
import bknLogo from '../assets/Logo_Badan_Kepegawaian_Negara.png';

function AdminDashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/logs');
            setLogs(response.data);
        } catch (error) {
            toast({ title: "Gagal memuat data", status: "error", position: "top" });
            if (error.response && error.response.status === 401) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();

        // Initialize session timeout (30 minutes idle = auto logout)
        const sessionTimeout = new SessionTimeout(30, () => {
            toast({
                title: "Sesi Berakhir",
                description: "Anda telah logout otomatis karena tidak aktif selama 30 menit.",
                status: "warning",
                position: "top",
                duration: 5000
            });
            handleLogout();
        });

        sessionTimeout.start();

        // Cleanup on unmount
        return () => {
            sessionTimeout.stop();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        toast({ title: "Logout Berhasil", status: "info", position: "top" });
        navigate('/admin/login');
    };

    const handleExportExcel = async () => {
        try {
            const response = await api.get('/admin/export-excel', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Laporan_Tamu_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast({ title: "Excel berhasil diexport!", status: "success", position: "top" });
        } catch (error) {
            toast({ title: "Gagal export Excel", status: "error", position: "top" });
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return "-";
        return new Date(isoString).toLocaleString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log =>
        log.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.nik.includes(searchTerm)
    );

    // Stats calculations - ONLY TODAY
    const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const todayISO = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const todayLogs = logs.filter(log => {
        if (!log.check_in_time) return false;
        const logDate = new Date(log.check_in_time).toISOString().split('T')[0];
        return logDate === todayISO;
    });

    const totalVisitors = todayLogs.length;
    const activeVisitors = todayLogs.filter(log => log.status === "Sedang Berkunjung").length;
    const completedVisitors = totalVisitors - activeVisitors;

    return (
        <Box bg="#f8f9fa" minH="100vh" fontFamily="'Google Sans', 'Inter', sans-serif">
            {/* Top Navigation Bar - Sticky & Glassmorphic effect if needed, simplicity for now */}
            <Box
                bg="white"
                py={3}
                px={6}
                borderBottom="1px solid #dadce0"
                position="sticky"
                top={0}
                zIndex={100}
                boxShadow="sm"
            >
                <Flex justify="space-between" align="center" maxW="1600px" mx="auto">
                    <HStack spacing={4}>
                        <Image src={bknLogo} h="42px" alt="Logo BKN" />
                        <VStack align="start" spacing={0} display={{ base: "none", md: "flex" }}>
                            <Heading size="sm" color="#202124" fontWeight="600" letterSpacing="tight">
                                Dashboard Monitoring
                            </Heading>
                            <Text fontSize="xs" color="#5f6368" fontWeight="500">
                                Badan Kepegawaian Negara
                            </Text>
                        </VStack>
                    </HStack>

                    <HStack spacing={3}>
                        <Button
                            leftIcon={<FaUserPlus />}
                            bg="#1a73e8"
                            color="white"
                            size="sm"
                            px={4}
                            borderRadius="full"
                            fontWeight="500"
                            _hover={{ bg: "#1557b0", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
                            onClick={() => navigate('/admin/register')}
                        >
                            Registrasi Tamu
                        </Button>
                        <IconButton
                            icon={<FaSync />}
                            aria-label="Refresh"
                            variant="ghost"
                            color="#5f6368"
                            borderRadius="full"
                            onClick={fetchLogs}
                            isLoading={loading}
                            _hover={{ bg: "#f1f3f4" }}
                        />
                        <IconButton
                            icon={<FaSignOutAlt />}
                            aria-label="Logout"
                            variant="ghost"
                            color="#d93025"
                            borderRadius="full"
                            onClick={handleLogout}
                            _hover={{ bg: "#fce8e6" }}
                        />
                    </HStack>
                </Flex>
            </Box>

            {/* Main Content Area */}
            <Container maxW="1600px" py={8} px={{ base: 4, md: 8 }}>

                {/* Header Section */}
                <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} mb={8} gap={4}>
                    <Box>
                        <Heading size="lg" color="#202124" mb={2} fontWeight="400">
                            Selamat Datang, Admin
                        </Heading>
                        <Text color="#5f6368" fontSize="md">
                            Pantau aktivitas kunjungan hari ini, <b>{todayDate}</b>
                        </Text>
                    </Box>
                    <Button
                        leftIcon={<FaFileExcel />}
                        variant="outline"
                        colorScheme="green"
                        size="md"
                        borderRadius="md"
                        onClick={handleExportExcel}
                        fontWeight="500"
                    >
                        Export Laporan Excel
                    </Button>
                </Flex>

                {/* Statistics Cards - High Visual Impact */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                    {/* Card 1: Total Visits */}
                    <Box bg="white" p={6} borderRadius="16px" boxShadow="0 1px 3px 0 rgba(60,64,67,0.1)" border="1px solid #e8eaed" position="relative" overflow="hidden">
                        <Box position="absolute" right="-20px" top="-20px" opacity={0.05}>
                            <FaUsers size="120px" />
                        </Box>
                        <Stat>
                            <StatLabel color="#5f6368" fontWeight="500" mb={1}>Total Kunjungan Hari Ini</StatLabel>
                            <StatNumber fontSize="4xl" color="#1a73e8" fontWeight="700">{totalVisitors}</StatNumber>
                            <StatHelpText mb={0} color="#5f6368" fontSize="sm">
                                <HStack spacing={1}>
                                    <FaClock size="12px" /> <span>Data realtime</span>
                                </HStack>
                            </StatHelpText>
                        </Stat>
                    </Box>

                    {/* Card 2: Active Visitors */}
                    <Box bg="white" p={6} borderRadius="16px" boxShadow="0 1px 3px 0 rgba(60,64,67,0.1)" border="1px solid #e8eaed" position="relative" overflow="hidden">
                        <Box position="absolute" right="-20px" top="-20px" opacity={0.05}>
                            <FaUserCheck size="120px" color="green" />
                        </Box>
                        <Stat>
                            <StatLabel color="#5f6368" fontWeight="500" mb={1}>Sedang Berkunjung</StatLabel>
                            <StatNumber fontSize="4xl" color="#1e8e3e" fontWeight="700">{activeVisitors}</StatNumber>
                            <StatHelpText mb={0} color="#1e8e3e" fontWeight="500" fontSize="sm">
                                <HStack spacing={1}>
                                    <Text>•</Text> <span>Sedang di lokasi</span>
                                </HStack>
                            </StatHelpText>
                        </Stat>
                    </Box>

                    {/* Card 3: Completed Visits */}
                    <Box bg="white" p={6} borderRadius="16px" boxShadow="0 1px 3px 0 rgba(60,64,67,0.1)" border="1px solid #e8eaed" position="relative" overflow="hidden">
                        <Box position="absolute" right="-20px" top="-20px" opacity={0.05}>
                            <FaCheckCircle size="120px" color="gray" />
                        </Box>
                        <Stat>
                            <StatLabel color="#5f6368" fontWeight="500" mb={1}>Kunjungan Selesai</StatLabel>
                            <StatNumber fontSize="4xl" color="#5f6368" fontWeight="700">{completedVisitors}</StatNumber>
                            <StatHelpText mb={0} color="#5f6368" fontSize="sm">
                                <HStack spacing={1}>
                                    <Text>•</Text> <span>Sudah checkout</span>
                                </HStack>
                            </StatHelpText>
                        </Stat>
                    </Box>
                </SimpleGrid>

                {/* Main Data Table Section */}
                <Box bg="white" borderRadius="16px" boxShadow="0 2px 6px 0 rgba(60,64,67,0.15)" border="1px solid #e8eaed" overflow="hidden">

                    {/* Toolbar */}
                    <Flex p={5} borderBottom="1px solid #f1f3f4" justify="space-between" align="center" wrap="wrap" gap={4}>
                        <Heading size="md" color="#202124" fontWeight="500">
                            Log Kunjungan
                        </Heading>
                        <InputGroup maxW="400px" size="md">
                            <InputLeftElement pointerEvents="none">
                                <FaSearch color="#9aa0a6" />
                            </InputLeftElement>
                            <Input
                                placeholder="Cari nama, NIK, atau instansi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                bg="#f1f3f4"
                                border="none"
                                borderRadius="8px"
                                _focus={{ bg: "white", boxShadow: "0 0 0 1px #1a73e8" }}
                                _placeholder={{ color: "#80868b" }}
                            />
                        </InputGroup>
                    </Flex>

                    {/* Table Container */}
                    <Box overflowX="auto">
                        <Table variant="simple" size="md">
                            <Thead bg="#fff">
                                <Tr>
                                    <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="#5f6368" letterSpacing="0.5px" py={4} pl={6}>Pengunjung</Th>
                                    <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="#5f6368" letterSpacing="0.5px">Instansi</Th>
                                    <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="#5f6368" letterSpacing="0.5px">Waktu Kunjungan</Th>
                                    <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="#5f6368" letterSpacing="0.5px">Status</Th>
                                    <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="#5f6368" letterSpacing="0.5px" pr={6} textAlign="right">Aksi</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <Tr key={i}>
                                            <Td pl={6}><HStack><SkeletonCircle size="10" /><SkeletonText noOfLines={2} width="150px" /></HStack></Td>
                                            <Td><Skeleton height="20px" width="100px" /></Td>
                                            <Td><Skeleton height="20px" width="120px" /></Td>
                                            <Td><Skeleton height="24px" width="80px" borderRadius="12px" /></Td>
                                            <Td pr={6}><Skeleton height="32px" width="32px" float="right" /></Td>
                                        </Tr>
                                    ))
                                ) : filteredLogs.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={5} textAlign="center" py={16}>
                                            <VStack spacing={3}>
                                                <Image src="https://ssl.gstatic.com/docs/common/drive/empty_state_1.png" h="100px" opacity={0.5} alt="No Data" />
                                                <Text color="#5f6368" fontWeight="500">Belum ada data kunjungan yang cocok.</Text>
                                            </VStack>
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <Tr key={log.id} _hover={{ bg: "#f8f9fa", transition: "all 0.2s" }} borderBottom="1px solid #f1f3f4">
                                            <Td pl={6} py={4}>
                                                <HStack spacing={4}>
                                                    <Box position="relative">
                                                        {log.photo_url ? (
                                                            <AuthenticatedImage
                                                                filename={log.photo_url.split(/[/\\]/).pop()}
                                                                boxSize="44px"
                                                                borderRadius="full"
                                                                objectFit="cover"
                                                                fallbackSrc="https://via.placeholder.com/44"
                                                                border="1px solid #dadce0"
                                                            />
                                                        ) : (
                                                            <Avatar size="md" name={log.full_name} bg="#1a73e8" color="white" />
                                                        )}
                                                    </Box>
                                                    <Box>
                                                        <Text fontWeight="600" color="#202124" fontSize="sm">{log.full_name}</Text>
                                                        <Text fontSize="xs" color="#5f6368" fontFamily="monospace">{log.nik}</Text>
                                                    </Box>
                                                </HStack>
                                            </Td>
                                            <Td>
                                                <Text color="#3c4043" fontSize="sm" fontWeight="500">{log.institution}</Text>
                                            </Td>
                                            <Td>
                                                <VStack align="start" spacing={0}>
                                                    <Text color="#202124" fontSize="sm" fontWeight="500">
                                                        {new Date(log.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                    <Text fontSize="xs" color="#5f6368">
                                                        {formatTime(log.check_out_time)} (Keluar)
                                                    </Text>
                                                </VStack>
                                            </Td>
                                            <Td>
                                                <Badge
                                                    bg={log.status === "Sedang Berkunjung" ? "#e6f4ea" : "#f1f3f4"}
                                                    color={log.status === "Sedang Berkunjung" ? "#137333" : "#5f6368"}
                                                    px={3}
                                                    py={1}
                                                    borderRadius="full"
                                                    fontSize="xs"
                                                    fontWeight="600"
                                                    letterSpacing="0.3px"
                                                    border={log.status === "Sedang Berkunjung" ? "1px solid #ceead6" : "1px solid #dadce0"}
                                                >
                                                    {log.status === "Sedang Berkunjung" ? "ACTIVE" : "DONE"}
                                                </Badge>
                                            </Td>
                                            <Td pr={6} textAlign="right">
                                                <Button
                                                    size="sm"
                                                    leftIcon={<FaEdit />}
                                                    variant="outline"
                                                    colorScheme="blue"
                                                    borderRadius="8px"
                                                    borderColor="#dadce0"
                                                    color="#1a73e8"
                                                    _hover={{ bg: "#f8faff", borderColor: "#1a73e8" }}
                                                    onClick={() => navigate(`/admin/visitor/${log.nik}`)}
                                                >
                                                    Detail
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                    <Box p={4} bg="#fff" borderTop="1px solid #f1f3f4">
                        <Text fontSize="xs" color="#5f6368" textAlign="center">
                            Menampilkan {filteredLogs.length} data kunjungan
                        </Text>
                    </Box>
                </Box>

                {/* Footer */}
                <Text textAlign="center" mt={8} fontSize="xs" color="#9aa0a6">
                    &copy; 2025 BKN Visitor System • Direktorat INTIKAMI
                </Text>

            </Container>
        </Box>
    );
}

export default AdminDashboard;