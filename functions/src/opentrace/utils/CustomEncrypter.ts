import * as crypto from "crypto";
import config from "../../config";

class CustomEncrypter {

  algorithm: string;
  key: Buffer;

  constructor(key: Buffer, algorithm: string = config.encryption.defaultAlgorithm) {
    this.algorithm = algorithm;
    this.key = key;
  }

  decode(encodedData: Buffer, lengths: number[]): string[] {
    const [cipherData, ivData, authTagData] = lengths.map((e, i) => Buffer.alloc(lengths[i]));
    encodedData.copy(cipherData, 0, 0, lengths[0]);
    encodedData.copy(ivData, 0, lengths[0], lengths[0] + lengths[1]);
    encodedData.copy(authTagData, 0, lengths[0] + lengths[1], lengths[0] + lengths[1] + lengths[2]);

    return [
      cipherData.toString('base64'),
      ivData.toString('base64'),
      authTagData.toString('base64')
    ];
  }

  decrypt(cipherText: string, iv: string, authTag: string) {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, 'base64'));
    // Add ts-ignore due to build error TS2339: Property 'setAuthTag' does not exist on type 'Decipher'.
    // @ts-ignore
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    // @ts-ignore
    let plainText = decipher.update(cipherText, 'base64', 'base64');
    plainText += decipher.final('base64');
    return plainText;
  }

  encode(cipherText: string, iv: string, authTag: string): Buffer {
    const [cipherData, ivData, authTagData] = [cipherText, iv, authTag].map(e => Buffer.from(e, 'base64'));
    const buffer = Buffer.alloc(cipherData.length + ivData.length + authTagData.length);
    cipherData.copy(buffer, 0);
    ivData.copy(buffer, cipherData.length);
    authTagData.copy(buffer, cipherData.length + ivData.length);

    return buffer;
  }

  encrypt(data: Buffer, ivLength = 16, authTagLength = 16): string[] {
    const dataB64 = data.toString('base64');
    const iv = crypto.randomBytes(ivLength);
    // @ts-ignore
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv, {authTagLength});

    let cipherText = cipher.update(dataB64, 'base64', 'base64');
    cipherText += cipher.final('base64');
    return [
      cipherText,
      iv.toString('base64'),
      cipher.getAuthTag().toString('base64')
    ];
  }

  encryptAndEncode(data: Buffer, ivLength = 16, authTagLength = 16): Buffer {
    const [cipherTextB64, ivB64, authTagB64] = this.encrypt(data, ivLength, authTagLength);
    return this.encode(cipherTextB64, ivB64, authTagB64);
  }

  decodeAndDecrypt(encodedData: Buffer, lengths: number[]): string {
    const [decodedCipherTextB64, decodedIvB64, decodedAuthTagB64] = this.decode(encodedData, lengths);
    return this.decrypt(decodedCipherTextB64, decodedIvB64, decodedAuthTagB64);
  }
}

export default CustomEncrypter;
