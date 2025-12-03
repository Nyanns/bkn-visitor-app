import { useState } from 'react';
import {
    Box, Button, Container, FormControl, FormLabel, Input,
    Heading, VStack, Card, CardBody, useToast, InputGroup, InputLeftElement
} from '@chakra-ui/react';
import { FaUserShield, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Pakai axios langsung untuk login awal

function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handleLogin = async () => {
        setLoading(true);
        try {
            // Format data harus x-www-form-urlencoded untuk OAuth2
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            const response = await axios.post('http://127.0.0.1:8000/token', formData);

            // Simpan Token Kunci
            localStorage.setItem('adminToken', response.data.access_token);

            toast({ title: "Login Berhasil", status: "success", position: "top" });
            navigate('/admin/dashboard'); // Masuk ke dashboard

        } catch (error) {
            toast({
                title: "Login Gagal",
                description: "Username atau Password salah",
                status: "error", position: "top"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box bg="gray.800" minH="100vh" py={20}>
            <Container maxW="sm">
                <VStack spacing={8}>
                    <Heading color="white">Admin Portal</Heading>
                    <Card w="full" bg="gray.700" color="white">
                        <CardBody p={8}>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Username</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement><FaUserShield color="gray" /></InputLeftElement>
                                        <Input
                                            value={username} onChange={(e) => setUsername(e.target.value)}
                                            placeholder="admin" bg="gray.600" border="none"
                                        />
                                    </InputGroup>
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <InputLeftElement><FaLock color="gray" /></InputLeftElement>
                                        <Input
                                            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••" bg="gray.600" border="none"
                                            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                                        />
                                    </InputGroup>
                                </FormControl>
                                <Button colorScheme="blue" w="full" onClick={handleLogin} isLoading={loading}>
                                    Masuk
                                </Button>
                            </VStack>
                        </CardBody>
                    </Card>
                </VStack>
            </Container>
        </Box>
    );
}

export default AdminLoginPage;