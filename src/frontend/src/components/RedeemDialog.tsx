import type { CouponListing } from "@ail/shared";
import { QRCodeSVG } from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COUPON_COPY } from "@/utils/copy";
import { demoQrValue, describeValidity } from "@/utils/coupons";

interface Props {
  listing: CouponListing | null;
  onClose: () => void;
  onMarkUsed: (couponId: string) => void;
}

/** The screen a person holds up at the counter: a large code and a QR code, labelled as a demo. */
export function RedeemDialog({ listing, onClose, onMarkUsed }: Props) {
  return (
    <Dialog open={listing !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {listing !== null && (
          <>
            <DialogHeader>
              <DialogTitle className="flex flex-wrap items-center gap-2">
                {listing.venueName}
                <Badge variant="outline">{COUPON_COPY.demoBadge}</Badge>
              </DialogTitle>
              <DialogDescription>{listing.coupon.description}</DialogDescription>
            </DialogHeader>

            <div className="flex flex-col items-center gap-3">
              <QRCodeSVG
                value={demoQrValue(listing.coupon.id, listing.coupon.code)}
                size={176}
                title={`QR code for demo coupon ${listing.coupon.code}`}
              />
              <p className="font-mono text-2xl font-semibold tracking-widest" aria-label="Coupon code">
                {listing.coupon.code}
              </p>
              <p className="text-center text-sm text-muted-foreground">{describeValidity(listing.coupon.validUntil)}</p>
              <p role="note" className="rounded-md border bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
                {COUPON_COPY.redeemDemoNote}
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  onMarkUsed(listing.coupon.id);
                  onClose();
                }}
              >
                {COUPON_COPY.markUsed}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
