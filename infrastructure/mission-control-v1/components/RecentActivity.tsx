// components/RecentActivity.tsx
import React from 'react';

const RecentActivity = () => {
  const activities = [
    { id: 1, agent: "Alice", task: "Completed research report on AI trends", timestamp: "2026-02-08 21:55 GMT+1" },
    { id: 2, agent: "Bob", task: "Published blog post: 'NextJS Best Practices'", timestamp: "2026-02-08 21:40 GMT+1" },
    { id: 3, agent: "Charlie", task: "Designed new UI mockups for Project X", timestamp: "2026-02-08 21:30 GMT+1" },
    { id: 4, agent: "David", task: "Debugged critical bug in User Auth module", timestamp: "2026-02-08 21:15 GMT+1" },
    { id: 5, agent: "Eve", task: "Analyzed Q1 sales data", timestamp: "2026-02-08 21:00 GMT+1" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Recent Activity (Last 5)</h3>
      <ul className="space-y-3 text-sm">
        {activities.map((activity) => (
          <li key={activity.id}>
            <div className="font-medium">{activity.task}</div>
            <div className="text-gray-500 text-xs">{activity.agent} - {activity.timestamp}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
