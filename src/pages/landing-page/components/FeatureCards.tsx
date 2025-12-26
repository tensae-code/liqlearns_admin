import React, { useState, useEffect, useRef } from 'react';
import { Globe, TrendingUp, Heart, Target, Smartphone, Zap, Send, User, Phone, MessageSquare, Users, Languages, Award, MapPin, ThumbsUp, CheckCircle, TrendingUp as Growth, Star, BookOpen, Shield, Sparkles, Mail } from 'lucide-react';
import Icon from '../../../components/AppIcon';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  gradient: string;
  accent: string;
  category: 'platform' | 'impact' | 'function' | 'contact' | 'liqlearns' | 'metrics' | 'tutoring' | 'interactive' | 'certificate' | 'permissions';
  metric?: string;
  hasLiveIndicator?: boolean;
}

const features: Feature[] = [
  // Platform Features
  {
    icon: Globe,
    title: 'Platform Features',
    description: 'Cultural and business-oriented tutorials with gamification elements for engaging, interactive learning experiences',
    gradient: 'from-blue-500 to-cyan-500',
    accent: 'bg-blue-50 border-blue-200',
    category: 'platform'
  },

  // Platform Impact - Updated
  {
    icon: TrendingUp,
    title: 'Platform Impact',
    description: 'Guiding people to master what they want through personalized, effective tutorial pathways',
    gradient: 'from-purple-500 to-pink-500',
    accent: 'bg-purple-50 border-purple-200',
    category: 'impact'
  },

  // Functions
  {
    icon: Zap,
    title: 'Core Functions',
    description: 'AI-powered tutorials, real-time analytics, and community building for comprehensive learning',
    gradient: 'from-green-500 to-emerald-500',
    accent: 'bg-green-50 border-green-200',
    category: 'function'
  },

  // Personalized Tutoring
  {
    icon: BookOpen,
    title: 'Knowledge-Based Tutoring',
    description: 'We tutor according to your knowledge level, ensuring you truly understand through personalized guidance',
    gradient: 'from-indigo-600 to-purple-600',
    accent: 'bg-indigo-50 border-indigo-200',
    category: 'tutoring'
  },

  // Interactive Platform
  {
    icon: Sparkles,
    title: 'Interactive Platform',
    description: 'We use only interactive tools to teach - engaging videos, live sessions, and hands-on practice',
    gradient: 'from-pink-600 to-rose-600',
    accent: 'bg-pink-50 border-pink-200',
    category: 'interactive'
  },

  // LiqLearns Vision - Updated
  {
    icon: Heart,
    title: 'LiqLearns Vision',
    description: 'Transforming education from boring to exciting with hands-on experience and practical learning',
    gradient: 'from-orange-500 to-red-500',
    accent: 'bg-orange-50 border-orange-200',
    category: 'liqlearns'
  },

  // Certificate of Completion
  {
    icon: Award,
    title: 'Certificates of Completion',
    description: 'Earn verified certificates upon course completion to showcase your skills and achievements',
    gradient: 'from-amber-500 to-yellow-600',
    accent: 'bg-amber-50 border-amber-200',
    category: 'certificate'
  },

  // Platform Permissions
  {
    icon: Shield,
    title: 'Platform Permissions',
    description: 'Access exclusive content, community forums, live sessions, and more as you progress',
    gradient: 'from-slate-600 to-gray-700',
    accent: 'bg-slate-50 border-slate-200',
    category: 'permissions'
  },

  // Platform Highlights Metrics (8 cards) - These will be populated from CEO dashboard
  {
    icon: Users,
    title: 'Learners',
    metric: '0',
    description: 'Active learners engaging with diverse tutorial content and community-driven learning',
    gradient: 'from-indigo-500 to-blue-500',
    accent: 'bg-indigo-50 border-indigo-200',
    category: 'metrics',
    hasLiveIndicator: true
  },
  {
    icon: Languages,
    title: 'Languages',
    metric: '1',
    description: 'We use English to teach, with plans to add more languages soon for global accessibility',
    gradient: 'from-pink-500 to-rose-500',
    accent: 'bg-pink-50 border-pink-200',
    category: 'metrics',
    hasLiveIndicator: true
  },
  {
    icon: Award,
    title: 'Success Rate',
    metric: 'Soon...',
    description: 'Success rate will be calculated as students complete courses on our platform',
    gradient: 'from-yellow-500 to-orange-500',
    accent: 'bg-yellow-50 border-yellow-200',
    category: 'metrics',
    hasLiveIndicator: true
  },
  {
    icon: MapPin,
    title: 'Countries',
    metric: 'Soon...',
    description: 'Global reach creating a diverse international tutorial community',
    gradient: 'from-teal-500 to-cyan-500',
    accent: 'bg-teal-50 border-teal-200',
    category: 'metrics',
    hasLiveIndicator: true
  },
  {
    icon: ThumbsUp,
    title: 'Completion Rate',
    metric: 'Soon...',
    description: 'Completion rate will be measured as students progress through our courses',
    gradient: 'from-green-500 to-emerald-500',
    accent: 'bg-green-50 border-green-200',
    category: 'metrics',
    hasLiveIndicator: true
  },
  {
    icon: CheckCircle,
    title: 'Growth',
    metric: 'Confident',
    description: 'We are confident with our platform and excited about upcoming growth opportunities',
    gradient: 'from-blue-500 to-indigo-500',
    accent: 'bg-blue-50 border-blue-200',
    category: 'metrics',
    hasLiveIndicator: true
  },
  {
    icon: Growth,
    title: 'Happy Students',
    metric: 'Soon...',
    description: 'Happy student count will grow as learners achieve their goals through our platform',
    gradient: 'from-purple-500 to-pink-500',
    accent: 'bg-purple-50 border-purple-200',
    category: 'metrics',
    hasLiveIndicator: true
  },
  {
    icon: Star,
    title: 'Platform Satisfaction',
    metric: 'Soon...',
    description: 'Satisfaction metrics will be available as we gather feedback from our growing community',
    gradient: 'from-orange-500 to-red-500',
    accent: 'bg-orange-50 border-orange-200',
    category: 'metrics',
    hasLiveIndicator: true
  }
];

const FeatureCards: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    verificationCode: ''
  });
  const [formVisible, setFormVisible] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  // Scroll Animation Observer
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    // Card animation observer
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            setVisibleCards(prev => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) cardObserver.observe(ref);
    });
    observers.push(cardObserver);

    // Form animation observer
    if (formRef.current) {
      const formObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setFormVisible(true);
            }
          });
        },
        { threshold: 0.2 }
      );
      formObserver.observe(formRef.current);
      observers.push(formObserver);
    }

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const handleCardClick = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limit verification code to 6 digits
    if (name === 'verificationCode' && value.length > 6) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendVerification = async () => {
    if (!formData.phone) {
      alert('Please enter your phone number');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate sending verification code
    setTimeout(() => {
      setVerificationSent(true);
      setIsSubmitting(false);
      alert('6-digit verification code sent to your phone!');
    }, 1000);
  };

  const handleSubmitCode = () => {
    if (formData.verificationCode.length !== 6) {
      alert('Please enter the complete 6-digit verification code');
      return;
    }
    // Simulate verification
    alert('Code verified successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationSent) {
      alert('Please request and enter the verification code first');
      return;
    }

    if (formData.verificationCode.length !== 6) {
      alert('Please enter the complete 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      alert('Message sent successfully!');
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: '',
        verificationCode: ''
      });
      setVerificationSent(false);
      setIsSubmitting(false);
    }, 1000);
  };

  // Group cards into custom layout: 2, 3, 4, 2, etc.
  const getRowClass = (index: number): string => {
    const pattern = [2, 3, 4, 2]; // Repeating pattern
    const patternIndex = Math.floor(index / pattern.reduce((a, b) => a + b, 0)) * pattern.reduce((a, b) => a + b, 0);
    const positionInPattern = index - patternIndex;
    
    let currentSum = 0;
    for (let i = 0; i < pattern.length; i++) {
      currentSum += pattern[i];
      if (positionInPattern < currentSum) {
        return `col-span-${12 / pattern[i]}`;
      }
    }
    return 'col-span-3';
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-full mb-4">
            <Target className="w-4 h-4 text-orange-600 mr-2" />
            <span className="text-sm font-medium text-orange-700">Why Choose Us</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why We're Your
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"> Best Choice</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover what makes us the preferred tutorial platform for thousands of students worldwide
          </p>
        </div>

        {/* Features Grid - Custom Layout Pattern (2,3,4,2) */}
        <div className="grid grid-cols-12 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isFlipped = flippedCards.has(index);
            const isVisible = visibleCards.has(index);
            
            return (
              <div
                key={index}
                ref={el => cardRefs.current[index] = el}
                data-index={index}
                className={`perspective-1000 h-72 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                } ${
                  // Custom grid pattern: 2, 3, 4, 2
                  index % 11 < 2 ? 'col-span-12 sm:col-span-6' :
                  index % 11 < 5 ? 'col-span-12 sm:col-span-4' :
                  index % 11 < 9 ? 'col-span-12 sm:col-span-3': 'col-span-12 sm:col-span-6'
                }`}
                style={{ transitionDelay: `${(index % 4) * 100}ms` }}
              >
                <div 
                  className={`relative preserve-3d transition-transform duration-700 w-full h-full cursor-pointer ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => handleCardClick(index)}
                >
                  {/* Front Side */}
                  <div className={`absolute inset-0 backface-hidden rounded-2xl p-6 bg-white border-2 ${feature.accent} shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden`}>
                    {feature.hasLiveIndicator && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50">
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                      </div>
                    )}
                    
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    <div className={`relative w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4 transform hover:scale-110 hover:rotate-3 transition-all duration-300 mx-auto`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {feature.metric && (
                      <div className="relative text-center mb-2">
                        <div className={`text-4xl font-bold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                          {feature.metric}
                        </div>
                      </div>
                    )}

                    <div className="relative text-center">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                    </div>

                    <div className="absolute bottom-4 right-4 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                      <div className="text-xs text-orange-600 font-medium">Click to flip</div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6 bg-gradient-to-br ${feature.gradient} text-white shadow-lg flex flex-col justify-center items-center text-center`}>
                    {feature.hasLiveIndicator && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-white/80 rounded-full animate-pulse shadow-lg">
                        <div className="absolute inset-0 bg-white/60 rounded-full animate-ping"></div>
                      </div>
                    )}
                    
                    <Icon className="w-12 h-12 mb-4 opacity-90" />
                    {feature.metric && (
                      <div className="text-3xl font-bold mb-2 text-white">
                        {feature.metric}
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                    <p className="text-sm opacity-95 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Optimization Note */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-full">
            <Smartphone className="w-4 h-4 text-gray-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Click cards to flip and explore details</span>
          </div>
        </div>

        {/* Divider Line with Shadow */}
        <div className="mt-20 mb-16">
          <div className="max-w-4xl mx-auto h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent shadow-lg"></div>
        </div>

        {/* Enhanced Contact Us Form with Different Background */}
        <div 
          ref={formRef}
          className={`mt-12 transition-all duration-1000 relative bg-gradient-to-br from-orange-50 via-white to-purple-50 py-16 px-4 rounded-3xl ${
            formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-3xl mx-auto relative">
            {/* Form Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-full mb-4">
                <Mail className="w-4 h-4 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-700">Get in Touch</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Contact Us</h3>
              <p className="text-gray-600">We'd love to hear from you. Verify your phone and send us a message.</p>
            </div>
            
            {/* Form Container */}
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-orange-100 p-8 md:p-10 relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100 to-transparent rounded-full blur-2xl opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-100 to-transparent rounded-full blur-2xl opacity-50"></div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Name Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Phone and Email Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Phone Field with Verification */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+251 XXX XXX XXX"
                        required
                        disabled={verificationSent}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    {!verificationSent && (
                      <button
                        type="button"
                        onClick={handleSendVerification}
                        disabled={isSubmitting}
                        className="mt-2 w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Verification Code'}
                      </button>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Code Field with Submit Button */}
                {verificationSent && (
                  <div className="space-y-4">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Code (6 digits) *</label>
                      <input
                        type="text"
                        name="verificationCode"
                        value={formData.verificationCode}
                        onChange={handleInputChange}
                        placeholder="000000"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="block w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 text-center text-2xl font-mono tracking-widest"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitCode}
                      disabled={formData.verificationCode.length !== 6}
                      className="w-full px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      Submit Code
                    </button>
                  </div>
                )}

                {/* Message Field */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message *</label>
                  <div className="relative">
                    <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    </div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      required
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-300 hover:border-gray-300 resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !verificationSent || formData.verificationCode.length !== 6}
                    className="group w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>

                {/* Security Note */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-center text-gray-600 text-sm">
                    🔒 Phone verification required to prevent spam. Your data is secure.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;