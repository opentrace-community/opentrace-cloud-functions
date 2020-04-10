// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

import FunctionConfig from "./opentrace/types/FunctionConfig";
import Authenticator from "./opentrace/utils/Authenticator";
import PinGenerator from "./opentrace/utils/PinGenerator";

const config: FunctionConfig = {
  projectId: "",
  regions: [],
  utcOffset: 0,
  authenticator: new Authenticator(),
  encryption: {
    defaultAlgorithm: "",
    keyPath: "encryptionKeyPath",
    defaultVersion: 1,
  },
  tempID: {
    validityPeriod: 0.25, // in hours
    refreshInterval: 12,  // in hours
    batchSize: 100, // sufficient for 24h+
  },
  upload: {
    pinGenerator: new PinGenerator(),
    bucket: "upload-bucket", //
    recordsDir: "records",
    testsDir: "tests",
    tokenValidityPeriod: 2, // in hours
    bucketForArchive: "archive-bucket",
  },
};

export default config;
