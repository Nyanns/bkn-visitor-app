// File: frontend/src/pages/DashboardPage.jsx
// Google Material Design Style - Visitor Dashboard
import { VStack, Button, Box, Text, Spinner, Flex, Heading, Avatar, Badge, HStack, Container } from '@chakra-ui/react';
import { FaSignInAlt, FaSignOutAlt, FaArrowLeft, FaCheckCircle, FaClock, FaBuilding } from 'react-icons/fa';

function DashboardPage({
    visitorData, handleBack, handleCheckIn, handleCheckOut,
    loading, checkInStatus
}) {
    if (!visitorData) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="#f8f9fa">
                <VStack spacing={4}>
                    <Spinner size="xl" color="#1a73e8" thickness="4px" />
                    <Text color="#5f6368" fontFamily="'Google Sans', sans-serif">Memuat data...</Text>
                </VStack>
            </Flex>
        );
    }

    return (
        <Box bg="#f8f9fa" minH="100vh">
            {/* Top Bar */}
            <Box bg="white" py={3} px={6} borderBottom="1px solid #dadce0" position="sticky" top="0" zIndex="10">
                <Flex maxW="600px" mx="auto" align="center" justify="space-between">
                    <Button
                        variant="ghost"
                        leftIcon={<FaArrowLeft />}
                        onClick={handleBack}
                        color="#5f6368"
                        size="sm"
                        _hover={{ bg: "#f1f3f4", color: "#202124" }}
                        borderRadius="full"
                        px={4}
                    >
                        Kembali
                    </Button>
                    <HStack spacing={2}>
                        <FaBuilding color="#1a73e8" />
                        <Text fontSize="sm" fontWeight="500" color="#5f6368">Visitor System</Text>
                    </HStack>
                </Flex>
            </Box>

            <Container maxW="600px" py={8}>
                <VStack spacing={6}>

                    {/* Header Text */}
                    <VStack spacing={1} textAlign="center">
                        <Heading
                            size="lg"
                            color="#202124"
                            fontFamily="'Google Sans', 'Inter', sans-serif"
                            fontWeight="400"
                        >
                            Selamat Datang
                        </Heading>
                        <Text color="#5f6368" fontSize="md">
                            Silakan Check-In atau Check-Out
                        </Text>
                    </VStack>

                    {/* Main Card */}
                    <Box
                        bg="white"
                        borderRadius="12px"
                        boxShadow="0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)"
                        p={0}
                        w="full"
                        overflow="hidden"
                    >
                        {/* Profile Section */}
                        <VStack spacing={4} p={8} bg="white">
                            <Box position="relative">
                                <Avatar
                                    size="2xl"
                                    name={visitorData.full_name}
                                    src={visitorData.photo_path ? `http://127.0.0.1:8000/${visitorData.photo_path}` : undefined}
                                    bg="#1a73e8"
                                    color="white"
                                    border="4px solid white"
                                    boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                                />
                                <Box
                                    position="absolute"
                                    bottom="2px"
                                    right="2px"
                                    bg={checkInStatus ? "#34a853" : "#fbbc04"}
                                    border="3px solid white"
                                    borderRadius="full"
                                    w="24px"
                                    h="24px"
                                />
                            </Box>

                            <VStack spacing={1}>
                                <Heading size="md" color="#202124" fontWeight="500" fontFamily="'Google Sans', sans-serif">
                                    {visitorData.full_name}
                                </Heading>
                                <Text color="#5f6368" fontSize="sm">
                                    {visitorData.institution}
                                </Text>
                                <Badge
                                    mt={2}
                                    bg={checkInStatus ? "#e6f4ea" : "#fef7e0"}
                                    color={checkInStatus ? "#137333" : "#b06000"}
                                    borderRadius="16px"
                                    px={3}
                                    py={1}
                                    fontSize="xs"
                                    fontWeight="500"
                                    textTransform="none"
                                >
                                    <HStack spacing={1}>
                                        {checkInStatus ? <FaCheckCircle size="12px" /> : <FaClock size="12px" />}
                                        <Text>{checkInStatus ? "Status: Checked-In" : "Status: Belum Check-In"}</Text>
                                    </HStack>
                                </Badge>
                            </VStack>
                        </VStack>

                        {/* Divider */}
                        <Box h="1px" bg="#dadce0" w="full" />

                        {/* Actions Section */}
                        <VStack spacing={4} p={8} bg="#f8f9fa">
                            <Button
                                w="full"
                                h="48px"
                                bg="#1a73e8"
                                color="white"
                                borderRadius="8px"
                                fontSize="15px"
                                fontWeight="500"
                                leftIcon={<FaSignInAlt />}
                                onClick={handleCheckIn}
                                isLoading={loading}
                                isDisabled={checkInStatus}
                                _hover={{ bg: "#1557b0", boxShadow: "0 1px 2px rgba(60,64,67,0.3)" }}
                                _active={{ bg: "#174ea6" }}
                                _disabled={{ bg: "#e8eaed", color: "#9aa0a6", cursor: "not-allowed" }}
                            >
                                {checkInStatus ? "Anda Sudah Masuk" : "Check-In (Masuk)"}
                            </Button>

                            <Button
                                w="full"
                                h="48px"
                                variant="outline"
                                borderColor="#dadce0"
                                bg="white"
                                color="#d93025"
                                borderRadius="8px"
                                fontSize="15px"
                                fontWeight="500"
                                leftIcon={<FaSignOutAlt />}
                                onClick={handleCheckOut}
                                isLoading={loading}
                                isDisabled={!checkInStatus}
                                _hover={{ bg: "#fce8e6", borderColor: "#d93025" }}
                                _active={{ bg: "#fad2cf" }}
                                _disabled={{ bg: "#f1f3f4", color: "#9aa0a6", borderColor: "transparent", cursor: "not-allowed" }}
                            >
                                Check-Out (Keluar)
                            </Button>
                        </VStack>
                    </Box>

                    {/* Footer Note */}
                    <Text fontSize="xs" color="#5f6368" textAlign="center" maxW="300px">
                        *Mohon lakukan Check-Out sebelum meninggalkan area gedung BKN.
                    </Text>

                </VStack>
            </Container>
        </Box>
    );
}

export default DashboardPage;