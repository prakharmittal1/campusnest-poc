"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type DialogProps = {
  /** Content of the button that opens the dialog. */
  trigger: ReactNode;
  triggerClassName?: string;
  title: string;
  description?: string;
  /** Rendered only while open, so every opening starts fresh. Receives a close callback. */
  children: (close: () => void) => ReactNode;
};

/**
 * Native <dialog> modal with its trigger button. The dialog is portalled to <body> only while
 * open, so triggers can sit inside inline content (e.g. a <p>) without invalid HTML nesting.
 */
export function Dialog({ trigger, triggerClassName, title, description, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
  }, [open]);

  // Unmounting an open <dialog> also removes it from the top layer, so closing is just state.
  const close = () => setOpen(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {trigger}
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialogRef}
            onClose={() => setOpen(false)}
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-panel bg-canvas p-0 text-left text-ink shadow-xl"
            aria-labelledby={titleId}
          >
            <div className="p-7">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="heading-md text-xl">
                    {title}
                  </h2>
                  {description && <p className="mt-1 text-sm text-muted">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="-mr-2 -mt-1 rounded-control p-2 text-muted hover:bg-surface hover:text-ink"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
              {children(close)}
            </div>
          </dialog>,
          document.body,
        )}
    </>
  );
}
