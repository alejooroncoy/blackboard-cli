import type { APIRoute } from "astro";
import body from "../../html/blackboard-cli/index.html?raw";
import { htmlToMarkdown } from "../../lib/html-to-markdown";

/**
 * The Markdown twin of the Blackboard CLI page. See the MCP page's endpoint for
 * why the pillar pages carry one.
 */
export const GET: APIRoute = () => {
  const markdown = [
    "> Consulta Blackboard UPC desde la terminal: cursos, tareas, notas, anuncios y materiales.",
    "",
    "Fuente: https://campuscli.com/blackboard-cli/",
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
