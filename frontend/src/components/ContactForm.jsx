import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await axios.post(`${BACKEND_URL}/api/contact/send`, formData);
      
      if (response.data && response.data.success) {
        setStatus('success');
        // Clear form data
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error('Réponse inattendue du serveur');
      }
    } catch (err) {
      console.error('Error sending contact form:', err);
      setStatus('error');
      setErrorMessage(
        err.response?.data?.detail || 
        'Une erreur est survenue. Veuillez réessayer ou nous contacter par téléphone.'
      );
    }
  };

  const handleNewMessage = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  // SUCCESS STATE - Show confirmation message
  if (status === 'success') {
    return (
      <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900/80 dark:border-gray-800 shadow-xl dark:shadow-none">
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Message envoyé avec succès !
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Merci pour votre message. Je vous répondrai dans les plus brefs délais, 
              généralement sous 24 à 48 heures.
            </p>
            <Button
              type="button"
              onClick={handleNewMessage}
              className="bg-french-blue hover:bg-french-blue/90 text-white px-8 py-3"
            >
              Envoyer un autre message
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // DEFAULT STATE - Show form
  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900/80 dark:border-gray-800 shadow-xl dark:shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900 dark:text-white">
          Envoyez-moi un Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 text-sm">{errorMessage}</p>
              <button 
                type="button"
                onClick={() => setStatus('idle')}
                className="text-red-600 text-sm underline mt-1"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 dark:text-gray-300 font-medium">
                Nom complet *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                value={formData.name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                disabled={status === 'loading'}
                className="border-gray-300 focus:border-french-blue focus:ring-french-blue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jean.dupont@example.com"
                disabled={status === 'loading'}
                className="border-gray-300 focus:border-french-blue focus:ring-french-blue"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 font-medium">
              Téléphone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="06 12 34 56 78"
              disabled={status === 'loading'}
              className="border-gray-300 focus:border-french-blue focus:ring-french-blue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-700 dark:text-gray-300 font-medium">
              Sujet *
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              required
              minLength={5}
              value={formData.subject}
              onChange={handleChange}
              placeholder="Demande d'assistance informatique"
              disabled={status === 'loading'}
              className="border-gray-300 focus:border-french-blue focus:ring-french-blue"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-gray-700 dark:text-gray-300 font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              name="message"
              required
              minLength={10}
              value={formData.message}
              onChange={handleChange}
              placeholder="Décrivez votre besoin en détail..."
              rows={6}
              disabled={status === 'loading'}
              className="border-gray-300 focus:border-french-blue focus:ring-french-blue resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-french-blue hover:bg-french-blue/90 text-white py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="mr-2" size={20} />
                Envoyer le Message
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            * Champs obligatoires
          </p>
        </form>
      </CardContent>
    </Card>
  );
};

export default ContactForm;
