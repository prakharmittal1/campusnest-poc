import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatMoney, rentPeriod } from "@/lib/format";

type Benchmark = {
  lowPrice: number;
  highPrice: number | null;
  period: string;
  sourceName: string;
  sourceUrl: string;
  note: string;
  asOf: string;
};

type Market = { currencySymbol: string; rentPeriod: string };

/** Real published rents for the city, so demo prices can be checked against reality. */
export function BenchmarkNote({
  benchmark,
  market,
  cityName,
}: {
  benchmark: Benchmark;
  market: Market;
  cityName: string;
}) {
  const t = useTranslations("benchmark");
  const period = rentPeriod({ ...market, rentPeriod: benchmark.period });
  const range = benchmark.highPrice
    ? `${formatMoney(benchmark.lowPrice, market)}–${formatMoney(benchmark.highPrice, market)}`
    : t("from", { price: formatMoney(benchmark.lowPrice, market) });

  return (
    <aside className="rounded-card border border-line bg-surface p-5">
      <p className="text-[13px] font-bold uppercase tracking-wider text-muted">{t("title", { city: cityName })}</p>
      <p className="mt-2 text-[15px] text-ink">
        {t.rich("range", {
          range,
          period,
          asOf: benchmark.asOf,
          strong: (chunks) => <span className="font-extrabold">{chunks}</span>,
        })}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">{benchmark.note}</p>
      <a
        href={benchmark.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline-offset-4 hover:underline"
      >
        {benchmark.sourceName}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
    </aside>
  );
}
