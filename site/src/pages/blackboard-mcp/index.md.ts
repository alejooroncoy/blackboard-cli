import type { APIRoute } from "astro";
import body from "../../html/blackboard-mcp/index.html?raw";
import { htmlToMarkdown } from "../../lib/html-to-markdown";

/**
 * The Markdown twin of the Blackboard MCP page.
 *
 * This is a pillar page — the one an assistant lands on when asked "how do I
 * connect Blackboard to ChatGPT" — and until now it was the only kind of page
 * on the site without a plain-text version to quote from.
 */
export const GET: APIRoute = () => {
  const markdown = [
    "> Conecta el Aula Virtual (Blackboard UPC) con asistentes de IA compatibles con Model Context Protocol.",
    "",
    "Fuente: https://campuscli.com/blackboard-mcp/",
    "",
    "---",
    "",
    htmlToMarkdown(body),
    "",
    "---",
    "",
    "Campus es un proyecto independiente, sin relación con UPC ni con Blackboard:",
    "https://campuscli.com/no-afiliacion/",
  ].join("\n");

  return new Response(`${markdown}\n`, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
};
