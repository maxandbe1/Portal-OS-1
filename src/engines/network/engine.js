// src/engines/network/engine.js

export async function request(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body = null,
    timeout = 8000
  } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal
    });

    clearTimeout(id);

    const text = await res.text();
    let json = null;

    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }

    return {
      ok: res.ok,
      status: res.status,
      data: json
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message || "Network error"
    };
  }
}

export function get(url, timeout = 8000) {
  return request(url, { method: "GET", timeout });
}

export function post(url, body, timeout = 8000) {
  return request(url, { method: "POST", body, timeout });
}

export function put(url, body, timeout = 8000) {
  return request(url, { method: "PUT", body, timeout });
}

export function del(url, timeout = 8000) {
  return request(url, { method: "DELETE", timeout });
}
