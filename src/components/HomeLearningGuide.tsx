import React, { useState } from 'react';
import { Brain, BookOpen, Search, History, Star, Settings, X, Play, Sparkles, BookCheck, MessageSquare } from 'lucide-react';
import { useLearningMode } from '../context/LearningModeContext';

interface HomeLearningGuideProps {
  onClose: () => void;
}

const HomeLearningGuide: React.FC<HomeLearningGuideProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const features = [
    {
      icon: <BookOpen className="w-5 h-5 text-blue-500" />,
      title: 'Smart Study Notes',
      description: 'AI-powered notes that capture key concepts, examples, and explanations',
      tip: 'Best for: Understanding complex topics and technical concepts'
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-green-500" />,
      title: 'Interactive Q&A',
      description: 'Ask questions about any part of the video and get instant explanations',
      tip: 'Best for: Clarifying doubts and deeper understanding'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      title: 'Smart Summaries',
      description: 'Get concise, accurate summaries focused on the main educational content',
      tip: 'Best for: Quick review and key points'
    },
    {
      icon: <BookCheck className="w-5 h-5 text-orange-500" />,
      title: 'Progress Tracking',
      description: 'Track your learning journey and build knowledge systematically',
      tip: 'Best for: Consistent learning and improvement'
    }
  ];

  const sections = {
    overview: {
      title: 'Welcome to Learning Mode',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Transform your video watching into an effective learning experience. Our AI-powered tools help you understand, remember, and master new topics.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Quick Start:</h4>
            <ol className="list-decimal list-inside text-sm text-blue-600 dark:text-blue-200 space-y-2">
              <li>Enable Learning Mode (already done! ✓)</li>
              <li>Browse educational videos below</li>
              <li>Click any video to start learning</li>
              <li>Use the learning tools while watching</li>
            </ol>
          </div>
        </div>
      )
    },
    features: {
      title: 'Learning Tools',
      content: (
        <div className="space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="group p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              <div className="flex items-start gap-3">
                {feature.icon}
                <div>
                  <h4 className="font-medium dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">{feature.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {feature.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    tips: {
      title: 'Pro Learning Tips',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-3">For Better Learning:</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Play className="w-4 h-4 text-green-500 mt-1" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Watch videos in shorter segments (5-10 minutes)</span>
              </li>
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-500 mt-1" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Take your own notes alongside AI-generated ones</span>
              </li>
              <li className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-purple-500 mt-1" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Ask questions when concepts aren't clear</span>
              </li>
              <li className="flex items-start gap-2">
                <History className="w-4 h-4 text-orange-500 mt-1" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Review previous video notes periodically</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 dark:text-green-300 mb-3">Getting Better Results:</h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li>• Use specific questions for better answers</li>
              <li>• Compare AI notes with video content</li>
              <li>• Save important summaries for later</li>
              <li>• Practice explaining concepts yourself</li>
            </ul>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold dark:text-white">Learning Guide</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex border-b dark:border-gray-700">
        {Object.entries(sections).map(([key, section]) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
              activeSection === key
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {sections[activeSection as keyof typeof sections].content}
      </div>
    </div>
  );
};

export default HomeLearningGuide; 