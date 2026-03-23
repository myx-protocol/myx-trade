import { getSdkLogSink } from "./sink.js";

/**
 * MyxLogger
 * Uses optional sink (no global console by default) so LavaMoat allowlist can omit "console".
 * Host can setSdkLogSink(console) to get logs.
 */
export type LogLevel = "debug" | "info" | "error" | "warn" | "none";

export interface LoggerOptions {
  logLevel?: LogLevel;
  /** Optional sink; if not set, uses getSdkLogSink() (no-op by default). */
  sink?: { log?: (...a: unknown[]) => void; info?: (...a: unknown[]) => void; warn?: (...a: unknown[]) => void; error?: (...a: unknown[]) => void };
}

export class Logger {
  private options: LoggerOptions;
  constructor(options?: LoggerOptions) {
    this.options = {
      ...options,
      logLevel: options?.logLevel ?? "info",
    };
  }

  private get out() {
    return this.options.sink ?? getSdkLogSink();
  }

  debug(message: string, ...args: unknown[]) {
    if (this.options.logLevel === "none") return;
    if (this.options.logLevel === "debug") {
      (this.out.log ?? this.out.info)?.(`[MYX-SDK-DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]) {
    if (this.options.logLevel === "none") return;
    if (this.options.logLevel === "debug" || this.options.logLevel === "info") {
      (this.out.log ?? this.out.info)?.(`[MYX-SDK-INFO] ${message}`, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.options.logLevel === "none") return;
    if (this.options.logLevel === "debug" || this.options.logLevel === "info" || this.options.logLevel === "error") {
      this.out.error?.(`[MYX-SDK-ERROR] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.options.logLevel !== "none") {
      this.out.warn?.(`[MYX-SDK-WARN] ${message}`, ...args);
    }
  }
}

export {
  setSdkLogSink,
  getSdkLogSink,
  sdkLog,
  sdkWarn,
  sdkError,
} from "./sink.js";
export type { LogSink } from "./sink.js";
