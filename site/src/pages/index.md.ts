import type { APIRoute } from "astro";
import body from "../html/index.html?raw";
import { htmlToMarkdown } from "../lib/html-to-markdown";

/**
 * The Markdown twin of the homepage.
 *
 * It is the page most likely to be fetched when someone asks an assistant what
 * Campus is, and it was the last one without a plain-text version: the answer
 * came from whatever the crawler managed to pull out of a page built around a
 * diagram and a pricing block.
 */
export const GET: APIRoute = () => {
  const markdown = [
    "# Campus",
    "",
    "> Conecta el Aula Virtual (Blackboard UPC) con el asistente de IA que ya usas.",
    "",
    "Fuente: https://campuscli.com/",
    "Texto completo del sitio: https://campuscli.com/llms-full.txt",
    "",
    "---",
    "",
    htmlToMarkdown(body),
  ].join("\n");

  return new Response(`${markdown.trimEnd()}\n`, {
    headers: {
      // Without an explicit type the file downloads instead of being read, and
      // the site sends X-Content-Type-Options: nosniff, so nothing recovers it.
      "content-type": "text/markdown; charset=utf-8",
    },
  });
};
