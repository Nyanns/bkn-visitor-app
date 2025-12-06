// File: frontend/src/pages/AdminDashboard.jsx
// Google Material Design Style - Admin Dashboard
import { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Heading,
    Container, Image, Text, Button, HStack, Input, InputGroup,
    InputLeftElement, useToast, Spinner, Center, Flex, VStack,
    IconButton, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid, Skeleton, SkeletonCircle, SkeletonText
} from '@chakra-ui/react';
import { FaSearch, FaSync, FaUserPlus, FaSignOutAlt, FaFileExcel, FaUsers, FaUserCheck, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
    const todayDate = new Date().toLocaleDateString('id-ID');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    const todayLogs = logs.filter(log => {
        if (!log.check_in_time) return false;
        const logDate = new Date(log.check_in_time).toISOString().split('T')[0];
        return logDate === today;
    });

    const totalVisitors = todayLogs.length;
    const activeVisitors = todayLogs.filter(log => log.status === "Sedang Berkunjung").length;

    return (
        <Box bg="#f8f9fa" minH="100vh">
            {/* Top Navigation Bar */}
            <Box
                bg="white"
                py={4}
                px={6}
                borderBottom="1px solid #dadce0"
                position="sticky"
                top={0}
                zIndex={10}
            >
                <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
                    <HStack spacing={3}>
                        <Box
                            w="40px"
                            h="40px"
                            bg="#1a73e8"
                            borderRadius="8px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <FaUsers color="white" />
                        </Box>
                        <VStack align="start" spacing={0}>
                            <Heading size="sm" color="#202124" fontWeight="500">
                                Dashboard Monitoring
                            </Heading>
                            <Text fontSize="xs" color="#5f6368">
                                Direktorat INTIKAMI - BKN
                            </Text>
                        </VStack>
                    </HStack>

                    <HStack spacing={2}>
                        <Button
                            leftIcon={<FaFileExcel />}
                            bg="#34a853"
                            color="white"
                            size="sm"
                            borderRadius="8px"
                            _hover={{ bg: "#2d9649" }}
                            onClick={handleExportExcel}
                        >
                            Export
                        </Button>
                        <Button
                            leftIcon={<FaUserPlus />}
                            bg="#1a73e8"
                            color="white"
                            size="sm"
                            borderRadius="8px"
                            _hover={{ bg: "#1557b0" }}
                            onClick={() => navigate('/admin/register')}
                        >
                            Registrasi
                        </Button>
                        <IconButton
                            icon={<FaSync />}
                            aria-label="Refresh"
                            variant="ghost"
                            size="sm"
                            onClick={fetchLogs}
                            isLoading={loading}
                        />
                        <Button
                            leftIcon={<FaSignOutAlt />}
                            variant="ghost"
                            size="sm"
                            color="#5f6368"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </HStack>
                </Flex>
            </Box>

            {/* Main Content */}
            <Container maxW="1400px" py={6}>
                {/* Stats Cards */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={6}>
                    <Box bg="white" p={5} borderRadius="12px" boxShadow="0 1px 2px 0 rgba(60,64,67,.1)">
                        <Stat>
                            <StatLabel color="#5f6368" fontSize="sm">Total Kunjungan</StatLabel>
                            <StatNumber color="#202124" fontSize="3xl">{totalVisitors}</StatNumber>
                            <StatHelpText color="#5f6368">
                                <HStack><FaCalendarAlt /><Text>Hari ini: {todayDate}</Text></HStack>
                            </StatHelpText>
                        </Stat>
                    </Box>
                    <Box bg="white" p={5} borderRadius="12px" boxShadow="0 1px 2px 0 rgba(60,64,67,.1)">
                        <Stat>
                            <StatLabel color="#5f6368" fontSize="sm">Sedang Berkunjung</StatLabel>
                            <StatNumber color="#34a853" fontSize="3xl">{activeVisitors}</StatNumber>
                            <StatHelpText color="#34a853">
                                <HStack><FaUserCheck /><Text>Aktif saat ini</Text></HStack>
                            </StatHelpText>
                        </Stat>
                    </Box>
                    <Box bg="white" p={5} borderRadius="12px" boxShadow="0 1px 2px 0 rgba(60,64,67,.1)">
                        <Stat>
                            <StatLabel color="#5f6368" fontSize="sm">Selesai Berkunjung</StatLabel>
                            <StatNumber color="#5f6368" fontSize="3xl">{totalVisitors - activeVisitors}</StatNumber>
                            <StatHelpText color="#5f6368">
                                <Text>Sudah check-out</Text>
                            </StatHelpText>
                        </Stat>
                    </Box>
                </SimpleGrid>

                {/* Table Card */}
                <Box bg="white" borderRadius="12px" boxShadow="0 1px 2px 0 rgba(60,64,67,.1)" overflow="hidden">
                    {/* Search Bar */}
                    <Box p={4} borderBottom="1px solid #e8eaed">
                        <InputGroup maxW="400px">
                            <InputLeftElement>
                                <FaSearch color="#5f6368" />
                            </InputLeftElement>
                            <Input
                                placeholder="Cari nama, NIK, atau instansi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                border="1px solid #dadce0"
                                borderRadius="8px"
                                _focus={{ borderColor: "#1a73e8", boxShadow: "none" }}
                            />
                        </InputGroup>
                    </Box>

                    {/* Table */}
                    <Box overflowX="auto">
                        <Table>
                            <Thead bg="#f8f9fa">
                                <Tr>
                                    <Th color="#5f6368" fontSize="xs" fontWeight="500">FOTO</Th>
                                    <Th color="#5f6368" fontSize="xs" fontWeight="500">NAMA & NIK</Th>
                                    <Th color="#5f6368" fontSize="xs" fontWeight="500">INSTANSI</Th>
                                    <Th color="#5f6368" fontSize="xs" fontWeight="500">MASUK</Th>
                                    <Th color="#5f6368" fontSize="xs" fontWeight="500">KELUAR</Th>
                                    <Th color="#5f6368" fontSize="xs" fontWeight="500">STATUS</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {loading ? (
                                    [1, 2, 3, 4, 5].map((i) => (
                                        <Tr key={i}>
                                            <Td><SkeletonCircle size="10" /></Td>
                                            <Td><SkeletonText noOfLines={2} spacing={2} /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="20px" /></Td>
                                            <Td><Skeleton height="24px" width="80px" borderRadius="12px" /></Td>
                                        </Tr>
                                    ))
                                ) : filteredLogs.length === 0 ? (
                                    <Tr>
                                        <Td colSpan={6} textAlign="center" py={10} color="#5f6368">
                                            Belum ada data kunjungan.
                                        </Td>
                                    </Tr>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <Tr key={log.id} _hover={{ bg: "#f8f9fa" }}>
                                            <Td>
                                                <Image
                                                    src={log.photo_url ? `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${log.photo_url}` : "https://via.placeholder.com/40"}
                                                    boxSize="40px"
                                                    borderRadius="full"
                                                    objectFit="cover"
                                                />
                                            </Td>
                                            <Td>
                                                <Text fontWeight="500" color="#202124">{log.full_name}</Text>
                                                <Text fontSize="xs" color="#5f6368">{log.nik}</Text>
                                            </Td>
                                            <Td color="#202124">{log.institution}</Td>
                                            <Td color="#202124" fontSize="sm">{formatTime(log.check_in_time)}</Td>
                                            <Td color="#5f6368" fontSize="sm">{formatTime(log.check_out_time)}</Td>
                                            <Td>
                                                <Badge
                                                    bg={log.status === "Sedang Berkunjung" ? "#e6f4ea" : "#f1f3f4"}
                                                    color={log.status === "Sedang Berkunjung" ? "#137333" : "#5f6368"}
                                                    px={3}
                                                    py={1}
                                                    borderRadius="full"
                                                    fontSize="xs"
                                                    fontWeight="500"
                                                >
                                                    {log.status}
                                                </Badge>
                                            </Td>
                                        </Tr>
                                    ))
                                )}
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

export default AdminDashboard;