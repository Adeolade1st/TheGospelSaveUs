import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';
import ContentSection from './components/ContentSection';
import DonationSection from './components/DonationSection';
import AboutSection from './components/AboutSection';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <ContentSection />
          <DonationSection />
          <AboutSection />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;