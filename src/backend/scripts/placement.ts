const METRES_PER_DEGREE = 111_000;
const GOLDEN_ANGLE = 137.5 * (Math.PI / 180);

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Stalls inside a food court have addresses but no coordinates of their own. Each one is placed
 * near its centre on a small deterministic spiral (at most about 40 m) so markers do not stack.
 */
export function placeNear(centre: LatLng, index: number): LatLng {
  const radius = 8 + index * 4;
  const angle = index * GOLDEN_ANGLE;
  return {
    lat: centre.lat + (radius * Math.cos(angle)) / METRES_PER_DEGREE,
    lng: centre.lng + (radius * Math.sin(angle)) / (METRES_PER_DEGREE * Math.cos((centre.lat * Math.PI) / 180)),
  };
}
