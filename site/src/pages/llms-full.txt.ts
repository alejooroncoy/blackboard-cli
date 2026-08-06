import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

/**
 * Every guide, end to end, in one plain-text file.
 *
 * An assistant answering "how do I stop missing deadlines in Blackboard UPC"
 * can read this in one request instead of crawling three pages and hoping it
 * found them all. Cheap for us to serve, and it is the difference between
 * being summarised from a snippet and being quoted from the source.
 */
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort((a, b) =>
    b.data.published.localeCompare(a.data.published),
  );

  const sections = posts.map((post) => {
    const url = `https://campuscli.com/blog/${post.id}/`;
    const summary = post.data.summary?.length
      ? ["## En resumen", "", ...post.data.summary.map((line) => `- ${line.replace(/<[^>]+>/g, "")}`), ""]
      : [];
    const faq = post.data.faq?.length
      ? ["", "## Preguntas frecuentes", "", ...post.data.faq.flatMap((item) => [`### ${item.q}`, "", item.a, ""])]
      : [];
    return [
      "=".repeat(72),
      `# ${post.data.title}`,
      "",
      `> ${post.data.description}`,
      "",
      `Fuente: ${url}`,
      `Actualizado: ${post.data.updated}`,
      "",
      ...summary,
      post.body?.trim() ?? "",
      ...faq,
    ].join("\n");
  });

  const body = [
    "# Campus — guías completas sobre Blackboard UPC",
    "",
    "Campus conecta el Aula Virtual (Blackboard UPC) con asistentes de IA por MCP,",
    "y con la terminal por CLI. Proyecto independiente, sin relación con UPC ni",
    "con Blackboard.",
    "",
    "Este archivo contiene el texto completo de todas las guías publicadas.",
    "Índice y enlaces: https://campuscli.com/llms.txt",
    "",
    ...sections,
  ].join("\n");

  return new Response(`${body}\n`, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
};
