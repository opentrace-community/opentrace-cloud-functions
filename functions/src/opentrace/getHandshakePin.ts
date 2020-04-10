import functions from "firebase-functions";
import {config} from "../config";

/**
 * Get the handshake pin for a user.
 */
export const getHandshakePin = async (uid: string) => {
  console.log('getHandshakePin:', 'uid', uid);

  try {
    return {
      status: 'SUCCESS',
      pin: await getUserHandshakePin(uid)
    }
  } catch (error) {
    console.error('getHandshakePin: Error while trying to generate handshake pin.', error);
    throw new functions.https.HttpsError('internal', 'Internal Server Error.');
  }
};

export const getUserHandshakePin = config.upload.pinGenerator.generatePin;
