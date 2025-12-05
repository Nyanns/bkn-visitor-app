import { useState, lazy, Suspense } from 'react';
import { Box, Container, useToast, Spinner, Center } from '@chakra-ui/react';
import api from './api';

// Lazy load page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

function App() {
  const [viewMode, setViewMode] = useState('login');
  const [nik, setNik] = useState('');
  const [visitorData, setVisitorData] = useState(null);
  const [checkInStatus, setCheckInStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  // --- LOGIC: LOGIN ---
  const handleLogin = async () => {
    if (!nik) {
      toast({ title: "NIK wajib diisi", status: "warning", position: "top", duration: 3000, isClosable: true });
      return;
    }
    setLoading(true);
    try {
      const response = await api.get(`/visitors/${nik}`);
      setVisitorData(response.data);
      setCheckInStatus(response.data.is_checked_in);
      setViewMode('dashboard');

      if (response.data.is_checked_in) {
        toast({ title: "Sesi Aktif", description: "Anda belum Check-Out.", status: "info", position: "top", duration: 3000, isClosable: true });
      }
    } catch (error) {
      toast({ title: "Data Tidak Ditemukan", status: "error", position: "top", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CHECK-IN ---
  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nik', nik);
      await api.post('/check-in/', formData);

      toast({ title: "Berhasil Masuk!", status: "success", position: "top", duration: 3000, isClosable: true });
      setCheckInStatus(true);
    } catch (error) {
      // Cek error khusus "sudah masuk"
      const msg = error.response?.data?.detail || "";
      if (msg.includes("masih di dalam") || msg.includes("sudah tercatat")) {
        setCheckInStatus(true);
        toast({ title: "Anda sudah tercatat masuk", status: "info", position: "top", duration: 3000, isClosable: true });
      } else {
        toast({ title: "Gagal Check-In", description: msg, status: "error", position: "top", duration: 3000, isClosable: true });
      }
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC: CHECK-OUT ---
  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nik', nik);
      await api.post('/check-out/', formData);

      toast({ title: "Berhasil Keluar!", status: "success", position: "top", duration: 3000, isClosable: true });

      // Kembali ke login setelah 2 detik
      setTimeout(() => {
        handleBack();
      }, 1500);
    } catch (error) {
      toast({ title: "Gagal Keluar", description: error.response?.data?.detail, status: "error", position: "top", duration: 3000, isClosable: true });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setNik('');
    setVisitorData(null);
    setViewMode('login');
    setCheckInStatus(false);
  };

  return (
    <Box bg="gray.50" minH="100vh" py={10} display="flex" alignItems="center">
      <Container maxW="md" centerContent>
        <Suspense fallback={
          <Center w="full" minH="400px">
            <Spinner size="xl" color="blue.500" thickness="4px" />
          </Center>
        }>
          {/* Render Halaman Berdasarkan Mode */}
          {viewMode === 'login' ? (
            <LoginPage
              nik={nik}
              setNik={setNik}
              handleLogin={handleLogin}
              loading={loading}
            />
          ) : (
            <DashboardPage
              visitorData={visitorData}
              handleBack={handleBack}
              handleCheckIn={handleCheckIn}
              handleCheckOut={handleCheckOut}
              checkInStatus={checkInStatus}
              loading={loading}
            />
          )}
        </Suspense>
      </Container>
    </Box>
  );
}

export default App;