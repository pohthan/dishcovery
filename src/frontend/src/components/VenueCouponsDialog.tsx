import type { CouponListing } from "@ail/shared";
import { CouponCard } from "@/components/CouponCard";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { COUPON_COPY } from "@/utils/copy";

interface Props {
  venueName: string | null;
  listings: CouponListing[];
  used: Set<string>;
  onShow: (listing: CouponListing) => void;
  onClose: () => void;
}

/** Opens when a place is chosen: that place's demo coupons, each with a button to show it at the counter. */
export function VenueCouponsDialog({ venueName, listings, used, onShow, onClose }: Props) {
  return (
    <Dialog open={venueName !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {COUPON_COPY.atVenueTitle} {venueName}
            <Badge variant="outline">{COUPON_COPY.demoBadge}</Badge>
          </DialogTitle>
          <DialogDescription>{COUPON_COPY.atVenueIntro}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-3">
          {listings.map((l) => (
            <li key={l.coupon.id}>
              <CouponCard listing={l} used={used.has(l.coupon.id)} onShow={() => onShow(l)} />
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
