// File: frontend/src/utils/imageHelper.js
// Helper untuk fetch images dengan authentication

import api from '../api';

/**
 * Get authenticated image URL that works with <Image> component
 * Creates a blob URL from authenticated API call
 * @param {string} filename - The filename from backend (e.g., "abc-123.jpg")
 * @returns {Promise<string>} - Blob URL to use in <Image src={...} />
 */
export const getAuthenticatedImageUrl = async (filename) => {
    if (!filename) return null;

    try {
        // Fetch image with authentication token
        const response = await api.get(`/uploads/${filename}`, {
            responseType: 'blob' // Important: get binary data
        });

        // Create blob URL
        const blobURL = URL.createObjectURL(response.data);
        return blobURL;
    } catch (error) {
        console.error('Failed to fetch image:', error);
        return null; // Return null, use fallback image
    }
};

/**
 * Fetch multiple images at once
 * @param {string[]} filenames - Array of filenames
 * @returns {Promise<Object>} - Object mapping filename to blob URL
 */
export const getAuthenticatedImages = async (filenames) => {
    const promises = filenames.map(async (filename) => {
        const url = await getAuthenticatedImageUrl(filename);
        return { filename, url };
    });

    const results = await Promise.all(promises);

    // Convert to object: { filename: url }
    return results.reduce((acc, { filename, url }) => {
        acc[filename] = url;
        return acc;
    }, {});
};

/**
 * Cleanup blob URLs when component unmounts
 * @param {string|string[]} urls - Single URL or array of URLs to revoke
 */
export const revokeBlobUrls = (urls) => {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    urlArray.forEach(url => {
        if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    });
};
