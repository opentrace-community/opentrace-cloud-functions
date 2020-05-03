import StreetPassRecord from "../types/StreetPassRecord";
import HeartBeatEvent from "../types/HeartBeatEvent";

/**
 * Create a subclass of this class and use it in config.*.ts
 */
export default class DataForwarder {
  async forwardData(filePath: string, id: string, uploadCode: string, records: StreetPassRecord[], events: HeartBeatEvent[]): Promise<void>{
    return;
  };
}
