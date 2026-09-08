const body = `# Página no encontrada | Campus

La ruta solicitada no existe.

- [Inicio](https://campuscli.com/)
- [Campus Profes](https://campuscli.com/profes/)
- [Blackboard MCP](https://campuscli.com/blackboard-mcp/)
- [Mapa del sitio](https://campuscli.com/sitemap.xml)
- [Índice para agentes](https://campuscli.com/.well-known/ard.json)
`;

export function GET() {
  return new Response(body, {
    status: 404,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "no-store",
      Vary: "Accept, Accept-Encoding",
    },
  });
}
