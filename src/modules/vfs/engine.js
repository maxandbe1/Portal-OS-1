export function vfsWrite(path, content) {
  window.Portal?.modules?.vfs?.write(path, content);
}

export function vfsRead(path) {
  return window.Portal?.modules?.vfs?.read(path) || null;
}

export function vfsList(path = "/") {
  return window.Portal?.modules?.vfs?.list(path) || [];
}

export function getVfsState() {
  return window.Portal?.modules?.vfs?.getState() || {};
}
