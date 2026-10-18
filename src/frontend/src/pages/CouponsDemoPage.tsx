import { useState } from "react";
import type { CouponListing } from "@ail/shared";
import { CouponCard } from "@/components/CouponCard";
import { RedeemDialog } from "@/components/RedeemDialog";
import { Button } from "@/components/ui/button";
import { useDemoCoupons } from "@/hooks/useDemoCoupons";
import { useUsedCoupons } from "@/hooks/useUsedCoupons";
import { APP_NAME, COUPON_COPY } from "@/utils/copy";
import { goTo } from "@/utils/hashRoute";

export function CouponsDemoPage() {
  const state = useDemoCoupons();
  const { used, markUsed, reset } = useUsedCoupons();
  const [showing, setShowing] = useState<CouponListing | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold tracking-wide text-muted-foreground">{APP_NAME}</p>
          <h1 className="text-2xl font-semibold">{COUPON_COPY.pageTitle}</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => goTo("home")}>{COUPON_COPY.back}</Button>
      </header>

      <p role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {COUPON_COPY.demoBanner}
      </p>

      <section aria-label="How coupons work" className="space-y-1 text-sm text-muted-foreground">
        <h2 className="font-medium text-foreground">{COUPON_COPY.howTitle}</h2>
        <ul className="list-disc space-y-1 pl-5">
          {COUPON_COPY.howItWorks.map((line) => <li key={line}>{line}</li>)}
        </ul>
      </section>

      {state.status === "loading" && <p>Loading coupons...</p>}
      {state.status === "off" && <p role="status">{COUPON_COPY.off}</p>}
      {state.status === "error" && <p role="alert" className="text-destructive">{state.message}</p>}
      {state.status === "ready" && (
        <>
          {!state.data.demo && <p role="alert" className="text-destructive">{COUPON_COPY.notDemo}</p>}
          <ul className="space-y-3">
            {state.data.coupons.map((l) => (
              <li key={l.coupon.id}>
                <CouponCard listing={l} used={used.has(l.coupon.id)} onShow={() => setShowing(l)} />
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" onClick={reset}>{COUPON_COPY.reset}</Button>
        </>
      )}

      <RedeemDialog listing={showing} onClose={() => setShowing(null)} onMarkUsed={markUsed} />
    </div>
  );
}
