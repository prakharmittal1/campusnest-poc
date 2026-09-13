"use client";

import { Check, LoaderCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useActionState, useId } from "react";
import { submitFeedback, type FeedbackState } from "@/app/actions/feedback";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";

const WOULD_USE = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
] as const;

const initialState: FeedbackState = { status: "idle" };

export function FeedbackForm({ onDone }: { onDone: () => void }) {
  const [state, formAction, pending] = useActionState(submitFeedback, initialState);
  const pathname = usePathname();
  const id = useId();

  if (state.status === "success") {
    return (
      <div className="py-6 text-center" role="status">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-ink">
          <Check className="size-6" aria-hidden />
        </span>
        <h3 className="heading-md mt-4">Thank you!</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">Your feedback helps us decide what to build next.</p>
        <Button size="sm" className="mt-6" onClick={onDone}>
          Close
        </Button>
      </div>
    );
  }

  const inputClass = (invalid: boolean) =>
    cx(
      "mt-1.5 block w-full rounded-control border bg-white px-3.5 text-sm text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none",
      invalid ? "border-danger" : "border-line-strong",
    );

  return (
    <form action={formAction} noValidate className="space-y-5">
      <input type="hidden" name="page" value={pathname} />

      <fieldset>
        <legend className="text-[13px] font-semibold text-ink-soft">Would you use this to find a room?</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {WOULD_USE.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="radio"
                name="wouldUse"
                value={option.value}
                defaultChecked={state.values?.wouldUse === option.value}
                className="peer sr-only"
              />
              <span className="flex h-10 items-center justify-center rounded-control text-sm font-semibold text-ink ring-1 ring-inset ring-line-strong peer-checked:bg-accent peer-checked:ring-accent peer-focus-visible:ring-2 peer-focus-visible:ring-ink">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${id}-message`} className="block text-[13px] font-semibold text-ink-soft">
          What worked? What was confusing or missing?
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={4}
          defaultValue={state.values?.message}
          aria-invalid={state.fieldErrors?.message ? true : undefined}
          aria-describedby={state.fieldErrors?.message ? `${id}-message-error` : undefined}
          className={cx(inputClass(Boolean(state.fieldErrors?.message)), "py-2.5")}
        />
        {state.fieldErrors?.message && (
          <p id={`${id}-message-error`} className="mt-1 text-xs text-danger">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${id}-email`} className="block text-[13px] font-semibold text-ink-soft">
          Email (optional — if we can follow up)
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state.values?.email}
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          aria-describedby={state.fieldErrors?.email ? `${id}-email-error` : undefined}
          className={cx(inputClass(Boolean(state.fieldErrors?.email)), "h-11")}
        />
        {state.fieldErrors?.email && (
          <p id={`${id}-email-error`} className="mt-1 text-xs text-danger">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      {state.status === "error" && state.message && (
        <p className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={pending} className="w-full">
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {pending ? "Sending…" : "Send feedback"}
      </Button>
    </form>
  );
}
