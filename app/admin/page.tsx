import { Download } from "lucide-react";
import type { Metadata } from "next";
import { buttonClass } from "@/components/ui/Button";
import { Container } from "@/components/ui/layout";
import { requireAdmin } from "@/lib/admin";
import { getLeads, getLeadStats } from "@/lib/leads";

// Internal page for the team, so it's English-only.
export const metadata: Metadata = { title: "Leads", robots: { index: false } };

const dateTime = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default async function AdminPage() {
  await requireAdmin();
  const [stats, leads] = await Promise.all([getLeadStats(), getLeads({}, 50)]);

  const tiles = [
    { label: "Accounts", value: stats.accounts },
    { label: "Consented leads", value: stats.consented },
    { label: "Enquiries", value: stats.enquiries },
    { label: "New accounts (7 days)", value: stats.newAccounts },
    { label: "Journey steps (7 days)", value: stats.events },
  ];

  const inputClass = "mt-1 block h-10 rounded-control border border-line-strong bg-white px-3 text-sm text-ink";

  return (
    <Container className="pt-10">
      <h1 className="heading-xl">Leads</h1>
      <p className="mt-2 text-[15px] text-muted">
        Student accounts, what they looked at, and what they asked for. Only share leads that have consented.
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-card border border-line p-4">
            <dt className="text-xs font-semibold text-muted">{tile.label}</dt>
            <dd className="mt-1 text-2xl font-extrabold text-ink">{tile.value.toLocaleString("en-GB")}</dd>
          </div>
        ))}
      </dl>

      <form action="/admin/export" method="get" className="mt-8 flex flex-wrap items-end gap-3 rounded-card bg-surface p-5">
        <label className="text-[13px] font-semibold text-ink-soft">
          From
          <input type="date" name="from" className={inputClass} />
        </label>
        <label className="text-[13px] font-semibold text-ink-soft">
          To
          <input type="date" name="to" className={inputClass} />
        </label>
        <button type="submit" className={buttonClass({ variant: "accent" })}>
          <Download className="size-4" aria-hidden />
          Download Excel
        </button>
        <p className="w-full text-xs text-muted">
          Leave dates empty for everything. Sheets: Leads (one row per account), Journey (every step), Enquiries.
        </p>
      </form>

      <h2 className="heading-md mt-12">Latest accounts</h2>
      <div className="mt-4 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              {["Signed up", "Student", "Phone", "Plans", "Journey", "Consent", "Last active"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No accounts yet.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-line align-top">
                <td className="whitespace-nowrap px-4 py-3 text-muted">{dateTime.format(lead.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className="block font-semibold text-ink">{lead.name || "—"}</span>
                  <span className="text-muted">{lead.email}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{lead.phone ?? "—"}</td>
                <td className="px-4 py-3 text-ink-soft">
                  {[lead.destinationCity, lead.destinationCountry].filter(Boolean).join(", ") || "—"}
                  {lead.studyStart && <span className="block text-muted">{lead.studyStart}</span>}
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  {lead.journey.propertiesViewed} homes viewed · {lead.enquiries} enquiries
                  {lead.journey.topCity && <span className="block text-muted">Mostly {lead.journey.topCity}</span>}
                </td>
                <td className="px-4 py-3">{lead.consentToShare ? "Yes" : "No"}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">
                  {lead.journey.lastActive ? dateTime.format(lead.journey.lastActive) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
