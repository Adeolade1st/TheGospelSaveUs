import React, { useEffect } from 'react';

interface DRMProtectionProps {
  children: React.ReactNode;
}

const DRMProtection: React.FC<DRMProtectionProps> = ({ children }) => {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 's')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection on audio players
    const disableSelection = () => {
      const audioPlayers = document.querySelectorAll('.music-player');
      audioPlayers.forEach(player => {
        (player as HTMLElement).style.userSelect = 'none';
        (player as HTMLElement).style.webkitUserSelect = 'none';
      });
    };

    // Apply protections
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    disableSelection();

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
};

export default DRMProtection;