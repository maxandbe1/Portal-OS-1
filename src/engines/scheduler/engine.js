// src/engines/scheduler/engine.js

let nextId = 1;
let tasks = {};
let ticking = false;
let tickInterval = null;

function startTick() {
  if (ticking) return;
  ticking = true;

  tickInterval = setInterval(() => {
    const now = Date.now();

    Object.values(tasks).forEach(task => {
      if (task.cancelled) return;

      if (now >= task.nextRun) {
        try {
          task.fn();
        } catch (err) {
          console.error("Scheduler task error:", err);
        }

        if (task.interval) {
          task.nextRun = now + task.interval;
        } else {
          task.cancelled = true;
        }
      }
    });
  }, 50);
}

function stopTick() {
  if (!ticking) return;
  clearInterval(tickInterval);
  tickInterval = null;
  ticking = false;
}

export function schedule(fn, delay = 0, interval = null) {
  const id = nextId++;
  const now = Date.now();

  tasks[id] = {
    id,
    fn,
    delay,
    interval,
    nextRun: now + delay,
    createdAt: now,
    cancelled: false
  };

  startTick();
  return id;
}

export function cancel(id) {
  if (tasks[id]) {
    tasks[id].cancelled = true;
  }
}

export function clearAll() {
  tasks = {};
  stopTick();
}

export function listTasks() {
  return Object.values(tasks).map(t => ({
    id: t.id,
    delay: t.delay,
    interval: t.interval,
    nextRun: t.nextRun,
    createdAt: t.createdAt,
    cancelled: t.cancelled
  }));
}
