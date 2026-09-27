import ExcelJS from "exceljs";
import { getEnquiries, getJourneyEvents, getLeads, type DateRange } from "./leads";
import { site } from "./site";

const EVENT_LABELS: Record<string, string> = {
  search: "Searched",
  view_city: "Viewed city",
  view_property: "Viewed property",
  select_room: "Picked a room",
  enquiry_sent: "Sent enquiry",
  signup: "Created account",
  login: "Signed in",
  locale_change: "Changed language",
};

/** Event details as "key: value" pairs, skipping empty values. */
function describe(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  return Object.entries(data as Record<string, unknown>)
    .filter(([, v]) => v !== null && v !== "" && v !== false && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : String(v)}`)
    .join(" · ");
}

function addSheet(workbook: ExcelJS.Workbook, name: string, columns: Partial<ExcelJS.Column>[]) {
  const sheet = workbook.addWorksheet(name, { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = columns;
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F1B2D" } };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  return sheet;
}

/** Workbook with three sheets: Leads (one row per account), Journey (every event), Enquiries. */
export async function buildLeadsWorkbook(range: DateRange = {}): Promise<Buffer> {
  const [leads, events, enquiries] = await Promise.all([getLeads(range), getJourneyEvents(range), getEnquiries(range)]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = site.name;
  workbook.created = new Date();
  const date = { numFmt: "yyyy-mm-dd hh:mm" };

  const leadSheet = addSheet(workbook, "Leads", [
    { header: "Signed up", key: "createdAt", width: 17, style: date },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Consent to share", key: "consent", width: 15 },
    { header: "Consent given", key: "consentAt", width: 17, style: date },
    { header: "Nationality", key: "nationality", width: 14 },
    { header: "Destination country", key: "destinationCountry", width: 18 },
    { header: "Destination city", key: "destinationCity", width: 16 },
    { header: "University", key: "university", width: 28 },
    { header: "Move in", key: "studyStart", width: 15 },
    { header: "Budget", key: "budget", width: 18 },
    { header: "Language", key: "locale", width: 10 },
    { header: "Sign-in method", key: "signInMethods", width: 14 },
    { header: "Last active", key: "lastActive", width: 17, style: date },
    { header: "Searches", key: "searches", width: 10 },
    { header: "City pages viewed", key: "citiesViewed", width: 12 },
    { header: "Properties viewed", key: "propertiesViewed", width: 12 },
    { header: "Rooms picked", key: "roomsSelected", width: 11 },
    { header: "Enquiries", key: "enquiries", width: 10 },
    { header: "Most viewed city", key: "topCity", width: 16 },
    { header: "UTM source", key: "utmSource", width: 14 },
    { header: "UTM medium", key: "utmMedium", width: 14 },
    { header: "UTM campaign", key: "utmCampaign", width: 16 },
    { header: "Referrer", key: "referrer", width: 30 },
  ]);
  for (const lead of leads) {
    leadSheet.addRow({
      ...lead,
      consent: lead.consentToShare ? "Yes" : "No",
      locale: lead.locale === "fil" ? "Filipino" : "English",
      ...lead.journey,
      enquiries: lead.enquiries,
    });
  }

  const journeySheet = addSheet(workbook, "Journey", [
    { header: "Time", key: "createdAt", width: 17, style: date },
    { header: "Email", key: "email", width: 30 },
    { header: "Name", key: "name", width: 22 },
    { header: "Visitor id", key: "anonymousId", width: 38 },
    { header: "Step", key: "type", width: 16 },
    { header: "Details", key: "details", width: 70 },
    { header: "Page", key: "path", width: 45 },
  ]);
  for (const event of events) {
    journeySheet.addRow({
      createdAt: event.createdAt,
      email: event.user?.email ?? "(not signed up)",
      name: event.user?.name ?? "",
      anonymousId: event.anonymousId,
      type: EVENT_LABELS[event.type] ?? event.type,
      details: describe(event.data),
      path: event.path,
    });
  }

  const enquirySheet = addSheet(workbook, "Enquiries", [
    { header: "Sent", key: "createdAt", width: 17, style: date },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Property", key: "property", width: 28 },
    { header: "City", key: "city", width: 16 },
    { header: "Room", key: "roomTypeName", width: 22 },
    { header: "Move in", key: "moveInMonth", width: 15 },
    { header: "Message", key: "message", width: 50 },
    { header: "Account", key: "account", width: 30 },
  ]);
  for (const enquiry of enquiries) {
    enquirySheet.addRow({
      ...enquiry,
      property: enquiry.property?.name ?? "",
      city: enquiry.property?.city.name ?? enquiry.city ?? "",
      account: enquiry.user?.email ?? "",
    });
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
