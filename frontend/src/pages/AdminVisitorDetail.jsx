// File: frontend/src/pages/AdminVisitorDetail.jsx
// FAANG Quality Redesign for Visitor Detail View - Matches Dashboard Theme
import { useState, useEffect, useRef } from 'react';
import {
    Box, Button, FormControl, FormLabel, Input, VStack, Heading,
    useToast, Spinner, Center, AlertDialog,
    AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
    AlertDialogContent, AlertDialogOverlay, Container, HStack, Text,
    Grid, GridItem, Flex, Badge, Icon, Card, CardBody, useColorModeValue,
    Fade, InputGroup, InputLeftElement, Tabs, TabList, TabPanels, Tab, TabPanel,
    Table, Thead, Tbody, Tr, Th, Td, Avatar, Skeleton
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaTrash, FaSave, FaUser, FaBuilding, FaPhone,
    FaHistory, FaEdit, FaCalendarAlt, FaClock, FaSignOutAlt,
    FaIdCard, FaFilePdf, FaPlus, FaCloudUploadAlt, FaDownload, FaCamera
} from 'react-icons/fa';
import api from '../api';
import AuthenticatedImage from '../components/AuthenticatedImage';

function AdminVisitorDetail() {
    const { nik } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Data State
    const [visitor, setVisitor] = useState(null);
    const [history, setHistory] = useState([]);
    const [documents, setDocuments] = useState([]); // Task letters
    const [activeVisitId, setActiveVisitId] = useState(null); // Current active visit ID

    // Refs for file uploads
    const photoInputRef = useRef();
    const ktpInputRef = useRef();
    const letterInputRef = useRef();

    // Form Data
    const [fullName, setFullName] = useState('');
    const [institution, setInstitution] = useState('');
    const [phone, setPhone] = useState('');

    // Delete Confirmation
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const cancelRef = useRef();

    // Theme Tokens (Matching AdminDashboard)
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const pageBg = "#f8f9fa";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Visitor Details
                const visitorRes = await api.get(`/visitors/${nik}`);
                const vData = visitorRes.data;
                setVisitor(vData);
                setFullName(vData.full_name);
                setInstitution(vData.institution);
                setPhone(vData.phone || '');

                // Fetch Visit History
                try {
                    const historyRes = await api.get(`/visitors/${nik}/history`);
                    setHistory(historyRes.data.history || []);
                } catch (err) {
                    console.error("Failed to fetch history", err);
                }

            } catch {
                toast({ title: "Gagal memuat data", status: "error" });
                navigate('/admin/dashboard'); // Redirect back if not found
            } finally {
                setLoading(false);
            }

            // Fetch Documents (Task Letters) - now returns active visit letters only
            try {
                const docsRes = await api.getTaskLetters(nik);
                setDocuments(docsRes.data.documents || []);
                setActiveVisitId(docsRes.data.visit_id); // Store active visit ID
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };
        fetchData();
    }, [nik, navigate, toast]);

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('full_name', fullName);
            formData.append('institution', institution);
            if (phone) formData.append('phone', phone);

            await api.put(`/visitors/${nik}`, formData);

            toast({ title: "Data berhasil diperbarui", status: "success", position: "top" });
            // Refresh local state
            setVisitor(prev => ({ ...prev, full_name: fullName, institution: institution, phone: phone }));
        } catch (error) {
            toast({ title: "Gagal update data", description: error.response?.data?.detail, status: "error", position: "top" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/visitors/${nik}`);
            toast({ title: "Pengunjung berhasil dihapus", status: "success", position: "top" });
            navigate('/admin/dashboard');
        } catch (error) {
            toast({ title: "Gagal menghapus data", description: error.response?.data?.detail, status: "error", position: "top" });
        }
    };

    // --- UPLOAD HANDLERS ---
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            toast({ title: "File too large (max 5MB)", status: "error" });
            return;
        }

        setSaving(true);
        try {
            await api.updateVisitorPhoto(nik, file);
            toast({ title: "Foto berhasil diperbarui", status: "success" });
            // Refresh visitor data
            const res = await api.get(`/visitors/${nik}`);
            setVisitor(res.data);
        } catch (error) {
            toast({ title: "Gagal upload foto", status: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleKtpUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSaving(true);
        try {
            await api.updateVisitorKtp(nik, file);
            toast({ title: "KTP berhasil diperbarui", status: "success" });
            // Refresh visitor data
            const res = await api.get(`/visitors/${nik}`);
            setVisitor(res.data);
        } catch (error) {
            toast({ title: "Gagal upload KTP", status: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleLetterUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!activeVisitId) {
            toast({ title: "Tidak ada kunjungan aktif", description: "Pengunjung harus check-in terlebih dahulu sebelum upload surat tugas", status: "warning" });
            return;
        }

        setSaving(true);
        try {
            await api.uploadTaskLetter(activeVisitId, file);
            toast({ title: "Surat Tugas berhasil diupload", status: "success" });

            // Refresh documents
            const docsRes = await api.getTaskLetters(nik);
            setDocuments(docsRes.data.documents || []);
        } catch (error) {
            toast({ title: "Gagal upload surat tugas", description: error.response?.data?.detail, status: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLetter = async (doc) => {
        // Use doc.visit_id for completed visits, or activeVisitId for active visits
        const visitId = doc.visit_id || activeVisitId;
        if (!visitId) {
            toast({ title: "Error", description: "No visit found for this document", status: "error" });
            return;
        }

        try {
            await api.deleteTaskLetter(visitId, doc.id);
            toast({ title: "Dokumen dihapus", status: "success" });
            // Refresh documents
            const docsRes = await api.getTaskLetters(nik);
            setDocuments(docsRes.data.documents || []);
        } catch (error) {
            toast({ title: "Gagal hapus dokumen", status: "error" });
        }
    };

    const handleForceCheckout = async (visitId) => {
        try {
            await api.put(`/admin/visits/${visitId}/checkout`);
            toast({ title: "Berhasil check-out manual", status: "success", position: "top" });

            // Refresh history
            const historyRes = await api.get(`/visitors/${nik}/history`);
            setHistory(historyRes.data.history || []);
        } catch (error) {
            toast({ title: "Gagal check-out", description: error.response?.data?.detail, status: "error", position: "top" });
        }
    };

    const handleDownloadFile = async (url, filename) => {
        try {
            // Use API client to ensure credentials/cookies are sent
            const response = await api.get(url, { responseType: 'blob' });

            // Create a blob URL and trigger download
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            // Clean up
            window.URL.revokeObjectURL(blobUrl);

            toast({ title: "Download berhasil", status: "success", duration: 2000 });
        } catch (error) {
            console.error("Download failed", error);
            const errorMsg = error.response ? "File tidak ditemukan atau akses ditolak" : "Gagal menghubungi server";
            toast({ title: "Gagal download file", description: errorMsg, status: "error" });
        }
    };

    if (loading) {
        return <Center minH="100vh" bg={pageBg}><Spinner size="xl" color="#1a73e8" thickness="4px" /></Center>;
    }

    return (
        <Fade in={true}>
            <Box bg={pageBg} minH="100vh" fontFamily="'Inter', sans-serif">
                {/* 1. Header Navigation (Identical to Dashboard for Consistency) */}
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
                            <Button
                                leftIcon={<FaArrowLeft />}
                                variant="ghost"
                                onClick={() => navigate('/admin/dashboard')}
                                color="gray.600"
                                size="sm"
                                fontWeight="600"
                                _hover={{ bg: "gray.100", color: "gray.900" }}
                            >
                                Back to Dashboard
                            </Button>
                            <Box w="1px" h="24px" bg="gray.200" display={{ base: "none", md: "block" }} />
                            <Text fontSize="sm" fontWeight="600" color="gray.500" display={{ base: "none", md: "block" }}>
                                Visitor Profile
                            </Text>
                        </HStack>
                    </Flex>
                </Box>

                {/* 2. Main Content */}
                <Container maxW="1200px" py={8}>
                    {/* Page Title */}
                    <Flex mb={8} justify="space-between" align="center">
                        <Box>
                            <Heading size="lg" color="gray.800" fontWeight="800" letterSpacing="-0.5px">
                                {visitor?.full_name}
                            </Heading>
                            <HStack mt={2} spacing={3}>
                                <Badge colorScheme="blue" variant="subtle" px={2} borderRadius="md">
                                    REGISTERED
                                </Badge>
                                <Text color="gray.500" fontSize="sm">
                                    NIK: <b style={{ fontFamily: 'monospace' }}>{visitor?.nik}</b>
                                </Text>
                            </HStack>
                        </Box>
                        {activeTab === 0 && (
                            <Button
                                leftIcon={<FaSave />}
                                bg="#1a73e8"
                                color="white"
                                _hover={{ bg: "#1557b0", boxShadow: "md" }}
                                isLoading={saving}
                                onClick={handleUpdate}
                                size="md"
                                px={6}
                                fontWeight="600"
                                boxShadow="sm"
                            >
                                Save Changes
                            </Button>
                        )}
                    </Flex>

                    <Grid templateColumns={{ base: "1fr", lg: "320px 1fr" }} gap={8}>
                        {/* 3. Left Column: Profile Card */}
                        <GridItem>
                            <Card
                                bg={cardBg}
                                borderRadius="xl"
                                boxShadow="sm"
                                border="1px solid"
                                borderColor={borderColor}
                                overflow="hidden"
                                position="sticky"
                                top="100px"
                            >
                                <CardBody textAlign="center" p={8}>
                                    <Center mb={6}>
                                        <Box
                                            w="160px"
                                            h="160px"
                                            borderRadius="full"
                                            overflow="hidden"
                                            border="4px solid white"
                                            boxShadow="lg"
                                            position="relative"
                                            bg="gray.100"
                                            cursor="pointer"
                                            onClick={() => photoInputRef.current.click()}
                                            _hover={{ opacity: 0.8 }}
                                        >
                                            {/* Hidden Input */}
                                            <input
                                                type="file"
                                                ref={photoInputRef}
                                                style={{ display: 'none' }}
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                            />

                                            {/* Overlay Icon on Hover */}
                                            <Center
                                                position="absolute" top="0" left="0" right="0" bottom="0"
                                                bg="blackAlpha.400" opacity="0"
                                                _hover={{ opacity: 1 }} transition="all 0.2s"
                                                zIndex="2"
                                            >
                                                <Icon as={FaCamera} color="white" boxSize={8} />
                                            </Center>
                                            {visitor?.photo_path ? (
                                                <AuthenticatedImage
                                                    filename={visitor.photo_path.split(/[/\\]/).pop()}
                                                    alt="Visitor Photo"
                                                    w="100%"
                                                    h="100%"
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <Center w="full" h="full" flexDirection="column">
                                                    <Icon as={FaUser} w={12} h={12} color="gray.300" />
                                                </Center>
                                            )}
                                        </Box>
                                    </Center>

                                    <Heading size="md" color="gray.800" fontWeight="700" mb={1}>
                                        {visitor?.full_name}
                                    </Heading>
                                    <Text color="gray.500" fontSize="sm" mb={6}>
                                        {visitor?.institution}
                                    </Text>

                                    <Button
                                        width="full"
                                        variant="outline"
                                        colorScheme="red"
                                        leftIcon={<FaTrash />}
                                        size="sm"
                                        onClick={() => setIsDeleteDialogOpen(true)}
                                    >
                                        Delete Visitor
                                    </Button>
                                </CardBody>
                            </Card>
                        </GridItem>

                        {/* 4. Right Column: Tabs (Info & History) */}
                        <GridItem>
                            <Tabs
                                variant="enclosed"
                                colorScheme="blue"
                                onChange={(index) => setActiveTab(index)}
                                isLazy
                            >
                                <TabList mb={4} borderBottomColor="gray.200">
                                    <Tab fontWeight="600" fontSize="sm" _selected={{ color: '#1a73e8', borderColor: 'gray.200', borderBottomColor: pageBg, bg: pageBg }}>
                                        <Icon as={FaEdit} mr={2} /> Profile Settings
                                    </Tab>
                                    <Tab fontWeight="600" fontSize="sm" _selected={{ color: '#1a73e8', borderColor: 'gray.200', borderBottomColor: pageBg, bg: pageBg }}>
                                        <Icon as={FaHistory} mr={2} /> Visit History
                                    </Tab>
                                    <Tab fontWeight="600" fontSize="sm" _selected={{ color: '#1a73e8', borderColor: 'gray.200', borderBottomColor: pageBg, bg: pageBg }}>
                                        <Icon as={FaFilePdf} mr={2} /> Documents
                                    </Tab>
                                </TabList>

                                <TabPanels>
                                    {/* Tab 1: Edit Profile */}
                                    <TabPanel p={0}>
                                        <Card
                                            bg={cardBg}
                                            borderRadius="xl"
                                            boxShadow="sm"
                                            border="1px solid"
                                            borderColor={borderColor}
                                        >
                                            <CardBody p={8}>
                                                <Heading size="sm" mb={6} color="gray.700" fontWeight="700" textTransform="uppercase" letterSpacing="0.5px">
                                                    Personal Information
                                                </Heading>
                                                <VStack spacing={6} align="stretch">
                                                    <FormControl>
                                                        <FormLabel color="gray.600" fontSize="xs" fontWeight="700" textTransform="uppercase">Full Name</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none" children={<FaUser color="gray.400" />} />
                                                            <Input
                                                                value={fullName}
                                                                onChange={(e) => setFullName(e.target.value)}
                                                                focusBorderColor="#1a73e8"
                                                            />
                                                        </InputGroup>
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color="gray.600" fontSize="xs" fontWeight="700" textTransform="uppercase">Institution / Agency</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none" children={<FaBuilding color="gray.400" />} />
                                                            <Input
                                                                value={institution}
                                                                onChange={(e) => setInstitution(e.target.value)}
                                                                focusBorderColor="#1a73e8"
                                                            />
                                                        </InputGroup>
                                                    </FormControl>

                                                    <FormControl>
                                                        <FormLabel color="gray.600" fontSize="xs" fontWeight="700" textTransform="uppercase">Phone Number</FormLabel>
                                                        <InputGroup>
                                                            <InputLeftElement pointerEvents="none" children={<FaPhone color="gray.400" />} />
                                                            <Input
                                                                value={phone}
                                                                onChange={(e) => setPhone(e.target.value)}
                                                                placeholder="Optional"
                                                                focusBorderColor="#1a73e8"
                                                            />
                                                        </InputGroup>
                                                    </FormControl>
                                                </VStack>
                                            </CardBody>
                                        </Card>
                                    </TabPanel>

                                    {/* Tab 2: Visit History */}
                                    <TabPanel p={0}>
                                        <Card
                                            bg={cardBg}
                                            borderRadius="xl"
                                            boxShadow="sm"
                                            border="1px solid"
                                            borderColor={borderColor}
                                            overflow="hidden"
                                        >
                                            <Box overflowX="auto">
                                                <Table variant="simple" size="sm">
                                                    <Thead bg="gray.50">
                                                        <Tr>
                                                            <Th py={4}>Date</Th>
                                                            <Th>Check In</Th>
                                                            <Th>Check Out</Th>
                                                            <Th>Status</Th>
                                                            <Th>Action</Th>
                                                        </Tr>
                                                    </Thead>
                                                    <Tbody>
                                                        {history.length === 0 ? (
                                                            <Tr>
                                                                <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                                                                    No visit history found.
                                                                </Td>
                                                            </Tr>
                                                        ) : (
                                                            history.map((h, i) => (
                                                                <Tr key={i} _hover={{ bg: "gray.50" }}>
                                                                    <Td fontWeight="600" color="gray.700">
                                                                        <HStack><Icon as={FaCalendarAlt} color="gray.400" /> <Text>{h.date}</Text></HStack>
                                                                    </Td>
                                                                    <Td color="green.600" fontWeight="500">
                                                                        {h.check_in}
                                                                    </Td>
                                                                    <Td color="red.600" fontWeight="500">
                                                                        {h.check_out || "-"}
                                                                    </Td>
                                                                    <Td>
                                                                        <Badge
                                                                            colorScheme={h.check_out ? "gray" : "green"}
                                                                            variant="solid"
                                                                            fontSize="10px"
                                                                            px={2}
                                                                            borderRadius="full"
                                                                        >
                                                                            {h.check_out ? "COMPLETED" : "ACTIVE"}
                                                                        </Badge>
                                                                    </Td>
                                                                    <Td>
                                                                        {!h.check_out && (
                                                                            <Button
                                                                                size="xs"
                                                                                colorScheme="orange"
                                                                                leftIcon={<FaSignOutAlt />}
                                                                                onClick={() => handleForceCheckout(h.id)}
                                                                                title="Manual Checkout if visitor forgot"
                                                                            >
                                                                                Manual Checkout
                                                                            </Button>
                                                                        )}
                                                                    </Td>
                                                                </Tr>
                                                            ))
                                                        )}
                                                    </Tbody>
                                                </Table>
                                            </Box>
                                        </Card>
                                    </TabPanel>

                                    {/* Tab 3: Documents (KTP & Task Letters) */}
                                    <TabPanel p={0}>
                                        <VStack spacing={6} align="stretch">
                                            {/* KTP Section */}
                                            <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
                                                <CardBody p={6}>
                                                    <HStack justify="space-between" mb={4}>
                                                        <HStack>
                                                            <Icon as={FaIdCard} color="blue.500" boxSize={5} />
                                                            <Heading size="sm" color="gray.700">Kartu Identitas (KTP)</Heading>
                                                        </HStack>
                                                        <Button
                                                            size="sm" leftIcon={<FaCloudUploadAlt />}
                                                            onClick={() => ktpInputRef.current.click()}
                                                            isLoading={saving}
                                                        >
                                                            Upload KTP
                                                        </Button>
                                                        <input type="file" ref={ktpInputRef} style={{ display: 'none' }} accept="image/*,.pdf" onChange={handleKtpUpload} />
                                                    </HStack>

                                                    {visitor?.ktp_path ? (
                                                        <Box
                                                            borderRadius="lg" overflow="hidden" border="1px solid" borderColor="gray.200"
                                                            maxH="300px" bg="gray.50" display="flex" justifyContent="center" alignItems="center"
                                                        >
                                                            {visitor.ktp_path.toLowerCase().endsWith('.pdf') ? (
                                                                <Button
                                                                    colorScheme="red" variant="outline" leftIcon={<FaFilePdf />} mt={4} mb={4}
                                                                    onClick={() => handleDownloadFile(`/uploads/${visitor.ktp_path.split(/[/\\]/).pop()}`, `KTP-${visitor.nik}.pdf`)}
                                                                >
                                                                    View KTP (PDF)
                                                                </Button>
                                                            ) : (
                                                                <AuthenticatedImage
                                                                    filename={visitor.ktp_path.split(/[/\\]/).pop()}
                                                                    maxH="300px" objectFit="contain"
                                                                />
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Center p={8} border="2px dashed" borderColor="gray.200" borderRadius="lg" bg="gray.50">
                                                            <Text color="gray.400">Belum ada KTP diupload</Text>
                                                        </Center>
                                                    )}
                                                </CardBody>
                                            </Card>

                                            {/* Task Letters Section */}
                                            <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
                                                <CardBody p={6}>
                                                    <HStack justify="space-between" mb={4}>
                                                        <HStack>
                                                            <Icon as={FaFilePdf} color="red.500" boxSize={5} />
                                                            <Heading size="sm" color="gray.700">Surat Tugas</Heading>
                                                        </HStack>
                                                        <Button
                                                            size="sm" leftIcon={<FaPlus />} colorScheme="blue" variant="outline"
                                                            onClick={() => letterInputRef.current.click()}
                                                            isLoading={saving}
                                                        >
                                                            Tambah Surat
                                                        </Button>
                                                        <input type="file" ref={letterInputRef} style={{ display: 'none' }} accept=".pdf" onChange={handleLetterUpload} />
                                                    </HStack>

                                                    {documents.length === 0 ? (
                                                        <Center p={8} border="2px dashed" borderColor="gray.200" borderRadius="lg" bg="gray.50">
                                                            <Text color="gray.400">Tidak ada surat tugas</Text>
                                                        </Center>
                                                    ) : (
                                                        <VStack spacing={3} align="stretch">
                                                            {documents.map((doc, idx) => (
                                                                <Flex
                                                                    key={idx} p={3} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200"
                                                                    justify="space-between" align="center"
                                                                >
                                                                    <HStack spacing={3}>
                                                                        <Icon as={FaFilePdf} color="red.500" />
                                                                        <Box>
                                                                            <HStack spacing={2}>
                                                                                <Text fontSize="sm" fontWeight="600">{doc.filename}</Text>
                                                                                {doc.visit_status && doc.visit_status !== 'legacy' && (
                                                                                    <Badge
                                                                                        colorScheme={doc.visit_status === 'active' ? 'green' : 'gray'}
                                                                                        fontSize="9px"
                                                                                        variant="solid"
                                                                                        px={1.5}
                                                                                        borderRadius="full"
                                                                                    >
                                                                                        {doc.visit_status === 'active' ? 'ACTIVE' : 'COMPLETED'}
                                                                                    </Badge>
                                                                                )}
                                                                                {doc.type === 'legacy' && (
                                                                                    <Badge colorScheme="purple" fontSize="9px" variant="outline" px={1.5} borderRadius="full">
                                                                                        LEGACY
                                                                                    </Badge>
                                                                                )}
                                                                            </HStack>
                                                                            <Text fontSize="xs" color="gray.500">
                                                                                {new Date(doc.uploaded_at).toLocaleDateString()}
                                                                                {doc.type === 'additional' && doc.visit_date && ` • Visit: ${doc.visit_date}`}
                                                                            </Text>
                                                                        </Box>
                                                                    </HStack>
                                                                    <HStack>
                                                                        <Button
                                                                            size="xs" colorScheme="blue" variant="ghost" leftIcon={<FaDownload />}
                                                                            onClick={() => handleDownloadFile(`/uploads/${doc.stored_filename}`, doc.filename)}
                                                                        >
                                                                            Download
                                                                        </Button>
                                                                        <Button
                                                                            size="xs" colorScheme="red" variant="ghost" leftIcon={<FaTrash />}
                                                                            onClick={() => handleDeleteLetter(doc)}
                                                                        >
                                                                            Hapus
                                                                        </Button>
                                                                    </HStack>
                                                                </Flex>
                                                            ))}
                                                        </VStack>
                                                    )}
                                                </CardBody>
                                            </Card>
                                        </VStack>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </GridItem>
                    </Grid>
                </Container>

                {/* Delete Dialog */}
                <AlertDialog
                    isOpen={isDeleteDialogOpen}
                    leastDestructiveRef={cancelRef}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    isCentered
                >
                    <AlertDialogOverlay bg="blackAlpha.600" backdropFilter="blur(5px)">
                        <AlertDialogContent borderRadius="xl" boxShadow="2xl">
                            <AlertDialogHeader fontSize="lg" fontWeight="bold">
                                Delete Visitor?
                            </AlertDialogHeader>
                            <AlertDialogBody>
                                Are you sure? This will remove <b>{fullName}</b> and all their history.
                            </AlertDialogBody>
                            <AlertDialogFooter>
                                <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                    Delete
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            </Box>
        </Fade>
    );
}

export default AdminVisitorDetail;
