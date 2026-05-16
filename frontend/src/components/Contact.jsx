import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, ExternalLink, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import ContactForm from './ContactForm';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const contactInfo = {
  phone: "07 61 50 35 85",
  email: "aidenumerique37@gmail.com",
  location: "Bas\u00e9 \u00e0 Jou\u00e9-l\u00e8s-Tours, intervenant dans tout l'Indre-et-Loire"
};

const socialLinks = {
  facebook: "https://www.facebook.com/profile.php?id=61577856314429",
  instagram: "https://www.instagram.com/aidenumerique37/",
  google: "https://share.google/rDb9rtPhWTK454rnn"
};

const Contact = () => {
  const [content, setContent] = useState({ title: 'Contactez-Moi', subtitle: '' });

  useEffect(() => {
    axios.get(`${BACKEND_URL}/api/admin/content`)
      .then(res => {
        if (res.data.contact) setContent(res.data.contact);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-french-blue via-french-blue to-sky-blue dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 dark:border-t dark:border-gray-800 text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4" data-testid="contact-title">
                {content.title || 'Contactez-Moi'}
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed" data-testid="contact-subtitle">
                {content.subtitle || "Une question ? Besoin d'un accompagnement informatique ? Je suis là pour vous aider. Contactez-moi par téléphone, email ou via le formulaire."}
              </p>
            </div>

            {/* Contact Cards */}
            <div className="space-y-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-french-red/80 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100 mb-1">Téléphone</div>
                      <a
                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                        className="hover:text-blue-200 transition-colors !font-semibold !text-xl !text-[#FFFFFF]">

                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-french-red/80 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100 mb-1">Email</div>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="hover:text-blue-200 transition-colors break-all !font-semibold !text-xl !text-[#FFFFFF]">

                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-french-red/80 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100 mb-1">Zone d'intervention</div>
                      <div className="!font-semibold !text-xl !text-[#F7F7F7]">
                        {contactInfo.location}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20" data-testid="contact-hours-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-french-red/80 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-sm text-blue-100 mb-1">Horaires d'intervention</div>
                      <div className="!font-semibold !text-xl !text-[#F7F7F7]">
                        7j/7 — du lundi au dimanche, 8h30 – 20h
                      </div>
                      <div className="text-xs text-blue-100 mt-1">Dimanche &amp; jours fériés sur RDV (forfait spécial)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Google Map */}
            <div className="rounded-xl overflow-hidden shadow-lg border border-white/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d43261.070389747445!2d0.576526395985005!3d47.33744711058404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47fcd61722c66071%3A0x4be9ca79fd2a1ec9!2s37300%20Jou%C3%A9-l%C3%A8s-Tours!5e0!3m2!1sfr!2sfr!4v1772726271319!5m2!1sfr!2sfr"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Zone d'intervention - Joué-lès-Tours"
                data-testid="google-map"
              ></iframe>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-xl font-bold mb-4">Suivez-moi sur les réseaux</h3>
              <div className="flex gap-4">
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 rounded-lg !bg-[rgba(0,26,255,0.3)]">

                  <Facebook size={28} />
                </a>
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 rounded-lg !bg-[rgba(234,66,170,0.3)]">

                  <Instagram size={28} />
                </a>
                <a
                  href={socialLinks.google}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 hover:bg-white/30 flex items-center justify-center transition-all duration-300 hover:scale-110 rounded-lg !bg-[rgba(255,131,0,0.3)]">

                  <svg 
                    viewBox="0 0 24 24" 
                    width="28" 
                    height="28" 
                    fill="currentColor"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Right Content - Contact Form */}
          <div className="relative">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>);

};

export default Contact;