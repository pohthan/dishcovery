import { Schema, model } from "mongoose";
import type { Dish } from "@ail/shared";

const dishSchema = new Schema<Dish>(
  {
    id: { type: String, required: true, unique: true },
    venueId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    priceSgd: { type: Number, default: null },
    servingGrams: { type: Number, default: null },
    nutrients: { type: Schema.Types.Mixed, required: true },
    vegetarian: { type: Boolean, default: null },
    menuSource: { type: String, required: true },
  },
  { versionKey: false, minimize: false },
);

export const DishModel = model<Dish>("Dish", dishSchema);
