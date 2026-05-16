import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, Loader2, MessageSquareQuote } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGoogleReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGoogleReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/reviews/google`);
      
      setReviews(response.data.reviews || []);
      setAverageRating(response.data.rating || 0);
      setTotalReviews(response.data.user_ratings_total || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching Google reviews:', err);
      setError('Impossible de charger les avis pour le moment.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Truncate text to a certain length
  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <section id="avis" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-french-blue" size={48} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="avis" className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-gray-950 dark:to-gray-900/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Avis de Mes Clients
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Découvrez les témoignages de satisfaction de mes clients
          </p>

          {/* Rating Summary - More prominent */}
          {!error && averageRating > 0 && (
            <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-french-blue to-sky-blue px-10 py-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-3">
                <div className="text-5xl font-bold text-white">{averageRating.toFixed(1)}</div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={`avg-star-${i}`} 
                        className={i < Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-white/40"} 
                        size={20} 
                      />
                    ))}
                  </div>
                  <div className="text-white/90 text-sm mt-1">Note Google</div>
                </div>
              </div>
              <div className="h-12 w-px bg-white/30 hidden sm:block"></div>
              <div className="text-center sm:text-left">
                <div className="text-4xl font-bold text-white">{totalReviews}</div>
                <div className="text-white/90 text-sm">avis clients</div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center py-12">
            <p className="text-gray-600">{error}</p>
          </div>
        )}

        {/* Reviews Grid - 5 columns */}
        {!error && reviews.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
              {reviews.slice(0, 12).map((review, index) => (
                <Card 
                  key={review.review_id || `review-${index}`} 
                  className="hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white dark:bg-gray-900/50 dark:border dark:border-gray-800 dark:shadow-none hover:-translate-y-1"
                >
                  <CardContent className="p-4">
                    {/* Quote icon */}
                    <MessageSquareQuote className="text-french-blue/20 mb-2" size={24} />
                    
                    {/* Review text */}
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4 min-h-[60px]">
                      "{truncateText(review.text)}"
                    </p>

                    {/* Footer with avatar and name */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                      <Avatar className="w-8 h-8">
                        {review.author.profile_photo_url ? (
                          <img src={review.author.profile_photo_url} alt={review.author.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <AvatarFallback className="bg-french-blue text-white text-xs font-semibold">
                            {getInitials(review.author.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 dark:text-white text-xs truncate">{review.author.name}</div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={`rating-star-${i}`} className="fill-yellow-400 text-yellow-400" size={10} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Link to Google My Business */}
            <div className="text-center">
              <a 
                href="https://share.google/rDb9rtPhWTK454rnn" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button 
                  size="lg"
                  className="bg-french-blue hover:bg-french-blue/90 text-white transition-all duration-300 group shadow-lg hover:shadow-xl"
                >
                  Voir les {totalReviews} avis sur Google
                  <ExternalLink className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </Button>
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Reviews;
