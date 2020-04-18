// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

import config from "../config";
import getEncryptionKey from "./utils/getEncryptionKey";
import CustomEncrypter from "./utils/CustomEncrypter";
import formatTimestamp from "./utils/formatTimestamp";

/**
 * Get upload token by passing in a secret string as `data`
 */
const getUploadToken = async (uid: string, data: any, context: functions.https.CallableContext) => {
  console.log('getUploadToken:', 'uid', uid, 'data', data, 'ip', context.rawRequest.ip);

  let valid = false;
  if (data) {
    const uploadCodes = await retrieveUploadCodes();
    console.log('getUploadToken:', `obtained ${uploadCodes.length} upload codes`);
    valid = uploadCodes.find(x => x === data) !== undefined;
    console.log('getUploadToken:', `data is ${valid ? 'valid' : 'not valid'} code`);
  }

  if (valid) {
    const payload = Buffer.from(JSON.stringify(
      {
        uid,
        createdAt: Date.now() / 1000,
        upload: data
      }
    ));
    console.log('getUploadToken:', 'uid:', `${uid.substring(0, 8)}***`, 'createdAt:', formatTimestamp(Date.now() / 1000));

    // Prepare encrypter
    const encryptionKey = await getEncryptionKey();
    const customEncrypter = new CustomEncrypter(encryptionKey);

    // Encode payload
    const payloadData = customEncrypter.encryptAndEncode(payload);
    console.log(`getUploadToken: Completed. Payload byte size: ${payloadData.length}`);

    return {
      status: "SUCCESS",
      token: payloadData.toString('base64')
    };
  } else {
    console.log('getUploadToken:', `Invalid data: ${data}`);
    throw new functions.https.HttpsError('invalid-argument', `Invalid data: ${data}`);
  }
};

export async function storeUploadCodes(uploadCodes: string[]) {
  // Prepare encrypter
  const encryptionKey = await getEncryptionKey();
  const customEncrypter = new CustomEncrypter(encryptionKey);

  const payload = Buffer.from(JSON.stringify(uploadCodes));

  // Encode payload
  const payloadData = customEncrypter.encryptAndEncode(payload);

  const writeResult = await admin.firestore().collection('codes').doc('uploadCode').set({uploadCode: payloadData.toString('base64')});
  console.log('storeCodes:', 'upload code is stored successfully at', formatTimestamp(writeResult.writeTime.seconds));
}

export async function retrieveUploadCodes(): Promise<string[]> {
  const document = await admin.firestore().collection('codes').doc('uploadCode').get();

  // Prepare encrypter
  const encryptionKey = await getEncryptionKey();
  const customEncrypter = new CustomEncrypter(encryptionKey);

  const payloadData = Buffer.from(document.get('uploadCode'), 'base64');

  const decryptedData = customEncrypter.decodeAndDecrypt(payloadData, [payloadData.length - 32, 16, 16]);

  return JSON.parse(Buffer.from(decryptedData, 'base64').toString());
}

/**
 * Validate upload token by decrypting it and checking if it's still withing validity period
 * @param token
 * @param encryptionKey
 * @param validateTokenTimestamp
 */
export function validateToken(token: string, encryptionKey: Buffer, validateTokenTimestamp: boolean = true) {
  const payloadData = Buffer.from(token, 'base64');

  // Prepare encrypter
  const customEncrypter = new CustomEncrypter(encryptionKey);

  // Decrypt UUID
  const decryptedData = customEncrypter.decodeAndDecrypt(payloadData, [payloadData.length - 32, 16, 16]);
  console.log('checkToken:', 'decryptedData:', decryptedData, Buffer.from(decryptedData, 'base64').toString());

  const {uid, createdAt, upload} = JSON.parse(Buffer.from(decryptedData, 'base64').toString());
  console.log('checkToken:', 'uid:', `${uid.substring(0, 8)}***`, 'createdAt:', formatTimestamp(createdAt), 'upload:', upload);

  if (validateTokenTimestamp && Date.now() / 1000 - createdAt > config.upload.tokenValidityPeriod * 3600) {
    console.error(new Error(`validateToken: Upload token has expired. createdAt: ${formatTimestamp(createdAt)}, validity period (hrs): ${config.upload.tokenValidityPeriod}, now: ${formatTimestamp(Date.now() / 1000)}`));
    throw new Error('Upload token has expired.');
  }

  if (upload.length !== 6) {
    console.error(new Error('validateToken: Upload code is invalid.'));
    throw new Error('Upload code is invalid.');
  }

  // Note: Cannot validate uid as file metadata does not contain uid

  return {uid: uid, uploadCode: upload};
}

export default getUploadToken;
