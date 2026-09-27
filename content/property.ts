// Property-page copy that's generic across listings, kept out of the page component.
// The wording itself lives in messages/*.json ("policies", "propertyFaq").
import { getTranslations } from "next-intl/server";
import type { FaqItem } from "@/components/Faq";

type PolicyInput = { badges: string[] };

export async function propertyPolicies({ badges }: PolicyInput) {
  const t = await getTranslations("policies");
  return [
    {
      term: t("cancellation"),
      detail: badges.includes("No Visa, No Pay") ? t("cancellationNoVisa") : t("cancellationStandard"),
    },
    {
      term: t("deposit"),
      detail: badges.includes("No deposit") ? t("depositNone") : t("depositStandard"),
    },
    {
      term: t("payments"),
      detail: badges.includes("Flexible payments") ? t("paymentsFlexible") : t("paymentsStandard"),
    },
    { term: t("guarantor"), detail: t("guarantorText") },
  ];
}

type FaqInput = {
  propertyName: string;
  billsIncluded: boolean;
  period: "week" | "month";
  /** Distance and travel time already formatted for display. */
  nearest?: { name: string; distance: string; travel: string };
};

export async function propertyFaqs({ propertyName, billsIncluded, period, nearest }: FaqInput): Promise<FaqItem[]> {
  const t = await getTranslations("propertyFaq");
  return [
    {
      question: nearest
        ? t("distanceQuestion", { property: propertyName, university: nearest.name })
        : t("distanceQuestionGeneric", { property: propertyName }),
      answer: nearest
        ? t("distanceAnswer", { distance: nearest.distance, travel: nearest.travel })
        : t("distanceAnswerGeneric"),
    },
    { question: t("billsQuestion"), answer: billsIncluded ? t("billsYes") : t("billsNo") },
    { question: t("instalmentsQuestion"), answer: t("instalmentsAnswer", { period }) },
    { question: t("viewingQuestion"), answer: t("viewingAnswer") },
  ];
}
