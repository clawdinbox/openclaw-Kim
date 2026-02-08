// components/AgentCount.tsx
import React from 'react';

const AgentCount = () => {
  // Placeholder data structure
  const agentData = {
    "BD": 15,
    "Research": 20,
    "Content": 25,
    "Design": 18,
    "Engineering": 30,
    "Operations": 12,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Agent Count by Division</h3>
      <ul className="space-y-2">
        {Object.entries(agentData).map(([division, count]) => (
          <li key={division} className="flex justify-between">
            <span>{division}</span>
            <span className="font-medium">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AgentCount;
