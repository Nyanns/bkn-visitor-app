import { VStack, Button, Box, Text } from '@chakra-ui/react';
import { FaSignInAlt, FaSignOutAlt, FaArrowLeft } from 'react-icons/fa';
import VisitorCard from '../components/VisitorCard';

function DashboardPage({
    visitorData, handleBack, handleCheckIn, handleCheckOut,
    loading, checkInStatus
}) {
    return (
        <VStack spacing={6} w="full" maxW="md">

            {/* Tombol Kembali (Kecil di atas kiri) */}
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

            {/* Tombol Aksi (Besar) */}
            <VStack spacing={3} w="full">
                <Button
                    w="full" h="14" size="lg"
                    colorScheme="green"
                    leftIcon={<FaSignInAlt />}
                    onClick={handleCheckIn}
                    isLoading={loading}
                    isDisabled={checkInStatus} // Mati kalau sudah masuk
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
                    isDisabled={!checkInStatus} // Mati kalau belum masuk
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