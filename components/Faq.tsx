import { Plus } from "lucide-react";

export type FaqItem = { question: string; answer: string };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.question} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {item.question}
            <Plus className="size-4 shrink-0 text-muted transition-transform group-open:rotate-45" aria-hidden />
          </summary>
          <p className="-mt-1 max-w-2xl pb-5 text-sm leading-relaxed text-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
