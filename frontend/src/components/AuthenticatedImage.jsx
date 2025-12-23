// File: frontend/src/components/AuthenticatedImage.jsx
// Component wrapper for displaying images that require authentication

import { useState, useEffect } from 'react';
import { Image, Spinner, Center } from '@chakra-ui/react';
import { getAuthenticatedImageUrl, revokeBlobUrls } from '../utils/imageHelper';

function AuthenticatedImage({ filename, fallbackSrc = "https://via.placeholder.com/150", alt = "Foto pengunjung", ...props }) {
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!filename) {
            setLoading(false);
            return;
        }

        let isMounted = true;

        const loadImage = async () => {
            setLoading(true);
            setError(false);

            try {
                const url = await getAuthenticatedImageUrl(filename);

                if (isMounted) {
                    if (url) {
                        setImageUrl(url);
                    } else {
                        setError(true);
                    }
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadImage();

        // Cleanup: revoke blob URL when component unmounts
        return () => {
            isMounted = false;
            if (imageUrl) {
                revokeBlobUrls(imageUrl);
            }
        };
    }, [filename]);

    if (loading) {
        return (
            <Center {...props}>
                <Spinner size="sm" color="#1a73e8" />
            </Center>
        );
    }

    return (
        <Image
            src={error ? fallbackSrc : (imageUrl || fallbackSrc)}
            alt={alt}
            {...props}
            onError={() => setError(true)}
        />
    );
}

export default AuthenticatedImage;
