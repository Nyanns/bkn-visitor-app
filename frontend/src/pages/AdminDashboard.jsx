// File: frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Heading,
    Container, Image, Text, Button, HStack, Input, InputGroup,
    InputLeftElement, Card, CardBody, useToast, Spinner, Center,
    IconButton
} from '@chakra-ui/react';
import { FaSearch, FaSync, FaUserPlus, FaSignOutAlt, FaFileExcel } from 'react-icons/fa';
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

    return (
        <Box bg="gray.50" minH="100vh" py={8}>
            <Container maxW="container.xl">

                {/* Header Dashboard */}
                <HStack justifyContent="space-between" mb={8} wrap="wrap" spacing={4}>
                    <Box>
                        <Heading color="blue.700" size="lg">Dashboard Monitoring Tamu</Heading>
                        <Text color="blue.600" fontSize="sm" fontWeight="semibold">
                            Direktorat Infrastruktur Teknologi Informasi dan Keamanan Informasi
                        </Text>
                        <Text color="gray.500" fontSize="xs">Badan Kepegawaian Negara</Text>
                    </Box>

                    <HStack spacing={3}>
                        {/* Tombol Export Excel */}
                        <Button
                            leftIcon={<FaFileExcel />}
                            colorScheme="green"
                            variant="outline"
                            onClick={handleExportExcel}
                        >
                            Export Excel
                        </Button>

                        {/* Tombol Registrasi */}
                        <Button
                            leftIcon={<FaUserPlus />}
                            colorScheme="blue"
                            onClick={() => navigate('/admin/register')}
                        >
                            Registrasi Baru
                        </Button>

                        {/* Tombol Refresh */}
                        <IconButton
                            icon={<FaSync />}
                            aria-label="Refresh Data"
                            onClick={fetchLogs}
                            isLoading={loading}
                        />

                        {/* Tombol Logout */}
                        <Button
                            leftIcon={<FaSignOutAlt />}
                            colorScheme="red"
                            variant="outline"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button}
                    </HStack>
                </HStack>

                {/* Card Tabel */}
                <Card boxShadow="lg" bg="white" borderRadius="xl" overflow="hidden">
                    <CardBody p={0}>

                        {/* Toolbar Pencarian */}
                        <Box p={4} borderBottom="1px solid" borderColor="gray.100" bg="white">
                            <InputGroup maxW="400px">
                                <InputLeftElement pointerEvents="none"><FaSearch color="gray" /></InputLeftElement>
                                <Input
                                    placeholder="Cari Nama / NIK / Instansi..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Box>

                        {/* Tabel Data */}
                        <Box overflowX="auto">
                            <Table variant="simple" size="md">
                                <Thead bg="gray.50">
                                    <Tr>
                                        <Th>Foto</Th>
                                        <Th>Nama & NIK</Th>
                                        <Th>Instansi</Th>
                                        <Th>Waktu Masuk</Th>
                                        <Th>Waktu Keluar</Th>
                                        <Th>Status</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {loading ? (
                                        <Tr>
                                            <Td colSpan={6} py={10}>
                                                <Center><Spinner size="xl" color="blue.500" /></Center>
                                            </Td>
                                        </Tr>
                                    ) : filteredLogs.length === 0 ? (
                                        <Tr>
                                            <Td colSpan={6} textAlign="center" py={10} color="gray.500">
                                                Belum ada data kunjungan.
                                            </Td>
                                        </Tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <Tr key={log.id} _hover={{ bg: "blue.50" }}>
                                                <Td>
                                                    <Image
                                                        src={log.photo_url ? `http://127.0.0.1:8000${log.photo_url}` : "https://via.placeholder.com/40"}
                                                        boxSize="40px"
                                                        borderRadius="full"
                                                        objectFit="cover"
                                                        border="2px solid white"
                                                        boxShadow="sm"
                                                    />
                                                </Td>
                                                <Td>
                                                    <Text fontWeight="bold" color="gray.700">{log.full_name}</Text>
                                                    <Badge fontSize="0.7em" colorScheme="gray">{log.nik}</Badge>
                                                </Td>
                                                <Td>{log.institution}</Td>
                                                <Td fontWeight="medium">{formatTime(log.check_in_time)}</Td>
                                                <Td color="gray.500">{formatTime(log.check_out_time)}</Td>
                                                <Td>
                                                    <Badge
                                                        colorScheme={log.status === "Sedang Berkunjung" ? "green" : "gray"}
                                                        variant="subtle"
                                                        px={3} py={1}
                                                        borderRadius="full"
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
                    </CardBody>
                </Card>

            </Container>
        </Box>
    );
}

export default AdminDashboard;