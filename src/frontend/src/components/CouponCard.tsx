import type { CouponListing } from "@ail/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { COUPON_COPY } from "@/utils/copy";
import { describeValidity, isExpired } from "@/utils/coupons";

interface Props {
  listing: CouponListing;
  used: boolean;
  onShow: () => void;
}

export function CouponCard({ listing, used, onShow }: Props) {
  const { coupon, venueName, venueAddress, dishNames } = listing;
  const expired = isExpired(coupon.validUntil);
  const unusable = used || expired;

  return (
    <Card className={unusable ? "opacity-70" : undefined}>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {venueName}
          <Badge variant="outline">{COUPON_COPY.demoBadge}</Badge>
          {used && <Badge variant="secondary">{COUPON_COPY.usedBadge}</Badge>}
          {expired && <Badge variant="secondary">{COUPON_COPY.expiredBadge}</Badge>}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{venueAddress}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="font-medium">{coupon.description}</p>
        <p className="text-sm text-muted-foreground">
          {dishNames.length === 0 ? COUPON_COPY.venueWide : `${COUPON_COPY.dishOnly}: ${dishNames.join(", ")}`}
        </p>
        <p className="text-sm text-muted-foreground">{describeValidity(coupon.validUntil)}</p>
        <Button type="button" disabled={unusable} onClick={onShow}>
          {COUPON_COPY.showAtCounter}
        </Button>
      </CardContent>
    </Card>
  );
}
