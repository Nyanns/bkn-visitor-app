import { useState, lazy, Suspense, useRef, useEffect } from 'react';
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

  // Use ref to track status for polling to avoid dependency loops or stale closures
  const checkInStatusRef = useRef(checkInStatus);
  useEffect(() => {
    checkInStatusRef.current = checkInStatus;
  }, [checkInStatus]);

  // --- AUTO-POLLING (Real-time Simulation) ---
  useEffect(() => {
    let intervalId;
    if (viewMode === 'dashboard' && nik) {
      intervalId = setInterval(async () => {
        try {
          // Silent background update
          const response = await api.get(`/visitors/${nik}`);
          const newStatus = response.data.is_checked_in;
          const currentStatus = checkInStatusRef.current;

          if (currentStatus !== newStatus) {
            setCheckInStatus(newStatus);

            // Side effect safely outside setState
            if (currentStatus === true && newStatus === false) {
              toast({
                title: "Permintaan Selesai",
                description: "Checkout diproses oleh Admin.",
                status: "info",
                position: "top",
                duration: 3000
              });
            }
          }
          setVisitorData(response.data);
        } catch (err) {
          // Ignore silent errors
        }
      }, 5000); // Poll every 5 seconds
    }
    return () => clearInterval(intervalId);
  }, [viewMode, nik, toast]);

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

  // --- LOGIC: CHECK-IN SUCCESS (Called from DashboardPage after successful check-in) ---
  const refreshAfterCheckIn = async () => {
    try {
      const response = await api.get(`/visitors/${nik}`);
      setVisitorData(response.data);
      setCheckInStatus(response.data.is_checked_in);
    } catch (error) {
      console.error('Failed to refresh visitor data:', error);
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

      // IMMEDIATE UI UPDATE:
      setCheckInStatus(false);

      // Refresh visitor data to update history list (Active -> Done)
      const visitorResponse = await api.get(`/visitors/${nik}`);
      setVisitorData(visitorResponse.data);

      toast({ title: "Berhasil Keluar!", status: "success", position: "top", duration: 3000, isClosable: true });

      // Kembali ke login setelah 2 detik
      setTimeout(() => {
        handleBack();
      }, 1500);
    } catch (error) {
      const msg = error.response?.data?.detail || "";
      if (error.response?.status === 400 && msg.includes("Belum Check-In")) {
        // Case: User was force checked-out by admin (or stale state).
        // Treat as success: Update UI to "Checked Out"
        setCheckInStatus(false);
        const visitorResponse = await api.get(`/visitors/${nik}`);
        setVisitorData(visitorResponse.data);

        toast({
          title: "Sesi Sudah Berakhir",
          description: "Anda sudah tercatat check-out sebelumnya.",
          status: "warning",
          position: "top",
          duration: 3000,
          isClosable: true
        });

        setTimeout(() => {
          handleBack();
        }, 1500);
      } else {
        toast({ title: "Gagal Keluar", description: msg, status: "error", position: "top", duration: 3000, isClosable: true });
      }
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
    <Suspense fallback={
      <Center w="full" minH="100vh">
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
          handleCheckOut={confirmCheckOut}
          checkInStatus={checkInStatus}
          loading={loading}
          onCheckInSuccess={refreshAfterCheckIn}
        />
      )}

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
    </Suspense>
  );
}

export default App;
