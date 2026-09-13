"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useActionState, useId, useState, type ReactNode } from "react";
import { submitEnquiry, type EnquiryField, type EnquiryState } from "@/app/actions/enquiry";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { useSelectedRoom } from "./SelectedRoomContext";

type EnquiryFormProps = {
  propertyId?: number;
  propertyName?: string;
  roomOptions?: string[];
  /** General enquiries (not tied to a property) ask which city the student wants. */
  askCity?: boolean;
  onDone?: () => void;
};

const initialState: EnquiryState = { status: "idle" };

function nextTwelveMonths() {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) =>
    new Date(now.getFullYear(), now.getMonth() + i, 1).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    }),
  );
}

export function EnquiryForm(props: EnquiryFormProps) {
  // Remounting via key is the simplest way to reset useActionState for "send another".
  const [formKey, setFormKey] = useState(0);
  return <EnquiryFormInner key={formKey} {...props} onReset={() => setFormKey((k) => k + 1)} />;
}

function EnquiryFormInner({
  propertyId,
  propertyName,
  roomOptions = [],
  askCity = false,
  onDone,
  onReset,
}: EnquiryFormProps & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState(submitEnquiry, initialState);
  const selected = useSelectedRoom();
  const [localRoom, setLocalRoom] = useState("");
  const room = selected?.room ?? localRoom;
  const setRoom = selected?.setRoom ?? setLocalRoom;
  const id = useId();

  if (state.status === "success") {
    return (
      <div className="py-6 text-center" role="status">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-ink">
          <Check className="size-6" aria-hidden />
        </span>
        <h3 className="heading-md mt-4">Enquiry sent</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          An expert will reply within 24 hours{propertyName ? ` about ${propertyName}` : ""}.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            Send another
          </Button>
          {onDone && (
            <Button size="sm" onClick={onDone}>
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  const error = (field: EnquiryField) => state.fieldErrors?.[field];
  const inputClass = (field: EnquiryField) =>
    cx(
      "mt-1.5 block h-11 w-full rounded-control border bg-white px-3.5 text-sm text-ink placeholder:text-muted/70",
      "focus:border-ink focus:outline-none",
      error(field) ? "border-danger" : "border-line-strong",
    );

  const field = (name: EnquiryField, label: string, input: ReactNode) => (
    <div>
      <label htmlFor={`${id}-${name}`} className="block text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      {input}
      {error(name) && (
        <p id={`${id}-${name}-error`} className="mt-1 text-xs text-danger">
          {error(name)}
        </p>
      )}
    </div>
  );

  const aria = (name: EnquiryField) => ({
    id: `${id}-${name}`,
    name,
    defaultValue: state.values?.[name] ?? "",
    "aria-invalid": error(name) ? true : undefined,
    "aria-describedby": error(name) ? `${id}-${name}-error` : undefined,
  });

  return (
    <form action={formAction} noValidate className="space-y-4">
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}

      {field("name", "Full name", <input {...aria("name")} autoComplete="name" className={inputClass("name")} />)}
      {field(
        "email",
        "Email",
        <input {...aria("email")} type="email" autoComplete="email" className={inputClass("email")} />,
      )}
      {field(
        "phone",
        "Phone or WhatsApp (optional)",
        <input {...aria("phone")} type="tel" autoComplete="tel" className={inputClass("phone")} />,
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {askCity && field("city", "City", <input {...aria("city")} className={inputClass("city")} placeholder="e.g. London" />)}
        {field(
          "moveInMonth",
          "Move in",
          <select {...aria("moveInMonth")} className={inputClass("moveInMonth")}>
            <option value="">Not sure yet</option>
            {nextTwelveMonths().map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>,
        )}
        {roomOptions.length > 0 &&
          field(
            "roomTypeName",
            "Room",
            // Uncontrolled + keyed on the selection: React resets forms after an action,
            // which would otherwise clear a controlled select's DOM value.
            <select
              key={room}
              id={`${id}-roomTypeName`}
              name="roomTypeName"
              className={inputClass("roomTypeName")}
              defaultValue={room}
              onChange={(e) => setRoom(e.target.value)}
            >
              <option value="">Any room</option>
              {roomOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>,
          )}
      </div>

      {field(
        "message",
        "Message (optional)",
        <textarea
          {...aria("message")}
          rows={3}
          className={cx(inputClass("message"), "h-auto py-2.5")}
          placeholder="Budget, university, questions…"
        />,
      )}

      {state.status === "error" && state.message && (
        <p className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={pending} className="w-full">
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
      <p className="text-center text-xs text-muted">Free · No obligation · Reply within 24 hours</p>
    </form>
  );
}
