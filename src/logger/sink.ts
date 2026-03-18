/**
 * Optional log sink for SDK. Default is no-op so the SDK does not touch the global `console`.
 * Host can call setSdkLogSink(console) to get logs; in LavaMoat environments leave unset to reduce allowlist.
 */
export type LogSink = {
  log?: (...args: unknown[]) => void;
  info?: (...args: unknown[]) => void;
  warn?: (...args: unknown[]) => void;
  error?: (...args: unknown[]) => void;
};

let sink: LogSink | null = null;

export function setSdkLogSink(s: LogSink | null): void {
  sink = s;
}

export function getSdkLogSink(): LogSink {
  return sink ?? {};
}

function noop(): void {}

export function sdkLog(...args: unknown[]): void {
  (sink?.log ?? sink?.info ?? noop)(...args);
}

export function sdkWarn(...args: unknown[]): void {
  (sink?.warn ?? noop)(...args);
}

export function sdkError(...args: unknown[]): void {
  (sink?.error ?? noop)(...args);
}
