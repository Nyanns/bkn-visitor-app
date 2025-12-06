// File: frontend/src/pages/LoginPage.jsx
// Google Material Design Style (Matching Admin Login)
import { useRef, useEffect } from 'react';
import {
    Box, Button, FormControl, Input,
    Heading, VStack, Text, InputGroup, InputLeftElement,
    Flex
} from '@chakra-ui/react';
import { FaBuilding, FaIdCard } from 'react-icons/fa';

function LoginPage({ nik, setNik, handleLogin, loading }) {
    const nikInputRef = useRef(null);

    // Auto-focus on mount
    useEffect(() => {
        if (nikInputRef.current) {
            nikInputRef.current.focus();
        }
    }, []);

    const handleNikChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setNik(value);
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
                        <FaBuilding color="white" size="32px" />
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
                            Data Center Visitor System
                        </Text>
                    </VStack>

                    {/* Form */}
                    <VStack spacing={4} w="full">
                        <FormControl>
                            <InputGroup>
                                <InputLeftElement h="44px">
                                    <FaIdCard color="#3c4043" />
                                </InputLeftElement>
                                <Input
                                    ref={nikInputRef}
                                    h="44px"
                                    value={nik}
                                    onChange={handleNikChange}
                                    placeholder="Masukkan NIK 16 digit atau NIP Anda"
                                    border="1px solid #dadce0"
                                    borderRadius="4px"
                                    _hover={{ borderColor: "#202124" }}
                                    _focus={{ borderColor: "#1a73e8", borderWidth: "2px", boxShadow: "none" }}
                                    fontSize="16px"
                                    inputMode="numeric"
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
                    <VStack spacing={2} pt={4}>
                        <Text color="#3c4043" fontSize="11px">
                            BKN Visitor System v1.0.0
                        </Text>
                        <Text color="#3c4043" fontSize="10px" textAlign="center">
                            Belum terdaftar? Hubungi resepsionis
                        </Text>
                        <Text color="#3c4043" fontSize="10px">
                            © 2025 BKN - Direktorat INTIKAMI
                        </Text>
                    </VStack>
                </VStack>
            </Box>
        </Flex>
    );
}

export default LoginPage;




