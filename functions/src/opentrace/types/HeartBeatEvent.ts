interface HeartBeatEvent {
  timestamp: number,
  msg?: string,
  // enhanced fields:
  timestampString?: string,
}

export default HeartBeatEvent;
