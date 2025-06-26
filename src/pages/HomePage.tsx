import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ImpactCounterSection from '../components/ImpactCounterSection';
import AboutSection from '../components/AboutSection';
import ContentSection from '../components/ContentSection';
import DonationSection from '../components/DonationSection';
import AudioPlayerCard from '../components/AudioPlayerCard';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ImpactCounterSection />
        <AboutSection />
        <ContentSection />
        <DonationSection />
        
        {/* Audio Player Section */}
        <section className="py-15 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Featured Audio Message
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Listen to our powerful spoken word message in Yoruba
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="max-w-md w-full">
                <AudioPlayerCard 
                  audioUrl="/Yoruba version of The Gospel (1).mp3"
                  title="Yoruba Gospel"
                  language="Yoruba"
                  description="A powerful spoken word message in Yoruba"
                  duration="15:32"
                  gradientColors="from-red-600 to-amber-500"
                  textColor="text-white"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;