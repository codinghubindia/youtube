import React from 'react';
import { Play } from 'lucide-react';

const ShortsPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Play className="w-6 h-6 mr-2" />
        <h1 className="text-2xl font-semibold">Shorts</h1>
      </div>

      <div className="max-w-sm mx-auto text-center py-12">
        <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-medium mb-2">Shorts coming soon</h2>
        <p className="text-gray-600">This feature is under development</p>
      </div>
    </div>
  );
};

export default ShortsPage;