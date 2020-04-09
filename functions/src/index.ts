import * as admin from "firebase-admin";
admin.initializeApp();

import * as firebaseFunctions from "./firebaseFunctions";
import config from "./config";

import getHandshakePin from "./opentrace/getHandshakePin";
import getTempIDs from "./opentrace/getTempIDs";
import getUploadToken from "./opentrace/getUploadToken";
import processUploadedData from "./opentrace/processUploadedData";

exports.getHandshakePin = firebaseFunctions.https(getHandshakePin);
exports.getTempIDs = firebaseFunctions.https(getTempIDs);
exports.getUploadToken = firebaseFunctions.https(getUploadToken);
exports.processUploadedData = firebaseFunctions.storage(config.upload.bucket, processUploadedData);
