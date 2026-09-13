"use client";

import dynamic from "next/dynamic";
import { Dialog } from "@/components/ui/Dialog";

// Loaded only when a tester opens the dialog.
const FeedbackForm = dynamic(() => import("./FeedbackForm").then((m) => m.FeedbackForm), {
  loading: () => <div className="h-80" />,
});

/** Vertical "Feedback" tab pinned to the right edge of every page, for POC testers. */
export function FeedbackButton() {
  return (
    <Dialog
      trigger="Feedback"
      triggerClassName="fixed right-0 top-1/2 z-40 -translate-y-1/2 rotate-180 rounded-r-control bg-ink px-1.5 py-3 text-xs font-bold tracking-wide text-white [writing-mode:vertical-rl] hover:bg-ink-soft sm:px-2 sm:py-4"
      title="How's this working for you?"
      description="This is an early prototype — honest feedback is the most useful kind."
    >
      {(close) => <FeedbackForm onDone={close} />}
    </Dialog>
  );
}
