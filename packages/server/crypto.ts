import { AES, mode, enc } from "crypto-js";
import { crc32 } from "easy-crc";

const firstCRCPart = crc32(
    "CRC-32",
    "I meant what I said and I said what I meant."
).toString(16);

const secondCRCPart = crc32(
    "CRC-32",
    "A pirate's faithful one-hundred percent!"
).toString(16);

const keys = [
    "aes_is_quite_tuf",
    "ee.vidbox.client",
    firstCRCPart + secondCRCPart,
];

export async function encrypt(input: string) {
    for (let i = 0; i < keys.length; i++) {
        input = await encryptOnce(input, keys[i]);
    }
    return input;
}

async function encryptOnce(input: string, key: string) {
    return AES.encrypt(input, enc.Utf8.parse(key), {
        mode: mode.ECB,
    }).toString();
}

export async function decrypt(input: string): Promise<string> {
    for (let i = keys.length - 1; i >= 0; i--) {
        input = await decryptOnce(input, keys[i]);
    }
    return input;
}

async function decryptOnce(input: string, key: string): Promise<string> {
    return AES.decrypt(input, enc.Utf8.parse(key), {
        mode: mode.ECB,
    }).toString(enc.Utf8);
}

// console.log(`inited with keys: ${keys}`);

// const encrypted_data = await encrypt("super secret data");
// console.log(`encrypted_data: ${encrypted_data}`);
// console.log(await decrypt(encrypted_data));

// console.log(firstCRCPart, secondCRCPart);
