import * as functions from "firebase-functions";
import {ObjectMetadata} from "firebase-functions/lib/providers/storage";

const processUploadedData = async (object: ObjectMetadata) => {
  throw new functions.https.HttpsError('unimplemented', 'Not implemented yet');
};

export default processUploadedData;
