// File: frontend/src/pages/DashboardPage.jsx
// Google Material Design Style - Visitor Dashboard
import { VStack, Button, Box, Text, Spinner, Center, Flex, Heading, Avatar, Badge, HStack } from '@chakra-ui/react';
import { FaSignInAlt, FaSignOutAlt, FaArrowLeft, FaCheckCircle, FaClock } from 'react-icons/fa';

function DashboardPage({
    visitorData, handleBack, handleCheckIn, handleCheckOut,
    loading, checkInStatus
}) {
    if (!visitorData) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="#f8f9fa">
                <VStack spacing={4}>
                    <Spinner size="xl" color="#1a73e8" thickness="4px" />
                    <Text color="#5f6368">Memuat data...</Text>
                    <Button
                        variant="link"
                        color="#1a73e8"
                        onClick={handleBack}
                    >
                        Kembali
                    </Button>
                </VStack>
            </Flex>
        );
    }

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            p={4}
        >
            <Box
                bg="white"
                borderRadius="24px"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                p={8}
                w="420px"
                maxW="95vw"
            >
                <VStack spacing={6}>
                    {/* Back Button */}
                    <Box w="full">
                        <Button
                            variant="ghost"
                            leftIcon={<FaArrowLeft />}
                            onClick={handleBack}
                            color="#5f6368"
                            size="sm"
                            _hover={{ bg: "#f1f3f4" }}
                        >
                            Kembali
                        </Button>
                    </Box>

                    {/* Profile Card */}
                    <VStack spacing={4} w="full" p={6} bg="#f8f9fa" borderRadius="16px">
                        <Avatar
                            size="xl"
                            name={visitorData.full_name}
                            src={visitorData.photo_path ? `http://127.0.0.1:8000/${visitorData.photo_path}` : undefined}
                            bg="#1a73e8"
                            color="white"
                        />
                        <VStack spacing={1}>
                            <Heading size="md" color="#202124" fontWeight="500">
                                {visitorData.full_name}
                            </Heading>
                            <Text color="#5f6368" fontSize="sm">
                                {visitorData.institution}
                            </Text>
                            <Badge
                                colorScheme={checkInStatus ? "green" : "gray"}
                                borderRadius="full"
                                px={3}
                                py={1}
                                fontSize="xs"
                            >
                                <HStack spacing={1}>
                                    {checkInStatus ? <FaCheckCircle /> : <FaClock />}
                                    <Text>{checkInStatus ? "Sudah Check-in" : "Belum Check-in"}</Text>
                                </HStack>
                            </Badge>
                        </VStack>
                    </VStack>

                    {/* Action Buttons */}
                    <VStack spacing={3} w="full">
                        <Button
                            w="full"
                            h="56px"
                            bg={checkInStatus ? "#e8f5e9" : "#34a853"}
                            color={checkInStatus ? "#34a853" : "white"}
                            borderRadius="12px"
                            fontSize="16px"
                            fontWeight="600"
                            leftIcon={<FaSignInAlt />}
                            onClick={handleCheckIn}
                            isLoading={loading}
                            isDisabled={checkInStatus}
                            _hover={!checkInStatus ? {
                                bg: "#2d9649",
                                transform: "translateY(-2px)",
                                boxShadow: "0 10px 20px rgba(52,168,83,0.3)"
                            } : {}}
                            transition="all 0.2s"
                        >
                            {checkInStatus ? "Anda Sudah Masuk ✓" : "Check-In (Masuk)"}
                        </Button>

                        <Button
                            w="full"
                            h="56px"
                            bg={checkInStatus ? "#ea4335" : "#fff"}
                            color={checkInStatus ? "white" : "#ea4335"}
                            borderRadius="12px"
                            fontSize="16px"
                            fontWeight="600"
                            border={!checkInStatus ? "2px solid #ea4335" : "none"}
                            leftIcon={<FaSignOutAlt />}
                            onClick={handleCheckOut}
                            isLoading={loading}
                            isDisabled={!checkInStatus}
                            _hover={checkInStatus ? {
                                bg: "#d33426",
                                transform: "translateY(-2px)",
                                boxShadow: "0 10px 20px rgba(234,67,53,0.3)"
                            } : {}}
                            transition="all 0.2s"
                        >
                            Check-Out (Keluar)
                        </Button>
                    </VStack>

                    {/* Footer Note */}
                    <Text fontSize="11px" color="#9aa0a6" textAlign="center">
                        *Pastikan Check-Out sebelum meninggalkan area BKN
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
}

export default DashboardPage;