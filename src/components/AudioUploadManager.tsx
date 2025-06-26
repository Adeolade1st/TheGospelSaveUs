import React, { useState, useCallback, useEffect } from 'react';
import { 
  Upload, 
  File, 
  Trash2, 
  Download, 
  Music, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Plus,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { storageService, UploadResult, StorageFile } from '../lib/supabaseStorage';
import { useAuth } from '../contexts/AuthContext';

interface AudioUploadManagerProps {
  onFileUploaded?: (url: string, fileName: string) => void;
  className?: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

interface NewContentForm {
  title: string;
  artist: string;
  description: string;
  language: 'yoruba' | 'igbo' | 'hausa' | 'english';
  scriptureRef: string;
  theme: string;
  thumbnail: string;
}

const AudioUploadManager: React.FC<AudioUploadManagerProps> = ({
  onFileUploaded,
  className = ''
}) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewContentForm, setShowNewContentForm] = useState(false);
  const [newContentForm, setNewContentForm] = useState<NewContentForm>({
    title: '',
    artist: 'Evangelist Birdie Jones',
    description: '',
    language: 'english',
    scriptureRef: '',
    theme: '',
    thumbnail: ''
  });
  const [pendingUpload, setPendingUpload] = useState<File | null>(null);

  // Load existing files on component mount
  useEffect(() => {
    loadFiles();
    initializeBucket();
  }, []);

  const initializeBucket = async () => {
    try {
      await storageService.initializeBucket();
    } catch (error) {
      console.error('Failed to initialize bucket:', error);
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const fileList = await storageService.listAudioFiles();
      setFiles(fileList);
    } catch (error) {
      setError('Failed to load files');
      console.error('Error loading files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    selectedFiles.forEach(file => {
      if (!file.type.startsWith('audio/')) {
        setError(`${file.name} is not an audio file`);
        return;
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError(`${file.name} is too large (max 100MB)`);
        return;
      }

      // If user is authenticated, show form to create content entry
      if (user) {
        setPendingUpload(file);
        setNewContentForm(prev => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
        }));
        setShowNewContentForm(true);
      } else {
        // Direct upload for non-authenticated users
        uploadFile(file);
      }
    });

    // Reset input
    event.target.value = '';
  }, [user]);

  const uploadFile = async (file: File, contentData?: NewContentForm) => {
    const progressEntry: UploadProgress = {
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    };

    setUploadProgress(prev => [...prev, progressEntry]);
    setError(null);

    try {
      // Simulate progress (since Supabase doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name && p.progress < 90
              ? { ...p, progress: p.progress + 10 }
              : p
          )
        );
      }, 200);

      const result: UploadResult = await storageService.uploadAudioFile(file);

      clearInterval(progressInterval);

      if (result.success && result.url) {
        // Update progress to success
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name
              ? { ...p, progress: 100, status: 'success', url: result.url }
              : p
          )
        );

        // If content data provided, create database entry
        if (contentData && result.url) {
          await storageService.createSpokenWordContent({
            ...contentData,
            audioUrl: result.url
          });
        }

        // Notify parent component
        onFileUploaded?.(result.url, file.name);

        // Reload file list
        await loadFiles();

        // Remove progress entry after 3 seconds
        setTimeout(() => {
          setUploadProgress(prev => prev.filter(p => p.fileName !== file.name));
        }, 3000);

      } else {
        setUploadProgress(prev => 
          prev.map(p => 
            p.fileName === file.name
              ? { ...p, status: 'error', error: result.error }
              : p
          )
        );
      }

    } catch (error) {
      setUploadProgress(prev => 
        prev.map(p => 
          p.fileName === file.name
            ? { ...p, status: 'error', error: 'Upload failed' }
            : p
        )
      );
    }
  };

  const handleCreateContent = async () => {
    if (!pendingUpload) return;

    await uploadFile(pendingUpload, newContentForm);
    
    // Reset form
    setShowNewContentForm(false);
    setPendingUpload(null);
    setNewContentForm({
      title: '',
      artist: 'Evangelist Birdie Jones',
      description: '',
      language: 'english',
      scriptureRef: '',
      theme: '',
      thumbnail: ''
    });
  };

  const handleDeleteFile = async (file: StorageFile) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      const success = await storageService.deleteAudioFile(file.name);
      if (success) {
        await loadFiles();
      } else {
        setError('Failed to delete file');
      }
    } catch (error) {
      setError('Failed to delete file');
      console.error('Delete error:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
            <Music className="text-white" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Audio File Manager</h3>
            <p className="text-sm text-gray-600">Upload and manage audio files</p>
          </div>
        </div>
        
        <label className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 cursor-pointer flex items-center space-x-2">
          <Upload size={16} />
          <span>Upload Audio</span>
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-xs mt-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* New Content Form Modal */}
      {showNewContentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-gray-900">Create Content Entry</h4>
                <button
                  onClick={() => {
                    setShowNewContentForm(false);
                    setPendingUpload(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newContentForm.title}
                    onChange={(e) => setNewContentForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter content title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Artist
                  </label>
                  <input
                    type="text"
                    value={newContentForm.artist}
                    onChange={(e) => setNewContentForm(prev => ({ ...prev, artist: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Artist name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newContentForm.description}
                    onChange={(e) => setNewContentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows={3}
                    placeholder="Brief description of the content"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language *
                    </label>
                    <select
                      value={newContentForm.language}
                      onChange={(e) => setNewContentForm(prev => ({ 
                        ...prev, 
                        language: e.target.value as 'yoruba' | 'igbo' | 'hausa' | 'english'
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      required
                    >
                      <option value="english">English</option>
                      <option value="yoruba">Yorùbá</option>
                      <option value="igbo">Igbo</option>
                      <option value="hausa">Hausa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Theme
                    </label>
                    <input
                      type="text"
                      value={newContentForm.theme}
                      onChange={(e) => setNewContentForm(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., salvation, healing, hope"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scripture Reference
                  </label>
                  <input
                    type="text"
                    value={newContentForm.scriptureRef}
                    onChange={(e) => setNewContentForm(prev => ({ ...prev, scriptureRef: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., John 3:16, Psalm 23:1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={newContentForm.thumbnail}
                    onChange={(e) => setNewContentForm(prev => ({ ...prev, thumbnail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowNewContentForm(false);
                    setPendingUpload(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContent}
                  disabled={!newContentForm.title}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Create & Upload</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="mb-6 space-y-3">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{progress.fileName}</span>
                <div className="flex items-center space-x-2">
                  {progress.status === 'uploading' && (
                    <Loader2 className="animate-spin text-blue-500" size={16} />
                  )}
                  {progress.status === 'success' && (
                    <CheckCircle className="text-green-500" size={16} />
                  )}
                  {progress.status === 'error' && (
                    <AlertCircle className="text-red-500" size={16} />
                  )}
                  <span className="text-sm text-gray-600">{progress.progress}%</span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.status === 'error' ? 'bg-red-500' : 
                    progress.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
              
              {progress.error && (
                <p className="text-red-600 text-xs mt-2">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* File List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Uploaded Files ({files.length})
          </h4>
          <button
            onClick={loadFiles}
            disabled={isLoading}
            className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <Loader2 className={`${isLoading ? 'animate-spin' : ''}`} size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
            <span className="ml-2 text-gray-600">Loading files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Music className="mx-auto mb-2 text-gray-300" size={48} />
            <p>No audio files uploaded yet</p>
            <p className="text-sm">Upload your first audio file to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <File className="text-red-500" size={20} />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatFileSize(file.metadata?.size || 0)}</span>
                      <span>{formatDate(file.created_at)}</span>
                      <span>{file.metadata?.mimetype}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const url = storageService.getPublicUrl(file.name);
                      window.open(url, '_blank');
                    }}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  
                  {user && (
                    <button
                      onClick={() => handleDeleteFile(file)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-semibold text-blue-900 mb-2">How to Use</h5>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload audio files (MP3, WAV, OGG, etc.) up to 100MB</li>
          <li>• Files are stored securely in Supabase Storage</li>
          <li>• Public URLs are generated automatically for playback</li>
          {user && <li>• Create content entries to organize your uploads</li>}
          <li>• Use the generated URLs in your audio players</li>
        </ul>
      </div>
    </div>
  );
};

export default AudioUploadManager;