async function initMermaid() {
  const mermaidNodes = document.querySelectorAll(".mermaid");
  if (mermaidNodes.length === 0) return;

  const mermaid = (
    await import("https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs")
  ).default;

  mermaid.initialize({ startOnLoad: false });
  mermaid.registerIconPacks([
    {
      name: "logos",
      loader: () =>
        fetch("https://unpkg.com/@iconify-json/logos@1/icons.json").then((res) =>
          res.json(),
        ),
    },
  ]);
  await mermaid.run({ querySelector: ".mermaid" });
}

function bootCustomScripts() {
  initMermaid().catch((error) => {
    console.error("Failed to initialize mermaid", error);
  });
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", bootCustomScripts, { once: true });
} else {
  bootCustomScripts();
}
