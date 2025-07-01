/**
 * Audio Error Handler Utility
 * Centralized error handling for audio playback issues
 */

export interface AudioErrorInfo {
  code: number;
  type: string;
  message: string;
  userMessage: string;
  troubleshooting: string[];
  severity: 'low' | 'medium' | 'high';
  recoverable: boolean;
}

export class AudioErrorHandler {
  private static errorLog: Array<{
    timestamp: Date;
    error: AudioErrorInfo;
    context: any;
  }> = [];

  /**
   * Process and categorize audio errors
   */
  static handleAudioError(
    error: MediaError | Error | null,
    context: {
      audioUrl: string;
      title: string;
      userAgent?: string;
      retryCount?: number;
    }
  ): AudioErrorInfo {
    let errorInfo: AudioErrorInfo;

    if (error instanceof MediaError) {
      errorInfo = this.handleMediaError(error, context);
    } else if (error instanceof Error) {
      errorInfo = this.handleGenericError(error, context);
    } else {
      errorInfo = this.handleUnknownError(context);
    }

    // Log the error
    this.logError(errorInfo, context);

    return errorInfo;
  }

  private static handleMediaError(error: MediaError, context: any): AudioErrorInfo {
    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        return {
          code: error.code,
          type: 'MEDIA_ERR_ABORTED',
          message: 'Audio loading was aborted by the user',
          userMessage: 'Audio loading was interrupted',
          troubleshooting: [
            'Try clicking play again',
            'Check if you accidentally stopped the loading',
            'Refresh the page if the problem persists'
          ],
          severity: 'low',
          recoverable: true
        };

      case MediaError.MEDIA_ERR_NETWORK:
        return {
          code: error.code,
          type: 'MEDIA_ERR_NETWORK',
          message: 'Network error occurred while loading audio',
          userMessage: 'Network connection problem',
          troubleshooting: [
            'Check your internet connection',
            'Try again in a few moments',
            'Switch to a different network if available',
            'Contact support if the problem persists'
          ],
          severity: 'medium',
          recoverable: true
        };

      case MediaError.MEDIA_ERR_DECODE:
        return {
          code: error.code,
          type: 'MEDIA_ERR_DECODE',
          message: 'Audio file could not be decoded',
          userMessage: 'Audio file is corrupted or invalid',
          troubleshooting: [
            'The audio file may be corrupted',
            'Try downloading the file instead of streaming',
            'Contact support to report this issue',
            'Try using a different browser'
          ],
          severity: 'high',
          recoverable: false
        };

      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        return {
          code: error.code,
          type: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
          message: 'Audio format not supported by browser',
          userMessage: 'Audio format not supported',
          troubleshooting: [
            'Try using Chrome, Firefox, or Safari',
            'Update your browser to the latest version',
            'Download the MP3 file to play locally',
            'Enable audio codecs in your browser settings'
          ],
          severity: 'high',
          recoverable: true
        };

      default:
        return {
          code: error.code,
          type: 'MEDIA_ERR_UNKNOWN',
          message: `Unknown media error (code: ${error.code})`,
          userMessage: 'Unknown audio playback error',
          troubleshooting: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Try using a different browser',
            'Contact support if the issue continues'
          ],
          severity: 'medium',
          recoverable: true
        };
    }
  }

  private static handleGenericError(error: Error, context: any): AudioErrorInfo {
    const message = error.message.toLowerCase();

    if (message.includes('404') || message.includes('not found')) {
      return {
        code: 404,
        type: 'FILE_NOT_FOUND',
        message: 'Audio file not found on server',
        userMessage: 'Audio file not found',
        troubleshooting: [
          'The audio file may have been moved or deleted',
          'Try refreshing the page',
          'Contact support to report this missing file',
          'Check if you have the correct URL'
        ],
        severity: 'high',
        recoverable: false
      };
    }

    if (message.includes('403') || message.includes('forbidden')) {
      return {
        code: 403,
        type: 'ACCESS_DENIED',
        message: 'Access denied to audio file',
        userMessage: 'Access denied to audio file',
        troubleshooting: [
          'You may not have permission to access this file',
          'Try logging in again',
          'Contact support for assistance',
          'Check if your subscription is active'
        ],
        severity: 'medium',
        recoverable: true
      };
    }

    if (message.includes('timeout') || message.includes('took too long')) {
      return {
        code: 408,
        type: 'TIMEOUT',
        message: 'Audio loading timed out',
        userMessage: 'Audio loading timed out',
        troubleshooting: [
          'Check your internet connection speed',
          'Try again with a better connection',
          'The audio file may be too large',
          'Contact support if timeouts persist'
        ],
        severity: 'medium',
        recoverable: true
      };
    }

    if (message.includes('cors') || message.includes('cross-origin')) {
      return {
        code: 0,
        type: 'CORS_ERROR',
        message: 'Cross-origin request blocked',
        userMessage: 'Security restriction preventing audio load',
        troubleshooting: [
          'This is a server configuration issue',
          'Contact support to report this problem',
          'Try downloading the file instead',
          'The audio server may need CORS configuration'
        ],
        severity: 'high',
        recoverable: false
      };
    }

    return {
      code: 0,
      type: 'GENERIC_ERROR',
      message: error.message,
      userMessage: 'Unexpected error occurred',
      troubleshooting: [
        'Try refreshing the page',
        'Clear your browser cache and cookies',
        'Try using a different browser',
        'Contact support with error details'
      ],
      severity: 'medium',
      recoverable: true
    };
  }

  private static handleUnknownError(context: any): AudioErrorInfo {
    return {
      code: 0,
      type: 'UNKNOWN_ERROR',
      message: 'Unknown error occurred',
      userMessage: 'Unable to load audio file',
      troubleshooting: [
        'Try refreshing the page',
        'Check your internet connection',
        'Try using a different browser',
        'Contact support if the problem persists'
      ],
      severity: 'medium',
      recoverable: true
    };
  }

  /**
   * Log error for debugging and analytics
   */
  private static logError(error: AudioErrorInfo, context: any) {
    const logEntry = {
      timestamp: new Date(),
      error,
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    this.errorLog.push(logEntry);

    // Keep only last 50 errors to prevent memory issues
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }

    // Console logging for development
    console.group(`🎵 Audio Error: ${error.type}`);
    console.error('Error Details:', error);
    console.log('Context:', context);
    console.log('User Agent:', navigator.userAgent);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }

  /**
   * Get error statistics for debugging
   */
  static getErrorStats() {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByType: {} as Record<string, number>,
      errorsBySeverity: {} as Record<string, number>,
      recentErrors: this.errorLog.slice(-10),
      mostCommonError: null as string | null
    };

    this.errorLog.forEach(entry => {
      const type = entry.error.type;
      const severity = entry.error.severity;

      stats.errorsByType[type] = (stats.errorsByType[type] || 0) + 1;
      stats.errorsBySeverity[severity] = (stats.errorsBySeverity[severity] || 0) + 1;
    });

    // Find most common error
    let maxCount = 0;
    Object.entries(stats.errorsByType).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        stats.mostCommonError = type;
      }
    });

    return stats;
  }

  /**
   * Clear error log
   */
  static clearErrorLog() {
    this.errorLog = [];
    console.log('🧹 Audio error log cleared');
  }

  /**
   * Get browser-specific troubleshooting steps
   */
  static getBrowserSpecificSteps(): string[] {
    const userAgent = navigator.userAgent;
    const steps: string[] = [];

    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      steps.push('Safari: Ensure "Auto-Play" is enabled in Safari preferences');
      steps.push('Safari: Try disabling "Prevent cross-site tracking"');
    }

    if (userAgent.includes('Firefox')) {
      steps.push('Firefox: Check that media.autoplay.default is set to 0 in about:config');
      steps.push('Firefox: Ensure enhanced tracking protection isn\'t blocking audio');
    }

    if (userAgent.includes('Chrome')) {
      steps.push('Chrome: Check that sound is enabled for this site in settings');
      steps.push('Chrome: Try disabling ad blockers temporarily');
    }

    if (userAgent.includes('Edge')) {
      steps.push('Edge: Ensure media autoplay is allowed in site permissions');
      steps.push('Edge: Check tracking prevention settings');
    }

    return steps;
  }
}

// Export utility functions
export const handleAudioError = AudioErrorHandler.handleAudioError.bind(AudioErrorHandler);
export const getErrorStats = AudioErrorHandler.getErrorStats.bind(AudioErrorHandler);
export const clearErrorLog = AudioErrorHandler.clearErrorLog.bind(AudioErrorHandler);
export const getBrowserSpecificSteps = AudioErrorHandler.getBrowserSpecificSteps.bind(AudioErrorHandler);