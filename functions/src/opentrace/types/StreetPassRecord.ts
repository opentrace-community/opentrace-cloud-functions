// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

/**
 * Format:
 *   Timestamp timestamp
 *   Broadcast Message msg
 *   Model of Central modelC
 *   Model of Peripheral modelP
 *   Received Signal Strength rssi
 *   Transmission Power txPower
 *   Organization org
 */
interface StreetPassRecord {
    timestamp: number,
    msg?: string,
    modelC: string,
    modelP: string,
    rssi: number,
    txPower?: number,
    org: string,
    // enhanced fields:
    isValid?: boolean,
    invalidReason?: "no_msg" | "expired_id" | "failed_decryption",
    timestampString?: string,
    contactId?: string,
    contactIdValidFrom?: number,
    contactIdValidTo?: number,
}

export default StreetPassRecord;
