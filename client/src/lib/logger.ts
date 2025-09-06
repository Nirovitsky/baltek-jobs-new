/**
 * Logger utility for consistent logging across the application
 * In development: logs to console
 * In production: can be extended to send to external services
 */

import { isDevelopment, isProduction, debugMode, logLevel } from '@/config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private static isDevelopment = isDevelopment;
  private static isProduction = isProduction;
  private static debugMode = debugMode;
  private static logLevel = logLevel;

  private static formatMessage(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private static shouldLog(level: LogLevel): boolean {
    // If debug mode is disabled, only log warnings and errors
    if (!this.debugMode) {
      return level === 'warn' || level === 'error';
    }
    
    // Check log level hierarchy
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private static log(level: LogLevel, message: string, data?: any, context?: string): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.formatMessage(level, message, data, context);
    
    if (this.isDevelopment) {
      // Use appropriate console method based on level
      switch (level) {
        case 'debug':
          console.debug(`[DEBUG] ${message}`, data);
          break;
        case 'info':
          console.info(`[INFO] ${message}`, data);
          break;
        case 'warn':
          console.warn(`[WARN] ${message}`, data);
          break;
        case 'error':
          console.error(`[ERROR] ${message}`, data);
          break;
      }
    } else {
      // In production, you could send to external services
      // Example: sendToAnalytics(logEntry);
      // Example: sendToSentry(logEntry);
    }
  }

  static debug(message: string, data?: any, context?: string): void {
    this.log('debug', message, data, context);
  }

  static info(message: string, data?: any, context?: string): void {
    this.log('info', message, data, context);
  }

  static warn(message: string, data?: any, context?: string): void {
    this.log('warn', message, data, context);
  }

  static error(message: string, error?: Error | any, context?: string): void {
    this.log('error', message, error, context);
  }

  // Specialized logging methods
  static apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, data, 'API');
  }

  static apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : 'debug';
    this.log(level, `API Response: ${method} ${url} - ${status}`, data, 'API');
  }

  static userAction(action: string, data?: any): void {
    this.info(`User Action: ${action}`, data, 'USER');
  }

  static performance(metric: string, value: number, unit: string = 'ms'): void {
    this.debug(`Performance: ${metric} - ${value}${unit}`, undefined, 'PERFORMANCE');
  }
}

export default Logger;
