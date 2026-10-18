export interface Origin {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/** Fixed starting points inside the launch area (Singapore CBD and SMU). */
export const PRESET_ORIGINS: Origin[] = [
  { id: "raffles-place", label: "Raffles Place", lat: 1.284, lng: 103.8514 },
  { id: "smu", label: "SMU", lat: 1.2963, lng: 103.8502 },
  { id: "tanjong-pagar", label: "Tanjong Pagar", lat: 1.2764, lng: 103.8458 },
];

export function currentPosition(): Promise<Origin> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ id: "gps", label: "My location", lat: p.coords.latitude, lng: p.coords.longitude }),
      (err) => reject(new Error(`Could not get your location: ${err.message}`)),
    );
  });
}
