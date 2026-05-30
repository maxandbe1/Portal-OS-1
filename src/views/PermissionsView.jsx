import React, { useState } from "react";

export default function PermissionsView() {
  const perms = window.Portal.modules.permissions;

  const [subject, setSubject] = useState("vfs");
  const [action, setAction] = useState("write");
  const [allowed, setAllowed] = useState(true);
  const [rules, setRules] = useState(perms.getRules());
  const [checkSubject, setCheckSubject] = useState("vfs");
  const [checkAction, setCheckAction] = useState("write");
  const [checkResult, setCheckResult] = useState(null);

  function refresh() {
    setRules(perms.getRules());
  }

  function applyRule() {
    perms.set(subject, action, allowed);
    refresh();
  }

  function clearAll() {
    perms.clear();
    refresh();
  }

  function runCheck() {
    const res = perms.check(checkSubject, checkAction);
    setCheckResult(res);
  }

  return (
    <div className="module-root">
      <h1>Permissions</h1>
      <p className="module-subtitle">Capability and access control kernel.</p>

      <h3>Set permission</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (e.g. vfs, network)"
          style={{ width: 180, marginRight: 8 }}
        />
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Action (e.g. read, write)"
          style={{ width: 160, marginRight: 8 }}
        />
        <label style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={allowed}
            onChange={(e) => setAllowed(e.target.checked)}
          />{" "}
          Allowed
        </label>
        <button onClick={applyRule}>Apply</button>
        <button onClick={clearAll} style={{ marginLeft: 8 }}>
          Clear all
        </button>
      </div>

      <h3>Check permission</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          value={checkSubject}
          onChange={(e) => setCheckSubject(e.target.value)}
          placeholder="Subject"
          style={{ width: 180, marginRight: 8 }}
        />
        <input
          value={checkAction}
          onChange={(e) => setCheckAction(e.target.value)}
          placeholder="Action"
          style={{ width: 160, marginRight: 8 }}
        />
        <button onClick={runCheck}>Check</button>
        {checkResult !== null && (
          <span style={{ marginLeft: 8 }}>
            Result: {checkResult ? "ALLOWED" : "DENIED"}
          </span>
        )}
      </div>

      <h3>Rules</h3>
      <pre style={{ maxHeight: 220, overflow: "auto" }}>
        {JSON.stringify(rules, null, 2)}
      </pre>
    </div>
  );
}
