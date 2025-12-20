// File: frontend/src/components/VisitDetailsForm.jsx
// Form for collecting visit details during check-in: purpose, room, companion, and task letters

import { useState, useEffect } from 'react';
import {
    VStack, HStack, Box, Text, Button, FormControl, FormLabel,
    Textarea, Select, Input, Icon, Flex, Badge, IconButton,
    Progress, useToast, Spinner, Alert, AlertIcon
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaClipboardList, FaDoorOpen, FaUserTie, FaFilePdf,
    FaUpload, FaTrash, FaCheckCircle, FaTimes
} from 'react-icons/fa';
import api from '../api';

const MotionBox = motion(Box);

function VisitDetailsForm({
    onSubmit,
    onCancel,
    isLoading = false,
    initialData = null  // For editing existing visit
}) {
    const toast = useToast();

    // Form state
    const [visitPurpose, setVisitPurpose] = useState('');
    const [roomId, setRoomId] = useState('');
    const [companionId, setCompanionId] = useState('');
    const [taskLetters, setTaskLetters] = useState([]);  // Array of File objects
    const [uploadedLetters, setUploadedLetters] = useState([]);  // Already uploaded (for edit mode)

    // Dropdown options
    const [rooms, setRooms] = useState([]);
    const [companions, setCompanions] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Validation
    const [errors, setErrors] = useState({});

    // Constants
    const MAX_FILES = 5;
    const MAX_FILE_SIZE_MB = 5;

    // Load dropdown options on mount
    useEffect(() => {
        fetchOptions();
    }, []);

    // Populate form with initial data (edit mode)
    useEffect(() => {
        if (initialData) {
            setVisitPurpose(initialData.visit_purpose || '');
            setRoomId(initialData.room?.id?.toString() || '');
            setCompanionId(initialData.companion?.id?.toString() || '');
            setUploadedLetters(initialData.task_letters || []);
        }
    }, [initialData]);

    const fetchOptions = async () => {
        setLoadingOptions(true);
        try {
            const [roomsRes, companionsRes] = await Promise.all([
                api.get('/rooms'),
                api.get('/companions')
            ]);
            setRooms(roomsRes.data || []);
            setCompanions(companionsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch options:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data ruangan dan pendamping',
                status: 'error',
                duration: 3000,
            });
        } finally {
            setLoadingOptions(false);
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!visitPurpose.trim()) {
            newErrors.visitPurpose = 'Tujuan berkunjung wajib diisi';
        }
        if (!roomId) {
            newErrors.room = 'Ruangan wajib dipilih';
        }
        if (!companionId) {
            newErrors.companion = 'Pendamping wajib dipilih';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle file selection
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const totalFiles = taskLetters.length + uploadedLetters.length;

        // Check max files
        if (totalFiles + files.length > MAX_FILES) {
            toast({
                title: 'Batas File',
                description: `Maksimal ${MAX_FILES} file surat tugas`,
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        // Validate each file
        const validFiles = [];
        for (const file of files) {
            // Check file type
            if (file.type !== 'application/pdf') {
                toast({
                    title: 'File Tidak Valid',
                    description: `${file.name} bukan file PDF`,
                    status: 'error',
                    duration: 3000,
                });
                continue;
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast({
                    title: 'File Terlalu Besar',
                    description: `${file.name} melebihi ${MAX_FILE_SIZE_MB}MB`,
                    status: 'error',
                    duration: 3000,
                });
                continue;
            }

            validFiles.push(file);
        }

        setTaskLetters([...taskLetters, ...validFiles]);
        e.target.value = '';  // Reset input
    };

    // Remove pending file
    const removeFile = (index) => {
        setTaskLetters(taskLetters.filter((_, i) => i !== index));
    };

    // Handle form submission
    const handleSubmit = () => {
        if (!validateForm()) {
            toast({
                title: 'Form Belum Lengkap',
                description: 'Mohon lengkapi semua field yang wajib',
                status: 'warning',
                duration: 3000,
            });
            return;
        }

        onSubmit({
            visit_purpose: visitPurpose.trim(),
            room_id: parseInt(roomId),
            companion_id: parseInt(companionId),
            task_letters: taskLetters  // Files to upload
        });
    };

    const totalFilesCount = taskLetters.length + uploadedLetters.length;
    const remainingSlots = MAX_FILES - totalFilesCount;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            bg="white"
            borderRadius="16px"
            boxShadow="0 4px 20px rgba(0,0,0,0.08)"
            border="1px solid"
            borderColor="gray.100"
            overflow="hidden"
        >
            {/* Header */}
            <Box
                bg="linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)"
                px={6} py={4}
            >
                <HStack spacing={3}>
                    <Icon as={FaClipboardList} color="white" boxSize={5} />
                    <Text color="white" fontWeight="600" fontSize="lg">
                        Detail Kunjungan
                    </Text>
                </HStack>
                <Text color="whiteAlpha.800" fontSize="sm" mt={1}>
                    Lengkapi informasi berikut untuk check-in
                </Text>
            </Box>

            {/* Form Body */}
            <VStack spacing={5} p={6} align="stretch">
                {loadingOptions ? (
                    <Flex justify="center" py={8}>
                        <Spinner size="lg" color="blue.500" />
                    </Flex>
                ) : (
                    <>
                        {/* No rooms/companions warning */}
                        {(rooms.length === 0 || companions.length === 0) && (
                            <Alert status="warning" borderRadius="lg">
                                <AlertIcon />
                                <Text fontSize="sm">
                                    {rooms.length === 0 && companions.length === 0
                                        ? 'Ruangan dan Pendamping belum tersedia. Hubungi Admin.'
                                        : rooms.length === 0
                                            ? 'Ruangan belum tersedia. Hubungi Admin.'
                                            : 'Pendamping belum tersedia. Hubungi Admin.'
                                    }
                                </Text>
                            </Alert>
                        )}

                        {/* 1. Visit Purpose */}
                        <FormControl isRequired isInvalid={errors.visitPurpose}>
                            <FormLabel fontWeight="500" color="gray.700">
                                <HStack spacing={2}>
                                    <Icon as={FaClipboardList} color="blue.500" />
                                    <Text>Tujuan Berkunjung</Text>
                                </HStack>
                            </FormLabel>
                            <Textarea
                                placeholder="Jelaskan tujuan kunjungan Anda..."
                                value={visitPurpose}
                                onChange={(e) => setVisitPurpose(e.target.value)}
                                rows={3}
                                borderRadius="10px"
                                borderColor={errors.visitPurpose ? 'red.300' : 'gray.200'}
                                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4285f4' }}
                                resize="none"
                            />
                            {errors.visitPurpose && (
                                <Text color="red.500" fontSize="xs" mt={1}>{errors.visitPurpose}</Text>
                            )}
                        </FormControl>

                        {/* 2. Room Selection */}
                        <FormControl isRequired isInvalid={errors.room}>
                            <FormLabel fontWeight="500" color="gray.700">
                                <HStack spacing={2}>
                                    <Icon as={FaDoorOpen} color="green.500" />
                                    <Text>Ruangan yang Dikunjungi</Text>
                                </HStack>
                            </FormLabel>
                            <Select
                                placeholder="Pilih ruangan..."
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                borderRadius="10px"
                                borderColor={errors.room ? 'red.300' : 'gray.200'}
                                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4285f4' }}
                            >
                                {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.name} {room.description && `- ${room.description}`}
                                    </option>
                                ))}
                            </Select>
                            {errors.room && (
                                <Text color="red.500" fontSize="xs" mt={1}>{errors.room}</Text>
                            )}
                        </FormControl>

                        {/* 3. Companion Selection */}
                        <FormControl isRequired isInvalid={errors.companion}>
                            <FormLabel fontWeight="500" color="gray.700">
                                <HStack spacing={2}>
                                    <Icon as={FaUserTie} color="purple.500" />
                                    <Text>Pendamping</Text>
                                </HStack>
                            </FormLabel>
                            <Select
                                placeholder="Pilih pendamping..."
                                value={companionId}
                                onChange={(e) => setCompanionId(e.target.value)}
                                borderRadius="10px"
                                borderColor={errors.companion ? 'red.300' : 'gray.200'}
                                _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px #4285f4' }}
                            >
                                {companions.map((companion) => (
                                    <option key={companion.id} value={companion.id}>
                                        {companion.name} {companion.position && `- ${companion.position}`}
                                    </option>
                                ))}
                            </Select>
                            {errors.companion && (
                                <Text color="red.500" fontSize="xs" mt={1}>{errors.companion}</Text>
                            )}
                        </FormControl>

                        {/* 4. Task Letters (Surat Tugas) */}
                        <FormControl>
                            <FormLabel fontWeight="500" color="gray.700">
                                <HStack spacing={2} justify="space-between" w="full">
                                    <HStack spacing={2}>
                                        <Icon as={FaFilePdf} color="red.500" />
                                        <Text>Surat Tugas</Text>
                                        <Badge colorScheme="gray" fontSize="xs">Opsional</Badge>
                                    </HStack>
                                    <Text fontSize="xs" color="gray.500">
                                        {totalFilesCount}/{MAX_FILES} file
                                    </Text>
                                </HStack>
                            </FormLabel>

                            {/* Already uploaded files (edit mode) */}
                            {uploadedLetters.length > 0 && (
                                <VStack spacing={2} mb={3} align="stretch">
                                    {uploadedLetters.map((letter) => (
                                        <Flex
                                            key={letter.id}
                                            align="center"
                                            justify="space-between"
                                            p={3}
                                            bg="green.50"
                                            borderRadius="10px"
                                            border="1px solid"
                                            borderColor="green.200"
                                        >
                                            <HStack spacing={3}>
                                                <Icon as={FaCheckCircle} color="green.500" />
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" fontWeight="500" color="gray.700" noOfLines={1}>
                                                        {letter.original_filename}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        Sudah diupload
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                        </Flex>
                                    ))}
                                </VStack>
                            )}

                            {/* Pending files to upload */}
                            <AnimatePresence>
                                {taskLetters.map((file, index) => (
                                    <MotionBox
                                        key={index}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        mb={2}
                                    >
                                        <Flex
                                            align="center"
                                            justify="space-between"
                                            p={3}
                                            bg="blue.50"
                                            borderRadius="10px"
                                            border="1px dashed"
                                            borderColor="blue.300"
                                        >
                                            <HStack spacing={3}>
                                                <Icon as={FaFilePdf} color="red.500" />
                                                <VStack align="start" spacing={0}>
                                                    <Text fontSize="sm" fontWeight="500" color="gray.700" noOfLines={1}>
                                                        {file.name}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <IconButton
                                                icon={<FaTrash />}
                                                size="sm"
                                                variant="ghost"
                                                colorScheme="red"
                                                onClick={() => removeFile(index)}
                                                aria-label="Remove file"
                                            />
                                        </Flex>
                                    </MotionBox>
                                ))}
                            </AnimatePresence>

                            {/* Upload Button */}
                            {remainingSlots > 0 && (
                                <Box position="relative">
                                    <Input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        multiple
                                        onChange={handleFileSelect}
                                        position="absolute"
                                        top={0}
                                        left={0}
                                        right={0}
                                        bottom={0}
                                        opacity={0}
                                        cursor="pointer"
                                        zIndex={1}
                                    />
                                    <Button
                                        variant="outline"
                                        colorScheme="blue"
                                        leftIcon={<FaUpload />}
                                        w="full"
                                        borderRadius="10px"
                                        borderStyle="dashed"
                                        py={6}
                                    >
                                        Upload PDF ({remainingSlots} slot tersisa)
                                    </Button>
                                </Box>
                            )}

                            <Text fontSize="xs" color="gray.500" mt={2}>
                                Format: PDF. Maks. {MAX_FILE_SIZE_MB}MB per file
                            </Text>
                        </FormControl>
                    </>
                )}
            </VStack>

            {/* Footer Actions */}
            <Flex
                px={6} py={4}
                bg="gray.50"
                borderTop="1px solid"
                borderColor="gray.100"
                gap={3}
            >
                <Button
                    variant="ghost"
                    onClick={onCancel}
                    flex={1}
                    isDisabled={isLoading}
                >
                    Batal
                </Button>
                <Button
                    colorScheme="blue"
                    onClick={handleSubmit}
                    flex={2}
                    isLoading={isLoading}
                    loadingText="Memproses..."
                    leftIcon={<FaCheckCircle />}
                    isDisabled={loadingOptions || rooms.length === 0 || companions.length === 0}
                >
                    Check-In
                </Button>
            </Flex>
        </MotionBox>
    );
}

export default VisitDetailsForm;
