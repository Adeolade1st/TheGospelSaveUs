import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ImpactCounterSection from '../components/ImpactCounterSection';
import AboutSection from '../components/AboutSection';
import SpokenWordSection from '../components/SpokenWordSection';
import DonationSection from '../components/DonationSection';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <ImpactCounterSection />
        <AboutSection />
        <SpokenWordSection />
        <DonationSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;