const buffer = [];

export function logToConsole(entry) {
  buffer.push({
    ts: Date.now(),
    entry
  });
  if (buffer.length > 200) buffer.shift();
}

export function getConsoleState() {
  return {
    logs: [...buffer]
  };
}
