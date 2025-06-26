import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AudioUploadManager from '../components/AudioUploadManager';
import DatabaseAudioPlayer from '../components/DatabaseAudioPlayer';
import { Settings, Upload, Database, Music } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
              <Settings className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage audio content and uploads</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Manager */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Upload className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">File Upload</h2>
            </div>
            <AudioUploadManager />
          </div>

          {/* Database Player */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Database className="text-red-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Content Library</h2>
            </div>
            <DatabaseAudioPlayer />
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Music className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">How to Use Supabase Storage</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Process</h3>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  <span>Click "Upload Audio" to select your audio files (MP3, WAV, OGG, etc.)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  <span>Fill out the content form with title, description, language, and other details</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  <span>Files are uploaded to Supabase Storage and database entries are created</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                  <span>Public URLs are generated automatically for use in audio players</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Features</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Secure cloud storage with CDN delivery</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Automatic public URL generation</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>File size limit: 100MB per file</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Supported formats: MP3, WAV, OGG, M4A, FLAC</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Database integration for content management</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-500">✓</span>
                  <span>Search and filter capabilities</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Getting Your Supabase URLs</h4>
            <p className="text-blue-800 text-sm">
              Once uploaded, your audio files will have URLs like: 
              <code className="bg-blue-100 px-2 py-1 rounded ml-1">
                https://[project-id].supabase.co/storage/v1/object/public/audio-files/[filename]
              </code>
            </p>
            <p className="text-blue-800 text-sm mt-2">
              These URLs can be used directly in your audio players and will be automatically integrated into your content database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;