import { useState, lazy, Suspense, useRef } from 'react';
import {
  Box, Container, useToast, Spinner, Center,
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Button
} from '@chakra-ui/react';
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
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  const cancelRef = useRef();

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
      toast({
        title: "Data Tidak Ditemukan",
        description: "NIK/NIP belum terdaftar. Silakan hubungi resepsionis untuk registrasi terlebih dahulu.",
        status: "error",
        position: "top",
        duration: 5000,
        isClosable: true
      });
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
      const response = await api.post('/check-in/', formData);

      // Show success with timestamp
      const checkInTime = response.data.time || new Date().toLocaleTimeString('id-ID');
      toast({
        title: "Check-In Berhasil!",
        description: `Waktu check-in: ${checkInTime} WIB`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true
      });
      setCheckInStatus(true);

      // Refresh visitor data to update check-in time display
      const visitorResponse = await api.get(`/visitors/${nik}`);
      setVisitorData(visitorResponse.data);
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
  const confirmCheckOut = () => {
    setIsCheckOutDialogOpen(true);
  };

  const handleCheckOut = async () => {
    setIsCheckOutDialogOpen(false);
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
              handleCheckOut={confirmCheckOut}
              checkInStatus={checkInStatus}
              loading={loading}
            />
          )}
        </Suspense>

        {/* Check-Out Confirmation Dialog */}
        <AlertDialog
          isOpen={isCheckOutDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsCheckOutDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Konfirmasi Check-Out
              </AlertDialogHeader>

              <AlertDialogBody>
                Apakah Anda yakin ingin check-out? Anda akan kembali ke halaman login.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsCheckOutDialogOpen(false)}>
                  Batal
                </Button>
                <Button colorScheme="red" onClick={handleCheckOut} ml={3} isLoading={loading}>
                  Ya, Check-Out
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
}

export default App;
