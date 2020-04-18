/**
 * Convert timestamp (expressed in seconds since the Epoch) to "DD-MMM-YYYY HH:mm:ss Z" format
 * @param timestamp
 */
import moment from "moment";

import {config} from "../../config";

const TIMESTAMP_FORMAT = "DD-MMM-YYYY HH:mm:ss Z";

export function formatTimestamp(timestamp: number) {
  return moment.unix(timestamp).utcOffset(config.utcOffset).format(TIMESTAMP_FORMAT);
}
