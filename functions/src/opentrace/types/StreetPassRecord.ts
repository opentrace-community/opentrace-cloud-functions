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
