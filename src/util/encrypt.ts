// /src/utils/encrypt.ts
import CryptoJS from 'crypto-js';

const AES_KEY = '0F7D51C8976E46ED'; // Must be 16 chars for AES-128

/**
 * Encrypts a given text using AES encryption algorithm.
 * 
 * This function takes a plain text string as input and returns an encrypted string.
 * The encryption is performed using the AES (Advanced Encryption Standard) algorithm
 * with a predefined key. The resulting encrypted text is prefixed with "ENC:" to
 * indicate that it is an encrypted string.
 * 
 * @param {string} text - The plain text string to be encrypted.
 * 
 * @returns {string} - The encrypted text string prefixed with "ENC:".
 * 
 * Example usage:
 * 
 * const encryptedText = encryptMessage("Hello, World!");
 * console.log(encryptedText); // Output: ENC:<encrypted_string>
 */
export const encryptMessage = (text: string) => {
  const ciphertext = CryptoJS.AES.encrypt(text, AES_KEY).toString();
  return `ENC:${ciphertext}`;
};

/**
 * Decrypts a given encrypted text using AES decryption algorithm.
 * 
 * This function takes an encrypted text string as input and returns the decrypted plain text string.
 * The decryption is performed using the AES (Advanced Encryption Standard) algorithm with a predefined key.
 * The input encrypted text must be prefixed with "ENC:" to indicate that it is an encrypted string.
 * If the decryption fails or the input text is not prefixed with "ENC:", the original input text is returned.
 * 
 * @param {string} cipher - The encrypted text string to be decrypted.
 * 
 * @returns {string} - The decrypted plain text string or the original input text if decryption fails.
 * 
 * Example usage:
 * 
 * const decryptedText = decryptMessage("ENC:<encrypted_string>");
 * console.log(decryptedText); // Output: Hello, World!
 * 
 * The function performs the following steps:
 * 1. Checks if the input text starts with "ENC:". If not, returns the original input text.
 * 2. Strips the "ENC:" prefix from the input text to get the encrypted part.
 * 3. Decrypts the encrypted part using the AES algorithm and the predefined key.
 * 4. Converts the decrypted bytes to a UTF-8 string.
 * 5. If the decryption is successful, returns the decrypted plain text string.
 * 6. If the decryption fails, logs a warning and returns the original input text.
 */
export const decryptMessage = (cipher: string) => {
  try {
    if (!cipher.startsWith("ENC:")) return cipher;
    const encryptedPart = cipher.slice(4); // strip "ENC:"
    const bytes = CryptoJS.AES.decrypt(encryptedPart, AES_KEY);
    const plaintext = bytes.toString(CryptoJS.enc.Utf8);

    if (!plaintext) throw new Error("Failed to decrypt");
    return plaintext;
  } catch (err) {
    console.warn("Decryption failed. Returning original text.", err);
    return cipher;
  }
};
