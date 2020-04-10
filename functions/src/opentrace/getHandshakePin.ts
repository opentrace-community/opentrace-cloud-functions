// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

import * as functions from "firebase-functions";

import config from "../config";

/**
 * Get the handshake pin for a user.
 */
const getHandshakePin = async (uid: string) => {
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

export default getHandshakePin;
