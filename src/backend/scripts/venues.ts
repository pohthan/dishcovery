import { z } from "zod";
import { Venue } from "@ail/shared";
import { placeNear } from "./placement";

const Kind = Venue.shape.kind;

/** A venue is either placed by coordinates, or is a stall inside another venue (`inCentre`). */
const VenueEntry = z
  .object({
    id: z.string(),
    name: z.string(),
    kind: Kind,
    address: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    inCentre: z.string().optional(),
    /** Links the stall to a MUIS record in the halal evidence file. */
    muisCertificateNo: z.string().optional(),
    vegetarianOptions: z.boolean().nullable().default(null),
    menuNote: z.string().optional(),
  })
  .refine((v) => (v.inCentre !== undefined) !== (v.lat !== undefined && v.lng !== undefined), {
    message: "give either lat and lng, or inCentre, but not both",
  });

const VenueFile = z.object({ venues: z.array(VenueEntry) });

const MuisFile = z.object({
  checkedOn: z.string(),
  establishments: z.array(z.object({ name: z.string(), certificateNo: z.string() })),
});

/**
 * Builds the venue list. Halal is verified only where a stall names a MUIS certificate that exists in
 * the evidence file; everything else stays unverified. A stall must sit inside a centre that exists.
 * Bad references fail the load.
 */
export function buildVenues(venuesJson: unknown, muisJson: unknown): Venue[] {
  const { venues: entries } = VenueFile.parse(venuesJson);
  const muis = MuisFile.parse(muisJson);
  const ids = entries.map((e) => e.id);
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate venue id");
  const byId = new Map<string, Venue>();
  const placedInCentre = new Map<string, number>();

  const toVenue = (e: z.infer<typeof VenueEntry>, lat: number, lng: number): Venue => {
    const cert = e.muisCertificateNo;
    if (cert !== undefined && !muis.establishments.some((m) => m.certificateNo === cert)) {
      throw new Error(`Venue ${e.id} cites MUIS certificate ${cert}, which is not in the evidence file`);
    }
    const halalNote = cert === undefined ? null : `Halal certified by MUIS (${cert}).`;
    const note = [halalNote, e.menuNote ?? null].filter((n) => n !== null).join(" ");
    return Venue.parse({
      id: e.id,
      name: e.name,
      kind: e.kind,
      address: e.address,
      lat,
      lng,
      vegetarianOptions: e.vegetarianOptions,
      menuNote: note === "" ? null : note,
      halal:
        cert === undefined
          ? { status: "unverified", checkedOn: null, certificateNo: null }
          : { status: "muis_certified", checkedOn: muis.checkedOn, certificateNo: cert },
    });
  };

  // Centres first so stalls can be placed regardless of their order in the file.
  for (const e of entries) {
    if (e.inCentre === undefined) byId.set(e.id, toVenue(e, e.lat!, e.lng!));
  }
  for (const e of entries) {
    if (e.inCentre === undefined) continue;
    const centre = byId.get(e.inCentre);
    if (centre === undefined) throw new Error(`Stall ${e.id} is in unknown centre ${e.inCentre}`);
    const index = placedInCentre.get(centre.id) ?? 0;
    placedInCentre.set(centre.id, index + 1);
    const at = placeNear(centre, index);
    byId.set(e.id, toVenue(e, at.lat, at.lng));
  }

  return ids.map((id) => byId.get(id)!);
}
