// File: frontend/src/components/Header.jsx
// Google Material Design Style
import { VStack, Heading, Text, Flex } from '@chakra-ui/react';
import { FaBuilding } from 'react-icons/fa';

function Header() {
    return (
        <VStack spacing={3} mb={6}>
            <Flex
                w="72px"
                h="72px"
                bg="#1a73e8"
                borderRadius="18px"
                align="center"
                justify="center"
                boxShadow="0 4px 12px rgba(26,115,232,0.4)"
            >
                <FaBuilding color="white" size="32px" />
            </Flex>
            <VStack spacing={1}>
                <Heading
                    size="lg"
                    color="#202124"
                    fontFamily="'Google Sans', 'Inter', sans-serif"
                    fontWeight="400"
                >
                    Buku Tamu Digital
                </Heading>
                <Text color="#3c4043" fontSize="sm" fontWeight="500" textAlign="center">
                    Direktorat Infrastruktur TI & Keamanan Informasi
                </Text>
                <Text color="#9aa0a6" fontSize="xs">
                    Badan Kepegawaian Negara
                </Text>
            </VStack>
        </VStack>
    );
}

export default Header;
