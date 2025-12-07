// File: frontend/src/pages/LoginPage.jsx
// Split-screen Google Material Design (Based on Wireframe)
import { useRef, useEffect } from 'react';
import {
    Box, Button, FormControl, Input,
    Heading, VStack, Text, Image, Flex, Grid
} from '@chakra-ui/react';
import bknLogo from '../assets/Logo_Badan_Kepegawaian_Negara.png';

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
            bg="#f5f5f5"
            p={4}
            direction="column"
            gap={4}
        >
            {/* Main Container - Split Screen */}
            <Box
                bg="white"
                borderRadius="12px"
                boxShadow="0 2px 4px rgba(0,0,0,.1), 0 8px 16px rgba(0,0,0,.1)"
                overflow="hidden"
                maxW="640px"
                w="full"
            >
                <Grid
                    templateColumns={{ base: "2fr", md: "2fr 2fr" }}
                    minH={{ base: "auto", md: "600px" }}
                >
                    {/* LEFT PANEL - Branding */}
                    <Flex
                        bg="#fafafa"
                        borderRight={{ base: "none", md: "1px solid #e0e0e0" }}
                        borderBottom={{ base: "1px solid #e0e0e0", md: "none" }}
                        direction="column"
                        align={{ base: "center", md: "flex-start" }} // Center on mobile
                        justify="center"
                        p={{ base: 6, md: 8 }}
                        position="relative"
                    >
                        <VStack spacing={6} align={{ base: "center", md: "flex-start" }} w="full"> {/* Center stack on mobile */}
                            {/* BKN Logo */}
                            <Image
                                src={bknLogo}
                                alt="Logo BKN"
                                w={{ base: "90px", md: "120px" }}
                                h="auto"
                                objectFit="contain"
                                alignSelf={{ base: "center", md: "flex-start" }} // Center logo on mobile
                            />

                            {/* Title */}
                            <VStack spacing={0} align={{ base: "center", md: "flex-start" }} lineHeight="1.2"> {/* Center text stack on mobile */}
                                <Heading
                                    fontSize={{ base: "40px", md: "28px" }}
                                    fontWeight="700"
                                    color="#202124"
                                    fontFamily="'Google Sans', 'Roboto', sans-serif"
                                    letterSpacing="-0.5px"
                                    mb={2}
                                >
                                    INTIKAMI
                                </Heading>
                                <Heading
                                    fontSize={{ base: "40px", md: "24px" }}
                                    fontWeight="400"
                                    color="#5f6368"
                                    fontFamily="'Google Sans', 'Roboto', sans-serif"
                                >
                                    DATA
                                </Heading>
                                <Heading
                                    fontSize={{ base: "40px", md: "24px" }}
                                    fontWeight="400"
                                    color="#5f6368"
                                    fontFamily="'Google Sans', 'Roboto', sans-serif"
                                >
                                    CENTER
                                </Heading>
                                <Heading
                                    fontSize={{ base: "40px", md: "24px" }}
                                    fontWeight="400"
                                    color="#5f6368"
                                    fontFamily="'Google Sans', 'Roboto', sans-serif"
                                >
                                    VISITOR
                                </Heading>
                                <Heading
                                    fontSize={{ base: "40px", md: "24px" }}
                                    fontWeight="400"
                                    color="#5f6368"
                                    fontFamily="'Google Sans', 'Roboto', sans-serif"
                                >
                                    SYSTEM
                                </Heading>
                            </VStack>

                            {/* Welcome Message */}
                            <Text
                                color="#5f6368"
                                fontSize={{ base: "16px", md: "14px" }}
                                textAlign={{ base: "center", md: "left" }} // Center text on mobile
                                mt={4}
                                maxW="175px"
                                lineHeight="1.5"
                            >
                                Selamat datang di Data Center BKN ...
                            </Text>
                        </VStack>
                    </Flex>

                    {/* RIGHT PANEL - Login Form */}
                    <Flex
                        direction="column"
                        align="center"
                        justify="center"
                        p={{ base: 6, md: 8 }}
                    >
                        <VStack spacing={6} w="full" maxW="360px">
                            {/* Login Title */}
                            <Heading
                                fontSize={{ base: "40px", md: "24px" }}
                                fontWeight="400"
                                color="#202124"
                                fontFamily="'Google Sans', 'Roboto', sans-serif"
                                alignSelf="flex-start"
                            >
                                Log In
                            </Heading>

                            {/* Form */}
                            <VStack spacing={5} w="full">
                                <FormControl>
                                    <Text
                                        fontSize="12px"
                                        color="#5f6368"
                                        mb={2}
                                        fontWeight="500"
                                    >
                                        NIK / NIP
                                    </Text>
                                    <Input
                                        ref={nikInputRef}
                                        h="48px"
                                        value={nik}
                                        onChange={handleNikChange}
                                        placeholder="NIK 16 digit atau NIP anda"
                                        border="1px solid #dadce0"
                                        borderRadius="4px"
                                        bg="white"
                                        _hover={{
                                            borderColor: "#202124",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                                        }}
                                        _focus={{
                                            borderColor: "#1a73e8",
                                            borderWidth: "2px",
                                            boxShadow: "none",
                                            outline: "none"
                                        }}
                                        fontSize="16px"
                                        px={3}
                                        inputMode="numeric"
                                        onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    />
                                </FormControl>

                                {/* Log In Button */}
                                <Button
                                    w="full"
                                    h="48px"
                                    bg="#1a73e8"
                                    color="white"
                                    borderRadius="4px"
                                    fontSize="14px"
                                    fontWeight="500"
                                    textTransform="none"
                                    letterSpacing="0.25px"
                                    _hover={{
                                        bg: "#1557b0",
                                        boxShadow: "0 1px 2px rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)"
                                    }}
                                    _active={{ bg: "#174ea6" }}
                                    onClick={handleLogin}
                                    isLoading={loading}
                                    mt={2}
                                >
                                    Log In
                                </Button>

                                {/* Help Text */}
                                <Text
                                    color="#5f6368"
                                    fontSize="13px"
                                    textAlign="center"
                                    mt={2}
                                >
                                    Belum terdaftar? Hubungi resepsionis
                                </Text>
                            </VStack>
                        </VStack>
                    </Flex>
                </Grid>
            </Box>

            {/* Footer - Outside the box */}
            <Flex
                maxW="640px"
                w="full"
                justify="space-between"
                px={4}
                direction={{ base: "column", md: "row" }} // Stack footer on mobile
                gap={{ base: 2, md: 0 }}
                align={{ base: "center", md: "flex-start" }}
            >
                <Text color="#5f6368" fontSize="11px">
                    © 2025 BKN - Direktorat INTIKAMI
                </Text>
                <Text color="#5f6368" fontSize="11px">
                    Data Center Visitor System v1.0.0
                </Text>
            </Flex>
        </Flex>
    );
}

export default LoginPage;
