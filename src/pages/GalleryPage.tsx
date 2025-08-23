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
  role: string;
  origin: string;
  culturalGroup: string;
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

  // Updated artist data with actual photos and new biographies
  const artists: Artist[] = [
    {
      id: 'janet-olaitan',
      stageName: 'Janet Olufunke Olaitan',
      realName: 'Janet Olufunke Olaitan',
      profileImage: '/JANET OLAITAN (1).jpg',
      role: 'Evangelist, Professional Teacher (Retired), Singer/Songwriter',
      origin: 'Osun State, Southwestern Nigeria',
      culturalGroup: 'Yoruba',
      location: 'Osun State, Nigeria / Atlanta, Georgia',
      yearsActive: '2008 - Present',
      specialties: ['Yoruba Spoken Word', 'Cultural Ministry', 'Youth Outreach'],
      biography: `Janet Olufunke Olaitan serves as the Yoruba representative for God Will Provide Outreach Ministry. As a retired professional teacher and experienced evangelist, she brings a wealth of educational expertise and spiritual insight to her role. Born and raised in Osun State in Southwestern Nigeria, Janet is deeply connected to her Yoruba cultural roots, which infuses her ministry with authentic cultural expressions and linguistic precision.

Her spoken word pieces in Yoruba carry the rich oral tradition of her people, utilizing proverbs, rhythmic patterns, and cultural metaphors that resonate deeply with Yoruba speakers. Janet's teaching background enables her to communicate complex spiritual concepts in accessible ways, making her ministry particularly effective among both young and old listeners.

Janet's work bridges generational and geographical divides, connecting Yoruba speakers in Nigeria with those in the diaspora through the universal language of faith. Her contributions to the ministry include not only spoken word recordings but also cultural consultation to ensure that all Yoruba-language content maintains linguistic authenticity and cultural relevance.`,
      featuredTrack: {
        title: 'Eyin rere (Good Fruit)',
        audioUrl: '/Yoruba version of The Gospel.mp3',
        duration: '3:45'
      }
    },
    {
      id: 'susan-collins',
      stageName: 'Susan Chinyere Collins',
      realName: 'Susan Chinyere Collins',
      profileImage: '/SUSSAN COLLINS.jpg',
      role: 'Professional Teacher',
      origin: 'Ideato South, Imo State, Eastern Nigeria',
      culturalGroup: 'Igbo',
      location: 'Imo State, Nigeria / Birmingham, Alabama',
      yearsActive: '2010 - Present',
      specialties: ['Igbo Spoken Word', 'Family Ministry', 'Community Healing'],
      biography: `Susan Chinyere Collins represents the Igbo cultural heritage within God Will Provide Outreach Ministry. As a professional teacher from Ideato South in Imo State, Eastern Nigeria, Susan brings educational expertise and cultural authenticity to her spoken word ministry. Her deep connection to her Igbo roots enables her to communicate spiritual truths in ways that resonate profoundly with Igbo-speaking communities.

Susan's spoken word pieces in Igbo are characterized by their poetic beauty and cultural depth. She skillfully incorporates traditional Igbo proverbs, idioms, and storytelling techniques to convey biblical principles in culturally relevant ways. Her teaching background allows her to present complex theological concepts with clarity and practical application.

Her ministry particularly focuses on family strengthening and community healing, addressing real-life challenges through the lens of faith and cultural wisdom. Susan's gentle yet authoritative delivery style has made her a respected voice among Igbo communities worldwide, helping to preserve the language while making the gospel message accessible to new generations of speakers.`,
      featuredTrack: {
        title: 'Ozi oma (Good News)',
        audioUrl: '/Ibo version of The Gospel-1.mp3',
        duration: '4:12'
      }
    },
    {
      id: 'isaac-samuel',
      stageName: 'Isaac Olamide Samson',
      realName: 'Isaac Olamide Samson',
      profileImage: '/ISAAC O. SAMSON (1).jpg',
      role: 'Clergyman, Full-time Pastor at Celestial Church of Christ',
      origin: 'Born in Northern Nigeria, Originally from Ogun State, Southwestern Nigeria',
      culturalGroup: 'Hausa-speaking',
      location: 'Northern Nigeria / Atlanta, Georgia',
      yearsActive: '2012 - Present',
      specialties: ['Hausa Spoken Word', 'Cross-Cultural Ministry', 'Islamic Outreach'],
      biography: `Isaac Olamide Samson serves as the Hausa representative for God Will Provide Outreach Ministry. Though originally from Ogun State in Southwestern Nigeria, Isaac was born and raised in Northern Nigeria, where he developed fluency in the Hausa language. This unique background has positioned him as an effective bridge-builder across Nigeria's diverse cultural landscape.

As a full-time pastor at Celestial Church of Christ, Isaac brings theological depth and pastoral experience to his spoken word ministry. His fluency in Hausa—acquired during his early childhood in Northern Nigeria—enables him to communicate with authenticity and cultural sensitivity to Hausa-speaking communities.

Isaac's spoken word pieces in Hausa reflect his understanding of northern Nigerian cultural contexts and linguistic nuances. His ministry is particularly valuable in reaching across religious boundaries, as he understands the cultural and religious background of many Hausa speakers. Through his work, Isaac demonstrates how the gospel message can be communicated respectfully and effectively in culturally diverse settings.`,
      featuredTrack: {
        title: 'Labari mai dadi (Sweet Story)',
        audioUrl: '/Hausa version of The Gospel.mp3',
        duration: '3:58'
      }
    },
    {
      id: 'birdie-jones',
      stageName: 'Evangelist Jones',
      realName: 'Birdie Mae Jones',
      profileImage: '/Evangelist Jones Picture.JPG',
      role: 'Founder & Lead Speaker',
      origin: 'Atlanta, Georgia',
      culturalGroup: 'English-speaking',
      location: 'Atlanta, Georgia',
      yearsActive: '1995 - Present',
      specialties: ['English Spoken Word', 'Gospel Ministry', 'International Outreach'],
      biography: `A member of Christian Missionary Baptist Church family in 1998 under Bishop Henry W. and 1st Lady Pauline White's leadership. Bishop White acknowledged the call to ministry on my life in 2004, which I confirmed.  I humbled myself to that call and my first assignment was to evangelize outside the four walls. We organized Bible Study classes at the Adult Care Home, and the Homeless Shelter (Atlanta Union Mission), where we also implemented a mobile GED program using volunteer tutors. Here we witnessed that many had not accepted Jesus Christ as their Lord and Savior.  
I had a burning desire to share Jesus, and I couldn't get enough of reading the Bible, and sharing with others. The Holy Spirit is still teaching and guiding me. God established my ministry which is God Will Provide. I was ordained in the office of Evangelist/Pastor, ministering to my family first and to whomever God sent to become a part of the congregation. Some have set under this ministry, because they wanted the intimacy of a small congregation.  I love teaching the word, and God allowed me to earn my doctorate in Divinity.  But like I said, the Holy Spirit is the real Teacher.
Since 2016, I've added a CD "The Gospel" to help with the outreach to evangelize the World. This CD is a Spoken Word simply planting seeds on how to be saved and why to be saved. It is intentionally placed to be heard in secular genres.  We pay a fee to Radio Airplay for the airtime, and our goal is to reach as many people as possible to come to Christ.  Since 2024, we have extended this opportunity to anyone who wants to help financially or by soliciting donors to help with this very important mission of seeking souls to be saved. 
I praise God for His faithfulness, and I honor Bishop Henry White and 1st Lady Pauline for their guidance.  I am grateful for my family, friends, tutors, volunteers, God Will Provide, Pure Gold Gospel Singers, and the passionate Artists that narrated the Gospel CD in their own respective languages. I acknowledge Singer/Musician Elizabeth Olaitan, and Website Developer Adeola Ilavbare (awesome website) to help bring this mission work to fruition. Hallelujah!`,
      featuredTrack: {
        title: 'Transformed by Grace',
        audioUrl: '/English.mp3',
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
                  style={{
                    objectPosition: 'center top',
                    maxWidth: '800px',
                    maxHeight: '600px'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Artist Names Overlay */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{artist.stageName}</h3>
                  <p className="text-white/80">{artist.role}</p>
                </div>
              </div>

              {/* Artist Details */}
              <div className="p-8">
                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin size={16} />
                    <span className="text-sm">{artist.origin}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar size={16} />
                    <span className="text-sm">{artist.yearsActive}</span>
                  </div>
                </div>

                {/* Cultural Group */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Cultural Group</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      {artist.culturalGroup}
                    </span>
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
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
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