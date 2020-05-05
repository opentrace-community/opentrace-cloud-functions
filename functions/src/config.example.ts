import FunctionConfig from "./opentrace/types/FunctionConfig";
import Authenticator from "./opentrace/utils/Authenticator";
import PinGenerator from "./opentrace/utils/PinGenerator";
import DataForwarder from "./opentrace/utils/DataForwarder";

const config: FunctionConfig = {
  projectId: "",
  projectNumber: "",
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
    logDBCollection: "uploadLogs",
    dataForwarder: new DataForwarder(),
  },
};

export default config;
