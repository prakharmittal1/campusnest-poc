"use server";

import { getTranslations } from "next-intl/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type FeedbackState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"wouldUse" | "message" | "email", string>>;
  /** Echoed back on error so the form can restore what the user typed. */
  values?: Record<string, string | undefined>;
};

async function feedbackSchemaFor() {
  const t = await getTranslations("feedback.errors");
  return z.object({
    wouldUse: z.enum(["yes", "maybe", "no"]).optional(),
    message: z.string().min(3, t("message")).max(2000, t("messageTooLong")),
    email: z.email(t("email")).optional(),
    page: z.string().startsWith("/").max(300).catch("/"),
  });
}

export async function submitFeedback(_prev: FeedbackState, formData: FormData): Promise<FeedbackState> {
  const feedbackSchema = await feedbackSchemaFor();
  const raw: Record<string, string | undefined> = {};
  for (const key of Object.keys(feedbackSchema.shape)) {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    raw[key] = text || (key === "message" ? "" : undefined);
  }

  const parsed = feedbackSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      values: raw,
      fieldErrors: {
        wouldUse: fieldErrors.wouldUse?.[0],
        message: fieldErrors.message?.[0],
        email: fieldErrors.email?.[0],
      },
    };
  }

  try {
    await prisma.feedback.create({ data: parsed.data });
  } catch (error) {
    console.error("Failed to save feedback", error);
    const t = await getTranslations("common");
    return { status: "error", values: raw, message: t("somethingWrong") };
  }

  return { status: "success" };
}
