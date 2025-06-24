import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import ContentSection from '../components/ContentSection';
import DonationSection from '../components/DonationSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <AboutSection />
        <ContentSection />
        <DonationSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;