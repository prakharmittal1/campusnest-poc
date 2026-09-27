"use client";

import { Check, LoaderCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useActionState, useId, useState, type ReactNode } from "react";
import { submitEnquiry, type EnquiryField, type EnquiryState } from "@/app/actions/enquiry";
import { useViewer } from "@/components/auth/ViewerContext";
import { Button } from "@/components/ui/Button";
import { cx } from "@/lib/cx";
import { INTL_LOCALE } from "@/lib/i18n";
import { nextTwelveMonths } from "@/lib/months";
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
  const t = useTranslations("enquiry");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const viewer = useViewer();
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
        <h3 className="heading-md mt-4">{t("sentTitle")}</h3>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
          {propertyName ? t("sentTextProperty", { property: propertyName }) : t("sentText")}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset}>
            {t("sendAnother")}
          </Button>
          {onDone && (
            <Button size="sm" onClick={onDone}>
              {tCommon("done")}
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

  // Signed-in students get their contact details filled in.
  const prefill: Partial<Record<EnquiryField, string>> = {
    name: viewer?.name ?? "",
    email: viewer?.email ?? "",
    phone: viewer?.phone ?? "",
  };

  const aria = (name: EnquiryField) => ({
    id: `${id}-${name}`,
    name,
    defaultValue: state.values?.[name] ?? prefill[name] ?? "",
    "aria-invalid": error(name) ? true : undefined,
    "aria-describedby": error(name) ? `${id}-${name}-error` : undefined,
  });

  return (
    <form action={formAction} noValidate className="space-y-4">
      {propertyId && <input type="hidden" name="propertyId" value={propertyId} />}

      {field("name", t("name"), <input {...aria("name")} autoComplete="name" className={inputClass("name")} />)}
      {field(
        "email",
        t("email"),
        <input {...aria("email")} type="email" autoComplete="email" className={inputClass("email")} />,
      )}
      {field(
        "phone",
        t("phone"),
        <input {...aria("phone")} type="tel" autoComplete="tel" className={inputClass("phone")} />,
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {askCity &&
          field("city", t("city"), <input {...aria("city")} className={inputClass("city")} placeholder={t("cityPlaceholder")} />)}
        {field(
          "moveInMonth",
          t("moveIn"),
          <select {...aria("moveInMonth")} className={inputClass("moveInMonth")}>
            <option value="">{t("notSure")}</option>
            {nextTwelveMonths(INTL_LOCALE[locale]).map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>,
        )}
        {roomOptions.length > 0 &&
          field(
            "roomTypeName",
            t("room"),
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
              <option value="">{t("anyRoom")}</option>
              {roomOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>,
          )}
      </div>

      {field(
        "message",
        t("message"),
        <textarea
          {...aria("message")}
          rows={3}
          className={cx(inputClass("message"), "h-auto py-2.5")}
          placeholder={t("messagePlaceholder")}
        />,
      )}

      {state.status === "error" && state.message && (
        <p className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" variant="accent" size="lg" disabled={pending} className="w-full">
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {pending ? tCommon("sending") : t("submit")}
      </Button>
      <p className="text-center text-xs text-muted">{t("reassurance")}</p>
    </form>
  );
}
