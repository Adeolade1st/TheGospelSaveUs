import { useEffect } from 'react';

interface UseKeyboardControlsProps {
  onTogglePlay: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onToggleMute: () => void;
  disabled?: boolean;
}

export const useKeyboardControls = ({
  onTogglePlay,
  onSeekForward,
  onSeekBackward,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
  disabled = false
}: UseKeyboardControlsProps) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onTogglePlay();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onSeekBackward();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onSeekForward();
          break;
        case 'ArrowUp':
          event.preventDefault();
          onVolumeUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onVolumeDown();
          break;
        case 'KeyM':
          event.preventDefault();
          onToggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    onTogglePlay,
    onSeekForward,
    onSeekBackward,
    onVolumeUp,
    onVolumeDown,
    onToggleMute,
    disabled
  ]);
};