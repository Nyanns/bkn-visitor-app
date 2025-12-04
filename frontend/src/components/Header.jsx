import { Box, Heading, Text, Icon, VStack, Center } from '@chakra-ui/react';
import { FaBuilding } from 'react-icons/fa';

function Header() {
    return (
        <VStack spacing={2} mb={8}>
            <Center
                bg="blue.600"
                w="16" h="16"
                borderRadius="xl"
                boxShadow="lg"
            >
                <Icon as={FaBuilding} w={8} h={8} color="white" />
            </Center>
            <Box textAlign="center">
                <Heading color="blue.800" size="lg" letterSpacing="tight">
                    Buku Tamu Digital
                </Heading>
                <Text color="gray.500" fontWeight="medium">
                    Direktorat Infrastruktur Teknologi Informasi dan Keamanan Informasi
                </Text>
            </Box>
        </VStack>
    );
}

export default Header;