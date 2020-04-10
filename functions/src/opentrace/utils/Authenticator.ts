// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

import * as functions from "firebase-functions";
import {CallableContext} from "firebase-functions/lib/providers/https";

export default class Authenticator {
  async authenticate(data: any, context: CallableContext): Promise<string> {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    return context.auth?.uid;
  }
}
