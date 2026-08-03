import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { extname, join } from "node:path";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

function contentType(pathname) {
  const extension = extname(pathname);
  if (extension === ".json") return "application/json; charset=utf-8";
  if (extension === ".txt") return "text/plain; charset=utf-8";
  return "application/octet-stream";
}

function makeEnv() {
  return {
    ASSETS: {
      fetch: async (request) => {
        const url = new URL(request.url);
        const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
        try {
          const file = await readFile(
            join(new URL("../dist/client", import.meta.url).pathname, pathname),
          );
          return new Response(file, {
            headers: { "content-type": contentType(pathname) },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  };
}

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

test("renders development preview metadata", async () => {
  const worker = await loadWorker();

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    makeEnv(),
    context,
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  assert.match(await response.text(), developmentPreviewMeta);
});

test("exposes common agent discovery endpoints", async () => {
  const worker = await loadWorker();
  const env = makeEnv();

  const agentAlias = await worker.fetch(
    new Request("http://localhost/.well-known/agent.json"),
    env,
    context,
  );
  assert.equal(agentAlias.status, 200);
  assert.equal((await agentAlias.json()).version, "0.6-agent-discovery-aliases");

  const llms = await worker.fetch(
    new Request("http://localhost/llms.txt"),
    env,
    context,
  );
  assert.equal(llms.status, 200);
  assert.match(await llms.text(), /Machine-readable contract: \/agent\.json/);

  const openapi = await worker.fetch(
    new Request("http://localhost/openapi.json"),
    env,
    context,
  );
  assert.equal(openapi.status, 200);
  assert.equal((await openapi.json()).info.version, "0.6-agent-discovery-aliases");
});
