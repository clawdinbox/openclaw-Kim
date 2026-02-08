"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Cpu, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Zap,
  TrendingUp,
  BarChart3,
  User
} from "lucide-react";

interface AgentWorkloadData {
  id: string;
  role: string;
  name: string;
  status: string;
  workload: number;
  maxWorkload: number;
  availability: "available" | "busy" | "overloaded" | "offline";
  capabilities: string[];
  currentTask?: string;
}

interface WorkloadDistribution {
  total: number;
  available: number;
  busy: number;
  overloaded: number;
}

export function AgentWorkload() {
  const agentAvailability = useQuery(api.pipeline.router.getAgentAvailability);
  const workloadDistribution = useQuery(api.pipeline.router.getWorkloadDistribution);
  
  const balanceWorkload = useMutation(api.pipeline.router.balanceWorkload);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available": return "bg-green-500";
      case "busy": return "bg-yellow-500";
      case "overloaded": return "bg-red-500";
      case "offline": return "bg-gray-400";
      default: return "bg-gray-400";
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return <Badge variant="outline" className="border-green-500 text-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Available</Badge>;
      case "busy":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock className="w-3 h-3 mr-1" /> Busy</Badge>;
      case "overloaded":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" /> Overloaded</Badge>;
      case "offline":
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" /> Offline</Badge>;
      default:
        return <Badge variant="secondary">{availability}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "senior-analyst": return <BarChart3 className="w-4 h-4" />;
      case "research-associate": return <Zap className="w-4 h-4" />;
      case "cmo": return <TrendingUp className="w-4 h-4" />;
      case "engineer": return <Cpu className="w-4 h-4" />;
      case "cso": return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "senior-analyst": return "bg-blue-100 text-blue-700";
      case "research-associate": return "bg-green-100 text-green-700";
      case "cmo": return "bg-purple-100 text-purple-700";
      case "engineer": return "bg-orange-100 text-orange-700";
      case "cso": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleBalanceWorkload = async () => {
    await balanceWorkload({});
  };

  const agents = agentAvailability || [];
  const distribution = workloadDistribution || {};

  // Calculate overall stats
  const totalAgents = agents.length;
  const availableAgents = agents.filter(a => a.availability === "available").length;
  const overloadedAgents = agents.filter(a => a.availability === "overloaded").length;
  const totalCapacity = agents.reduce((sum, a) => sum + a.maxWorkload, 0);
  const currentLoad = agents.reduce((sum, a) => sum + a.workload, 0);
  const utilizationRate = totalCapacity > 0 ? (currentLoad / totalCapacity) * 100 : 0;

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Overall Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAgents}</div>
              <p className="text-xs text-muted-foreground">
                {availableAgents} available now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilization</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{utilizationRate.toFixed(0)}%</div>
              <Progress value={utilizationRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Load</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentLoad}<span className="text-lg text-muted-foreground">/{totalCapacity}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Active tasks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overloadedAgents > 0 ? "text-red-500" : ""}`}>
                {overloadedAgents}
              </div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Department Distribution */}
        {Object.keys(distribution).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Department Workload</CardTitle>
              <CardDescription>Workload distribution by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(distribution).map(([dept, stats]: [string, WorkloadDistribution]) => (
                  <div key={dept} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{dept}</span>
                      <Badge variant="outline">{stats.total} agents</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Available</span>
                        <span>{stats.available}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-600">Busy</span>
                        <span>{stats.busy}</span>
                      </div>
                      {stats.overloaded > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Overloaded</span>
                          <span className="text-red-600 font-medium">{stats.overloaded}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Agent Status</CardTitle>
              <CardDescription>Individual agent workload and availability</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleBalanceWorkload}>
              Balance Workload
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent: AgentWorkloadData) => (
                <Tooltip key={agent.id}>
                  <TooltipTrigger asChild>
                    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-10 w-10 ${getRoleColor(agent.role)}`}>
                            <AvatarFallback className={getRoleColor(agent.role)}>
                              {getRoleIcon(agent.role)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {agent.role.replace(/-/g, " ")}
                            </p>
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getAvailabilityColor(agent.availability)}`} />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {getAvailabilityBadge(agent.availability)}
                          <span className="text-sm text-muted-foreground">
                            {agent.workload}/{agent.maxWorkload} tasks
                          </span>
                        </div>

                        <Progress 
                          value={(agent.workload / agent.maxWorkload) * 100} 
                          className={`h-2 ${
                            agent.availability === "overloaded" ? "bg-red-200" :
                            agent.availability === "busy" ? "bg-yellow-200" :
                            "bg-green-200"
                          }`}
                        />

                        {agent.currentTask && (
                          <p className="text-sm text-muted-foreground truncate">
                            Current: <span className="font-medium">{agent.currentTask}</span>
                          </p>
                        )}

                        {agent.capabilities.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map((cap: string) => (
                              <Badge key={cap} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{agent.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs">Role: {agent.role}</p>
                      <p className="text-xs">Status: {agent.status}</p>
                      <p className="text-xs">Workload: {agent.workload}/{agent.maxWorkload}</p>
                      <p className="text-xs">Capabilities: {agent.capabilities.join(", ")}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {agents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No agents configured</p>
                <p className="text-sm">Run the setup script to initialize agents</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capacity Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Capacity Forecast</CardTitle>
            <CardDescription>Projected availability for next 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Hour</span>
                  <span className="font-medium">{availableAgents} available</span>
                </div>
                <Progress value={(availableAgents / totalAgents) * 100} />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next 4h (Projected)</span>
                  <span className="font-medium">{Math.max(availableAgents - 1, 0)} available</span>
                </div>
                <Progress 
                  value={(Math.max(availableAgents - 1, 0) / totalAgents) * 100}
                  className="bg-blue-100"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Next 24h (Projected)</span>
                  <span className="font-medium">{Math.max(availableAgents - 2, 0)} available</span>
                </div>
                <Progress 
                  value={(Math.max(availableAgents - 2, 0) / totalAgents) * 100}
                  className="bg-purple-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
