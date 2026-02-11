export function defaultTilt(lat) {
  return Math.abs(lat);
}

export function defaultAzimuth(lat) {
  return lat >= 0 ? 180 : 0;
}
