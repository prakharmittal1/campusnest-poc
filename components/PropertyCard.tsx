import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DistanceTag, Tag } from "@/components/ui/Tag";
import { formatDistance, formatMoney, rentPeriod, travelTime } from "@/lib/format";
import type { PropertyCardData } from "@/lib/queries";

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const t = useTranslations("common");
  const tCard = useTranslations("propertyCard");
  return (
    <Link href={property.href} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface">
        {property.isDemo && (
          <Tag className="absolute left-3 top-3 z-10 bg-white/95 text-ink-soft">{t("exampleListing")}</Tag>
        )}
        {property.image && (
          <Image
            src={property.image}
            alt={`${property.name}, ${property.cityName}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-bold leading-snug text-ink group-hover:underline group-hover:underline-offset-4">
          {property.name}
        </h3>
        <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink">
          <Star className="size-3.5 fill-accent text-accent-strong" aria-hidden />
          {property.rating.toFixed(1)}
          <span className="sr-only">{tCard("ratingSr", { count: property.reviewCount })}</span>
        </span>
      </div>
      <p className="mt-0.5 text-sm text-muted">
        {property.area}, {property.cityName}
      </p>
      {property.distance && (
        <DistanceTag className="mt-2">
          {formatDistance(property.distance.km, property.country.slug)} · {t("travel", travelTime(property.distance.km))}
        </DistanceTag>
      )}
      <p className="mt-2 text-sm text-muted">
        {property.fromPrice !== null
          ? t.rich("fromPrice", {
              period: t("periodShort", { period: rentPeriod(property.country) }),
              price: () => (
                <span className="font-extrabold text-ink">{formatMoney(property.fromPrice!, property.country)}</span>
              ),
            })
          : t("soldOut")}
        {property.billsIncluded && ` · ${t("billsIncluded")}`}
      </p>
    </Link>
  );
}
