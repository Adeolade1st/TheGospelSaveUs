import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ImpactCounterSection from '../components/ImpactCounterSection';
import AboutSection from '../components/AboutSection';
import ContentSection from '../components/ContentSection';
import DonationSection from '../components/DonationSection';
import Footer from '../components/Footer';
import AudioPlayerCard from '../components/AudioPlayerCard';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ImpactCounterSection />
        <AboutSection />
        
        {/* Featured Audio Section */}
        <section className="py-15 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Featured Message
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Listen to our transformative spoken word ministry in Yoruba
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <AudioPlayerCard
                title="The Gospel Saves Us"
                language="Yorùbá"
                description="A powerful spoken word message about salvation and God's transforming grace"
                audioUrl="yoruba.mp3"
                duration="Audio Message"
                gradientColors="bg-gradient-to-br from-red-600 via-red-700 to-amber-600"
                textColor="text-white"
              />
            </div>
          </div>
        </section>
        
        <ContentSection />
        <DonationSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;