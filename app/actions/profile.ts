"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export type ProfileField =
  | "name"
  | "phone"
  | "nationality"
  | "destinationCountry"
  | "destinationCity"
  | "university"
  | "studyStart"
  | "budget";

export type ProfileState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<ProfileField, string>>;
  values?: Partial<Record<ProfileField | "consentToShare", string>>;
};

/** Only same-site paths, so `next` can't send people to another website. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

async function profileSchema() {
  const t = await getTranslations("account.errors");
  const text = (max: number) => z.string().max(max, t("tooLong")).optional();
  return z.object({
    name: z.string().min(2, t("name")).max(100, t("tooLong")),
    phone: z
      .string()
      .max(30, t("tooLong"))
      .regex(/^[+\d\s()-]+$/, t("phone"))
      .optional(),
    nationality: text(60),
    destinationCountry: text(60),
    destinationCity: text(80),
    university: text(120),
    studyStart: text(30),
    budget: text(80),
  });
}

export async function saveProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const session = await getSession();
  if (!session) redirect("/account");

  const [schema, tCommon] = await Promise.all([profileSchema(), getTranslations("common")]);
  const raw: Record<string, string | undefined> = {};
  for (const key of Object.keys(schema.shape)) {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    raw[key] = text || (key === "name" ? "" : undefined);
  }
  const consentToShare = formData.get("consentToShare") === "on";

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      message: tCommon("fixFields"),
      values: { ...raw, consentToShare: consentToShare ? "on" : "" },
      fieldErrors: Object.fromEntries(Object.entries(fieldErrors).map(([field, errors]) => [field, errors?.[0]])),
    };
  }

  const userId = session.user.id;
  try {
    const current = await prisma.user.findUnique({ where: { id: userId }, select: { consentToShare: true } });
    const data = parsed.data;
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Blank fields clear the stored value.
        name: data.name,
        phone: data.phone ?? null,
        nationality: data.nationality ?? null,
        destinationCountry: data.destinationCountry ?? null,
        destinationCity: data.destinationCity ?? null,
        university: data.university ?? null,
        studyStart: data.studyStart ?? null,
        budget: data.budget ?? null,
        consentToShare,
        // Keep the time consent was first given; clear it when withdrawn.
        ...(consentToShare !== current?.consentToShare && { consentAt: consentToShare ? new Date() : null }),
        onboardedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to save profile", error);
    return { status: "error", message: tCommon("somethingWrong") };
  }

  revalidatePath("/", "layout");
  if (formData.get("mode") === "welcome") redirect(safeNext(formData.get("next")));
  return { status: "success" };
}

/** "Skip for now" on the welcome form. */
export async function skipWelcome(formData: FormData): Promise<void> {
  const session = await getSession();
  if (session) {
    await prisma.user.update({ where: { id: session.user.id }, data: { onboardedAt: new Date() } }).catch(() => undefined);
  }
  redirect(safeNext(formData.get("next")));
}
