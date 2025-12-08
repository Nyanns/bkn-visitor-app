// File: frontend/src/pages/AdminDashboard.jsx
// Google Material Design Style - Admin Dashboard (FAANG Quality Redesign)
import { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Heading,
    Container, Image, Text, Button, HStack, Input, InputGroup,
    InputLeftElement, useToast, Flex, VStack,
    IconButton, Stat, StatLabel, StatNumber, StatHelpText, SimpleGrid,
    Skeleton, SkeletonCircle, SkeletonText, Avatar, Card, CardBody,
    useColorModeValue, Icon, Fade
} from '@chakra-ui/react';
import {
    FaSearch, FaSync, FaUserPlus, FaSignOutAlt, FaFileExcel,
    FaUsers, FaUserCheck, FaCalendarAlt, FaCheckCircle,
    FaClock, FaChartLine, FaArrowRight, FaFilter
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import AuthenticatedImage from '../components/AuthenticatedImage';
import SessionTimeout from '../utils/sessionTimeout';
import bknLogo from '../assets/Logo_Badan_Kepegawaian_Negara.png';

// --- Reusable Components (Matching Analytics Style) ---

const StatCard = ({ label, value, icon, helpText, colorScheme = "blue", isLoading }) => {
    const bg = useColorModeValue('white', 'gray.800');
    return (
        <Card
            bg={bg}
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
        >
            <CardBody>
                {isLoading ? (
                    <Box>
                        <Skeleton height="20px" width="100px" mb={2} />
                        <Skeleton height="40px" width="60px" mb={2} />
                        <Skeleton height="15px" width="120px" />
                    </Box>
                ) : (
                    <Flex justify="space-between" align="start" mb={2}>
                        <Stat>
                            <StatLabel fontSize="xs" fontWeight="700" letterSpacing="0.5px" textTransform="uppercase" color="gray.500">
                                {label}
                            </StatLabel>
                            <StatNumber fontSize="3xl" fontWeight="800" color="gray.800">
                                {value}
                            </StatNumber>
                            {helpText && (
                                <StatHelpText mb={0} fontSize="xs" fontWeight="500" color="gray.500">
                                    <HStack spacing={1}>
                                        <Icon as={FaClock} /> <span>{helpText}</span>
                                    </HStack>
                                </StatHelpText>
                            )}
                        </Stat>
                        <Box
                            p={2}
                            bg={`${colorScheme}.50`}
                            color={`${colorScheme}.600`}
                            borderRadius="lg"
                        >
                            <Icon as={icon} boxSize={5} />
                        </Box>
                    </Flex>
                )}
            </CardBody>
        </Card>
    );
};

function AdminDashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    // Theme Colors (Consistent with Analytics)
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

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
            // Simulate smooth loading transition
            setTimeout(() => setLoading(false), 300);
        }
    };

    useEffect(() => {
        fetchLogs();

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
        return () => sessionTimeout.stop();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        toast({ title: "Logout Berhasil", status: "info", position: "top" });
        navigate('/admin/login');
    };

    const handleExportExcel = async () => {
        try {
            const response = await api.get('/admin/export-excel', { responseType: 'blob' });
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
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log =>
        log.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.nik.includes(searchTerm)
    );

    // Stats calculations - ONLY TODAY
    const today = new Date();
    const todayDate = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const checkIsToday = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const todayLogs = logs.filter(log => checkIsToday(log.check_in_time));
    const totalVisitors = todayLogs.length;
    const activeVisitors = todayLogs.filter(log => log.status === "Sedang Berkunjung").length;
    const completedVisitors = totalVisitors - activeVisitors;

    return (
        <Fade in={true}>
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
                                Visitor Management
                            </Heading>
                        </HStack>

                        <HStack spacing={3}>
                            <Button
                                leftIcon={<FaUserPlus />}
                                bg="#1a73e8"
                                color="white"
                                size="sm"
                                px={5}
                                borderRadius="full"
                                fontWeight="600"
                                fontSize="xs"
                                _hover={{ bg: "#1557b0", boxShadow: "md" }}
                                boxShadow="sm"
                                onClick={() => navigate('/admin/register')}
                            >
                                NEW VISITOR
                            </Button>
                            <IconButton
                                icon={<FaSync />}
                                aria-label="Refresh"
                                variant="ghost"
                                color="gray.500"
                                size="sm"
                                borderRadius="full"
                                onClick={fetchLogs}
                                isLoading={loading}
                            />
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

                {/* Main Content Area */}
                <Container maxW="1600px" py={8} px={{ base: 4, md: 8 }}>

                    {/* Header Section */}
                    <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} mb={8} gap={4}>
                        <Box>
                            <Heading size="lg" color="gray.800" fontWeight="800" letterSpacing="-0.5px">
                                Dashboard Overview
                            </Heading>
                            <Text color="gray.500" fontSize="md" mt={1}>
                                Aktivitas hari ini: <b>{todayDate}</b>
                            </Text>
                        </Box>
                        <HStack spacing={3}>
                            <Button
                                leftIcon={<FaChartLine />}
                                variant="outline"
                                colorScheme="blue"
                                size="md"
                                borderRadius="md"
                                onClick={() => navigate('/admin/analytics')}
                                fontWeight="600"
                                bg="white"
                            >
                                Analytics
                            </Button>
                            <Button
                                leftIcon={<FaFileExcel />}
                                variant="outline"
                                colorScheme="green"
                                size="md"
                                borderRadius="md"
                                onClick={handleExportExcel}
                                fontWeight="600"
                                bg="white"
                            >
                                Export Data
                            </Button>
                        </HStack>
                    </Flex>

                    {/* Statistics Cards */}
                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                        <StatCard
                            label="Total Visitors"
                            value={totalVisitors}
                            icon={FaUsers}
                            helpText="Hari ini"
                            colorScheme="blue"
                            isLoading={loading}
                        />
                        <StatCard
                            label="Active Sessions"
                            value={activeVisitors}
                            icon={FaUserCheck}
                            helpText="Sedang di lokasi"
                            colorScheme="green"
                            isLoading={loading}
                        />
                        <StatCard
                            label="Completed Visits"
                            value={completedVisitors}
                            icon={FaCheckCircle}
                            helpText="Sudah checkout"
                            colorScheme="gray"
                            isLoading={loading}
                        />
                    </SimpleGrid>

                    {/* Main Data Table Section */}
                    <Card
                        bg={cardBg}
                        borderRadius="xl"
                        boxShadow="sm"
                        border="1px solid"
                        borderColor={borderColor}
                        overflow="hidden"
                    >
                        {/* Toolbar */}
                        <Flex p={5} borderBottom="1px solid" borderColor={borderColor} justify="space-between" align="center" wrap="wrap" gap={4}>
                            <HStack>
                                <Icon as={FaCalendarAlt} color="gray.400" />
                                <Heading size="sm" color="gray.700" fontWeight="700">
                                    Recent Activity Log
                                </Heading>
                            </HStack>

                            <InputGroup maxW="320px" size="md">
                                <InputLeftElement pointerEvents="none">
                                    <FaSearch color="#9aa0a6" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search visitors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    bg="gray.50"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    borderRadius="md"
                                    _focus={{ bg: "white", borderColor: "#1a73e8", boxShadow: "none" }}
                                    fontSize="sm"
                                />
                            </InputGroup>
                        </Flex>

                        {/* Table Container */}
                        <Box overflowX="auto">
                            <Table variant="simple" size="md">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.5px" py={4} pl={6}>Visitor Profile</Th>
                                        <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.5px">Institution</Th>
                                        <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.5px">Date & Time</Th>
                                        <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.5px">Status</Th>
                                        <Th textTransform="uppercase" fontSize="xs" fontWeight="700" color="gray.500" letterSpacing="0.5px" pr={6} textAlign="right">Actions</Th>
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
                                            <Td colSpan={5} textAlign="center" py={12}>
                                                <VStack spacing={3}>
                                                    <Box p={4} bg="gray.50" borderRadius="full">
                                                        <Icon as={FaFilter} boxSize={8} color="gray.300" />
                                                    </Box>
                                                    <Text color="gray.500" fontWeight="500">No matching records found.</Text>
                                                </VStack>
                                            </Td>
                                        </Tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <Tr key={log.id} _hover={{ bg: "gray.50", transition: "all 0.2s" }} borderBottom="1px solid" borderColor="gray.100">
                                                <Td pl={6} py={4}>
                                                    <HStack spacing={4}>
                                                        <Box position="relative">
                                                            {log.photo_url ? (
                                                                <AuthenticatedImage
                                                                    filename={log.photo_url.split(/[/\\]/).pop()}
                                                                    boxSize="40px"
                                                                    borderRadius="full"
                                                                    objectFit="cover"
                                                                    fallbackSrc="https://via.placeholder.com/40"
                                                                    border="2px solid white"
                                                                    boxShadow="sm"
                                                                />
                                                            ) : (
                                                                <Avatar size="sm" name={log.full_name} bg="#1a73e8" color="white" />
                                                            )}
                                                            {log.status === "Sedang Berkunjung" && (
                                                                <Box position="absolute" bottom="0" right="0" w="10px" h="10px" bg="green.400" borderRadius="full" border="2px solid white" />
                                                            )}
                                                        </Box>
                                                        <Box>
                                                            <Text fontWeight="600" color="gray.800" fontSize="sm">{log.full_name}</Text>
                                                            <Text fontSize="xs" color="gray.500" fontFamily="monospace">{log.nik}</Text>
                                                        </Box>
                                                    </HStack>
                                                </Td>
                                                <Td>
                                                    <Badge colorScheme="gray" variant="subtle" fontWeight="500" px={2} borderRadius="md" fontSize="xs">
                                                        {log.institution}
                                                    </Badge>
                                                </Td>
                                                <Td>
                                                    <VStack align="start" spacing={1}>
                                                        <HStack spacing={2}>
                                                            <Badge colorScheme="green" fontSize="xs" size="sm" variant="subtle">IN</Badge>
                                                            <Text color="green.700" fontSize="xs" fontWeight="700">
                                                                {formatTime(log.check_in_time)}
                                                            </Text>
                                                        </HStack>

                                                        {log.check_out_time ? (
                                                            <HStack spacing={2}>
                                                                <Badge colorScheme="red" fontSize="xs" size="sm" variant="subtle">OUT</Badge>
                                                                <Text color="red.600" fontSize="xs" fontWeight="700">
                                                                    {formatTime(log.check_out_time)}
                                                                </Text>
                                                            </HStack>
                                                        ) : (
                                                            <Text fontSize="xs" color="gray.400" pl={8} fontStyle="italic">
                                                                Sedang berkunjung...
                                                            </Text>
                                                        )}
                                                    </VStack>
                                                </Td>
                                                <Td>
                                                    <Badge
                                                        bg={log.status === "Sedang Berkunjung" ? "green.50" : "gray.100"}
                                                        color={log.status === "Sedang Berkunjung" ? "green.700" : "gray.600"}
                                                        px={2.5}
                                                        py={0.5}
                                                        borderRadius="full"
                                                        fontSize="11px"
                                                        fontWeight="700"
                                                        letterSpacing="0.3px"
                                                        border="1px solid"
                                                        borderColor={log.status === "Sedang Berkunjung" ? "green.200" : "gray.200"}
                                                    >
                                                        {log.status === "Sedang Berkunjung" ? "ACTIVE" : "DONE"}
                                                    </Badge>
                                                </Td>
                                                <Td pr={6} textAlign="right">
                                                    <Button
                                                        size="xs"
                                                        rightIcon={<FaArrowRight />}
                                                        variant="ghost"
                                                        colorScheme="blue"
                                                        color="#1a73e8"
                                                        onClick={() => navigate(`/admin/visitor/${log.nik}`)}
                                                    >
                                                        Details
                                                    </Button>
                                                </Td>
                                            </Tr>
                                        ))
                                    )}
                                </Tbody>
                            </Table>
                        </Box>
                        {/* Pagination or Footer of Table */}
                        <Box p={4} bg="gray.50" borderTop="1px solid" borderColor={borderColor}>
                            <Flex justify="space-between" align="center">
                                <Text fontSize="xs" color="gray.500">
                                    Showing <b>{filteredLogs.length}</b> records
                                </Text>
                            </Flex>
                        </Box>
                    </Card>

                    {/* Footer */}
                    <Text textAlign="center" mt={12} fontSize="xs" color="gray.400" fontWeight="500">
                        &copy; 2025 BKN Visitor System • Direktorat INTIKAMI • v1.0
                    </Text>

                </Container>
            </Box>
        </Fade>
    );
}

export default AdminDashboard;