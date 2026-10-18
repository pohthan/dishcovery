import { readFile } from "node:fs/promises";
import { z } from "zod";
import { Coupon } from "@ail/shared";

const DemoFile = z.object({ coupons: z.array(Coupon) });

/** Demonstration coupons, kept apart from the real catalog. Every code starts with DEMO. */
export function parseDemoCoupons(json: unknown): Coupon[] {
  const { coupons } = DemoFile.parse(json);
  const bad = coupons.find((c) => !c.code.startsWith("DEMO"));
  if (bad !== undefined) throw new Error(`Demo coupon ${bad.id} must have a code starting with DEMO`);
  return coupons;
}

export async function loadDemoCoupons(dataRoot: URL): Promise<Coupon[]> {
  return parseDemoCoupons(JSON.parse(await readFile(new URL("coupons/demo-coupons.json", dataRoot), "utf-8")));
}
