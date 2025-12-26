import React, { useState } from 'react';
import { Play, ArrowRight, Sparkles, Heart, Target } from 'lucide-react';
import VideoModal from './VideoModal';

interface HeroSectionProps {
  onGetStarted: () => void;
  demoVideoUrl?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, demoVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }) => {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <>
      <section className="min-h-[calc(100vh-4rem)] py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-orange-50 to-orange-100 flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center">
            <div className="max-w-4xl mx-auto relative z-10">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
                <span className="text-orange-600">LiqLearns</span>
              </h1>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Interactive Tutorial Hub
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-700 font-normal mb-8 max-w-3xl mx-auto">
                Our tutoring approach takes you to a point where you're actually learning
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <button
                  onClick={onGetStarted}
                  className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-medium text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-2"
                  aria-label="Get started with LiqLearns"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </button>
                
                <button 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="group px-10 py-5 bg-white border-2 border-orange-500 text-orange-700 rounded-full font-medium text-xl shadow-md hover:bg-orange-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-2"
                  aria-label="Watch demo video"
                >
                  <Play className="w-6 h-6" aria-hidden="true" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="flex justify-center mb-2">
                    <Sparkles className="w-8 h-8 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">Learn</div>
                  <div className="text-sm text-gray-700 font-normal">Master New Skills</div>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="flex justify-center mb-2">
                    <Heart className="w-8 h-8 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">Play</div>
                  <div className="text-sm text-gray-700 font-normal">Gamified Learning</div>
                </div>
                <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200">
                  <div className="flex justify-center mb-2">
                    <Target className="w-8 h-8 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">Thrive</div>
                  <div className="text-sm text-gray-700 font-normal">Achieve Success</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VideoModal 
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={demoVideoUrl}
      />
    </>
  );
};

export default HeroSection;