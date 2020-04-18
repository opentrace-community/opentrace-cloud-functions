import {Authenticator} from "../utils/Authenticator";
import {PinGenerator} from "../utils/PinGenerator";

// SUPPORTED_REGIONS from function-configuration.d.ts
declare type SUPPORTED_REGIONS = "us-central1" | "us-east1" | "us-east4" | "europe-west1" | "europe-west2" | "asia-east2" | "asia-northeast1";

export interface FunctionConfig {
  projectId: string // Firebase Project ID
  regions: SUPPORTED_REGIONS[]
  utcOffset: number | string
  authenticator: Authenticator
  encryption: {
    defaultAlgorithm: string
    keyPath: string
    defaultVersion: number
  }
  tempID: {
    validityPeriod: number // in hours
    refreshInterval: number // in hours
    batchSize: number // number of tempIDs to generate in 1 batch
  }
  upload: {
    pinGenerator: PinGenerator
    bucket: string
    recordsDir: string
    testsDir: string
    tokenValidityPeriod: number // in hours
    bucketForArchive: string
  }
}
