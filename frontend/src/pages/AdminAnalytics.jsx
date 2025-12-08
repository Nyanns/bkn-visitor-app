// File: frontend/src/pages/AdminAnalytics.jsx
// FAANG Quality - Advanced Analytics Dashboard
import { useState, useEffect } from 'react';
import {
    Box, Heading, SimpleGrid, Text, Flex, Icon, Spinner, Center,
    Card, CardHeader, CardBody, useColorModeValue, Select, HStack,
    Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Skeleton,
    Badge, Fade
} from '@chakra-ui/react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { FaChartLine, FaChartPie, FaClock, FaCalendarAlt, FaArrowLeft, FaFilter, FaUsers } from 'react-icons/fa';
import api from '../api';
import { useNavigate } from 'react-router-dom';

// --- Components ---

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                bg="rgba(255, 255, 255, 0.95)"
                p={4}
                boxShadow="xl"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.100"
                backdropFilter="blur(8px)"
            >
                <Text fontWeight="700" fontSize="sm" color="gray.700" mb={1}>{label}</Text>
                <HStack spacing={2}>
                    <Box w="8px" h="8px" borderRadius="full" bg="#1a73e8" />
                    <Text color="#1a73e8" fontWeight="600" fontSize="md">{`${payload[0].value} Visitors`}</Text>
                </HStack>
            </Box>
        );
    }
    return null;
};

const StatCard = ({ label, value, icon, helpText, trend, colorScheme = "blue" }) => {
    const bg = useColorModeValue('white', 'gray.800');
    return (
        <Card
            bg={bg}
            borderRadius="xl"
            boxShadow="sm"
            border="1px solid"
            borderColor={useColorModeValue('gray.100', 'gray.700')}
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
        >
            <CardBody>
                <Flex justify="space-between" align="start" mb={2}>
                    <Stat>
                        <StatLabel fontSize="xs" fontWeight="700" letterSpacing="0.5px" textTransform="uppercase" color="gray.500">
                            {label}
                        </StatLabel>
                        <StatNumber fontSize="3xl" fontWeight="800" color="gray.800">
                            {value}
                        </StatNumber>
                        {helpText && (
                            <StatHelpText mb={0} fontSize="xs" fontWeight="500">
                                {trend && <StatArrow type={trend} />}
                                {helpText}
                            </StatHelpText>
                        )}
                    </Stat>
                    <Box
                        p={2}
                        bg={`${colorScheme}.50`}
                        color={`${colorScheme}.600`}
                        borderRadius="lg"
                    >
                        <Icon as={icon} boxSize={5} />
                    </Box>
                </Flex>
            </CardBody>
        </Card>
    );
};

function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterDays, setFilterDays] = useState(30); // Default 30 days
    const navigate = useNavigate();

    // Theme Colors
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC'];

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Show loading when filter changes
            try {
                const response = await api.get('/analytics/dashboard', {
                    params: { days: filterDays }
                });
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };
        fetchData();
    }, [filterDays]); // Re-run when filterDays changes

    // Loading Skeleton
    if (loading) {
        return (
            <Box bg="#f8f9fa" minH="100vh" p={{ base: 4, md: 8 }}>
                <Flex justify="space-between" align="center" mb={8}>
                    <Box>
                        <Skeleton height="20px" width="150px" mb={2} />
                        <Skeleton height="32px" width="300px" />
                    </Box>
                    <Skeleton height="40px" width="150px" borderRadius="md" />
                </Flex>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Skeleton height="120px" borderRadius="xl" />
                    <Skeleton height="120px" borderRadius="xl" />
                    <Skeleton height="120px" borderRadius="xl" />
                    <Skeleton height="400px" borderRadius="xl" gridColumn={{ md: "span 2" }} />
                    <Skeleton height="400px" borderRadius="xl" />
                </SimpleGrid>
            </Box>
        );
    }

    if (!data) return null;

    return (
        <Fade in={true}>
            <Box bg="#f8f9fa" minH="100vh" p={{ base: 4, md: 8 }} fontFamily="'Inter', sans-serif">
                {/* Header */}
                <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} mb={8} gap={4}>
                    <Box>
                        <Flex align="center" mb={2} cursor="pointer" onClick={() => navigate('/admin/dashboard')} color="gray.500" _hover={{ color: "#1a73e8" }} transition="color 0.2s">
                            <Icon as={FaArrowLeft} mr={2} boxSize={3} />
                            <Text fontSize="xs" fontWeight="600" letterSpacing="0.5px">DASHBOARD</Text>
                        </Flex>
                        <Heading size="lg" color="gray.800" fontWeight="800" letterSpacing="-0.5px">
                            Analytics Overview
                        </Heading>
                        <Text color="gray.500" fontSize="md" mt={1}>
                            Insight mendalam tentang aktivitas pengunjung Data Center.
                        </Text>
                    </Box>

                    {/* Filter Mockup */}
                    <HStack spacing={3}>
                        <Flex align="center" bg="white" px={3} py={2} borderRadius="md" border="1px solid" borderColor="gray.200" boxShadow="sm" color="gray.600" fontSize="sm" fontWeight="500" cursor="pointer" _hover={{ bg: "gray.50" }}>
                            <Icon as={FaFilter} mr={2} color="gray.400" />
                            <Text>Filter</Text>
                        </Flex>
                        <Select
                            w="180px"
                            bg="white"
                            size="md"
                            borderRadius="md"
                            fontWeight="500"
                            borderColor="gray.200"
                            boxShadow="sm"
                            value={filterDays}
                            onChange={(e) => setFilterDays(parseInt(e.target.value))}
                            focusBorderColor="blue.500"
                        >
                            <option value="7">7 Hari Terakhir</option>
                            <option value="30">30 Hari Terakhir</option>
                            <option value="90">3 Bulan Terakhir</option>
                        </Select>
                    </HStack>
                </Flex>

                {/* KPI Cards */}
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
                    <StatCard
                        label="Total Kunjungan"
                        value={data.summary.total_visits}
                        icon={FaUsers}
                        helpText="Semua waktu"
                        colorScheme="blue"
                    />
                    <StatCard
                        label="Kunjungan Hari Ini"
                        value={data.summary.visits_today}
                        icon={FaCalendarAlt}
                        helpText="Update realtime"
                        trend={data.summary.visits_today > 0 ? "increase" : undefined}
                        colorScheme="green"
                    />
                    <StatCard
                        label="Top Instansi"
                        value={data.institutions[0]?.name || "-"}
                        icon={FaChartPie}
                        helpText={`${data.institutions[0]?.count || 0} kunjungan`}
                        colorScheme="purple"
                    />
                </SimpleGrid>

                {/* Charts Grid */}
                <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>

                    {/* 1. Monthly Trend */}
                    <Card gridColumn={{ lg: "span 2" }} bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor} overflow="hidden">
                        <CardHeader pb={2}>
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Heading size="sm" color="gray.800" fontWeight="700">Tren Kunjungan</Heading>
                                    <Text fontSize="xs" color="gray.500" mt={1}>Grafik {filterDays} hari terakhir</Text>
                                </Box>
                                <Badge colorScheme="blue" variant="subtle" borderRadius="full" px={2}>Daily</Badge>
                            </Flex>
                        </CardHeader>
                        <CardBody>
                            <Box w="100%" h="320px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#1a73e8" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: '#9aa0a6' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(str) => {
                                                const d = new Date(str);
                                                return `${d.getDate()}/${d.getMonth() + 1}`;
                                            }}
                                            dy={10}
                                        />
                                        <YAxis tick={{ fontSize: 11, fill: '#9aa0a6' }} tickLine={false} axisLine={false} />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#1a73e8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Area
                                            type="monotone"
                                            dataKey="count"
                                            stroke="#1a73e8"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorVisits)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>

                    {/* 2. Top Institutions (Donut Chart) */}
                    <Card bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <Heading size="sm" color="gray.800" fontWeight="700">Distribusi Instansi</Heading>
                            <Text fontSize="xs" color="gray.500" mt={1}>Top 5 instansi pengunjung</Text>
                        </CardHeader>
                        <CardBody position="relative">
                            <Box w="100%" h="250px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.institutions}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="count"
                                            cornerRadius={4}
                                        >
                                            {data.institutions.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Center Label */}
                                <Box position="absolute" top="38%" left="0" right="0" textAlign="center" pointerEvents="none">
                                    <Text fontSize="3xl" fontWeight="800" color="gray.700" lineHeight="1">
                                        {data.institutions.reduce((acc, curr) => acc + curr.count, 0)}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500" fontWeight="600" textTransform="uppercase">Total</Text>
                                </Box>
                            </Box>

                            {/* Custom Legend */}
                            <Box mt={2}>
                                {data.institutions.slice(0, 4).map((entry, index) => (
                                    <Flex key={index} justify="space-between" align="center" mb={2} fontSize="sm">
                                        <HStack>
                                            <Box w="8px" h="8px" borderRadius="full" bg={COLORS[index % COLORS.length]} />
                                            <Text color="gray.600" noOfLines={1} maxW="150px" title={entry.name}>{entry.name}</Text>
                                        </HStack>
                                        <Text fontWeight="600" color="gray.800">{entry.count}</Text>
                                    </Flex>
                                ))}
                            </Box>
                        </CardBody>
                    </Card>

                    {/* 3. Hourly Heatmap */}
                    <Card gridColumn={{ lg: "span 3" }} bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px solid" borderColor={borderColor}>
                        <CardHeader pb={2}>
                            <Flex justify="space-between" align="center">
                                <Box>
                                    <Heading size="sm" color="gray.800" fontWeight="700">Heatmap Kunjungan</Heading>
                                    <Text fontSize="xs" color="gray.500" mt={1}>Rata-rata kepadatan pengunjung per jam</Text>
                                </Box>
                                <Flex align="center" color="gray.500" fontSize="xs">
                                    <Icon as={FaClock} mr={1} />
                                    <Text>24 Jam</Text>
                                </Flex>
                            </Flex>
                        </CardHeader>
                        <CardBody>
                            <Box w="100%" h="280px">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.heatmap} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={32}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f3f4" />
                                        <XAxis
                                            dataKey="hour"
                                            tickFormatter={(tick) => `${tick}:00`}
                                            tick={{ fontSize: 11, fill: '#9aa0a6' }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis tick={{ fontSize: 11, fill: '#9aa0a6' }} tickLine={false} axisLine={false} />
                                        <RechartsTooltip
                                            cursor={{ fill: '#f8f9fa' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <Box bg="gray.800" color="white" p={3} borderRadius="md" boxShadow="xl">
                                                            <Text fontWeight="700" fontSize="sm">{`${label}:00 - ${label + 1}:00`}</Text>
                                                            <Text color="green.300" fontSize="sm" mt={1}>{`${payload[0].value} Pengunjung`}</Text>
                                                        </Box>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 6, 6]}>
                                            {data.heatmap.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.count >= 5 ? '#1a73e8' : entry.count >= 2 ? '#8ab4f8' : '#e8f0fe'}
                                                    strokeWidth={0}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardBody>
                    </Card>

                </SimpleGrid>
            </Box>
        </Fade>
    );
}

export default AdminAnalytics;
