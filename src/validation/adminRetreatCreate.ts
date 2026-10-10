import { z } from "zod";

/** Admin create-draft validation. Always forced to draft/submitted server-side. */
export const adminRetreatCreateSchema = z.object({
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  type: z.string().min(1).max(50),
  categories: z.array(z.string()).optional().default([]),
  location: z.string().max(500).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  region: z.enum(["europe","latin_america","asia","africa","north_america","oceania","middle_east"]).optional().nullable(),
  dates_display: z.string().max(120).optional().nullable(),
  price_display: z.string().max(120).optional().nullable(),
  price_from: z.coerce.number().optional().nullable(),
  price_currency: z.string().max(10).optional().nullable(),
  price_notes: z.string().max(500).optional().nullable(),
  image_path: z.string().max(500).optional().nullable(),
  gallery_paths: z.array(z.string().max(500)).optional().nullable(),
  description: z.string().max(8000).optional().nullable(),
  inclusions: z.array(z.string()).optional().nullable(),
  exclusions: z.array(z.string()).optional().nullable(),
  itinerary: z.array(
    z.object({
      label: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
    })
  ).optional().nullable(),
  operator_name: z.string().max(200).optional().nullable(),
  operator_website: z.string().max(500).optional().nullable(),
  min_age: z.coerce.number().int().optional().nullable(),
  max_age: z.coerce.number().int().optional().nullable(),
  age_notes: z.string().max(500).optional().nullable(),
  booking_url: z.string().max(500).optional().nullable(),
  commercial_status: z.enum(["free_listing","promotion","commission","partnership","other"]).optional().nullable(),
  internal_notes: z.string().max(8000).optional().nullable(),
});

export type AdminRetreatCreatePayload = z.infer<typeof adminRetreatCreateSchema>;