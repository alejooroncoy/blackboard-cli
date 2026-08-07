import type { APIRoute } from "astro";
import body from "../../html/blackboard-chatgpt/index.html?raw";
import { htmlToMarkdown } from "../../lib/html-to-markdown";

/**
 * The Markdown twin of the paid service page.
 *
 * "Can I use Blackboard from ChatGPT" is a question people ask an assistant
 * before they ask a search engine, so this is the page most likely to be read
 * by a model rather than a person.
 */
export const GET: APIRoute = () => {
  const markdown = [
    "# Blackboard UPC en ChatGPT",
    "",
    "> Conecta el Aula Virtual de la UPC con ChatGPT o Claude, también desde el móvil, sin instalar nada.",
    "",
    "Fuente: https://campuscli.com/blackboard-chatgpt/",
    "Alternativa gratuita para clientes de escritorio: https://campuscli.com/blackboard-cli/",
    "",
    "---",
    "",
    htmlToMarkdown(body),
  ].join("\n");

  return new Response(`${markdown.trimEnd()}\n`, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
};
