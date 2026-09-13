"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type EnquiryField = "name" | "email" | "phone" | "city" | "moveInMonth" | "roomTypeName" | "message";

export type EnquiryState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<EnquiryField, string>>;
  /** Echoed back on error so the form can restore what the user typed (React resets forms after an action). */
  values?: Partial<Record<EnquiryField, string>>;
};

const optionalText = (max: number, label: string) =>
  z.string().max(max, `${label} is too long.`).optional();

const enquirySchema = z.object({
  name: z.string().min(2, "Please enter your full name.").max(100, "Name is too long."),
  email: z.email("Please enter a valid email address."),
  phone: z
    .string()
    .max(30, "Phone number is too long.")
    .regex(/^[+\d\s()-]+$/, "Use digits, spaces, brackets and + only.")
    .optional(),
  city: optionalText(80, "City"),
  moveInMonth: optionalText(20, "Move-in month"),
  roomTypeName: optionalText(80, "Room type"),
  message: optionalText(1000, "Message"),
  propertyId: z.coerce.number().int().positive().optional(),
});

const REQUIRED = new Set(["name", "email"]);

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Trim everything; blank optional fields become undefined so they're stored as NULL.
  const raw: Record<string, string | undefined> = {};
  for (const key of [...Object.keys(enquirySchema.shape)]) {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    raw[key] = text || REQUIRED.has(key) ? text : undefined;
  }

  const parsed = enquirySchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      values: raw,
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).map(([field, errors]) => [field, errors?.[0]]),
      ),
    };
  }

  const { propertyId, ...data } = parsed.data;

  try {
    const property = propertyId
      ? await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true } })
      : null;
    await prisma.enquiry.create({ data: { ...data, propertyId: property?.id } });
  } catch (error) {
    console.error("Failed to save enquiry", error);
    return { status: "error", message: "Something went wrong on our side. Please try again." };
  }

  return { status: "success" };
}
