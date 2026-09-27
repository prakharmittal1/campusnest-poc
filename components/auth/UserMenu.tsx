"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { authClient } from "@/lib/auth-client";
import { useViewer } from "./ViewerContext";
import { SignInForm } from "./SignInForm";

function initials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return email[0]?.toUpperCase() ?? "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** "Sign in" when signed out; otherwise an initials button with profile and sign-out links. */
export function UserMenu({ googleEnabled }: { googleEnabled: boolean }) {
  const t = useTranslations("auth");
  const viewer = useViewer();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!viewer) {
    return (
      <Dialog
        trigger={t("signIn")}
        triggerClassName={buttonClass({ variant: "ghost", size: "sm" })}
        title={t("dialogTitle")}
        description={t("dialogDescription")}
      >
        {() => <SignInForm googleEnabled={googleEnabled} />}
      </Dialog>
    );
  }

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    setOpen(false);
    setSigningOut(false);
    router.refresh();
  }

  const itemClass = "block w-full rounded-control px-3 py-2 text-left text-sm text-ink hover:bg-surface";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("account")}
        className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-bold text-white hover:bg-ink-soft"
      >
        {initials(viewer.name, viewer.email)}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 rounded-card bg-white p-1.5 shadow-lg ring-1 ring-line">
          <div className="border-b border-line px-3 pb-2.5 pt-1.5">
            {viewer.name && <p className="truncate text-sm font-semibold text-ink">{viewer.name}</p>}
            <p className="truncate text-xs text-muted">{viewer.email}</p>
          </div>
          <div className="pt-1.5">
            <Link role="menuitem" href="/account" onClick={() => setOpen(false)} className={itemClass}>
              {t("myProfile")}
            </Link>
            {viewer.isAdmin && (
              <Link role="menuitem" href="/admin" onClick={() => setOpen(false)} className={itemClass}>
                Admin · leads
              </Link>
            )}
            <button role="menuitem" type="button" onClick={signOut} disabled={signingOut} className={itemClass}>
              <span className="flex items-center gap-2">
                {signingOut && <LoaderCircle className="size-3.5 animate-spin" aria-hidden />}
                {t("signOut")}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
