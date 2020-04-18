// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

/**
 * This class uses a plain substring to generate a pin from user uid.
 * It should be subclassed with a secure implementation.
 */
export default class PinGenerator {
  async generatePin(uid: string): Promise<string> {
    return uid.substring(0, 6).toUpperCase();
  }
}
