import AgentCount from "@/components/AgentCount";
import RecentActivity from "@/components/RecentActivity";
import ContentOutput from "@/components/ContentOutput";
import ActiveProjects from "@/components/ActiveProjects";

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mission Control Dashboard v1</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AgentCount />
        <RecentActivity />
        <ContentOutput />
        <ActiveProjects />
      </div>
    </div>
  );
}
