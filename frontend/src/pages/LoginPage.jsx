// File: frontend/src/pages/LoginPage.jsx
// Google Material Design Style - Visitor Check-in
import {
    VStack, FormControl, Input, Button, Text, Box, Flex, Heading,
    InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FaIdCard, FaArrowRight } from 'react-icons/fa';

function LoginPage({ nik, setNik, handleLogin, loading }) {

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
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            p={4}
        >
            <Box
                bg="white"
                borderRadius="16px"
                boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                p={10}
                w="420px"
                maxW="95vw"
            >
                <VStack spacing={8}>
                    {/* Header */}
                    <VStack spacing={2}>
                        <Flex
                            w="80px"
                            h="80px"
                            bg="#1a73e8"
                            borderRadius="20px"
                            align="center"
                            justify="center"
                            mb={2}
                        >
                            <FaIdCard color="white" size="36px" />
                        </Flex>
                        <Heading
                            size="lg"
                            color="#202124"
                            fontFamily="'Google Sans', 'Inter', sans-serif"
                            fontWeight="500"
                        >
                            Selamat Datang
                        </Heading>
                        <Text color="#5f6368" fontSize="sm" textAlign="center">
                            Direktorat Infrastruktur TI & Keamanan Informasi
                        </Text>
                        <Text color="#5f6368" fontSize="xs">
                            Badan Kepegawaian Negara
                        </Text>
                    </VStack>

                    {/* Form */}
                    <FormControl>
                        <Text
                            fontSize="xs"
                            color="#5f6368"
                            mb={2}
                            fontWeight="500"
                            textTransform="uppercase"
                            letterSpacing="0.5px"
                        >
                            Masukkan NIK / NIP Anda
                        </Text>
                        <InputGroup size="lg">
                            <InputLeftElement h="56px" pl={2}>
                                <FaIdCard color="#5f6368" />
                            </InputLeftElement>
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="Contoh: 3201234567890001"
                                value={nik}
                                onChange={handleNikChange}
                                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                h="56px"
                                pl={12}
                                fontSize="lg"
                                border="2px solid #dadce0"
                                borderRadius="12px"
                                _hover={{ borderColor: "#1a73e8" }}
                                _focus={{
                                    borderColor: "#1a73e8",
                                    boxShadow: "0 0 0 3px rgba(26,115,232,0.1)"
                                }}
                                maxLength={20}
                            />
                        </InputGroup>
                    </FormControl>

                    {/* Button */}
                    <Button
                        w="full"
                        h="56px"
                        bg="#1a73e8"
                        color="white"
                        borderRadius="12px"
                        fontSize="16px"
                        fontWeight="600"
                        rightIcon={<FaArrowRight />}
                        _hover={{
                            bg: "#1557b0",
                            transform: "translateY(-2px)",
                            boxShadow: "0 10px 20px rgba(26,115,232,0.3)"
                        }}
                        _active={{ bg: "#174ea6", transform: "translateY(0)" }}
                        transition="all 0.2s"
                        onClick={handleLogin}
                        isLoading={loading}
                        loadingText="Mencari..."
                    >
                        Cek Data Saya
                    </Button>

                    {/* Footer */}
                    <Text color="#9aa0a6" fontSize="11px" textAlign="center">
                        Sistem Buku Tamu Digital INTIKAMI © 2025
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
}

export default LoginPage;