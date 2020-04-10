import functions from "firebase-functions";
import {CallableContext} from "firebase-functions/lib/providers/https";

export class Authenticator {
  async authenticate(data: any, context: CallableContext): Promise<string> {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    return context.auth?.uid;
  }
}
