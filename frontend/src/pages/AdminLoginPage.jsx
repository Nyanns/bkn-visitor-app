// File: frontend/src/pages/AdminLoginPage.jsx
// Google Material Design Style - Admin Login (FAANG Quality)
import { useState } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Input,
    Heading, VStack, Text, useToast, InputGroup, InputRightElement,
    Flex, Image, ScaleFade, Icon, Center, Spinner
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash, FaLock, FaUserShield, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import bknLogo from '../assets/Logo_Badan_Kepegawaian_Negara.png';

function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(''); // 'username' or 'password'

    const navigate = useNavigate();
    const toast = useToast();

    const handleLogin = async (e) => {
        if (e) e.preventDefault();

        if (!username || !password) {
            toast({ title: "Harap isi semua kolom", status: "warning", position: "top" });
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/token', formData);
            localStorage.setItem('adminToken', response.data.access_token);

            toast({
                title: "Login Berhasil",
                description: "Selamat datang kembali, Admin.",
                status: "success",
                position: "top",
                duration: 2000,
                isClosable: true
            });
            navigate('/admin/dashboard');

        } catch (error) {
            toast({
                title: "Akses Ditolak",
                description: "Username atau sandi yang Anda masukkan salah.",
                status: "error",
                position: "top",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex minH="100vh" bg="white" overflow="hidden">
            {/* LEFT SIDE: Login Form */}
            <Flex
                flex="1"
                align="center"
                justify="center"
                p={8}
                direction="column"
                maxW={{ base: "100%", md: "500px", lg: "600px" }}
                zIndex={2}
                boxShadow={{ base: "none", md: "10px 0 30px rgba(0,0,0,0.05)" }}
            >
                <VStack
                    spacing={8}
                    w="full"
                    maxW="360px"
                    as="form"
                    onSubmit={handleLogin}
                    align="flex-start"
                >
                    {/* Brand Header */}
                    <Box>
                        <Image src={bknLogo} alt="BKN Logo" h="48px" mb={6} />
                        <Heading
                            size="xl"
                            color="#202124"
                            lineHeight="1.2"
                            fontFamily="'Google Sans', 'Inter', sans-serif"
                            fontWeight="700"
                        >
                            Log in to<br />Admin Portal
                        </Heading>
                        <Text color="#5f6368" mt={3} fontSize="md" fontWeight="500">
                            DATA CENTER VISITOR SYSTEM
                        </Text>
                    </Box>

                    {/* Inputs */}
                    <VStack spacing={5} w="full">
                        <FormControl>
                            <FormLabel
                                color={isFocused === 'username' ? "#1a73e8" : "#5f6368"}
                                fontSize="xs"
                                fontWeight="600"
                                letterSpacing="0.5px"
                                ml={1}
                            >
                                USERNAME
                            </FormLabel>
                            <Input
                                size="lg"
                                placeholder="Masukkan username admin"
                                _placeholder={{ color: "#dadce0" }}
                                bg="#f8f9fa"
                                border="1px solid transparent"
                                _hover={{ bg: "#f1f3f4" }}
                                _focus={{
                                    bg: "white",
                                    borderColor: "#1a73e8",
                                    boxShadow: "0 0 0 4px rgba(26,115,232,0.1)"
                                }}
                                borderRadius="8px"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onFocus={() => setIsFocused('username')}
                                onBlur={() => setIsFocused('')}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel
                                color={isFocused === 'password' ? "#1a73e8" : "#5f6368"}
                                fontSize="xs"
                                fontWeight="600"
                                letterSpacing="0.5px"
                                ml={1}
                            >
                                PASSWORD
                            </FormLabel>
                            <InputGroup size="lg">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Masukkan kata sandi"
                                    _placeholder={{ color: "#dadce0" }}
                                    bg="#f8f9fa"
                                    border="1px solid transparent"
                                    _hover={{ bg: "#f1f3f4" }}
                                    _focus={{
                                        bg: "white",
                                        borderColor: "#1a73e8",
                                        boxShadow: "0 0 0 4px rgba(26,115,232,0.1)"
                                    }}
                                    borderRadius="8px"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setIsFocused('password')}
                                    onBlur={() => setIsFocused('')}
                                />
                                <InputRightElement width="3rem">
                                    <Button
                                        h="1.75rem"
                                        size="sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                        variant="ghost"
                                        color="#5f6368"
                                        _hover={{ bg: "transparent", color: "#202124" }}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                    </VStack>

                    {/* Actions */}
                    <Button
                        type="submit"
                        w="full"
                        size="lg"
                        height="56px"
                        bg="#1a73e8"
                        color="white"
                        fontSize="md"
                        fontWeight="600"
                        borderRadius="30px" // Pill shape
                        _hover={{ bg: "#1557b0", transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(26,115,232,0.3)" }}
                        _active={{ bg: "#174ea6", transform: "translateY(0)" }}
                        rightIcon={!loading && <FaArrowRight />}
                        isLoading={loading}
                        loadingText="Memasuk..."
                        transition="all 0.2s"
                        mt={4}
                    >
                        Login
                    </Button>

                    <Flex w="full" justify="center" pt={4}>
                        <Flex align="center" color="#9aa0a6" fontSize="xs">
                            <Icon as={FaUserShield} mr={2} />
                            Area Terbatas. Hanya untuk petugas berwenang.
                        </Flex>
                    </Flex>
                </VStack>
            </Flex>

            {/* RIGHT SIDE: Unique Animated Gradient Background */}
            <Box
                flex="1.5"
                display={{ base: "none", md: "block" }}
                position="relative"
                bg="#1a73e8"
                overflow="hidden"
            >
                {/* CSS Mesh Gradient */}
                <Box
                    position="absolute"
                    top="-50%"
                    left="-50%"
                    width="200%"
                    height="200%"
                    bgGradient="radial(circle at 50% 50%, #4285f4, #1a73e8, #185abc, #174ea6)"
                    filter="blur(80px)"
                    opacity="0.8"
                    animation="rotate 20s linear infinite"
                    sx={{
                        "@keyframes rotate": {
                            "0%": { transform: "rotate(0deg)" },
                            "100%": { transform: "rotate(360deg)" }
                        }
                    }}
                />
                {/* Floating Shapes for 'Unix' feel */}
                <Box position="absolute" top="20%" right="20%" w="300px" h="300px" bg="#8ab4f8" borderRadius="full" filter="blur(60px)" opacity="0.4" animation="float 6s ease-in-out infinite" />
                <Box position="absolute" bottom="10%" left="10%" w="200px" h="200px" bg="#d2e3fc" borderRadius="full" filter="blur(40px)" opacity="0.3" animation="float 8s ease-in-out infinite reverse" />

                {/* Content Overlay */}
                <Flex
                    position="absolute"
                    top={0} left={0} right={0} bottom={0}
                    direction="column"
                    justify="flex-end"
                    p={16}
                    color="white"
                    zIndex={10}
                >
                    <Heading size="3xl" mb={4} fontFamily="'Google Sans', 'Inter', sans-serif" fontWeight="800">
                        Secure.<br />Scalable.<br />Reliable.
                    </Heading>
                    <Text fontSize="xl" opacity={0.9} maxW="500px">
                        Admin Portal terintegrasi untuk manajemen akses fisik Data Center BKN yang modern.
                    </Text>
                </Flex>
            </Box>
        </Flex>
    );
}

export default AdminLoginPage;
