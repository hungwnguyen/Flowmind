const assert = require("node:assert/strict");
const {
  chromium,
} = require("C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async () => {
  const b = await chromium.launch(),
    p = await b.newPage();
  await p.goto(process.env.DESIGNER_URL || "http://127.0.0.1:3000/tools/designer-source/");
  await p.locator(".ui-board").waitFor();
  const r = await p.evaluate(async () => {
    const { record, records } = await import("./idb.mjs");
    for (const [key, value] of [
      ["doc:probe:one", { name: "First" }],
      ["doc:probe:two", { name: "Second" }],
      ["doc:probe-other:three", { name: "Other workspace" }],
      ["resource:probe:one", new Blob(["image"])],
      ["cache:psd-paint:unrelated", "x".repeat(8 * 1024 * 1024)],
    ])
      await record(key, value);
    const queries = [],
      proto = IDBObjectStore.prototype,
      original = proto.getAll;
    proto.getAll = function (range) {
      queries.push([range?.lower, range?.upper]);
      return original.call(this, range);
    };
    try {
      const docs = await records("doc:probe:"),
        none = await records("doc:missing:");
      if (docs.length !== 2 || none.length)
        throw Error("Prefix read crossed workspace boundaries");
      return { names: docs.map(([k, v]) => v.name), queries };
    } finally {
      proto.getAll = original;
    }
  });
  assert.deepEqual(r.names, ["First", "Second"]);
  assert.deepEqual(r.queries, [
    ["doc:probe:", "doc:probe:\uffff"],
    ["doc:missing:", "doc:missing:\uffff"],
  ]);
  console.log(
    "Workspace restores use bounded bulk reads; unrelated paint caches and other workspaces are excluded.",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
