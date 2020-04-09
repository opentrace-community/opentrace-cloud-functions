import * as moment from "moment";

import config from "../config";
import CustomEncrypter from "./utils/CustomEncrypter";
import getEncryptionKey from "./utils/getEncryptionKey";

const UID_SIZE = 21;
const TIME_SIZE = 4;
// 21 bytes for UID, 4 bytes each for creation and expiry timestamp
const TEMPID_SIZE = UID_SIZE + TIME_SIZE * 2;
const IV_SIZE = 16;
const AUTHTAG_SIZE = 16;

const getTempIDs = async (uid: string) => {
  console.log('getTempIDs:', 'uid', uid);

  const encryptionKey = await getEncryptionKey();

  const tempIDs = await Promise.all(
    [...Array(config.tempID.batchSize).keys()].map(
      async (i) => generateTempId(encryptionKey, uid, i)
    )
  );

  console.log('getTempIDs:', 'Success. TempID count:', tempIDs.length);
  return {
    status: 'SUCCESS',
    tempIDs: tempIDs,
    refreshTime: moment().unix() + 3600 * config.tempID.refreshInterval,
  }
};

async function generateTempId(encryptionKey: Buffer, uid: string, i: number) {
  // allow the first message to be valid a minute earlier
  const start = moment().unix() + 3600 * config.tempID.validityPeriod * i - 60;
  const expiry = start + 3600 * config.tempID.validityPeriod;

  // Prepare encrypter
  const customEncrypter = new CustomEncrypter(encryptionKey);

  // Encrypt UID, start, expiry and encode payload
  // 21 bytes for UID, 4 bytes each for start and expiry timestamp
  const plainData = Buffer.alloc(TEMPID_SIZE);
  plainData.write(uid, 0, UID_SIZE, 'base64');
  plainData.writeInt32BE(start, UID_SIZE);
  plainData.writeInt32BE(expiry, UID_SIZE + TIME_SIZE);

  const encodedData = customEncrypter.encryptAndEncode(plainData);

  const tempID = encodedData.toString('base64');

  return {
    tempID: tempID,
    startTime: start,
    expiryTime: expiry,
  }
}

export function decryptTempID(tempID: string, encryptionKey: Buffer): { uid: string; startTime: number; expiryTime: number } {
  const payloadData = Buffer.from(tempID, 'base64');

  // Prepare encrypter
  const customEncrypter = new CustomEncrypter(encryptionKey);

  // Decrypt UUID
  const decryptedB64 = customEncrypter.decodeAndDecrypt(payloadData, [TEMPID_SIZE, IV_SIZE, AUTHTAG_SIZE]);
  const decryptedData = Buffer.from(decryptedB64, 'base64');

  const uid = decryptedData.toString('base64', 0, UID_SIZE);
  const startTime = decryptedData.readInt32BE(UID_SIZE);
  const expiryTime = decryptedData.readInt32BE(UID_SIZE + TIME_SIZE);

  return {
    uid: uid,
    startTime: startTime,
    expiryTime: expiryTime
  };
}

export default getTempIDs;
