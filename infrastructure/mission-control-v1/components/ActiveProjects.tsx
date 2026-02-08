// components/ActiveProjects.tsx
import React from 'react';

const ActiveProjects = () => {
  const projects = [
    { id: 1, name: "Project Phoenix", status: "In Progress", lead: "Engineer X" },
    { id: 2, name: "New Feature Rollout", status: "Development", lead: "Engineer Y" },
    { id: 3, name: "Website Redesign", status: "Planning", lead: "Designer Z" },
    { id: 4, name: "Q2 Marketing Campaign", status: "Active", lead: "BD Lead A" },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2">
      <h3 className="text-xl font-semibold mb-4">Active Projects</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.lead}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveProjects;
