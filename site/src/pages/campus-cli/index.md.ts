import type { APIRoute } from "astro";
import body from "../../html/campus-cli/index.html?raw";
import { htmlToMarkdown } from "../../lib/html-to-markdown";

/**
 * The Markdown twin of the Campus CLI product page. See the homepage's
 * endpoint for why the pillar pages carry one.
 */
export const GET: APIRoute = () => {
  const markdown = [
    "# Campus CLI",
    "",
    "> Conecta el Aula Virtual (Blackboard UPC) con el asistente de IA que ya usas.",
    "",
    "Fuente: https://campuscli.com/campus-cli/",
    "Texto completo del sitio: https://campuscli.com/llms-full.txt",
    "",
    "---",
    "",
    htmlToMarkdown(body),
  ].join("\n");

  return new Response(`${markdown.trimEnd()}\n`, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
};
