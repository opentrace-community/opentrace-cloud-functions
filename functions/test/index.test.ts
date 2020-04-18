import admin from "firebase-admin";
import {config} from "../src/config";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Environment variable GOOGLE_APPLICATION_CREDENTIALS is required to access Firebase. Refer to: https://cloud.google.com/docs/authentication/production ");
}

export const FunctionsTestWrapper = require("firebase-functions-test")({projectId: config.projectId});
if (admin.apps.length === 0) {
  admin.initializeApp();
}
