// File: frontend/src/components/VisitorCard.jsx
// Google Material Design Style
import {
    Box, Image, Heading, Text, Badge, VStack, HStack, Flex
} from '@chakra-ui/react';
import { FaIdCard, FaBuilding } from 'react-icons/fa';
import AuthenticatedImage from './AuthenticatedImage';

function VisitorCard({ data }) {
    if (!data) return null;

    const getFilename = (path) => {
        if (!path) return null;
        return path.split(/[/\\]/).pop();
    };

    return (
        <Box
            w="full"
            bg="white"
            borderRadius="20px"
            boxShadow="0 1px 3px 0 rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15)"
            overflow="hidden"
        >
            {/* Gradient Header */}
            <Box
                h="80px"
                bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
            />

            {/* Profile Content */}
            <Box textAlign="center" mt="-50px" pb={6} px={6}>
                {/* Photo */}
                <AuthenticatedImage
                    filename={getFilename(data.photo_path)}
                    borderRadius="full"
                    boxSize="100px"
                    border="4px solid white"
                    boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                    objectFit="cover"
                    bg="#f8f9fa"
                    mx="auto"
                    fallbackSrc="https://via.placeholder.com/150"
                />

                {/* Info */}
                <VStack spacing={2} mt={4}>
                    <Heading
                        size="md"
                        color="#202124"
                        fontFamily="'Google Sans', 'Inter', sans-serif"
                        fontWeight="500"
                    >
                        {data.full_name || "Nama Tidak Ada"}
                    </Heading>

                    <Badge
                        bg="#e8f0fe"
                        color="#1a73e8"
                        px={4}
                        py={1.5}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="500"
                    >
                        <HStack spacing={2}>
                            <FaIdCard />
                            <Text>{data.nik || "-"}</Text>
                        </HStack>
                    </Badge>

                    <HStack spacing={1} color="#3c4043">
                        <FaBuilding size="12px" />
                        <Text fontSize="sm">
                            {data.institution || "Instansi Tidak Diketahui"}
                        </Text>
                    </HStack>
                </VStack>
            </Box>
        </Box>
    );
}

export default VisitorCard;
