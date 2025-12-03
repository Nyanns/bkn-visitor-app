import { VStack, Button, Box, Text, Spinner, Center } from '@chakra-ui/react';
import { FaSignInAlt, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import VisitorCard from '../components/VisitorCard';

function DashboardPage({
    visitorData, handleBack, handleCheckIn, handleCheckOut,
    loading, checkInStatus
}) {
    // --- PERBAIKAN: Safety Check ---
    // Jika data visitor belum ada, tampilkan loading atau null agar tidak crash
    if (!visitorData) {
        return (
            <Center h="100vh">
                <VStack>
                    <Spinner size="xl" color="blue.500" />
                    <Text>Memuat data...</Text>
                    {/* Tombol darurat untuk kembali jika macet */}
                    <Button variant="link" onClick={handleBack} mt={4}>Kembali</Button>
                </VStack>
            </Center>
        );
    }

    return (
        <VStack spacing={6} w="full" maxW="md">

            {/* Tombol Kembali */}
            <Box w="full">
                <Button
                    variant="ghost"
                    leftIcon={<FaArrowLeft />}
                    onClick={handleBack}
                    color="gray.500"
                    size="sm"
                >
                    Kembali ke Login
                </Button>
            </Box>

            {/* Kartu Profil */}
            <VisitorCard data={visitorData} />

            {/* Tombol Aksi */}
            <VStack spacing={3} w="full">
                <Button
                    w="full" h="14" size="lg"
                    colorScheme="green"
                    leftIcon={<FaSignInAlt />}
                    onClick={handleCheckIn}
                    isLoading={loading}
                    isDisabled={checkInStatus}
                    boxShadow={!checkInStatus ? "lg" : "none"}
                    _hover={!checkInStatus ? { transform: 'translateY(-2px)' } : {}}
                >
                    {checkInStatus ? "Anda Sudah Masuk" : "Check-In (Masuk)"}
                </Button>

                <Button
                    w="full" h="14" size="lg"
                    colorScheme="orange"
                    variant={checkInStatus ? "solid" : "outline"}
                    leftIcon={<FaSignOutAlt />}
                    onClick={handleCheckOut}
                    isLoading={loading}
                    isDisabled={!checkInStatus}
                    boxShadow={checkInStatus ? "lg" : "none"}
                >
                    Check-Out (Keluar)
                </Button>
            </VStack>

            <Text fontSize="xs" color="gray.400" textAlign="center">
                *Pastikan Check-Out sebelum meninggalkan area BKN.
            </Text>
        </VStack>
    );
}

export default DashboardPage;