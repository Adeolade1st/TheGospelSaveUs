import React, { useEffect, useState } from 'react';
import { Shield, Lock, Eye, Download, AlertTriangle } from 'lucide-react';

interface DRMConfig {
  enableWatermarking: boolean;
  preventDownload: boolean;
  limitPreviewTime: number;
  trackUsage: boolean;
  encryptionLevel: 'basic' | 'standard' | 'advanced';
}

interface DRMProviderProps {
  children: React.ReactNode;
  config?: Partial<DRMConfig>;
}

interface SecurityEvent {
  type: 'download_attempt' | 'right_click' | 'dev_tools' | 'copy_attempt';
  timestamp: Date;
  userAgent: string;
  trackId?: string;
}

export const DigitalRightsManager: React.FC<DRMProviderProps> = ({ 
  children, 
  config = {} 
}) => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  const defaultConfig: DRMConfig = {
    enableWatermarking: true,
    preventDownload: true,
    limitPreviewTime: 30,
    trackUsage: true,
    encryptionLevel: 'standard',
    ...config
  };

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      if (defaultConfig.preventDownload) {
        e.preventDefault();
        logSecurityEvent('right_click');
      }
    };

    // Disable common keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (defaultConfig.preventDownload) {
        // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.key === 's')
        ) {
          e.preventDefault();
          logSecurityEvent('dev_tools');
        }

        // Disable Ctrl+A, Ctrl+C for audio elements
        if ((e.ctrlKey && e.key === 'a') || (e.ctrlKey && e.key === 'c')) {
          const target = e.target as HTMLElement;
          if (target.tagName === 'AUDIO' || target.closest('.secure-audio-player')) {
            e.preventDefault();
            logSecurityEvent('copy_attempt');
          }
        }
      }
    };

    // Detect developer tools
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!isDevToolsOpen) {
          setIsDevToolsOpen(true);
          logSecurityEvent('dev_tools');
        }
      } else {
        setIsDevToolsOpen(false);
      }
    };

    // Disable text selection on audio players
    const disableSelection = () => {
      const audioPlayers = document.querySelectorAll('.secure-audio-player');
      audioPlayers.forEach(player => {
        (player as HTMLElement).style.userSelect = 'none';
        (player as HTMLElement).style.webkitUserSelect = 'none';
      });
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    if (defaultConfig.trackUsage) {
      const devToolsInterval = setInterval(detectDevTools, 1000);
      return () => {
        clearInterval(devToolsInterval);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }

    disableSelection();

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [defaultConfig, isDevToolsOpen]);

  const logSecurityEvent = (type: SecurityEvent['type'], trackId?: string) => {
    const event: SecurityEvent = {
      type,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      trackId
    };

    setSecurityEvents(prev => [...prev, event]);

    // Send to analytics/security service
    if (defaultConfig.trackUsage) {
      console.warn('Security Event:', event);
      // In production, send to your security monitoring service
    }
  };

  return (
    <div className="drm-protected-content">
      {isDevToolsOpen && defaultConfig.preventDownload && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={20} />
            <span className="font-semibold">Developer tools detected</span>
          </div>
          <p className="text-sm mt-1">Audio content is protected by DRM</p>
        </div>
      )}
      {children}
    </div>
  );
};

export const DRMStatus: React.FC<{ config: DRMConfig }> = ({ config }) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Shield className="text-green-600" size={20} />
        <h3 className="font-semibold text-gray-900">Content Protection Status</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${config.preventDownload ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Download Protection</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${config.enableWatermarking ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Watermarking</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${config.trackUsage ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>Usage Tracking</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Preview Limit: {config.limitPreviewTime}s</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Lock size={12} />
          <span>Encryption Level: {config.encryptionLevel.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default DigitalRightsManager;