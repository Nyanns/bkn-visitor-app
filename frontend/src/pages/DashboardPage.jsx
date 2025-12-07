// File: frontend/src/pages/DashboardPage.jsx
// Google Material Design Style - Visitor Dashboard (Clean & Optimized)
import { useState, useEffect } from 'react';
import {
    VStack, Button, Box, Text, Image, Flex, Heading, Avatar, Badge, HStack,
    Container, Accordion, AccordionItem, AccordionButton, AccordionPanel,
    AccordionIcon, Divider, Skeleton, SkeletonCircle, Icon, useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaSignOutAlt, FaArrowLeft, FaCheckCircle, FaClock, FaHistory } from 'react-icons/fa';
import bknLogo from '../assets/Logo_Badan_Kepegawaian_Negara.png';
import api from '../api';

function DashboardPage({
    visitorData, handleBack, handleCheckIn, handleCheckOut,
    loading, checkInStatus
}) {
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (visitorData && visitorData.nik) {
            fetchHistory();
        }
    }, [visitorData]);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const response = await api.get(`/visitors/${visitorData.nik}/history`);
            setHistory(response.data.history || []);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!visitorData) return <Box bg="gray.50" minH="100vh" />;

    return (
        <Box bg="#f8f9fa" minH="100vh" fontFamily="'Google Sans', 'Inter', sans-serif">

            {/* Top Navigation Bar (Clean White) */}
            <Box
                bg="white"
                borderBottom="1px solid"
                borderColor="gray.200"
                py={3} px={{ base: 4, md: 6 }}
                position="sticky" top={0} zIndex={20}
            >
                <Flex maxW="1000px" mx="auto" align="center" justify="space-between">
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
                    <HStack spacing={3}>
                        <Image src={bknLogo} h="28px" alt="Logo BKN" />
                        <VStack align="end" spacing={0} display={{ base: "none", sm: "flex" }}>
                            <Text fontSize="xs" fontWeight="bold" color="#202124">BADAN KEPEGAWAIAN NEGARA</Text>
                            <Text fontSize="10px" fontWeight="500" color="#5f6368">Data Center Visitor System</Text>
                        </VStack>
                    </HStack>
                </Flex>
            </Box>

            {/* Main Content */}
            <Container maxW="900px" py={8}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <VStack spacing={6} align="stretch">

                        {/* Profile & Status Card */}
                        <Box
                            bg="white"
                            borderRadius="16px"
                            boxShadow="0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)"
                            overflow="hidden"
                            border="1px solid"
                            borderColor="gray.100"
                        >
                            <Flex direction={{ base: "column", md: "row" }} p={{ base: 6, md: 0 }}>
                                {/* Profile Section (Left) */}
                                <Box w={{ base: "100%", md: "40%" }} bg={{ md: "#f8f9fa" }} p={{ md: 8 }} borderRight={{ md: "1px solid" }} borderColor={{ md: "gray.200" }}>
                                    <VStack spacing={4} align="center">
                                        <Box position="relative">
                                            <Avatar
                                                size="2xl"
                                                name={visitorData.full_name}
                                                src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/visitors/${visitorData.nik}/photo`}
                                                border="4px solid white"
                                                boxShadow="sm"
                                            />
                                            <Box
                                                position="absolute"
                                                bottom="4px" right="4px"
                                                bg={checkInStatus ? "#34a853" : "#fbbc04"} // Google Green / Yellow
                                                borderRadius="full"
                                                border="3px solid white"
                                                p="6px"
                                            >
                                                <Icon as={checkInStatus ? FaCheckCircle : FaClock} color="white" w={4} h={4} />
                                            </Box>
                                        </Box>

                                        <VStack spacing={1}>
                                            <Heading size="md" color="#202124" textAlign="center" fontWeight="500">
                                                {visitorData.full_name}
                                            </Heading>
                                            <Text color="#5f6368" fontSize="sm">
                                                {visitorData.institution}
                                            </Text>
                                        </VStack>

                                        <Badge
                                            px={3} py={1}
                                            borderRadius="8px"
                                            colorScheme={checkInStatus ? "green" : "yellow"}
                                            fontSize="xs"
                                            textTransform="uppercase"
                                        >
                                            {checkInStatus ? "Checked In" : "Not Checked In"}
                                        </Badge>
                                    </VStack>
                                </Box>

                                {/* Action Buttons (Right) */}
                                <Box w={{ base: "100%", md: "60%" }} p={{ md: 8 }} pt={{ base: 6, md: 8 }}>
                                    <VStack spacing={6} align="start" h="full" justify="center">
                                        <VStack align="start" spacing={1}>
                                            <Text fontSize="sm" fontWeight="600" color="#1a73e8" letterSpacing="0.5px">
                                                Selamat Datang
                                            </Text>
                                            <Heading size="lg" color="#202124" fontWeight="400">
                                                Check-in atau Check-out?
                                            </Heading>
                                        </VStack>

                                        <Flex gap={4} w="full" direction={{ base: "column", sm: "row" }}>
                                            <Button
                                                flex={1}
                                                h="80px"
                                                bg={!checkInStatus ? "#1a73e8" : "gray.100"}
                                                color={!checkInStatus ? "white" : "gray.400"}
                                                _hover={!checkInStatus ? { bg: "#1557b0", boxShadow: "md" } : {}}
                                                borderRadius="12px"
                                                onClick={handleCheckIn}
                                                isLoading={loading}
                                                isDisabled={checkInStatus}
                                                justifyContent="center"
                                                fontSize="lg"
                                                fontWeight="500"
                                            >
                                                <VStack spacing={1}>
                                                    <Icon as={FaSignInAlt} />
                                                    <Text fontSize="sm">Check In</Text>
                                                </VStack>
                                            </Button>

                                            <Button
                                                flex={1}
                                                h="80px"
                                                bg={checkInStatus ? "#ea4335" : "gray.100"}
                                                color={checkInStatus ? "white" : "gray.400"}
                                                _hover={checkInStatus ? { bg: "#d93025", boxShadow: "md" } : {}}
                                                borderRadius="12px"
                                                onClick={handleCheckOut}
                                                isLoading={loading}
                                                isDisabled={!checkInStatus}
                                                justifyContent="center"
                                                fontSize="lg"
                                                fontWeight="500"
                                            >
                                                <VStack spacing={1}>
                                                    <Icon as={FaSignOutAlt} />
                                                    <Text fontSize="sm">Check Out</Text>
                                                </VStack>
                                            </Button>
                                        </Flex>
                                    </VStack>
                                </Box>
                            </Flex>
                        </Box>

                        {/* Visitor History (Clean List) */}
                        <Box
                            bg="white"
                            borderRadius="16px"
                            boxShadow="0 1px 3px 0 rgba(0,0,0,0.1)"
                            border="1px solid"
                            borderColor="gray.100"
                            overflow="hidden"
                        >
                            <Accordion allowToggle defaultIndex={[0]}>
                                <AccordionItem border="none">
                                    <AccordionButton py={4} px={6} _hover={{ bg: "gray.50" }}>
                                        <Box flex="1" textAlign="left">
                                            <HStack>
                                                <Icon as={FaHistory} color="#5f6368" />
                                                <Text fontWeight="500" color="#202124" fontSize="md">Riwayat Kunjungan</Text>
                                            </HStack>
                                        </Box>
                                        <AccordionIcon color="gray.400" />
                                    </AccordionButton>
                                    <AccordionPanel pb={6} px={6}>
                                        <Divider mb={4} borderColor="gray.100" />
                                        {loadingHistory ? (
                                            <VStack spacing={3}>
                                                <Skeleton height="20px" />
                                                <Skeleton height="20px" />
                                            </VStack>
                                        ) : history.length === 0 ? (
                                            <Text textAlign="center" color="gray.500" py={4} fontSize="sm">Belum ada riwayat.</Text>
                                        ) : (
                                            <VStack spacing={0} align="stretch" divider={<Divider borderColor="gray.50" />}>
                                                {history.map((visit, index) => (
                                                    <Box key={index} py={3}>
                                                        <Flex justify="space-between" align="center">
                                                            <VStack align="start" spacing={0}>
                                                                <Text fontSize="sm" fontWeight="600" color="#202124">{visit.date}</Text>
                                                                <Text fontSize="xs" color="gray.500">{visit.check_in} - {visit.check_out || "?"}</Text>
                                                            </VStack>
                                                            <Badge
                                                                colorScheme={visit.status === "Selesai" ? "green" : "yellow"}
                                                                variant="subtle"
                                                                fontSize="10px"
                                                            >
                                                                {visit.status}
                                                            </Badge>
                                                        </Flex>
                                                    </Box>
                                                ))}
                                            </VStack>
                                        )}
                                    </AccordionPanel>
                                </AccordionItem>
                            </Accordion>
                        </Box>

                    </VStack>
                </motion.div>
            </Container>

            <Flex w="full" justify="center" py={6}>
                <Text fontSize="11px" color="#9aa0a6">&copy; 2025 BKN - Direktorat INTIKAMI</Text>
            </Flex>
        </Box>
    );
}

export default DashboardPage;
