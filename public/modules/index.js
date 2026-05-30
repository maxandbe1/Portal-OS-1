if (!window.Portal) window.Portal = {};
if (!window.Portal.modules) window.Portal.modules = {};

async function loadModules() {
  const res = await fetch("/modules/module-index.json");
  const index = await res.json();

  for (const [name, path] of Object.entries(index)) {
    await import(`/modules/${path}`);
    console.log(`Loaded module: ${name}`);
  }
}

loadModules();
