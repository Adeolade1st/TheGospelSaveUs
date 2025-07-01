import React, { useState } from 'react';
import { ArrowLeft, Music, Shield, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import SecureAudioPlayer from '../components/SecureAudioPlayer';
import { DigitalRightsManager, DRMStatus } from '../components/DigitalRightsManager';
import SecureDownloadManager from '../components/SecureDownloadManager';

const MusicPreviewPage: React.FC = () => {
  const [purchasedTracks, setPurchasedTracks] = useState<Set<string>>(new Set());
  const [showDownloadManager, setShowDownloadManager] = useState<string | null>(null);

  const tracks = [
    {
      id: 'yoruba-track',
      title: 'Eyin rere (Good Fruit)',
      artist: 'Janet Olufunke Olaitan',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Yoruba.mp3',
      duration: '3:45',
      price: 1,
      albumArt: '/JANET OLAITAN (1).jpg'
    },
    {
      id: 'igbo-track',
      title: 'Ozi oma (Good News)',
      artist: 'Susan Chinyere Collins',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Igbo.mp3',
      duration: '4:12',
      price: 1,
      albumArt: '/SUSSAN COLLINS.jpg'
    },
    {
      id: 'hausa-track',
      title: 'Labari mai dadi (Sweet Story)',
      artist: 'Isaac Olamide Samson',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa.mp3',
      duration: '3:58',
      price: 1,
      albumArt: '/ISAAC O. SAMSON (1).jpg'
    },
    {
      id: 'english-track',
      title: 'The Good News',
      artist: 'Evangelist Birdie Jones',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3',
      duration: '4:33',
      price: 1,
      albumArt: '/Evangelist Jones Picture.JPG'
    }
  ];

  const handlePurchase = (trackId: string) => {
    setPurchasedTracks(prev => new Set([...prev, trackId]));
    setShowDownloadManager(trackId);
  };

  const drmConfig = {
    enableWatermarking: true,
    preventDownload: true,
    limitPreviewTime: 30,
    trackUsage: true,
    encryptionLevel: 'advanced' as const
  };

  return (
    <DigitalRightsManager config={drmConfig}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Home</span>
                </Link>
              </div>
              <div className="text-center flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Music Preview & Download</h1>
                <p className="text-gray-600">Secure streaming with instant purchase options</p>
              </div>
              <div className="w-32"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* DRM Status */}
          <div className="mb-8">
            <DRMStatus config={drmConfig} />
          </div>

          {/* Security Notice */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Content Protection Notice</h3>
                <p className="text-blue-800 leading-relaxed">
                  Our audio content is protected by advanced Digital Rights Management (DRM) technology. 
                  Preview tracks are limited to 30 seconds. Purchase required for full track access and download.
                  All downloads are tracked and secured with time-limited access tokens.
                </p>
              </div>
            </div>
          </div>

          {/* Track Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {tracks.map((track) => (
              <div key={track.id} className="secure-audio-player">
                <SecureAudioPlayer
                  title={track.title}
                  artist={track.artist}
                  audioUrl={track.audioUrl}
                  duration={track.duration}
                  price={track.price}
                  trackId={track.id}
                  albumArt={track.albumArt}
                  onPurchase={handlePurchase}
                />
              </div>
            ))}
          </div>

          {/* Download Manager */}
          {showDownloadManager && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Download className="text-green-600" size={24} />
                <span>Download Your Purchase</span>
              </h2>
              
              {(() => {
                const track = tracks.find(t => t.id === showDownloadManager);
                return track ? (
                  <SecureDownloadManager
                    trackId={track.id}
                    trackTitle={track.title}
                    artistName={track.artist}
                    purchaseEmail="user@example.com" // This would come from the purchase flow
                    onDownloadComplete={() => {
                      console.log('Download completed for track:', track.id);
                    }}
                  />
                ) : null;
              })()}
            </div>
          )}

          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Premium Audio Experience
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">High Quality Audio</h3>
                <p className="text-gray-600">320kbps MP3 files with crystal clear sound quality for the best listening experience.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Download</h3>
                <p className="text-gray-600">Immediate access after purchase with secure download links sent to your email.</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-purple-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">DRM Protected</h3>
                <p className="text-gray-600">Advanced security measures protect our artists' work while ensuring your legitimate access.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DigitalRightsManager>
  );
};

export default MusicPreviewPage;