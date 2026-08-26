import assert from 'node:assert/strict';
import test from 'node:test';
import { registerBannerTools } from '../src/providers/banner/mcp-tools.js';

test('Banner weekly schedule exposes a canonical tool and a compatibility alias', () => {
  const tools: Array<{ name: string; description: string }> = [];
  const server = {
    registerTool(name: string, config: { description: string }) {
      tools.push({ name, description: config.description });
    },
  };

  registerBannerTools(server as any);

  assert.deepEqual(tools.map((tool) => tool.name), [
    'banner_get_weekly_schedule',
    'campus_get_weekly_schedule',
  ]);
  assert.match(tools[1].description, /Deprecated alias.*banner_get_weekly_schedule/);
});
