// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

import * as admin from "firebase-admin";
import config from "../src/config";

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("Environment variable GOOGLE_APPLICATION_CREDENTIALS is required to access Firebase. Refer to: https://cloud.google.com/docs/authentication/production ");
}

export const FunctionsTestWrapper = require("firebase-functions-test")({projectId: config.projectId});
if (admin.apps.length === 0) {
  admin.initializeApp();
}
