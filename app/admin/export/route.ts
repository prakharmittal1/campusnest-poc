import { requireAdmin } from "@/lib/admin";
import { buildLeadsWorkbook } from "@/lib/leads-excel";

function parseDate(value: string | null, endOfDay = false): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

/** GET /admin/export?from=2026-09-01&to=2026-09-30 → .xlsx download (admins only). */
export async function GET(request: Request) {
  await requireAdmin();
  const params = new URL(request.url).searchParams;
  const range = { from: parseDate(params.get("from")), to: parseDate(params.get("to"), true) };

  const file = await buildLeadsWorkbook(range);
  const today = new Date().toISOString().slice(0, 10);
  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="campusnest-leads-${today}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
