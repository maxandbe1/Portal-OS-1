import React, { useState } from "react";

export default function EventBusView() {
  const bus = window.Portal.modules.eventbus;

  const [topic, setTopic] = useState("test.event");
  const [payload, setPayload] = useState("{}");
  const [log, setLog] = useState([]);
  const [subs, setSubs] = useState([]);

  function append(msg) {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }

  function doPublish() {
    let data = null;
    try {
      data = JSON.parse(payload);
    } catch {
      append("Invalid JSON payload");
      return;
    }

    bus.publish(topic, data);
    append(`Published ${topic}`);
  }

  function doSubscribe() {
    const id = bus.subscribe(topic, (data, t) => {
      append(`Received event ${t}: ${JSON.stringify(data)}`);
    });

    setSubs(prev => [...prev, id]);
    append(`Subscribed to ${topic} (id=${id})`);
  }

  function doUnsubscribe(id) {
    bus.unsubscribe(id);
    setSubs(prev => prev.filter(x => x !== id));
    append(`Unsubscribed id=${id}`);
  }

  return (
    <div className="module-root">
      <h1>Event Bus</h1>
      <p className="module-subtitle">Portal‑OS signal and message kernel.</p>

      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic"
        style={{ width: "100%", marginBottom: 8 }}
      />

      <textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        placeholder="JSON payload"
        style={{ width: "100%", height: 80, marginBottom: 8 }}
      />

      <button onClick={doPublish}>Publish</button>
      <button onClick={doSubscribe} style={{ marginLeft: 8 }}>
        Subscribe
      </button>

      <h3 style={{ marginTop: 20 }}>Subscriptions</h3>
      {subs.map(id => (
        <div key={id} style={{ marginBottom: 4 }}>
          <span>#{id}</span>
          <button
            onClick={() => doUnsubscribe(id)}
            style={{ marginLeft: 8 }}
          >
            Unsubscribe
          </button>
        </div>
      ))}

      <h3 style={{ marginTop: 20 }}>Log</h3>
      <pre style={{ maxHeight: 200, overflow: "auto" }}>
        {log.join("\n")}
      </pre>
    </div>
  );
}
