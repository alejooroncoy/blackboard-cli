import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { strict as assert } from "node:assert";

const publicPath = new URL("../public/", import.meta.url);
const read = (path) => readFile(new URL(path, publicPath), "utf8");

const robots = await read("robots.txt");
assert.match(robots, /^Content-Signal: ai-train=no, search=yes, ai-input=yes$/m);
assert.match(robots, /^Agentmap: https:\/\/campuscli\.com\/.well-known\/ard\.json$/m);

const protectedResource = JSON.parse(await read(".well-known/oauth-protected-resource"));
assert.equal(protectedResource.resource, "https://mcp.campuscli.com/mcp");
assert.deepEqual(protectedResource.authorization_servers, ["https://mcp.campuscli.com"]);
assert.deepEqual(protectedResource.scopes_supported, ["campus.read", "campus.identity"]);

const card = JSON.parse(await read(".well-known/mcp-server-card.json"));
assert.equal(card.name, "com.campuscli/blackboard");
assert.equal(card.remotes?.[0]?.url, "https://mcp.campuscli.com/mcp");

for (const catalogPath of [".well-known/ard.json", ".well-known/ai-catalog.json"]) {
  const catalog = JSON.parse(await read(catalogPath));
  assert.equal(catalog.entries?.[0]?.type, "application/mcp-server-card+json");
  assert.equal(catalog.entries?.[0]?.url, "https://campuscli.com/.well-known/mcp-server-card.json");
}

const skills = JSON.parse(await read(".well-known/agent-skills/index.json"));
const skill = skills.skills?.[0];
const source = await read(".well-known/agent-skills/campus-blackboard/SKILL.md");
const digest = createHash("sha256").update(source).digest("hex");
assert.equal(skill?.digest, `sha256:${digest}`);
assert.match(source, /^name: campus-blackboard$/m);

const fallback = await read("404.md");
assert.match(fallback, /^# Página no encontrada \| Campus$/m);

console.log("Agent discovery metadata is internally consistent.");
