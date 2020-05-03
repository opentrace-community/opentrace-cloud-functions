import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as moment from "moment";
import * as path from "path";

import StreetPassRecord from "./types/StreetPassRecord";
import config from "../config";

import { decryptTempID } from "./getTempIDs";
import { validateToken } from "./getUploadToken";
import { getAllEncryptionKeys } from "./utils/getEncryptionKey";
import formatTimestamp from "./utils/formatTimestamp";
import { storeUploadLog } from "./utils/AuditLogger";

/**
 * Process user's uploaded data.
 *
 * Most important tasks:
 *  + Validate upload token to get uid
 *  + Post-process records (e.g., validate exchanged messages, decrypt TempIDs)
 *  + Forward data for further processing
 */
export default async function processUploadedData(object: functions.storage.ObjectMetadata) {
  const filePath = object.name;

  console.log('processUploadedData:', 'Detected new file:', filePath);

  if (filePath !== undefined && filePath.startsWith(config.upload.recordsDir) && filePath.endsWith('.json')) {
    const fileName = path.basename(filePath, '.json');
    let archiveFilePath = filePath;
    console.log('processUploadedData:', 'File is streetPassRecords, content type:', object.contentType);
    await storeUploadLog(fileName, {
      fileName: fileName,
      status: 'STARTED',
      loggedTime: Date.now() / 1000
    });

    const step = "0 - move file";
    try {
      const uploadFile = admin.storage().bucket(object.bucket).file(filePath);
      console.log('processUploadedData:', 'Uploaded file md5Hash', object.md5Hash);

      //
      // Step 0: Move file to archive bucket
      //
      if (!archiveFilePath.startsWith(`${config.upload.recordsDir}/20`)) {
        // Put file into date folder if filepath doesn't contain date
        archiveFilePath = archiveFilePath.replace(config.upload.recordsDir, `${config.upload.recordsDir}/${formatTimestamp(moment().unix(), "YYYYMMDD")}`)
      }
      const archivedFile = admin.storage().bucket(config.upload.bucketForArchive).file(archiveFilePath);
      await uploadFile.copy(archivedFile);
      await uploadFile.delete();
      console.log('processUploadedData:', `"step ${step}"`, 'Uploaded file has been moved to archive folder.');
    } catch (error) {
      console.error(new Error(`processUploadedData: "step ${step}" Error encountered, message: ${error.message}. Stack trace:\n${error.stack}`));
      await storeUploadLog(fileName, {
        fileName: fileName,
        id: '',
        status: 'ERROR',
        step: step,
        errorMessage: error.message,
        errorStackTrace: error.stack,
        loggedTime: Date.now() / 1000
      });

      return {
        status: 'ERROR'
      };
    }

    return _processUploadedData(archiveFilePath);
  } else {
    console.log('processUploadedData:', 'File is not streetPassRecords, ignore.');

    return {
      status: 'NONE'
    };
  }
}

export async function _processUploadedData(filePath: string, validateTokenTimestamp: boolean = true): Promise<{ status: string; message?: string; filePath?: string }> {
  const fileName = path.basename(filePath, '.json');
  let uid = '', uploadCode = '', step = '';

  try {
    //
    // Step 1: load file content into memory
    //
    step = "1 - load file";
    const { token, records, events } = JSON.parse(await getStorageData(config.upload.bucketForArchive, filePath));
    console.log('processUploadedData:', `"step ${step}"`, 'File is loaded, record count:', records.length);

    //
    // Step 2: Validate upload token to get uid
    //
    step = "2 - validate upload token";
    ({ uid, uploadCode } = await validateToken(token, validateTokenTimestamp));
    console.log('processUploadedData:', `"step ${step}"`, 'Upload token is valid, id:', uid);

    //
    // Step 3: Post-process records (e.g., validate, decrypt the contact's phone number)
    //
    step = "3 - post-process records";
    const validatedRecords = await validateRecords(records);
    console.log('processUploadedData:', `"step ${step}"`, 'Complete validation of records,', 'original count:', records.length, 'after validation:', validatedRecords.length);

    //
    // Step 4: Forward validated data for further processing
    //
    step = "4 - forward data";
    await config.upload.dataForwarder.forwardData(filePath, uid, uploadCode, validatedRecords, events);

    //
    // Step 5: Create an audit record and store in a Firebase Database
    //
    await storeUploadLog(fileName, {
      fileName: fileName,
      id: uid,
      status: 'SUCCESS',
      uploadCode: uploadCode,
      recordsReceived: records.length,
      recordsSent: validatedRecords.length,
      loggedTime: Date.now() / 1000
    });
  } catch (error) {
    console.error(new Error(`processUploadedData: "step ${step}" Error encountered, message: ${error.message}. Stack trace:\n${error.stack}`));
    await storeUploadLog(fileName, {
      fileName: fileName,
      id: uid,
      status: 'ERROR',
      uploadCode: uploadCode,
      step: step,
      errorMessage: error.message,
      errorStackTrace: error.stack,
      loggedTime: Date.now() / 1000
    });

    return {
      status: 'ERROR',
      message: error.message
    };
  }

  return {
    status: 'SUCCESS',
    filePath: filePath
  };
}

/**
 * Get data from storage bucket
 * @param bucket
 * @param filePath
 */
async function getStorageData(bucket: string, filePath: string) {
  const archivedFile = admin.storage().bucket(bucket).file(filePath);
  return archivedFile.download().then(_ => _.toString());
}

/**
 * Validate records and convert temp ID to UID
 */
async function validateRecords(records: StreetPassRecord[]): Promise<StreetPassRecord[]> {
  if (!records) {
    return [];
  }
  const encryptionKeys = await getAllEncryptionKeys();

  records.forEach(record => {
    record.timestamp = record.timestamp > 10000000000 ? record.timestamp / 1000 : record.timestamp; // Convert Epoch ms to Epoch s
    record.timestampString = formatTimestamp(record.timestamp);
    validateRecord(record, encryptionKeys);
  });

  return records;
}

/**
 * Validate records by decrypting and checking if broadcast message's timestamp is within validity period.
 * Multiple encryption keys can be provided, they are tried until 1 succeeds.
 * @param record
 * @param encryptionKeys: all possible encryption keys
 */
function validateRecord(record: StreetPassRecord, encryptionKeys: Buffer[]) {
  record.isValid = false;

  if (!record.msg) {
    record.invalidReason = "no_msg";
    return;
  }

  for (const encryptionKey of encryptionKeys) {
    try {
      // Decrypt UUID
      const { uid, startTime, expiryTime } = decryptTempID(record.msg, encryptionKey);
      record.contactId = uid;
      record.contactIdValidFrom = startTime;
      record.contactIdValidTo = expiryTime;

      if (record.timestamp < startTime || record.timestamp > expiryTime) {
        console.warn('validateRecord:', 'ID timestamp is not valid.', 'ID startTime:', formatTimestamp(startTime), 'ID expiryTime:', formatTimestamp(expiryTime), 'timestamp:', formatTimestamp(record.timestamp));
        record.isValid = false;
        record.invalidReason = "expired_id";
      } else {
        record.isValid = true;
      }

      break;
    } catch (error) {
      console.warn('validateRecord:', 'Error while decrypting temp ID.', error.message);
    }
  }

  if (!record.isValid && !record.invalidReason) {
    // Decryption using all encryption keys have failed. Setting the full temp ID as contactId for downstream processing.
    record.contactId = record.msg;
    record.invalidReason = "failed_decryption";
  }
}
