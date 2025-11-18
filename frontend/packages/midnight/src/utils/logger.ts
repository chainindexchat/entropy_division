type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
}

class MidnightLogger {
  private level: LogLevel

  constructor() {
    // Read log level from environment variable
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'info'
    this.level = this.isValidLogLevel(envLevel) ? envLevel : 'info'
  }

  private isValidLogLevel(level: string): level is LogLevel {
    return level in LOG_LEVELS
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level]
  }

  debug(...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log('🌙 [DEBUG]', ...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log('🌙 [INFO]', ...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn('🌙 [WARN]', ...args)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error('🌙 [ERROR]', ...args)
    }
  }
}

export const logger = new MidnightLogger()
