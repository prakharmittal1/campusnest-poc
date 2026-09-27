import { getTranslations } from "next-intl/server";
import { Resend } from "resend";
import type { Locale } from "./i18n";
import { site } from "./site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
// Resend's shared test sender works without a verified domain, but only delivers to your own address.
const from = process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`;

const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendMagicLinkEmail(to: string, url: string, locale: Locale) {
  if (!resend) {
    if (process.env.NODE_ENV === "production") throw new Error("RESEND_API_KEY is not set");
    // Local development: no email provider needed, click the link from the terminal.
    console.log(`\n[auth] Magic link for ${to}:\n${url}\n`);
    return;
  }

  const t = await getTranslations({ locale, namespace: "auth" });
  const heading = t("linkEmailHeading", { site: site.name });
  const html = `<!doctype html>
<html lang="${locale}"><body style="margin:0;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#0f1b2d">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px">
    <div style="background:#ffffff;border-radius:16px;padding:32px">
      <h1 style="margin:0 0 12px;font-size:22px">${escapeHtml(heading)}</h1>
      <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#3a4556">${escapeHtml(t("linkEmailBody"))}</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:#ffc629;color:#0f1b2d;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:10px">${escapeHtml(t("linkEmailButton"))}</a>
      <p style="margin:24px 0 0;font-size:13px;color:#6b7585">${escapeHtml(t("linkEmailIgnore"))}</p>
    </div>
  </div>
</body></html>`;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: t("linkEmailSubject", { site: site.name }),
    html,
    text: `${heading}\n\n${t("linkEmailBody")}\n\n${url}\n\n${t("linkEmailIgnore")}`,
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}
