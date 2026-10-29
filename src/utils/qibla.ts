/**
 * Qibla Direction and Great-Circle Bearing Engine
 * Computes exact azimuth to the Kaaba in Makkah (21.4225° N, 39.8262° E).
 */

export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
};

/**
 * Calculates the forward azimuth (bearing) from user's coordinates to the Kaaba.
 * Returns bearing in degrees [0, 360).
 */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const phi1 = (latitude * Math.PI) / 180;
  const phi2 = (KAABA_COORDINATES.latitude * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDINATES.longitude - longitude) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;

  // Normalize to 0 - 360
  return (qiblaDeg + 360) % 360;
}

/**
 * Great-circle distance between user and Kaaba in kilometers.
 */
export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371; // Earth radius in km
  const phi1 = (latitude * Math.PI) / 180;
  const phi2 = (KAABA_COORDINATES.latitude * Math.PI) / 180;
  const deltaPhi = ((KAABA_COORDINATES.latitude - latitude) * Math.PI) / 180;
  const deltaLambda = ((KAABA_COORDINATES.longitude - longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Calculates needle rotation angle given device heading and Qibla bearing.
 * Positive angle rotates clockwise.
 */
export function calculateNeedleAngle(deviceHeading: number, qiblaBearing: number): number {
  // When device faces heading, Qibla needle must point (qiblaBearing - deviceHeading)
  const diff = (qiblaBearing - deviceHeading + 360) % 360;
  return diff;
}
