import React, { useState, useEffect } from 'react';
import { AlertTriangle, ExternalLink, Upload, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface CorsAudioFixProps {
  audioUrl: string;
  onFileUpload?: (file: File) => void;
  className?: string;
}

const CorsAudioFix: React.FC<CorsAudioFixProps> = ({
  audioUrl,
  onFileUpload,
  className = ''
}) => {
  const [corsStatus, setCorsStatus] = useState<'checking' | 'allowed' | 'blocked'>('checking');
  const [fileExists, setFileExists] = useState<boolean | null>(null);

  useEffect(() => {
    checkCorsAndFile();
  }, [audioUrl]);

  const checkCorsAndFile = async () => {
    setCorsStatus('checking');
    setFileExists(null);

    try {
      // Test CORS by attempting to fetch with no-cors mode first
      const noCorsResponse = await fetch(audioUrl, { 
        mode: 'no-cors',
        method: 'HEAD'
      });

      // If no-cors succeeds, try with cors mode
      try {
        const corsResponse = await fetch(audioUrl, { 
          mode: 'cors',
          method: 'HEAD'
        });
        
        if (corsResponse.ok) {
          setCorsStatus('allowed');
          setFileExists(true);
        } else {
          setCorsStatus('blocked');
          setFileExists(corsResponse.status !== 404);
        }
      } catch (corsError) {
        setCorsStatus('blocked');
        setFileExists(true); // File exists but CORS is blocking
      }

    } catch (error) {
      // If even no-cors fails, file likely doesn't exist
      setCorsStatus('blocked');
      setFileExists(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onFileUpload?.(file);
    } else {
      alert('Please select a valid audio file');
    }
  };

  const getStatusIcon = () => {
    switch (corsStatus) {
      case 'checking':
        return <RefreshCw className="animate-spin text-blue-500" size={20} />;
      case 'allowed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'blocked':
        return <XCircle className="text-red-500" size={20} />;
    }
  };

  const getStatusMessage = () => {
    if (corsStatus === 'checking') {
      return 'Checking CORS and file accessibility...';
    }
    
    if (corsStatus === 'allowed') {
      return 'Audio file is accessible and CORS is properly configured.';
    }

    if (fileExists === false) {
      return 'Audio file not found (404). The file may have been moved or deleted.';
    }

    return 'CORS (Cross-Origin Resource Sharing) is blocking this audio file. The server needs to allow cross-origin requests.';
  };

  if (corsStatus === 'allowed') {
    return null; // Don't show anything if CORS is working
  }

  return (
    <div className={`bg-orange-50 border border-orange-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h4 className="font-semibold text-orange-800 mb-2">
            {corsStatus === 'checking' ? 'Checking Audio File...' : 'Audio Playback Issue'}
          </h4>
          
          <p className="text-orange-700 text-sm mb-3">
            {getStatusMessage()}
          </p>

          {corsStatus === 'blocked' && (
            <>
              <div className="mb-4">
                <h5 className="font-medium text-orange-800 text-sm mb-2">What is CORS?</h5>
                <p className="text-orange-700 text-xs mb-2">
                  CORS is a security feature that prevents websites from accessing resources on other domains 
                  unless explicitly allowed. Your audio files need proper server configuration to work across domains.
                </p>
              </div>

              <div className="space-y-3">
                <h5 className="font-medium text-orange-800 text-sm">Solutions:</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="inline-flex items-center space-x-2 text-xs bg-orange-100 text-orange-800 px-3 py-2 rounded hover:bg-orange-200 transition-colors cursor-pointer">
                    <Upload size={12} />
                    <span>Upload Local Audio File</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  <a
                    href="https://www.jango.com/music/Pure+Gold+Gospel+Singers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-xs bg-orange-100 text-orange-800 px-3 py-2 rounded hover:bg-orange-200 transition-colors"
                  >
                    <ExternalLink size={12} />
                    <span>Listen on Jango Radio</span>
                  </a>
                </div>

                <button
                  onClick={checkCorsAndFile}
                  className="inline-flex items-center space-x-2 text-xs bg-orange-100 text-orange-800 px-3 py-2 rounded hover:bg-orange-200 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Recheck File</span>
                </button>
              </div>

              <div className="mt-4 p-3 bg-orange-100 rounded border border-orange-300">
                <h6 className="font-medium text-orange-800 text-xs mb-1">For Developers:</h6>
                <p className="text-orange-700 text-xs">
                  Add these headers to your server: <br />
                  <code className="bg-orange-200 px-1 rounded">Access-Control-Allow-Origin: *</code><br />
                  <code className="bg-orange-200 px-1 rounded">Access-Control-Allow-Methods: GET, HEAD</code>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorsAudioFix;