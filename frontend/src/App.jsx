import { useState } from 'react';
import {
  Box, Button, Container, FormControl, FormLabel, Input,
  Heading, Text, useToast, VStack, Card, CardBody,
  Image, Badge, HStack, Divider, IconButton
} from '@chakra-ui/react';
import { FaBuilding, FaSignInAlt, FaSignOutAlt, FaArrowLeft, FaUserCheck } from 'react-icons/fa';
import api from './api';

function App() {
  // State untuk menyimpan alur aplikasi
  // 'login' = Tampilan awal input NIK
  // 'dashboard' = Tampilan data diri & tombol absen
  const [viewMode, setViewMode] = useState('login');

  const [nik, setNik] = useState('');
  const [visitorData, setVisitorData] = useState(null); // Menyimpan data tamu (Nama, Foto, dll)
  const [checkInStatus, setCheckInStatus] = useState(false); // false = belum check-in, true = sudah

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // --- 1. FUNGSI LOGIN (UPDATE LOGIKA) ---
  const handleLogin = async () => {
    if (!nik) {
      toast({ title: "NIK harus diisi!", status: "warning", position: "top" });
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/visitors/${nik}`);

      // Simpan data tamu
      setVisitorData(response.data);

      // LOGIKA BARU: 
      // Set status tombol berdasarkan laporan dari Backend
      // Jika backend bilang "True", maka tombol Check-Out langsung nyala
      setCheckInStatus(response.data.is_checked_in);

      setViewMode('dashboard');

      // Beri notifikasi status
      if (response.data.is_checked_in) {
        toast({
          title: "Sesi Aktif Ditemukan",
          description: "Anda belum Check-Out. Silakan Check-Out sebelum pulang.",
          status: "info",
          position: "top",
          duration: 3000
        });
      }

    } catch (error) {
      toast({
        title: "Gagal Login",
        description: error.response?.data?.detail || "Data tidak ditemukan",
        status: "error",
        position: "top",
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. FUNGSI CHECK-IN ---
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nik', nik);

      const response = await api.post('/check-in/', formData);

      toast({
        title: "Berhasil Masuk!",
        description: response.data.message,
        status: "success",
        position: "top",
        duration: 5000,
      });

      // KUNCI UTAMA: Aktifkan tombol Check-Out setelah berhasil masuk
      setCheckInStatus(true);

    } catch (error) {
      // Jika errornya "Anda sudah masuk", kita anggap dia memang sudah check-in
      if (error.response?.data?.detail?.includes("masih di dalam")) {
        setCheckInStatus(true);
        toast({ title: "Anda sudah tercatat masuk.", status: "info", position: "top" });
      } else {
        toast({
          title: "Gagal Check-In",
          description: error.response?.data?.detail,
          status: "error",
          position: "top",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 3. FUNGSI CHECK-OUT ---
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nik', nik);

      const response = await api.post('/check-out/', formData);

      toast({
        title: "Berhasil Keluar!",
        description: response.data.message,
        status: "success", // Hijau karena sukses menyelesaikan kunjungan
        position: "top",
        duration: 5000,
      });

      // Kembali ke halaman Login setelah selesai
      setTimeout(() => {
        handleBackToLogin();
      }, 2000);

    } catch (error) {
      toast({
        title: "Gagal Keluar",
        description: error.response?.data?.detail,
        status: "error",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Helper: Membersihkan URL Foto
  // Backend menyimpan path seperti "uploads\foto.jpg", kita ubah jadi URL browser
  const getPhotoUrl = (path) => {
    if (!path) return "https://via.placeholder.com/150";
    // Ambil nama file saja (buang folder 'uploads/' manual jika ada)
    const filename = path.split(/[/\\]/).pop();
    return `http://127.0.0.1:8000/uploads/${filename}`;
  };

  const handleBackToLogin = () => {
    setNik('');
    setVisitorData(null);
    setViewMode('login');
    setCheckInStatus(false);
  };

  return (
    <Box bg="gray.100" minH="100vh" py={10} display="flex" alignItems="center">
      <Container maxW="md">

        {/* === TAMPILAN 1: LOGIN (INPUT NIK) === */}
        {viewMode === 'login' && (
          <VStack spacing={8}>
            <Box textAlign="center">
              <FaBuilding size={50} color="#2B6CB0" style={{ margin: "0 auto" }} />
              <Heading color="blue.700" mt={4}>Buku Tamu BKN</Heading>
              <Text color="gray.500">Silakan Masuk dengan NIK Anda</Text>
            </Box>

            <Card w="full" boxShadow="xl" borderRadius="2xl" bg="white">
              <CardBody p={8}>
                <VStack spacing={6}>
                  <FormControl>
                    <FormLabel fontWeight="bold">NIK / NIP</FormLabel>
                    <Input
                      type="number"
                      placeholder="Contoh: 19901010..."
                      size="lg"
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </FormControl>
                  <Button
                    colorScheme="blue" size="lg" w="full"
                    onClick={handleLogin} isLoading={loading}
                    leftIcon={<FaUserCheck />}
                  >
                    Cek Data Saya
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        )}

        {/* === TAMPILAN 2: DASHBOARD USER (FOTO & TOMBOL) === */}
        {viewMode === 'dashboard' && visitorData && (
          <VStack spacing={6}>

            {/* Kartu Profil */}
            <Card w="full" boxShadow="xl" borderRadius="2xl" bg="white" overflow="hidden">
              <Box bg="blue.600" h="100px" position="relative">
                <IconButton
                  icon={<FaArrowLeft />}
                  position="absolute" top={4} left={4}
                  colorScheme="whiteAlpha"
                  onClick={handleBackToLogin}
                  aria-label="Back"
                />
              </Box>

              <CardBody textAlign="center" mt="-60px">
                <Image
                  borderRadius="full"
                  boxSize="120px"
                  src={getPhotoUrl(visitorData.photo_path)}
                  alt="Foto Profil"
                  border="4px solid white"
                  boxShadow="md"
                  mx="auto"
                  objectFit="cover"
                />

                <Heading size="md" mt={4}>{visitorData.full_name}</Heading>
                <Badge colorScheme="blue" mt={1} px={3} borderRadius="full">
                  {visitorData.nik}
                </Badge>

                <Text color="gray.500" mt={2} fontSize="sm">
                  {visitorData.institution}
                </Text>

                <Divider my={5} />

                {/* Tombol Aksi */}
                <VStack spacing={4}>
                  {/* Tombol Check-In: Mati kalau sudah Check-In */}
                  <Button
                    colorScheme="green" size="lg" w="full" h="60px"
                    leftIcon={<FaSignInAlt />}
                    onClick={handleCheckIn}
                    isLoading={loading}
                    isDisabled={checkInStatus} // Disabled kalau sudah check-in
                    opacity={checkInStatus ? 0.6 : 1}
                  >
                    {checkInStatus ? "Anda Sudah Masuk" : "Check-In (Masuk)"}
                  </Button>

                  {/* Tombol Check-Out: Mati kalau BELUM Check-In */}
                  <Button
                    colorScheme="orange" size="lg" w="full" h="60px"
                    leftIcon={<FaSignOutAlt />}
                    onClick={handleCheckOut}
                    isLoading={loading}
                    isDisabled={!checkInStatus} // Disabled kalau belum check-in
                  >
                    Check-Out (Keluar)
                  </Button>
                </VStack>

              </CardBody>
            </Card>

            <Text fontSize="xs" color="gray.400">Pastikan menekan Check-Out sebelum meninggalkan gedung.</Text>
          </VStack>
        )}

      </Container>
    </Box>
  );
}

export default App;