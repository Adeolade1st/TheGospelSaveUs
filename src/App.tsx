import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ContentSection from './components/ContentSection';
import DonationSection from './components/DonationSection';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header />
        <main>
          <Hero />
          <AboutSection />
          <ContentSection />
          <DonationSection />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}

export default App;