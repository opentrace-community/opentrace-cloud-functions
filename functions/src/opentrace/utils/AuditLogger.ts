import * as admin from "firebase-admin";
import config from "../../config";
import formatTimestamp from "./formatTimestamp";

/**
 * Store upload logs in a Firebase database
 * @param id
 * @param log
 */
export async function storeUploadLog(id: string, log: object) {
  const writeResult = await admin.firestore().collection(config.upload.logDBCollection).doc(id).set(log);
  console.log('storeUploadLog:', 'upload log is recorded successfully at', formatTimestamp(writeResult.writeTime.seconds));
}