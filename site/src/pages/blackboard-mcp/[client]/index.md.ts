import type { APIRoute } from "astro";
import clients from "../../../data/mcp-clients.json";
import { htmlToMarkdown } from "../../../lib/html-to-markdown";

/**
 * The Markdown twin of each per-client page.
 *
 * These pages answer a question a model gets asked directly ("how do I connect
 * Blackboard to Cursor"), so handing over clean Markdown is what decides
 * whether the answer quotes us or a forum thread. The html pages never had one
 * because they predate the convention.
 */
const bodies = import.meta.glob("../../../html/blackboard-mcp/clients/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export function getStaticPaths() {
  return Object.keys(clients).map((client) => ({ params: { client } }));
}

export const GET: APIRoute = ({ params }) => {
  const client = params.client as keyof typeof clients;
  const data = clients[client];
  const body = bodies[`../../../html/blackboard-mcp/clients/${client}.html`];
  if (!data || !body) return new Response("No encontrado", { status: 404 });

  const markdown = [
    `> ${data.description}`,
    "",
    `Fuente: ${data.canonical}`,
    "",
    "---",
    "",
    htmlToMarkdown(body),
  ].join("\n");

  return new Response(`${markdown.trimEnd()}\n`, {
    headers: {
      // Without this the file downloads instead of being read, and the site
      // sends X-Content-Type-Options: nosniff, so nothing recovers it.
      "content-type": "text/markdown; charset=utf-8",
    },
  });
};
