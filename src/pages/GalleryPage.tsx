import React, { useState, useEffect } from 'react';
import { ArrowLeft, Music, MapPin, Calendar, Heart, Play, Pause, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Artist {
  id: string;
  stageName: string;
  realName: string;
  profileImage: string;
  biography: string;
  location: string;
  yearsActive: string;
  specialties: string[];
  featuredTrack?: {
    title: string;
    audioUrl: string;
    duration: string;
  };
}

const GalleryPage: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Updated artist data with new biographies and details
  const artists: Artist[] = [
    {
      id: 'janet-olaitan',
      stageName: 'Janet Olufunke Olaitan',
      realName: 'Janet Olufunke Olaitan',
      profileImage: '/JANET OLAITAN (1).jpg',
      location: 'Osun State, Southwestern Nigeria / Atlanta, Georgia',
      yearsActive: '2008 - Present',
      specialties: ['Yoruba Spoken Word', 'Cultural Ministry', 'Youth Outreach', 'Educational Ministry'],
      biography: `Evangelist & Retired Professional Teacher Janet Olufunke Olaitan brings a unique blend of educational excellence and spiritual passion to her ministry. As a Singer/Songwriter with deep roots in Osun State, Southwestern Nigeria, Janet has dedicated her life to preserving and sharing the rich cultural heritage of the Yoruba people through gospel ministry. Her journey began in the classroom, where she spent decades shaping young minds as a professional educator. This foundation in teaching has profoundly influenced her approach to ministry, making complex spiritual truths accessible through familiar cultural metaphors and traditional Yoruba storytelling. After relocating to Atlanta, Janet recognized the critical need for gospel content that spoke directly to the hearts of Yoruba-speaking communities in both Africa and the diaspora. Her ministry particularly resonates with young people who are seeking to maintain their cultural identity while growing in their Christian faith. Janet's work extends beyond the pulpit as she actively mentors young women in ministry and leads cultural preservation initiatives. Her Yoruba spoken word pieces are celebrated for their poetic beauty, scriptural accuracy, and ability to convey the transformative power of God's love through the rhythmic cadences and proverbs that characterize traditional Yoruba oratory.`,
      featuredTrack: {
        title: 'Eyin rere (Good Fruit)',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Yoruba.mp3',
        duration: '3:45'
      }
    },
    {
      id: 'susan-collins',
      stageName: 'Susan Chinyere Collins',
      realName: 'Susan Chinyere Collins',
      profileImage: '/SUSSAN COLLINS.jpg',
      location: 'Ideato South, Imo State, Eastern Nigeria / Birmingham, Alabama',
      yearsActive: '2010 - Present',
      specialties: ['Igbo Spoken Word', 'Family Ministry', 'Community Healing', 'Educational Outreach'],
      biography: `Professional Teacher Susan Chinyere Collins is a powerful voice in Igbo-language gospel ministry, known for her compassionate approach to healing and restoration. Originally from Ideato South, Imo State in Eastern Nigeria, Susan's calling to ministry was born from personal experiences of God's faithfulness during difficult times. Her background as a professional educator has deeply informed her ministry approach, as she addresses real-life issues such as family reconciliation, trauma healing, and community building through the lens of scripture. Susan's spoken word ministry in the Igbo language carries the weight of ancestral wisdom combined with New Testament truth, creating messages that resonate deeply with Igbo communities worldwide. Her gentle yet authoritative delivery style has made her a sought-after speaker at women's conferences and family retreats. Susan is particularly passionate about preserving the Igbo language for future generations while ensuring that the gospel message remains accessible and relevant. Her spoken word pieces often incorporate traditional Igbo proverbs and cultural references, making complex spiritual truths understandable and applicable to daily life. As both an educator and minister, Susan bridges the gap between academic excellence and spiritual growth, demonstrating that faith and learning are complementary forces in personal development.`,
      featuredTrack: {
        title: 'Ozi oma (Good News)',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Igbo.mp3',
        duration: '4:12'
      }
    },
    {
      id: 'isaac-samson',
      stageName: 'Isaac Olamide Samson',
      realName: 'Isaac Olamide Samson',
      profileImage: '/ISAAC O. SAMSON (1).jpg',
      location: 'Ogun State, Southwestern Nigeria / Houston, Texas',
      yearsActive: '2012 - Present',
      specialties: ['Hausa Spoken Word', 'Cross-Cultural Ministry', 'Interfaith Dialogue', 'Northern Nigeria Outreach'],
      biography: `Clergyman Isaac Olamide Samson serves as a bridge-builder in one of the most challenging and rewarding fields of ministry - reaching Hausa-speaking communities with the gospel message. Currently serving as a Full-time Minister with the Celestial Church of Christ, Isaac brings a unique perspective shaped by his origins in Ogun State, Southwestern Nigeria, combined with his Northern Nigeria education and native fluency in Hausa. This distinctive background has equipped him with rare insights into cross-cultural communication and interfaith dialogue. Isaac's conversion to Christianity as a young adult gave him unique understanding of the spiritual journey of those seeking truth across religious boundaries. His Hausa-language spoken word ministry is characterized by its respectful approach to cultural sensitivities while maintaining the uncompromising truth of the gospel. His background in comparative religion enables him to address questions and concerns that are particularly relevant to his target audience. Isaac's ministry extends beyond spoken word to include community development projects and educational initiatives in northern Nigeria. His work has been instrumental in fostering peaceful dialogue and understanding between different religious communities. Isaac's spoken word pieces are known for their scholarly depth, cultural authenticity, and powerful testimonial elements that demonstrate the transformative power of Christ's love in diverse cultural contexts.`,
      featuredTrack: {
        title: 'Labari mai dadi (Sweet Story)',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/Hausa.mp3',
        duration: '3:58'
      }
    },
    {
      id: 'birdie-jones',
      stageName: 'Evangelist Birdie Jones',
      realName: 'Birdie Mae Jones',
      profileImage: '/Evangelist Jones Picture.JPG',
      location: 'Atlanta, Georgia',
      yearsActive: '1995 - Present',
      specialties: ['English Spoken Word', 'Gospel Ministry', 'International Outreach'],
      biography: `Evangelist Birdie Jones is the founding voice and spiritual leader of God Will Provide Outreach Ministry. With over 25 years of dedicated service to spreading God's word, she has touched countless lives through her powerful spoken word ministry. Born and raised in the heart of Georgia, Birdie discovered her calling at a young age when she felt the Holy Spirit move through her during a church service. Her ministry began in small community gatherings, where her passionate delivery and profound spiritual insights quickly drew larger audiences. Today, she leads the Pure Gold Gospel Singers and has expanded the ministry's reach internationally through digital platforms. Her English-language spoken word pieces are known for their deep theological insight, practical life application, and ability to bring comfort to those facing life's greatest challenges. Birdie's vision of reaching souls across cultural and linguistic barriers has made her a pioneer in multilingual gospel ministry. Her leadership has inspired a new generation of ministers to embrace both traditional gospel values and innovative outreach methods, creating a lasting impact that extends far beyond geographical boundaries.`,
      featuredTrack: {
        title: 'The Good News',
        audioUrl: 'https://tamgexlordzjyfzhvmel.supabase.co/storage/v1/object/public/audio-files/English.mp3',
        duration: '4:33'
      }
    }
  ];

  useEffect(() => {
    // Simulate loading time for smooth user experience
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handlePlayPause = (artistId: string) => {
    if (currentlyPlaying === artistId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(artistId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-red-600 hover:text-red-700 transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 font-medium">Gallery</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </Link>
            </div>
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Artist Gallery</h1>
              <p className="text-xl text-gray-600">Meet the voices behind our multilingual ministry</p>
            </div>
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Artists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {artists.map((artist, index) => (
            <div
              key={artist.id}
              className={`bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 ${
                selectedArtist === artist.id ? 'ring-4 ring-red-500' : ''
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
                animation: 'fadeInUp 0.8s ease-out forwards'
              }}
            >
              {/* Artist Image */}
              <div className="relative h-80 overflow-hidden">
                <img
                  src={artist.profileImage}
                  alt={`${artist.stageName} - Gospel Artist`}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Play Button Overlay */}
                {artist.featuredTrack && (
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => handlePlayPause(artist.id)}
                      className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 transform hover:scale-110 shadow-lg"
                      aria-label={`${currentlyPlaying === artist.id ? 'Pause' : 'Play'} ${artist.featuredTrack.title}`}
                    >
                      {currentlyPlaying === artist.id ? (
                        <Pause className="text-red-600" size={24} />
                      ) : (
                        <Play className="text-red-600 ml-1" size={24} />
                      )}
                    </button>
                  </div>
                )}

                {/* Artist Names Overlay */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{artist.stageName}</h3>
                  <p className="text-white/80">{artist.realName}</p>
                </div>
              </div>

              {/* Artist Details */}
              <div className="p-8">
                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm">{artist.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">{artist.yearsActive}</span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Ministry Focus</h4>
                  <div className="flex flex-wrap gap-2">
                    {artist.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Featured Track */}
                {artist.featuredTrack && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">Featured Track</h5>
                        <p className="text-gray-600 text-sm">{artist.featuredTrack.title}</p>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-500 text-sm">
                        <Music size={14} />
                        <span>{artist.featuredTrack.duration}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Biography Preview */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Biography</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedArtist === artist.id 
                      ? artist.biography
                      : `${artist.biography.substring(0, 200)}...`
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedArtist(
                      selectedArtist === artist.id ? null : artist.id
                    )}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 transform hover:scale-105"
                  >
                    {selectedArtist === artist.id ? 'Show Less' : 'Read Full Biography'}
                  </button>
                  
                  {artist.featuredTrack && (
                    <button
                      onClick={() => handlePlayPause(artist.id)}
                      className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition-all duration-200 transform hover:scale-105"
                    >
                      {currentlyPlaying === artist.id ? 'Pause' : 'Listen'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ministry Impact Section */}
        <div className="mt-20 bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <Heart className="w-16 h-16 text-red-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              United in Purpose, Diverse in Expression
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              Our artists represent the beautiful diversity of God's kingdom, each bringing their unique 
              cultural heritage and linguistic gifts to share the universal message of God's love. 
              Together, they form a powerful ministry team that reaches across cultural boundaries 
              to touch hearts and transform lives through the spoken word.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multilingual Ministry</h3>
                <p className="text-gray-600">Reaching souls in their heart language</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cultural Bridge</h3>
                <p className="text-gray-600">Connecting communities through faith</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Global Impact</h3>
                <p className="text-gray-600">Transforming lives worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;