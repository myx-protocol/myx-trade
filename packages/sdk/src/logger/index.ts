/**
 * MyxLogger
 * @description MyxLogger is a logger for Myx SDK
 * @author Myx
 * @version 1.0.0
 * @since 2025-09-19
 * @license MIT
 * @copyright Myx
 * @description MyxLogger is a logger for Myx SDK
 */

export type LogLevel = "debug" | "info" | "error" | "warn" | "none";

export interface LoggerOptions {
  logLevel?: LogLevel;
}
export class Logger {
  private options: LoggerOptions;
  constructor(options?: LoggerOptions) {
    this.options = {
      ...options,
      logLevel: options?.logLevel || "info",
    };
  }
  /**
   * debug
   */
  debug(message: string, ...args: any[]) {
    if (this.options.logLevel === "none") return;
    if (this.options.logLevel === "debug") {
      console.log(`[MYX-SDK-DEBUG] ${message}`, ...args);
    }
  }

  /**
   * info
   */
  info(message: string, ...args: any[]) {
    if (this.options.logLevel === "none") return;
    if (this.options.logLevel === "debug" || this.options.logLevel === "info") {
      console.log(`[MYX-SDK-INFO] ${message}`, ...args);
    }
  }

  /**
   * error
   */
  error(message: string, ...args: any[]) {
    if (this.options.logLevel === "none") return;
    if (
      this.options.logLevel === "debug" ||
      this.options.logLevel === "info" ||
      this.options.logLevel === "error"
    ) {
      console.error(`[MYX-SDK-ERROR] ${message}`, ...args);
    }
  }

  /**
   * warn
   */
  warn(message: string, ...args: any[]) {
    if (this.options.logLevel !== "none") {
      console.warn(`[MYX-SDK-WARN] ${message}`, ...args);
    }
  }
}
