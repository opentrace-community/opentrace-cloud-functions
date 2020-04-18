// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

import * as functions from "firebase-functions";
import {ObjectMetadata} from "firebase-functions/lib/providers/storage";

const processUploadedData = async (object: ObjectMetadata) => {
  throw new functions.https.HttpsError('unimplemented', 'Not implemented yet');
};

export default processUploadedData;
