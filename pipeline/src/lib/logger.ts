import type { Logger } from "../types.js";

export function makeLogger(prefix: string): Logger {
  return {
    info(msg) { console.log(`[${prefix}] ${msg}`); },
    warn(msg) { console.warn(`[${prefix}] ⚠ ${msg}`); },
    error(msg, err?) {
      console.error(`[${prefix}] ✗ ${msg}`);
      if (err) console.error(err);
    },
  };
}
