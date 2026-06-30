export function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}
