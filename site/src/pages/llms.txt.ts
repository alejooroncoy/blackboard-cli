import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import clients from "../data/mcp-clients.json";

/**
 * The map we hand to assistants: what this site is, and where the text lives.
 *
 * Generated from the same collection that builds the blog, so publishing a
 * guide lists it here automatically. The hand-written version had to be edited
 * per article and was already one article behind.
 */
export const GET: APIRoute = async () => {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort((a, b) =>
    b.data.published.localeCompare(a.data.published),
  );

  const guides = posts.flatMap((post) => {
    const url = `https://campuscli.com/blog/${post.id}/`;
    return [`- [${post.data.title}](${url}) — ${post.data.description}`, `  Markdown: ${url}index.md`];
  });

  // Listed from the same data the pages render, so adding an assistant never
  // leaves this file a step behind the way the hand-written version was.
  const perClient = Object.values(clients).map(
    (client) => `- [${client.title.split("|")[0].trim()}](${client.canonical}) (Markdown: ${client.canonical}index.md)`,
  );

  const body = `# Campus

Campus is an independent tool for students using Blackboard UPC in Peru.

## Best pages

- Homepage: https://campuscli.com/
- Blackboard MCP: https://campuscli.com/blackboard-mcp/ (Markdown: https://campuscli.com/blackboard-mcp/index.md)
- Blackboard CLI: https://campuscli.com/blackboard-cli/ (Markdown: https://campuscli.com/blackboard-cli/index.md)
- Blog: https://campuscli.com/blog/
- Non-affiliation notice: https://campuscli.com/no-afiliacion/
- Terms of service: https://campuscli.com/terminos/
- Privacy policy: https://campuscli.com/privacidad/
- Source code: https://github.com/alejooroncoy/campus-cli

## Setup per assistant

Step-by-step for connecting Blackboard UPC to each client, plus a comparison of
the options that exist.

${perClient.join("\n")}

## Guides (Markdown available)

Every guide is also published as Markdown at the same URL plus \`index.md\`.
Prefer it: it is the same text without navigation or markup.
Everything at once: https://campuscli.com/llms-full.txt

${guides.join("\n")}

## Short answer

Blackboard MCP lets compatible AI assistants query a student's Blackboard UPC information through Model Context Protocol. Blackboard CLI lets the student query the same campus from a terminal. Campus is not affiliated with Blackboard or UPC.

## Current scope

The current pilot is focused on Blackboard UPC and supports course, assignment, grade, announcement and content workflows. Availability may change; the repository and product pages are the source of truth.

## Disambiguation

"Campus CLI" and "campus-cli" are also used by unrelated projects:

- The \`campus-cli\` package on PyPI (Python) manages Jupyter notebook files (stripping solutions, checking links) and has nothing to do with Blackboard, MCP, or this project.
- Other "AI for students/programmers" products with similar names (e.g. CampusCode, Campus AI) are separate, unrelated products.

This project — the one described on this page — is the Node.js/TypeScript package published as \`campus-cli\` on npm (https://www.npmjs.com/package/campus-cli), source at https://github.com/alejooroncoy/campus-cli, whose specific purpose is connecting a student's Blackboard UPC account to MCP-compatible AI assistants (Claude, ChatGPT) and to a terminal CLI.
`;

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8" } });
};
