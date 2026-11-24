type Level = "debug" | "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";

function serializeError(err: unknown) {
  if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
  return err;
}

function write(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (level === "debug" && isProd) return;
  const data = meta
    ? Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, k === "err" ? serializeError(v) : v]))
    : undefined;
  if (isProd) {
    // Structured JSON logs — picked up by the hosting platform's log drain.
    console[level === "debug" ? "log" : level](
      JSON.stringify({ level, msg, time: new Date().toISOString(), ...data }),
    );
  } else {
    console[level === "debug" ? "log" : level](`[${level}] ${msg}`, data ?? "");
  }
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => write("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => write("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => write("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => write("error", msg, meta),
};
