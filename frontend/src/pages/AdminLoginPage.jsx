// File: frontend/src/pages/AdminLoginPage.jsx
// Google Material Design Style
import { useState } from 'react';
import {
    Box, Button, Container, FormControl, Input,
    Heading, VStack, Text, useToast, InputGroup, InputLeftElement,
    Flex, Image
} from '@chakra-ui/react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';  // Import api instance
import axios from 'axios';

function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await api.post('/token', formData);
            localStorage.setItem('adminToken', response.data.access_token);

            toast({ title: "Login Berhasil", status: "success", position: "top", duration: 3000, isClosable: true });
            navigate('/admin/dashboard');

        } catch (error) {
            toast({
                title: "Login Gagal",
                description: "Username atau Password salah",
                status: "error", position: "top",
                duration: 3000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex
            minH="100vh"
            align="center"
            justify="center"
            bg="#f8f9fa"
        >
            <Box
                bg="white"
                p={6}
                borderRadius="8px"
                boxShadow="0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)"
                w="400px"
                maxW="90vw"
            >
                <VStack spacing={6}>
                    {/* Logo/Icon */}
                    <Flex
                        w="72px"
                        h="72px"
                        bg="#1a73e8"
                        borderRadius="full"
                        align="center"
                        justify="center"
                    >
                        <FaUser color="white" size="28px" />
                    </Flex>

                    {/* Title */}
                    <VStack spacing={1}>
                        <Heading
                            size="lg"
                            color="#202124"
                            fontWeight="400"
                            fontFamily="'Google Sans', 'Inter', sans-serif"
                        >
                            Sign in
                        </Heading>
                        <Text color="#3c4043" fontSize="sm">
                            Admin Portal - Data Center Visitor System
                        </Text>
                    </VStack>

                    {/* Form */}
                    <VStack spacing={4} w="full">
                        <FormControl>
                            <InputGroup>
                                <InputLeftElement h="44px">
                                    <FaUser color="#3c4043" />
                                </InputLeftElement>
                                <Input
                                    h="44px"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    border="1px solid #dadce0"
                                    borderRadius="4px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                    fontSize="16px"
                                />
                            </InputGroup>
                        </FormControl>

                        <FormControl>
                            <InputGroup>
                                <InputLeftElement h="44px">
                                    <FaLock color="#3c4043" />
                                </InputLeftElement>
                                <Input
                                    h="44px"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    border="1px solid #dadce0"
                                    borderRadius="4px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                    fontSize="16px"
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                />
                            </InputGroup>
                        </FormControl>
                    </VStack>

                    {/* Button */}
                    <Button
                        w="full"
                        h="44px"
                        bg="#1a73e8"
                        color="white"
                        borderRadius="4px"
                        fontSize="15px"
                        fontWeight="500"
                        _hover={{ bg: "#1557b0" }}
                        _active={{ bg: "#174ea6" }}
                        onClick={handleLogin}
                        isLoading={loading}
                    >
                        Sign in
                    </Button>

                    {/* Footer */}
                    <Text color="#3c4043" fontSize="12px" pt={4}>
                        © 2025 BKN - Direktorat INTIKAMI
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
}

export default AdminLoginPage;




