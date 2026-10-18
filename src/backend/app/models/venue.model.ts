import { Schema, model } from "mongoose";
import type { Venue } from "@ail/shared";

const venueSchema = new Schema<Venue>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    kind: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    menuNote: { type: String, default: null },
    vegetarianOptions: { type: Boolean, default: null },
    halal: {
      status: { type: String, required: true },
      checkedOn: { type: String, default: null },
      certificateNo: { type: String, default: null },
    },
  },
  { versionKey: false },
);

export const VenueModel = model<Venue>("Venue", venueSchema);
