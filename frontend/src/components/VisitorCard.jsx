import {
    Box, Card, CardBody, Image, Heading, Text, Badge, Divider,
    VStack, Icon
} from '@chakra-ui/react';
import { FaIdCard } from 'react-icons/fa';

function VisitorCard({ data }) {
    // Helper: Ubah path backend jadi URL gambar
    const getPhotoUrl = (path) => {
        if (!path) return "https://via.placeholder.com/150";
        const filename = path.split(/[/\\]/).pop();
        return `http://127.0.0.1:8000/uploads/${filename}`;
    };

    return (
        <Card
            w="full"
            boxShadow="2xl"
            borderRadius="3xl"
            overflow="hidden"
            bg="white"
        >
            {/* Background Banner */}
            <Box h="100px" bgGradient="linear(to-r, blue.500, blue.600)" />

            <CardBody textAlign="center" mt="-60px">
                {/* Foto Profil dengan Border */}
                <Box position="relative" display="inline-block">
                    <Image
                        borderRadius="full"
                        boxSize="130px"
                        src={getPhotoUrl(data.photo_path)}
                        alt="Foto Profil"
                        border="5px solid white"
                        boxShadow="lg"
                        objectFit="cover"
                        bg="gray.200"
                    />
                </Box>

                <VStack spacing={1} mt={4}>
                    <Heading size="md" color="gray.700">{data.full_name}</Heading>

                    <Badge
                        colorScheme="blue"
                        variant="subtle"
                        px={3} py={1}
                        borderRadius="full"
                        fontSize="0.8em"
                    >
                        <Icon as={FaIdCard} mr={1} /> {data.nik}
                    </Badge>

                    <Text color="gray.500" fontSize="sm" fontWeight="medium">
                        {data.institution}
                    </Text>
                </VStack>

                <Divider my={6} borderColor="gray.100" />
            </CardBody>
        </Card>
    );
}

export default VisitorCard;