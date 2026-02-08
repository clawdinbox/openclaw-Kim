// components/ContentOutput.tsx
import React from 'react';

const ContentOutput = () => {
  // Placeholder data
  const postsToday = 72;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Content Output</h3>
      <div className="flex items-center justify-center">
        <div className="text-5xl font-bold text-blue-500">{postsToday}</div>
        <div className="ml-4 text-lg text-gray-600">posts today</div>
      </div>
    </div>
  );
};

export default ContentOutput;
