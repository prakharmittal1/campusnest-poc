"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { buttonClass, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

// The form's code is only downloaded when someone opens the dialog.
const EnquiryForm = dynamic(() => import("./EnquiryForm").then((m) => m.EnquiryForm), {
  loading: () => <div className="h-96" />,
});

type EnquiryModalProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

/** A button that opens a general "help me find a room" enquiry form. */
export function EnquiryModal({ children, variant, size, className }: EnquiryModalProps) {
  return (
    <Dialog
      trigger={children}
      triggerClassName={buttonClass({ variant, size, className })}
      title="Tell us what you need"
      description="We'll shortlist rooms that fit your budget and university."
    >
      {(close) => <EnquiryForm askCity onDone={close} />}
    </Dialog>
  );
}
