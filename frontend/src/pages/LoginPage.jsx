// File: frontend/src/pages/LoginPage.jsx
// Google Antigravity Style - Clean, Playful, Physics-based
import { useRef, useEffect } from 'react';
import {
    Box, Button, FormControl, Input, Heading, VStack, Text, Image, Flex,
    Icon, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { useMotionValue } from 'framer-motion';
import { FaUser, FaArrowRight } from 'react-icons/fa';
import bknLogo from '../assets/Logo_Badan_Kepegawaian_Negara.png';
import AntigravityBackground from '../components/AntigravityBackground';

function LoginPage({ nik, setNik, handleLogin, loading }) {
    const nikInputRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Track mouse
    useEffect(() => {
        const handleMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
    }, [mouseX, mouseY]);

    // Focus input
    useEffect(() => {
        if (nikInputRef.current) nikInputRef.current.focus();
    }, []);

    const handleNikChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) setNik(value);
    };

    return (
        <Flex
            w="100vw"
            h="100vh"
            bg="white"
            overflow="hidden"
            position="relative"
            fontFamily="'Google Sans', 'Inter', sans-serif"
        >
            {/* --- ANTIGRAVITY PLAYGROUND (LEFT/FULL) --- */}
            <Box
                flex="1.5"
                position="relative"
                display={{ base: "none", lg: "block" }}
                overflow="hidden"
                bg="#f8f9fa"
            >
                <AntigravityBackground mouseX={mouseX} mouseY={mouseY} />
            </Box>

            {/* --- CLEAN LOGIN FORM (RIGHT) --- */}
            <Flex
                flex="1"
                align="center"
                justify="center"
                bg="white"
                zIndex={10}
                boxShadow={{ lg: "-20px 0 50px rgba(0,0,0,0.05)" }}
                p={8}
            >
                <VStack spacing={8} w="full" maxW="400px" align="start">
                    <Box>
                        <Image src={bknLogo} h="48px" mb={6} />
                        <Heading size="xl" color="#202124" fontWeight="700">
                            Selamat Datang
                        </Heading>
                        <Text color="#5f6368" mt={2} fontSize="lg">
                            Silakan check-in untuk memulai kunjungan.
                        </Text>
                    </Box>

                    <FormControl>
                        <VStack spacing={4} align="stretch">
                            <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none" children={<Icon as={FaUser} color="gray.400" />} />
                                <Input
                                    ref={nikInputRef}
                                    value={nik}
                                    onChange={handleNikChange}
                                    placeholder="Nomor Identitas (NIK/NIP)"
                                    bg="#f8f9fa"
                                    border="1px solid transparent"
                                    _hover={{ bg: "#f1f3f4" }}
                                    _focus={{
                                        bg: "white",
                                        borderColor: "#1a73e8",
                                        boxShadow: "0 0 0 4px rgba(66, 133, 244, 0.1)"
                                    }}
                                    borderRadius="8px"
                                    fontSize="md"
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    autoComplete="off"
                                    inputMode="numeric"
                                    h="56px" // Taller input
                                />
                            </InputGroup>

                            <Button
                                h="56px" // Matching height
                                bg="#1a73e8"
                                color="white"
                                _hover={{
                                    bg: "#1557b0",
                                    boxShadow: "0 4px 12px rgba(26,115,232,0.3)",
                                    transform: "translateY(-1px)"
                                }}
                                _active={{ bg: "#174ea6", transform: "translateY(0)" }}
                                onClick={handleLogin}
                                isLoading={loading}
                                borderRadius="30px" // Pill shape
                                fontSize="md"
                                fontWeight="600"
                                rightIcon={<FaArrowRight />}
                                width="full"
                            >
                                Check In
                            </Button>
                        </VStack>
                    </FormControl>

                    <Text fontSize="xs" color="#9aa0a6" w="full" textAlign="center" pt={8}>
                        &copy; 2025 BKN - Direktorat INTIKAMI
                    </Text>
                </VStack>
            </Flex>
        </Flex>
    );
}

export default LoginPage;
