import functions from "firebase-functions";
import {ObjectMetadata} from "firebase-functions/lib/providers/storage";

export const processUploadedData = async (object: ObjectMetadata) => {
  throw new functions.https.HttpsError('unimplemented', 'Not implemented yet');
};
