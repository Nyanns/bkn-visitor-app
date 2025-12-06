// File: frontend/src/pages/DashboardPage.jsx
// Google Material Design Style - Visitor Dashboard
import { useState, useEffect } from 'react';
import { VStack, Button, Box, Text, Spinner, Flex, Heading, Avatar, Badge, HStack, Container, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Divider, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';
import { FaSignInAlt, FaSignOutAlt, FaArrowLeft, FaCheckCircle, FaClock, FaBuilding, FaHistory } from 'react-icons/fa';

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
                <Flex maxW="600px" mx="auto" align="center" justify="space-between">
                    <Button
                        variant="ghost"
                        leftIcon={<FaArrowLeft />}
                        onClick={handleBack}
                        color="#3c4043"
                        size="sm"
                        _hover={{ bg: "#f1f3f4", color: "#202124" }}
                        borderRadius="full"
                        px={4}
                    >
                        Kembali
                    </Button>
                    <HStack spacing={2}>
                        <FaBuilding color="#1a73e8" />
                        <Text fontSize="sm" fontWeight="500" color="#3c4043">Visitor System</Text>
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
                        <Text color="#3c4043" fontSize="md">
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
                        <VStack spacing={4} p={6} bg="white">
                            <Box position="relative">
                                <Avatar
                                    size="2xl"
                                    name={visitorData.full_name}
                                    src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/visitors/${visitorData.nik}/photo`}
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
                                <Text color="#3c4043" fontSize="sm">
                                    {visitorData.institution}
                                </Text>
                                {checkInStatus && visitorData.check_in_time && (
                                    <Text color="#1a73e8" fontSize="xs" fontWeight="500">
                                        Check-in: {visitorData.check_in_time} WIB
                                    </Text>
                                )}
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
                        <VStack spacing={4} p={6} bg="#f8f9fa">
                            <Button
                                w="full"
                                h="44px"
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
                                h="44px"
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

                    {/* Visitor History Section */}
                    <Box
                        bg="white"
                        borderRadius="12px"
                        boxShadow="0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)"
                        overflow="hidden"
                        w="full"
                    >
                        <Accordion allowToggle>
                            <AccordionItem border="none">
                                <AccordionButton
                                    _hover={{ bg: "#f8f9fa" }}
                                    py={4}
                                >
                                    <Box flex="1" textAlign="left">
                                        <HStack spacing={2}>
                                            <FaHistory color="#1a73e8" />
                                            <Text fontWeight="500" color="#202124">
                                                Riwayat Kunjungan
                                            </Text>
                                        </HStack>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel pb={4} px={6}>
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
                                        <Text fontSize="sm" color="#3c4043" textAlign="center" py={4}>
                                            Belum ada riwayat kunjungan
                                        </Text>
                                    ) : (
                                        <VStack spacing={3} align="stretch">
                                            {history.map((visit, index) => (
                                                <Box key={index}>
                                                    <HStack justify="space-between" py={2}>
                                                        <VStack align="start" spacing={0}>
                                                            <Text fontSize="sm" fontWeight="500" color="#202124">
                                                                📅 {visit.date}
                                                            </Text>
                                                            <Text fontSize="xs" color="#3c4043">
                                                                {visit.check_in} - {visit.check_out || "Belum check-out"}
                                                            </Text>
                                                        </VStack>
                                                        <Badge
                                                            bg={visit.status === "Selesai" ? "#e6f4ea" : "#fef7e0"}
                                                            color={visit.status === "Selesai" ? "#137333" : "#b06000"}
                                                            borderRadius="12px"
                                                            px={2}
                                                            py={1}
                                                            fontSize="xs"
                                                        >
                                                            {visit.status === "Selesai" ? "✅" : "⏳"} {visit.status}
                                                        </Badge>
                                                    </HStack>
                                                    {index < history.length - 1 && <Divider />}
                                                </Box>
                                            ))}
                                        </VStack>
                                    )}
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    </Box>

                    {/* Footer Note */}
                    <VStack spacing={2} pt={2}>
                        <Text fontSize="xs" color="#3c4043" textAlign="center" maxW="300px">
                            *Mohon lakukan Check-Out sebelum meninggalkan area gedung BKN.
                        </Text>
                        <Text fontSize="10px" color="#9aa0a6" textAlign="center">
                            BKN Visitor System v1.0.0
                        </Text>
                    </VStack>

                </VStack>
            </Container>
        </Box>
    );
}

export default DashboardPage;




