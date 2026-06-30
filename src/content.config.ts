import { defineCollection, z } from "astro:content";

const playbook = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    navLabel: z.string().optional(),
    summary: z.string().optional(),
    order: z.number(),
  }),
});

export const collections = { playbook };
