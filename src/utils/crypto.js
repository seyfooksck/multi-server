const crypto = require('crypto');
const config = require('../system/config');

const algorithm = 'aes-256-cbc';
const key = config.ENCRYPTION.KEY;
const iv = config.ENCRYPTION.IV;

class CryptoService {
    /**
     * Encrypts a text or object.
     * @param {string|object} data - Data to encrypt.
     * @returns {string} - Encrypted hex string.
     */
    static encrypt(data) {
        let text = data;
        if (typeof data === 'object') {
            text = JSON.stringify(data);
        }

        const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return encrypted.toString('hex');
    }

    /**
     * Decrypts an encrypted hex string.
     * @param {string} encryptedData - Encrypted hex string.
     * @returns {string|object} - Decrypted data (parsed JSON if possible).
     */
    static decrypt(encryptedData) {
        const encryptedText = Buffer.from(encryptedData, 'hex');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        const decryptedString = decrypted.toString();

        try {
            return JSON.parse(decryptedString);
        } catch (e) {
            return decryptedString;
        }
    }
}

module.exports = CryptoService;
