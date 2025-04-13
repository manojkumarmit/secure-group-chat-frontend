import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch signed URLs for media files.
 * 
 * This hook takes an array of media URLs and returns an object where the keys are the original media URLs
 * and the values are the corresponding signed URLs. The signed URLs are fetched from the server to allow
 * secure access to the media files.
 * 
 * @param {Array<string | undefined>} mediaUrls - An array of media URLs for which signed URLs are to be fetched.
 * 
 * @returns {Object} - An object where the keys are the original media URLs and the values are the signed URLs.
 * 
 * The hook uses the following state:
 * - signedUrls: An object to store the mapping of original media URLs to signed URLs.
 * 
 * The hook uses the following effect:
 * - useEffect: Fetches the signed URLs whenever the mediaUrls array changes.
 * 
 * The hook defines the following function:
 * - fetchSignedUrls: An asynchronous function that iterates over the mediaUrls array, fetches the signed URL
 *   for each media URL from the server, and updates the signedUrls state with the fetched signed URLs.
 * 
 * The fetchSignedUrls function performs the following steps:
 * 1. Initializes an empty object to store the mapping of original media URLs to signed URLs.
 * 2. Iterates over the mediaUrls array.
 * 3. For each media URL, splits the URL to extract the key (removing the bucket and region).
 * 4. Sends a request to the server to fetch the signed URL for the media file using the extracted key.
 * 5. Updates the mapping object with the original media URL as the key and the fetched signed URL as the value.
 * 6. Updates the signedUrls state with the mapping object.
 */
const useSignedURLs = (mediaUrls: (string | undefined)[]) => {
    const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const fetchSignedUrls = async () => {
            const urls: { [key: string]: string } = {};
            for (const mediaUrl of mediaUrls) {
                if (mediaUrl) {
                    const urlParts = mediaUrl.split('/');
                    const key = urlParts.slice(3).join('/'); // remove bucket & region
                    const res = await fetch(`/api/upload/presigned-download-url?key=${encodeURIComponent(key)}`);
                    const { signedUrl } = await res.json();
                    urls[mediaUrl] = signedUrl;
                }
            }
            setSignedUrls(urls);
        };

        fetchSignedUrls();
    }, [mediaUrls]);

    return signedUrls;
};

export default useSignedURLs;