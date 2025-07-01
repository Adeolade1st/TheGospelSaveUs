import React, { useState } from 'react';
import { ArrowLeft, Music, Download, Lock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import MusicPlayer from '../components/MusicPlayer';
import PurchaseModal from '../components/PurchaseModal';
import DownloadManager from '../components/DownloadManager';

const MusicPreviewPage: React.FC = () => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [purchasedTracks, setPurchasedTracks] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState('user@example.com'); // In a real app, get from auth

  const tracks = [
    {
      id: 'english',
      title: 'The Good News',
      artist: 'Evangelist Birdie Jones',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3',
      duration: '4:33',
      language: 'English',
      coverImage: '/Evangelist Jones Picture.JPG'
    },
    {
      id: 'yoruba',
      title: 'Eyin rere',
      artist: 'Janet Olufunke Olaitan',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Yoruba.mp3',
      duration: '3:45',
      language: 'Yorùbá',
      coverImage: '/JANET OLAITAN (1).jpg'
    },
    {
      id: 'igbo',
      title: 'Ozi oma',
      artist: 'Susan Chinyere Collins',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Igbo.mp3',
      duration: '4:12',
      language: 'Igbo',
      coverImage: '/SUSSAN COLLINS.jpg'
    },
    {
      id: 'hausa',
      title: 'Labari mai dadi',
      artist: 'Isaac Olamide Samson',
      audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa.mp3',
      duration: '3:58',
      language: 'Hausa',
      coverImage: '/ISAAC O. SAMSON (1).jpg'
    }
  ];

  const handlePurchase = (trackId: string) => {
    setSelectedTrack(trackId);
    setShowPurchaseModal(true);
  };

  const completePurchase = () => {
    if (selectedTrack) {
      setPurchasedTracks([...purchasedTracks, selectedTrack]);
      setShowPurchaseModal(false);
    }
  };

  return (
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
              <p className="text-gray-600">Listen to previews and purchase your favorite tracks</p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Notice */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Preview Information</h3>
              <p className="text-blue-800 leading-relaxed">
                Our audio content is protected by digital rights management. Preview tracks are limited to 30 seconds.
                Purchase for $1 to get full track access and unlimited downloads. All purchases include email backup links.
              </p>
            </div>
          </div>
        </div>

        {/* Music Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {tracks.map(track => (
            <MusicPlayer
              key={track.id}
              title={track.title}
              artist={track.artist}
              audioUrl={track.audioUrl}
              duration={track.duration}
              language={track.language}
              coverImage={track.coverImage}
            />
          ))}
        </div>

        {/* Download Manager Section (for purchased tracks) */}
        {purchasedTracks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Download className="text-green-600" size={24} />
              <span>Your Purchases</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {purchasedTracks.map(trackId => {
                const track = tracks.find(t => t.id === trackId);
                if (!track) return null;
                
                return (
                  <DownloadManager
                    key={track.id}
                    trackId={track.id}
                    trackTitle={track.title}
                    artist={track.artist}
                    email={userEmail}
                  />
                );
              })}
            </div>
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
              <p className="text-gray-600">Professional studio recordings with crystal clear sound quality for the best listening experience.</p>
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
                <Lock className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Your payments are processed securely through Stripe with SSL encryption.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      {selectedTrack && (
        <PurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onPurchase={completePurchase}
          title={tracks.find(t => t.id === selectedTrack)?.title || ''}
          artist={tracks.find(t => t.id === selectedTrack)?.artist || ''}
          price={1}
        />
      )}
    </div>
  );
};

export default MusicPreviewPage;