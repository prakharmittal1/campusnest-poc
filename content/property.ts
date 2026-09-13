// Property-page copy that's generic across listings, kept out of the page component.
import type { FaqItem } from "@/components/Faq";

type PolicyInput = { badges: string[] };

export function propertyPolicies({ badges }: PolicyInput) {
  return [
    {
      term: "Cancellation",
      detail: badges.includes("No Visa, No Pay")
        ? "Full refund if your visa is refused or you don't get a university place, with evidence."
        : "Free cancellation within 14 days of booking. After that, a replacement tenant may be needed.",
    },
    {
      term: "Deposit",
      detail: badges.includes("No deposit")
        ? "No security deposit required."
        : "Refundable deposit, held in a protection scheme and returned after move-out.",
    },
    {
      term: "Payments",
      detail: badges.includes("Flexible payments")
        ? "Pay in full, per term, or in monthly instalments."
        : "Rent is paid per term. Upfront payment may be needed without a guarantor.",
    },
    {
      term: "Guarantor",
      detail: "A local or international guarantor is usually required — we can help if you don't have one.",
    },
  ];
}

type FaqInput = {
  propertyName: string;
  billsIncluded: boolean;
  period: string;
  nearest?: { name: string; distance: string; travel: string };
};

export function propertyFaqs({ propertyName, billsIncluded, period, nearest }: FaqInput): FaqItem[] {
  return [
    {
      question: nearest
        ? `How far is ${propertyName} from ${nearest.name}?`
        : `How far is ${propertyName} from campus?`,
      answer: nearest
        ? `About ${nearest.distance} — roughly ${nearest.travel}.`
        : "See the location section for distances to nearby universities.",
    },
    {
      question: "Are bills included?",
      answer: billsIncluded
        ? "Yes. Wi-Fi, electricity, water and heating are included in the rent."
        : "No, so budget for utilities on top of rent.",
    },
    {
      question: "Can I pay in instalments?",
      answer: `Most students pay in instalments across the academic year. Rent is quoted per ${period}; we'll confirm the exact schedule.`,
    },
    {
      question: "Can I see the room before booking?",
      answer: "Virtual tours can be arranged on request. Send an enquiry and we'll organise one.",
    },
  ];
}
