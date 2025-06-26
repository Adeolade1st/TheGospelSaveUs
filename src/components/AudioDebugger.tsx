import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface AudioDebuggerProps {
  audioUrl: string;
  className?: string;
}

const AudioDebugger: React.FC<AudioDebuggerProps> = ({ audioUrl, className = '' }) => {
  const [testResults, setTestResults] = useState<{
    urlValid: boolean | null;
    fileExists: boolean | null;
    fileSize: number | null;
    contentType: string | null;
    corsEnabled: boolean | null;
    audioPlayable: boolean | null;
    error: string | null;
  }>({
    urlValid: null,
    fileExists: null,
    fileSize: null,
    contentType: null,
    corsEnabled: null,
    audioPlayable: null,
    error: null
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setTestResults({
      urlValid: null,
      fileExists: null,
      fileSize: null,
      contentType: null,
      corsEnabled: null,
      audioPlayable: null,
      error: null
    });

    try {
      // Test 1: URL Validation
      let urlValid = false;
      try {
        new URL(audioUrl);
        urlValid = true;
      } catch {
        urlValid = false;
      }

      // Test 2: File Existence and Headers
      let fileExists = false;
      let fileSize = null;
      let contentType = null;
      let corsEnabled = false;

      try {
        const response = await fetch(audioUrl, { method: 'HEAD' });
        fileExists = response.ok;
        
        if (response.ok) {
          const sizeHeader = response.headers.get('content-length');
          fileSize = sizeHeader ? parseInt(sizeHeader) : null;
          contentType = response.headers.get('content-type');
          
          // Check CORS
          const accessControl = response.headers.get('access-control-allow-origin');
          corsEnabled = accessControl === '*' || accessControl === window.location.origin;
        }
      } catch (error) {
        console.error('HEAD request failed:', error);
      }

      // Test 3: Audio Playability
      let audioPlayable = false;
      try {
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 10000);

          audio.oncanplay = () => {
            clearTimeout(timeout);
            audioPlayable = true;
            resolve(void 0);
          };

          audio.onerror = (e) => {
            clearTimeout(timeout);
            reject(new Error(`Audio error: ${audio.error?.message || 'Unknown error'}`));
          };

          audio.src = audioUrl;
          audio.load();
        });
      } catch (error) {
        console.error('Audio playability test failed:', error);
        audioPlayable = false;
      }

      setTestResults({
        urlValid,
        fileExists,
        fileSize,
        contentType,
        corsEnabled,
        audioPlayable,
        error: null
      });

    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (audioUrl) {
      runDiagnostics();
    }
  }, [audioUrl]);

  const getStatusIcon = (status: boolean | null) => {
    if (status === null) return <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />;
    if (status === true) return <CheckCircle className="text-green-500" size={16} />;
    return <XCircle className="text-red-500" size={16} />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <AlertTriangle className="text-orange-500" size={20} />
          <span>Audio Diagnostics</span>
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`${isLoading ? 'animate-spin' : ''}`} size={14} />
          <span>Retest</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-gray-600 break-all mb-4">
          <strong>Testing URL:</strong> {audioUrl}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium">URL Valid</span>
            {getStatusIcon(testResults.urlValid)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium">File Exists</span>
            {getStatusIcon(testResults.fileExists)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium">CORS Enabled</span>
            {getStatusIcon(testResults.corsEnabled)}
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium">Audio Playable</span>
            {getStatusIcon(testResults.audioPlayable)}
          </div>
        </div>

        {testResults.fileSize !== null && (
          <div className="p-3 bg-blue-50 rounded">
            <div className="text-sm"><strong>File Size:</strong> {formatFileSize(testResults.fileSize)}</div>
            {testResults.contentType && (
              <div className="text-sm"><strong>Content Type:</strong> {testResults.contentType}</div>
            )}
          </div>
        )}

        {testResults.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-sm text-red-800"><strong>Error:</strong> {testResults.error}</div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Troubleshooting Tips:</h4>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Ensure the audio file URL is publicly accessible</li>
            <li>• Check that CORS is enabled on your server</li>
            <li>• Verify the file format is supported (MP3, WAV, OGG)</li>
            <li>• Make sure the file isn't corrupted or empty</li>
            <li>• Try uploading the file to Supabase Storage instead</li>
          </ul>
        </div>

        {/* Alternative Solutions */}
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-800">Alternative Solutions:</h4>
          <a
            href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-xs bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200 transition-colors"
          >
            <ExternalLink size={12} />
            <span>Listen on Jango Radio</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AudioDebugger;