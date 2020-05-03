/**
 * Convert timestamp (expressed in seconds since the Epoch) to "DD-MMM-YYYY HH:mm:ss Z" format
 * @param timestamp
 */
import * as moment from "moment";

import config from "../../config";

const DEFAULT_TIMESTAMP_FORMAT = "DD-MMM-YYYY HH:mm:ss Z";

function formatTimestamp(timestamp: number, format: string = DEFAULT_TIMESTAMP_FORMAT) {
  return moment.unix(timestamp).utcOffset(config.utcOffset).format(format);
}

export default formatTimestamp;