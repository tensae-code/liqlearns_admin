import React, { useState, useEffect } from 'react';
import { Lightbulb, Globe, BookOpen, Users, Heart, Star } from 'lucide-react';
import Icon from '../../../components/AppIcon';


const educationalTips = [
  {
    icon: Globe,
    text: "Ethiopia has over 80 languages, making it one of the most linguistically diverse countries in Africa.",
    category: "Cultural Fact"
  },
  {
    icon: BookOpen,
    text: "Amharic uses the Ge'ez script, one of the oldest writing systems still in use today.",
    category: "Language Insight"
  },
  {
    icon: Users,
    text: "Learning with others increases retention by 75%. Join our community discussions!",
    category: "Study Tip"
  },
  {
    icon: Heart,
    text: "Regular practice for just 15 minutes daily can help you achieve conversational fluency.",
    category: "Learning Strategy"
  },
  {
    icon: Star,
    text: "Our gamified approach helps you stay motivated and track your progress effectively.",
    category: "Platform Feature"
  },
  {
    icon: Globe,
    text: "Oromo is spoken by over 35 million people, making it one of Africa's major languages.",
    category: "Cultural Fact"
  }
];

const EducationalTips: React.FC = () => {
  const [currentTip, setCurrentTip] = useState(0);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeClass('opacity-0');
      
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % educationalTips.length);
        setFadeClass('opacity-100');
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tip = educationalTips[currentTip];
  const Icon = tip.icon;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 min-h-[120px] flex items-center">
      <div className={`transition-opacity duration-300 ${fadeClass} w-full`}>
        {/* Tip Header */}
        <div className="flex items-center justify-center mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mr-3">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-orange-300 text-sm font-semibold uppercase tracking-wider">
            {tip.category}
          </span>
        </div>

        {/* Tip Content */}
        <p className="text-white text-center text-sm leading-relaxed">
          {tip.text}
        </p>

        {/* Tip Indicator */}
        <div className="flex justify-center mt-4 space-x-1">
          {educationalTips.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentTip 
                  ? 'bg-orange-400 scale-125' :'bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Lightbulb Icon */}
        <div className="absolute top-2 right-2 opacity-20">
          <Lightbulb className="w-6 h-6 text-orange-300" />
        </div>
      </div>
    </div>
  );
};

export default EducationalTips;