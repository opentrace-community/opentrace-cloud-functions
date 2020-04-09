/**
 * This class uses a plain substring to generate a pin from user uid.
 * It should be subclassed with a secure implementation.
 */
export default class PinGenerator {
  async generatePin(uid: string): Promise<string> {
    return uid.substring(0, 6).toUpperCase();
  }
}
