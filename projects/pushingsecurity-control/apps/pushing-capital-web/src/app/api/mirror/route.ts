import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/mirror
 * WebSocket-based screen mirror endpoint.
 * Returns the current mirror status and connection info.
 *
 * The actual WebSocket server runs as a standalone process
 * on port 3021 to avoid Next.js limitations.
 */

const MIRROR_PORT = 3021;

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "pushingSecurity Mirror",
    websocket: `ws://localhost:${MIRROR_PORT}`,
    status: "ready",
    protocol: "stealth-mirror-v1",
    capabilities: [
      "screen-capture",
      "dom-snapshot",
      "location-sync",
      "input-relay",
    ],
    instructions: {
      connect: `new WebSocket('ws://localhost:${MIRROR_PORT}')`,
      subscribe: '{ "type": "subscribe", "channel": "mirror" }',
      navigate: '{ "type": "navigate", "url": "http://localhost:3020" }',
    },
  });
}
