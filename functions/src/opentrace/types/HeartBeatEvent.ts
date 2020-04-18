// Copyright Singapore Government Agency 2020. All Rights Reserved.
// Node module: functions
// This file is licensed under the GNU General Public License v3.0 or later.
// License text available at https://www.gnu.org/licenses/gpl-3.0-standalone.html

interface HeartBeatEvent {
  timestamp: number,
  msg?: string,
  // enhanced fields:
  timestampString?: string,
}

export default HeartBeatEvent;
