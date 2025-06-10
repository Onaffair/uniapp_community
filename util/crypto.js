// crypto.js
import CryptoJS from 'crypto-js';

// 加密密钥（必须为 16、24 或 32 位字符）
const SECRET_KEY = 'onaffaironaffair';

/**
 * 加密数据（幂等）
 * @param {string} data - 需要加密的数据
 * @returns {string} - 返回加密后的字符串
 */
export function encrypt(data) {
    if (!data) return null;

    // 将密钥转换为 CryptoJS 的 WordArray 格式
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

    // 使用 AES + ECB 模式（无随机 IV，确保幂等）
    const encrypted = CryptoJS.AES.encrypt(data, key, {
        mode: CryptoJS.mode.ECB,       // 使用 ECB 模式
        padding: CryptoJS.pad.Pkcs7    // 明确填充方案
    });

    // 返回 Base64 编码的密文
    return encrypted.toString();
}

/**
 * 解密数据
 * @param {string} encryptedData - 需要解密的数据
 * @returns {string} - 返回解密后的原始数据
 */
export function decrypt(encryptedData) {
    if (!encryptedData) return null;

    // 将密钥转换为 CryptoJS 的 WordArray 格式
    const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);

    // 使用相同配置解密
    const bytes = CryptoJS.AES.decrypt(encryptedData, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    // 返回 UTF-8 解码的原始数据
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
} 