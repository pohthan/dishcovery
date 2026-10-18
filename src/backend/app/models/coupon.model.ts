import { Schema, model } from "mongoose";
import type { Coupon } from "@ail/shared";

const couponSchema = new Schema<Coupon>(
  {
    id: { type: String, required: true, unique: true },
    venueId: { type: String, required: true, index: true },
    code: { type: String, required: true },
    description: { type: String, required: true },
    validUntil: { type: String, default: null },
    dishIds: { type: [String], default: [] },
  },
  { versionKey: false },
);

export const CouponModel = model<Coupon>("Coupon", couponSchema);
