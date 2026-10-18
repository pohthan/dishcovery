import mongoose from "mongoose";
import { loadConfig } from "../app/core/config";
import { connectDb } from "../app/core/db";
import { CouponModel } from "../app/models/coupon.model";
import { DishModel } from "../app/models/dish.model";
import { VenueModel } from "../app/models/venue.model";
import { repoDataRoot } from "./data-root";
import { loadCatalogData } from "./load-catalog";

const config = loadConfig();
await connectDb(config.MONGODB_URI);

const { venues, dishes, coupons } = await loadCatalogData(repoDataRoot);
await Promise.all([VenueModel.deleteMany({}), DishModel.deleteMany({}), CouponModel.deleteMany({})]);
await Promise.all([VenueModel.insertMany(venues), DishModel.insertMany(dishes), CouponModel.insertMany(coupons)]);
console.log(`Seeded ${venues.length} venues, ${dishes.length} dishes, ${coupons.length} coupons`);

await mongoose.disconnect();
