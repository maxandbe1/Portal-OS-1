// src/engines/permissions/engine.js

// Simple in‑memory permissions registry.
// Shape: { [subject]: { [action]: boolean } }
// Example: { "vfs": { "read": true, "write": false } }

let rules = {
  "*": {
    "*": true // default allow everything; you can tighten this later
  }
};

export function setPermission(subject, action, allowed) {
  if (!rules[subject]) rules[subject] = {};
  rules[subject][action] = !!allowed;
}

export function getRules() {
  return rules;
}

export function clearPermissions() {
  rules = {
    "*": {
      "*": true
    }
  };
}

export function check(subject, action) {
  // Exact match
  if (rules[subject] && rules[subject][action] !== undefined) {
    return rules[subject][action];
  }

  // Subject wildcard
  if (rules[subject] && rules[subject]["*"] !== undefined) {
    return rules[subject]["*"];
  }

  // Global action
  if (rules["*"] && rules["*"][action] !== undefined) {
    return rules["*"][action];
  }

  // Global wildcard
  if (rules["*"] && rules["*"]["*"] !== undefined) {
    return rules["*"]["*"];
  }

  // Default deny if nothing matches
  return false;
}
