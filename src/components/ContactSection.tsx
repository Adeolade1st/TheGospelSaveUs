import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../data/translations';

const ContactSection: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const t = translations[currentLanguage.code];

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Contact Info */}
          <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-3xl p-8 text-white">
            <h3 className="text-3xl font-bold mb-8">{t.contact}</h3>
            <div className="space-y-6">
              <div className="flex items-center">
                <Mail className="mr-4 text-red-300" size={24} />
                <div>
                  <p className="font-semibold text-lg">Email</p>
                  <p className="text-red-200">Jones8874@bellsouth.net</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="mr-4 text-red-300" size={24} />
                <div>
                  <p className="font-semibold text-lg">Phone</p>
                  <p className="text-red-200">404-709-9620</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-4 text-red-300" size={24} />
                <div>
                  <p className="font-semibold text-lg">Address</p>
                  <p className="text-red-200">Atlanta, Georgia</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-4 text-red-300" size={24} />
                <div>
                  <p className="font-semibold text-lg">Mailing Address</p>
                  <p className="text-red-200">P.O. Box 213, Fairburn, GA 30213</p>
                </div>
              </div>
            </div>
          </div>

          {/* Complementary Photo */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3178798/pexels-photo-3178798.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop"
                alt="People in prayer and worship"
                className="rounded-3xl shadow-2xl w-full max-w-md h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;