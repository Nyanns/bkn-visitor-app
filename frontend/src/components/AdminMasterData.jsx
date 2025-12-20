// File: frontend/src/components/AdminMasterData.jsx
// Admin component for managing Rooms and Companions (Master Data)

import { useState, useEffect } from 'react';
import {
    Box, VStack, HStack, Text, Button, Input, FormControl, FormLabel,
    Table, Thead, Tbody, Tr, Th, Td, IconButton, Badge, Tabs, TabList,
    TabPanels, Tab, TabPanel, useToast, Spinner, AlertDialog,
    AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
    AlertDialogOverlay, useDisclosure, Modal, ModalOverlay, ModalContent,
    ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Switch, Icon
} from '@chakra-ui/react';
import { FaDoorOpen, FaUserTie, FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaFileExcel } from 'react-icons/fa';
import { useRef } from 'react';
import api from '../api';

function AdminMasterData({ token }) {
    const toast = useToast();
    const cancelRef = useRef();

    // State for Rooms
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);

    // State for Companions
    const [companions, setCompanions] = useState([]);
    const [loadingCompanions, setLoadingCompanions] = useState(false);

    // Modal states
    const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
    const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Form states
    const [roomForm, setRoomForm] = useState({ name: '', description: '' });
    const [companionForm, setCompanionForm] = useState({ name: '', position: '' });

    // Delete confirmation
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const [deleteTarget, setDeleteTarget] = useState({ type: '', id: null, name: '' });

    // Saving state
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Axios config with auth
    const authConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // Load data on mount
    useEffect(() => {
        fetchRooms();
        fetchCompanions();
    }, []);

    // === EXPORT ===
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await api.get('/admin/export-master-data', {
                ...authConfig,
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Try to extract filename from content-disposition
            let filename = `Master_Data_BKN_${new Date().toISOString().split('T')[0]}.xlsx`;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (filenameMatch && filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            toast({
                title: 'Export Berhasil',
                description: 'File Excel sedang diunduh',
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            console.error('Export failed:', error);
            toast({
                title: 'Gagal Export',
                description: 'Terjadi kesalahan saat mengunduh data',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setIsExporting(false);
        }
    };

    // === ROOMS CRUD ===
    const fetchRooms = async () => {
        setLoadingRooms(true);
        try {
            const response = await api.get('/admin/rooms', authConfig);
            setRooms(response.data || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data ruangan',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoadingRooms(false);
        }
    };

    const openRoomModal = (room = null) => {
        if (room) {
            setEditingItem(room);
            setRoomForm({ name: room.name, description: room.description || '' });
        } else {
            setEditingItem(null);
            setRoomForm({ name: '', description: '' });
        }
        setIsRoomModalOpen(true);
    };

    const saveRoom = async () => {
        if (!roomForm.name.trim()) {
            toast({ title: 'Nama ruangan wajib diisi', status: 'warning', duration: 2000 });
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', roomForm.name.trim());
            formData.append('description', roomForm.description.trim());

            if (editingItem) {
                await api.put(`/admin/rooms/${editingItem.id}`, formData, authConfig);
                toast({ title: 'Ruangan berhasil diperbarui', status: 'success', duration: 2000 });
            } else {
                await api.post('/admin/rooms', formData, authConfig);
                toast({ title: 'Ruangan berhasil ditambahkan', status: 'success', duration: 2000 });
            }

            setIsRoomModalOpen(false);
            fetchRooms();
        } catch (error) {
            toast({
                title: 'Gagal menyimpan',
                description: error.response?.data?.detail || 'Terjadi kesalahan',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleRoomStatus = async (room) => {
        try {
            const formData = new FormData();
            formData.append('is_active', !room.is_active);
            await api.put(`/admin/rooms/${room.id}`, formData, authConfig);
            fetchRooms();
        } catch (error) {
            toast({ title: 'Gagal mengubah status', status: 'error', duration: 2000 });
        }
    };

    // === COMPANIONS CRUD ===
    const fetchCompanions = async () => {
        setLoadingCompanions(true);
        try {
            const response = await api.get('/admin/companions', authConfig);
            setCompanions(response.data || []);
        } catch (error) {
            console.error('Failed to fetch companions:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data pendamping',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoadingCompanions(false);
        }
    };

    const openCompanionModal = (companion = null) => {
        if (companion) {
            setEditingItem(companion);
            setCompanionForm({ name: companion.name, position: companion.position || '' });
        } else {
            setEditingItem(null);
            setCompanionForm({ name: '', position: '' });
        }
        setIsCompanionModalOpen(true);
    };

    const saveCompanion = async () => {
        if (!companionForm.name.trim()) {
            toast({ title: 'Nama pendamping wajib diisi', status: 'warning', duration: 2000 });
            return;
        }

        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', companionForm.name.trim());
            formData.append('position', companionForm.position.trim());

            if (editingItem) {
                await api.put(`/admin/companions/${editingItem.id}`, formData, authConfig);
                toast({ title: 'Pendamping berhasil diperbarui', status: 'success', duration: 2000 });
            } else {
                await api.post('/admin/companions', formData, authConfig);
                toast({ title: 'Pendamping berhasil ditambahkan', status: 'success', duration: 2000 });
            }

            setIsCompanionModalOpen(false);
            fetchCompanions();
        } catch (error) {
            toast({
                title: 'Gagal menyimpan',
                description: error.response?.data?.detail || 'Terjadi kesalahan',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleCompanionStatus = async (companion) => {
        try {
            const formData = new FormData();
            formData.append('is_active', !companion.is_active);
            await api.put(`/admin/companions/${companion.id}`, formData, authConfig);
            fetchCompanions();
        } catch (error) {
            toast({ title: 'Gagal mengubah status', status: 'error', duration: 2000 });
        }
    };

    // === DELETE ===
    const confirmDelete = (type, id, name) => {
        setDeleteTarget({ type, id, name });
        onDeleteOpen();
    };

    const handleDelete = async () => {
        try {
            if (deleteTarget.type === 'room') {
                await api.delete(`/admin/rooms/${deleteTarget.id}`, authConfig);
                fetchRooms();
            } else {
                await api.delete(`/admin/companions/${deleteTarget.id}`, authConfig);
                fetchCompanions();
            }
            toast({ title: 'Berhasil dinonaktifkan', status: 'success', duration: 2000 });
        } catch (error) {
            toast({ title: 'Gagal menghapus', status: 'error', duration: 2000 });
        } finally {
            onDeleteClose();
        }
    };

    return (
        <Box>



            <Tabs variant="enclosed" colorScheme="blue">
                <TabList>
                    <Tab>
                        <HStack spacing={2}>
                            <Icon as={FaDoorOpen} />
                            <Text>Ruangan</Text>
                            <Badge colorScheme="blue" borderRadius="full">{rooms.length}</Badge>
                        </HStack>
                    </Tab>
                    <Tab>
                        <HStack spacing={2}>
                            <Icon as={FaUserTie} />
                            <Text>Pendamping</Text>
                            <Badge colorScheme="purple" borderRadius="full">{companions.length}</Badge>
                        </HStack>
                    </Tab>
                </TabList>

                <TabPanels>
                    {/* ROOMS TAB */}
                    <TabPanel px={0}>
                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                                <Text fontWeight="600" color="gray.700">Daftar Ruangan</Text>
                                <Button
                                    leftIcon={<FaPlus />}
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => openRoomModal()}
                                >
                                    Tambah Ruangan
                                </Button>
                            </HStack>

                            {loadingRooms ? (
                                <Spinner />
                            ) : rooms.length === 0 ? (
                                <Box textAlign="center" py={8} color="gray.500">
                                    <Icon as={FaDoorOpen} boxSize={10} mb={2} />
                                    <Text>Belum ada ruangan. Tambahkan ruangan baru.</Text>
                                </Box>
                            ) : (
                                <Box overflowX="auto">
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th>Nama</Th>
                                                <Th>Deskripsi</Th>
                                                <Th textAlign="center">Status</Th>
                                                <Th textAlign="center">Aksi</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {rooms.map((room) => (
                                                <Tr key={room.id} opacity={room.is_active ? 1 : 0.5}>
                                                    <Td fontWeight="500">{room.name}</Td>
                                                    <Td color="gray.600">{room.description || '-'}</Td>
                                                    <Td textAlign="center">
                                                        <Switch
                                                            isChecked={room.is_active}
                                                            onChange={() => toggleRoomStatus(room)}
                                                            colorScheme="green"
                                                        />
                                                    </Td>
                                                    <Td textAlign="center">
                                                        <HStack justify="center" spacing={1}>
                                                            <IconButton
                                                                icon={<FaEdit />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="blue"
                                                                onClick={() => openRoomModal(room)}
                                                                aria-label="Edit"
                                                            />
                                                            <IconButton
                                                                icon={<FaTrash />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="red"
                                                                onClick={() => confirmDelete('room', room.id, room.name)}
                                                                aria-label="Delete"
                                                            />
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </VStack>
                    </TabPanel>

                    {/* COMPANIONS TAB */}
                    <TabPanel px={0}>
                        <VStack align="stretch" spacing={4}>
                            <HStack justify="space-between">
                                <Text fontWeight="600" color="gray.700">Daftar Pendamping</Text>
                                <Button
                                    leftIcon={<FaPlus />}
                                    colorScheme="purple"
                                    size="sm"
                                    onClick={() => openCompanionModal()}
                                >
                                    Tambah Pendamping
                                </Button>
                            </HStack>

                            {loadingCompanions ? (
                                <Spinner />
                            ) : companions.length === 0 ? (
                                <Box textAlign="center" py={8} color="gray.500">
                                    <Icon as={FaUserTie} boxSize={10} mb={2} />
                                    <Text>Belum ada pendamping. Tambahkan pendamping baru.</Text>
                                </Box>
                            ) : (
                                <Box overflowX="auto">
                                    <Table size="sm" variant="simple">
                                        <Thead bg="gray.50">
                                            <Tr>
                                                <Th>Nama</Th>
                                                <Th>Jabatan</Th>
                                                <Th textAlign="center">Status</Th>
                                                <Th textAlign="center">Aksi</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {companions.map((companion) => (
                                                <Tr key={companion.id} opacity={companion.is_active ? 1 : 0.5}>
                                                    <Td fontWeight="500">{companion.name}</Td>
                                                    <Td color="gray.600">{companion.position || '-'}</Td>
                                                    <Td textAlign="center">
                                                        <Switch
                                                            isChecked={companion.is_active}
                                                            onChange={() => toggleCompanionStatus(companion)}
                                                            colorScheme="green"
                                                        />
                                                    </Td>
                                                    <Td textAlign="center">
                                                        <HStack justify="center" spacing={1}>
                                                            <IconButton
                                                                icon={<FaEdit />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="blue"
                                                                onClick={() => openCompanionModal(companion)}
                                                                aria-label="Edit"
                                                            />
                                                            <IconButton
                                                                icon={<FaTrash />}
                                                                size="sm"
                                                                variant="ghost"
                                                                colorScheme="red"
                                                                onClick={() => confirmDelete('companion', companion.id, companion.name)}
                                                                aria-label="Delete"
                                                            />
                                                        </HStack>
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </Box>
                            )}
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            {/* Room Modal */}
            <Modal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editingItem ? 'Edit Ruangan' : 'Tambah Ruangan'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nama Ruangan</FormLabel>
                                <Input
                                    placeholder="Contoh: Ruang Rapat Lt. 2"
                                    value={roomForm.name}
                                    onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Deskripsi</FormLabel>
                                <Input
                                    placeholder="Keterangan tambahan (opsional)"
                                    value={roomForm.description}
                                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setIsRoomModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            colorScheme="blue"
                            onClick={saveRoom}
                            isLoading={isSaving}
                            leftIcon={<FaSave />}
                        >
                            Simpan
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Companion Modal */}
            <Modal isOpen={isCompanionModalOpen} onClose={() => setIsCompanionModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{editingItem ? 'Edit Pendamping' : 'Tambah Pendamping'}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel>Nama Pendamping</FormLabel>
                                <Input
                                    placeholder="Nama lengkap"
                                    value={companionForm.name}
                                    onChange={(e) => setCompanionForm({ ...companionForm, name: e.target.value })}
                                />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Jabatan</FormLabel>
                                <Input
                                    placeholder="Contoh: Staff IT"
                                    value={companionForm.position}
                                    onChange={(e) => setCompanionForm({ ...companionForm, position: e.target.value })}
                                />
                            </FormControl>
                        </VStack>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setIsCompanionModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            colorScheme="purple"
                            onClick={saveCompanion}
                            isLoading={isSaving}
                            leftIcon={<FaSave />}
                        >
                            Simpan
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete Confirmation */}
            <AlertDialog
                isOpen={isDeleteOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Nonaktifkan {deleteTarget.type === 'room' ? 'Ruangan' : 'Pendamping'}
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Apakah Anda yakin ingin menonaktifkan "{deleteTarget.name}"?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Batal
                            </Button>
                            <Button colorScheme="red" onClick={handleDelete} ml={3}>
                                Nonaktifkan
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
}

export default AdminMasterData;
