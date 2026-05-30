import React, { useState } from "react";

export default function VFSView() {
  const vfs = window.Portal.modules.vfs;

  const [path, setPath] = useState("/");
  const [content, setContent] = useState("");
  const [output, setOutput] = useState("");

  function doList() {
    const res = vfs.list(path);
    setOutput(JSON.stringify(res, null, 2));
  }

  function doRead() {
    const res = vfs.read(path);
    setOutput(JSON.stringify(res, null, 2));
  }

  function doWrite() {
    vfs.write(path, content);
    setOutput("Written.");
  }

  function doDelete() {
    vfs.remove(path);
    setOutput("Deleted.");
  }

  return (
    <div className="module-root">
      <h1>Virtual Filesystem</h1>
      <p className="module-subtitle">Portal‑OS VFS layer.</p>

      <input
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="Path"
        style={{ width: "100%", marginBottom: 12 }}
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Content"
        style={{ width: "100%", height: 80, marginBottom: 12 }}
      />

      <button onClick={doList}>List</button>
      <button onClick={doRead}>Read</button>
      <button onClick={doWrite}>Write</button>
      <button onClick={doDelete}>Delete</button>

      <pre style={{ marginTop: 20 }}>{output}</pre>
    </div>
  );
}
