// File: frontend/src/pages/DashboardPage.jsx
// Google Material Design Style - Visitor Dashboard
import { useState, useEffect } from 'react';
import { VStack, Button, Box, Text, Image, Flex, Heading, Avatar, Badge, HStack, Container, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Divider, Skeleton, SkeletonCircle } from '@chakra-ui/react';
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

    if (!visitorData) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg="#f8f9fa">
                <Container maxW="600px">
                    <VStack spacing={6}>
                        {/* Skeleton Header */}
                        <VStack spacing={1}>
                            <Skeleton height="32px" width="200px" />
                            <Skeleton height="20px" width="250px" />
                        </VStack>

                        {/* Skeleton Card */}
                        <Box
                            bg="white"
                            borderRadius="12px"
                            boxShadow="0 1px 2px 0 rgba(60,64,67,.3)"
                            p={6}
                            w="full"
                        >
                            <VStack spacing={4}>
                                {/* Avatar Skeleton */}
                                <SkeletonCircle size="24" />

                                {/* Name & Info Skeleton */}
                                <VStack spacing={2}>
                                    <Skeleton height="24px" width="180px" />
                                    <Skeleton height="16px" width="150px" />
                                    <Skeleton height="28px" width="140px" borderRadius="16px" />
                                </VStack>
                            </VStack>

                            <Box h="1px" bg="#dadce0" w="full" my={6} />

                            {/* Buttons Skeleton */}
                            <VStack spacing={3}>
                                <Skeleton height="44px" width="full" borderRadius="8px" />
                                <Skeleton height="44px" width="full" borderRadius="8px" />
                            </VStack>
                        </Box>
                    </VStack>
                </Container>
            </Flex>
        );
    }

    return (
        <Box bg="#f8f9fa" minH="100vh">
            {/* Top Bar */}
            <Box bg="white" py={3} px={6} borderBottom="1px solid #dadce0" position="sticky" top="0" zIndex="10">
                <Flex maxW="1000px" mx="auto" align="center" justify="space-between">
                    <Button
                        variant="outline"
                        leftIcon={<FaArrowLeft />}
                        onClick={handleBack}
                        color="#3c4043"
                        borderColor="#dadce0"
                        bg="white"
                        size="sm"
                        _hover={{ bg: "#f1f3f4", color: "#202124" }}
                        borderRadius="4px"
                        px={{ base: 2, md: 4 }}
                        fontWeight="500"
                    >
                        <Text display={{ base: "none", md: "block" }}>Kembali</Text>
                    </Button>
                    <HStack spacing={{ base: 2, md: 3 }}>
                        <Image src={bknLogo} h={{ base: "28px", md: "32px" }} alt="Logo BKN" />
                        <VStack align="end" spacing={0}>
                            <Text fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color="#3c4043" textAlign="right">
                                BADAN KEPEGAWAIAN NEGARA
                            </Text>
                            <Text fontSize={{ base: "10px", md: "xs" }} fontWeight="500" color="#5f6368" textAlign="right">
                                Data Center Visitor System
                            </Text>
                        </VStack>
                    </HStack>
                </Flex>
            </Box>

            <Container maxW="1000px" py={8}>
                <VStack spacing={6} align="stretch">

                    {/* Main Split Card */}
                    <Box
                        bg="white"
                        borderRadius="12px"
                        boxShadow="0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)"
                        overflow="hidden"
                    >
                        <Flex direction={{ base: "column", md: "row" }}>

                            {/* LEFT COLUMN: PROFILE */}
                            <Box
                                w={{ base: "100%", md: "40%" }}
                                bg="#f8f9fa"
                                p={8}
                                borderRight={{ base: "none", md: "1px solid #dadce0" }}
                                borderBottom={{ base: "1px solid #dadce0", md: "none" }}
                            >
                                <VStack spacing={6} align="start" h="full" justify="center" textAlign="left">
                                    <Box position="relative">
                                        <Avatar
                                            size="2xl"
                                            name={visitorData.full_name}
                                            src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/visitors/${visitorData.nik}/photo`}
                                            bg="#1a73e8"
                                            color="white"
                                            border="4px solid white"
                                            boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                                            w="150px"
                                            h="150px"
                                        />
                                        <Box
                                            position="absolute"
                                            bottom="10px"
                                            right="10px"
                                            bg={checkInStatus ? "#34a853" : "#fbbc04"}
                                            border="4px solid white"
                                            borderRadius="full"
                                            w="32px"
                                            h="32px"
                                        />
                                    </Box>

                                    <VStack spacing={1} align="start">
                                        <Heading size="md" color="#202124" fontWeight="500" fontFamily="'Google Sans', sans-serif">
                                            {visitorData.full_name}
                                        </Heading>
                                        <Text color="#5f6368" fontSize="md" fontWeight="400">
                                            {visitorData.institution}
                                        </Text>

                                        <Badge
                                            mt={3}
                                            bg={checkInStatus ? "#e6f4ea" : "#fef7e0"}
                                            color={checkInStatus ? "#137333" : "#b06000"}
                                            borderRadius="16px"
                                            px={4}
                                            py={2}
                                            fontSize="sm"
                                            fontWeight="500"
                                            textTransform="none"
                                            border="1px solid"
                                            borderColor={checkInStatus ? "#ceead6" : "#fef0b3"}
                                        >
                                            <HStack spacing={2}>
                                                {checkInStatus ? <FaCheckCircle /> : <FaClock />}
                                                <Text>{checkInStatus ? "Status: Checked-In" : "Status: Belum Check-In"}</Text>
                                            </HStack>
                                        </Badge>
                                    </VStack>
                                </VStack>
                            </Box>

                            {/* RIGHT COLUMN: ACTIONS */}
                            <Box w={{ base: "100%", md: "60%" }} p={8} bg="white">
                                <VStack spacing={6} align="start" h="full" justify="center">
                                    <VStack align="start" spacing={1} w="full">
                                        <Heading
                                            size="lg"
                                            color="#202124"
                                            fontFamily="'Google Sans', sans-serif"
                                            fontWeight="500"
                                            fontSize="32px"
                                        >
                                            Selamat Datang
                                        </Heading>
                                        <Text color="#5f6368" fontWeight="500" fontSize="24px">
                                            Check-In
                                        </Text>
                                        <Text color="#5f6368" fontWeight="400" fontSize="24px">
                                            Atau
                                        </Text>
                                        <Text color="#5f6368" fontWeight="500" fontSize="24px">
                                            Check-Out
                                        </Text>
                                    </VStack>

                                    <VStack spacing={4} w="full" pt={4}>
                                        {/* Check-In Button */}
                                        <Button
                                            w="full"
                                            h="60px"
                                            bg="#4285f4" // Google Blue
                                            color="white"
                                            borderRadius="8px"
                                            fontSize="18px"
                                            fontWeight="500"
                                            leftIcon={<Box as={FaSignInAlt} boxSize="24px" mr={2} />}
                                            onClick={handleCheckIn}
                                            isLoading={loading}
                                            isDisabled={checkInStatus}
                                            _hover={{ bg: "#3367d6", boxShadow: "0 2px 6px rgba(66,133,244,0.3)" }}
                                            _active={{ bg: "#2a56c6" }}
                                            _disabled={{ bg: "#f1f3f4", color: "#9aa0a6", cursor: "not-allowed", boxShadow: "none" }}
                                            justifyContent="flex-start"
                                            pl={8}
                                        >
                                            Check - In
                                        </Button>

                                        {/* Check-Out Button */}
                                        <Button
                                            w="full"
                                            h="60px"
                                            bg="#ea4335" // Google Red
                                            color="white"
                                            borderRadius="8px"
                                            fontSize="18px"
                                            fontWeight="500"
                                            leftIcon={<Box as={FaSignOutAlt} boxSize="24px" mr={2} />}
                                            onClick={handleCheckOut}
                                            isLoading={loading}
                                            isDisabled={!checkInStatus}
                                            _hover={{ bg: "#d93025", boxShadow: "0 2px 6px rgba(234,67,53,0.3)" }}
                                            _active={{ bg: "#b31412" }}
                                            _disabled={{ bg: "#f1f3f4", color: "#9aa0a6", cursor: "not-allowed", boxShadow: "none" }}
                                            justifyContent="flex-start"
                                            pl={8}
                                        >
                                            Check - Out
                                        </Button>
                                    </VStack>
                                </VStack>
                            </Box>
                        </Flex>
                    </Box>

                    {/* Visitor History Section */}
                    <Box
                        bg="white"
                        borderRadius="8px"
                        border="1px solid #dadce0"
                        overflow="hidden"
                        w="full"
                    >
                        <Accordion allowToggle defaultIndex={[0]}>
                            <AccordionItem border="none">
                                <AccordionButton _hover={{ bg: "#f8f9fa" }} py={4} px={6}>
                                    <Box flex="1" textAlign="left">
                                        <HStack spacing={3}>
                                            <Box p={2} bg="#e8f0fe" borderRadius="full">
                                                <FaHistory color="#1967d2" />
                                            </Box>
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="500" color="#202124" fontSize="md">
                                                    Riwayat Kunjungan
                                                </Text>
                                                <Text fontSize="xs" color="#5f6368">
                                                    Klik untuk melihat detail kunjungan sebelumnya
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Box>
                                    <AccordionIcon color="#5f6368" />
                                </AccordionButton>
                                <AccordionPanel pb={4} px={6} bg="#fff">
                                    <Divider mb={4} borderColor="#dadce0" />
                                    {loadingHistory ? (
                                        <VStack spacing={3} py={2}>
                                            {[1, 2, 3].map((i) => (
                                                <HStack key={i} w="full" justify="space-between">
                                                    <VStack align="start" spacing={2} flex="1">
                                                        <Skeleton height="16px" width="120px" />
                                                        <Skeleton height="12px" width="180px" />
                                                    </VStack>
                                                    <Skeleton height="24px" width="70px" borderRadius="12px" />
                                                </HStack>
                                            ))}
                                        </VStack>
                                    ) : history.length === 0 ? (
                                        <Text fontSize="sm" color="#5f6368" textAlign="center" py={6} fontStyle="italic">
                                            Belum ada riwayat kunjungan tercatat.
                                        </Text>
                                    ) : (
                                        <VStack spacing={0} align="stretch" divider={<Divider borderColor="#f1f3f4" />}>
                                            {history.map((visit, index) => (
                                                <Box key={index} py={3} _hover={{ bg: "#f8f9fa" }} borderRadius="4px" px={2} transition="background 0.2s">
                                                    <HStack justify="space-between">
                                                        <VStack align="start" spacing={1}>
                                                            <Text fontSize="sm" fontWeight="500" color="#202124">
                                                                📅 {visit.date}
                                                            </Text>
                                                            <HStack fontSize="xs" color="#5f6368" spacing={3}>
                                                                <Text>Masuk: {visit.check_in}</Text>
                                                                <Text>•</Text>
                                                                <Text>Keluar: {visit.check_out || "-"}</Text>
                                                            </HStack>
                                                        </VStack>
                                                        <Badge
                                                            bg={visit.status === "Selesai" ? "#e6f4ea" : "#fef7e0"}
                                                            color={visit.status === "Selesai" ? "#137333" : "#b06000"}
                                                            borderRadius="4px"
                                                            px={2}
                                                            py={1}
                                                            fontSize="xs"
                                                            fontWeight="500"
                                                        >
                                                            {visit.status}
                                                        </Badge>
                                                    </HStack>
                                                </Box>
                                            ))}
                                        </VStack>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </Box>

                    {/* Footer Note */}
                    <Flex w="full" justify="space-between" pt={4} px={2}>
                        <Text fontSize="11px" color="#9aa0a6">
                            &copy; 2025 BKN Visitor System
                        </Text>
                        <Text fontSize="11px" color="#9aa0a6">
                            Direktorat INTIKAMI
                        </Text>
                    </Flex>

                </VStack>
            </Container>
        </Box>
    );
}

export default DashboardPage;
