"use server";

import { cookies, headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { pathFromUrl, recordEvent } from "@/lib/journey";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ANON_COOKIE } from "@/lib/tracking";

export type EnquiryField = "name" | "email" | "phone" | "city" | "moveInMonth" | "roomTypeName" | "message";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<EnquiryField, string>>;
  /** Echoed back on error so the form can restore what the user typed (React resets forms after an action). */
  values?: Partial<Record<EnquiryField, string>>;
};

async function enquirySchema() {
  const t = await getTranslations("enquiry.errors");
  const optionalText = (max: number) => z.string().max(max, t("tooLong")).optional();
  return z.object({
    name: z.string().min(2, t("name")).max(100, t("tooLong")),
    email: z.email(t("email")),
    phone: z
      .string()
      .max(30, t("tooLong"))
      .regex(/^[+\d\s()-]+$/, t("phone"))
      .optional(),
    city: optionalText(80),
    moveInMonth: optionalText(20),
    roomTypeName: optionalText(80),
    message: optionalText(1000),
    propertyId: z.coerce.number().int().positive().optional(),
  });
}

const REQUIRED = new Set(["name", "email"]);

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const [schema, tCommon] = await Promise.all([enquirySchema(), getTranslations("common")]);

  // Trim everything; blank optional fields become undefined so they're stored as NULL.
  const raw: Record<string, string | undefined> = {};
  for (const key of [...Object.keys(schema.shape)]) {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    raw[key] = text || REQUIRED.has(key) ? text : undefined;
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      message: tCommon("fixFields"),
      values: raw,
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors?.[0]]),
      ),
    };
  }

  const { propertyId, ...data } = parsed.data;
  const [session, cookieStore, headerList] = await Promise.all([
    getSession().catch(() => null),
    cookies(),
    headers(),
  ]);
  const userId = session?.user.id;

  let property: { id: number; name: string } | null = null;
  try {
    property = propertyId
      ? await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true, name: true } })
      : null;
    await prisma.enquiry.create({ data: { ...data, propertyId: property?.id, userId } });
    // Fill in profile gaps from the enquiry, so the lead record stays complete.
    if (userId && data.phone) {
      await prisma.user.updateMany({ where: { id: userId, phone: null }, data: { phone: data.phone } });
    }
  } catch (error) {
    console.error("Failed to save enquiry", error);
    return { status: "error", message: tCommon("somethingWrong") };
  }

  const anonymousId = cookieStore.get(ANON_COOKIE)?.value;
  if (anonymousId || userId) {
    await recordEvent({
      type: "enquiry_sent",
      anonymousId: anonymousId ?? `user:${userId}`,
      userId,
      path: pathFromUrl(headerList.get("referer")),
      data: {
        property: property?.name ?? null,
        city: data.city ?? null,
        room: data.roomTypeName ?? null,
        moveIn: data.moveInMonth ?? null,
      },
    });
  }

  return { status: "success" };
}
