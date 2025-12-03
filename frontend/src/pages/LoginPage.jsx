import {
    VStack, FormControl, FormLabel, Input, Button, Card, CardBody,
    InputGroup, InputLeftElement, Text
} from '@chakra-ui/react';
import { FaUser, FaSearch } from 'react-icons/fa';
import Header from '../components/Header';

function LoginPage({ nik, setNik, handleLogin, loading }) {

    // Fungsi Helper: Hanya izinkan angka
    const handleNikChange = (e) => {
        const value = e.target.value;
        // Regex: Hanya boleh angka (0-9)
        if (/^\d*$/.test(value)) {
            setNik(value);
        }
    };

    return (
        <VStack spacing={8} w="full" maxW="md" px={4}>
            <Header />

            <Card w="full" boxShadow="2xl" borderRadius="3xl" bg="white" overflow="hidden">
                <CardBody p={10}>
                    <VStack spacing={6}>

                        <FormControl>
                            <FormLabel
                                fontWeight="bold"
                                color="blue.900"
                                fontSize="xs"
                                textTransform="uppercase"
                                letterSpacing="wider"
                                textAlign="center"
                                mb={4}
                            >
                                Identitas Pengunjung
                            </FormLabel>

                            <InputGroup size="lg">
                                <InputLeftElement pointerEvents="none" h="full" pl={2}>
                                    <FaUser color="#A0AEC0" />
                                </InputLeftElement>

                                {/* PERBAIKAN DI SINI */}
                                <Input
                                    type="text"                  // Ganti number jadi text
                                    inputMode="numeric"          // Tetap muncul angka di keyboard HP
                                    placeholder="Masukkan NIK / NIP..."
                                    value={nik}
                                    onChange={handleNikChange}   // Pakai fungsi filter angka
                                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                    focusBorderColor="blue.500"
                                    borderRadius="xl"
                                    variant="filled"
                                    bg="gray.50"
                                    _hover={{ bg: "gray.100" }}
                                    h="14"
                                    fontSize="lg"
                                    pl={12}
                                    maxLength={20} // Batasi panjang NIK agar tidak kepanjangan
                                />
                            </InputGroup>
                        </FormControl>

                        <Button
                            colorScheme="blue"
                            size="lg"
                            w="full"
                            h="14"
                            borderRadius="xl"
                            fontSize="md"
                            fontWeight="bold"
                            boxShadow="lg"
                            onClick={handleLogin}
                            isLoading={loading}
                            loadingText="Mencari..."
                            leftIcon={<FaSearch />}
                            _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
                            transition="all 0.2s"
                        >
                            Cek Data Saya
                        </Button>

                    </VStack>
                </CardBody>
            </Card>

            <Text fontSize="xs" color="gray.400" textAlign="center" mt={2}>
                Sistem Buku Tamu Digital BKN © 2025
            </Text>

        </VStack>
    );
}

export default LoginPage;