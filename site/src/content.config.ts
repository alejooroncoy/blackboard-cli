import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * One Markdown file per guide, and everything else is derived from it: the
 * page, its Markdown twin for assistants, the blog index, the sitemap.
 *
 * Written down as a schema so a missing description or a malformed date fails
 * the build instead of shipping a page Google cannot summarise.
 */
const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    /** The h1, written for the reader. */
    title: z.string(),
    /** The <title>, written for the results page. Falls back to the h1. */
    seoTitle: z.string().optional(),
    /** Social title, when sharing should read differently from the h1. */
    ogTitle: z.string().optional(),
    // Shown in search results, so it has to stand alone without the title.
    description: z.string().min(70).max(180),
    published: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** Grouping shown on the hub, e.g. "Guía · Estudiantes UPC". */
    tag: z.string(),
    section: z.enum(["fundador", "empieza", "comparativa", "tutorial"]),
    readingMinutes: z.number().int().positive(),
    summary: z.array(z.string()).min(2).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    howTo: z
      .object({
        name: z.string(),
        totalTime: z.string().optional(),
        steps: z.array(z.object({ name: z.string(), text: z.string() })),
      })
      .optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
