"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { 
  Play, 
  Pause, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Activity,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Zap,
  Settings,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AgentWorkload } from "./AgentWorkload";

export function PipelineDashboard() {
  const pipelineStatus = useQuery(api.pipeline.worker.getPipelineStatus);
  const pipelineHealth = useQuery(api.pipeline.monitor.getPipelineHealth);
  const executionReport = useQuery(api.pipeline.monitor.getExecutionReport, { hours: 24 });
  
  const setPaused = useMutation(api.pipeline.worker.setPaused);
  const setMode = useMutation(api.pipeline.worker.setMode);
  const emergencyStop = useMutation(api.pipeline.worker.emergencyStop);
  
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePause = async () => {
    setIsLoading("pause");
    await setPaused({ 
      paused: !pipelineStatus?.isPaused,
      reason: pipelineStatus?.isPaused ? "User resumed" : "User paused",
    });
    setIsLoading(null);
  };

  const handleModeChange = async (mode: "proactive" | "reactive" | "project") => {
    setIsLoading("mode");
    await setMode({ mode });
    setIsLoading(null);
  };

  const handleEmergencyStop = async () => {
    if (confirm("Are you sure you want to EMERGENCY STOP all pipeline operations?")) {
      setIsLoading("emergency");
      await emergencyStop({ 
        reason: "Manual emergency stop from dashboard",
        initiatedBy: "dashboard_user",
      });
      setIsLoading(null);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-500";
      case "degraded": return "text-yellow-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case "proactive":
        return <Badge className="bg-blue-500"><Zap className="w-3 h-3 mr-1" /> Proactive</Badge>;
      case "reactive":
        return <Badge className="bg-amber-500"><Activity className="w-3 h-3 mr-1" /> Reactive</Badge>;
      case "project":
        return <Badge className="bg-purple-500"><BarChart3 className="w-3 h-3 mr-1" /> Project</Badge>;
      default:
        return <Badge variant="secondary">{mode}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "running": return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "stuck": return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const timeSinceLastTick = pipelineStatus?.lastTick 
    ? Math.floor((Date.now() - pipelineStatus.lastTick) / 1000)
    : null;

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            24/7 Autonomous Agent Pipeline Control Center
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={pipelineStatus?.isPaused ? "default" : "outline"}
            size="sm"
            onClick={handlePause}
            disabled={isLoading === "pause"}
          >
            {pipelineStatus?.isPaused ? (
              <><Play className="w-4 h-4 mr-2" /> Resume</>
            ) : (
              <><Pause className="w-4 h-4 mr-2" /> Pause</>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleEmergencyStop}
            disabled={isLoading === "emergency"}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Emergency Stop
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {pipelineStatus?.isPaused && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pipeline is currently paused. No new tasks will be generated or assigned.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getHealthColor(pipelineHealth?.status || "healthy")}`}>
                {pipelineHealth?.status?.toUpperCase() || "LOADING"}
              </span>
            </div>
            <Progress value={pipelineHealth?.score || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Score: {pipelineHealth?.score || 0}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineStatus?.queue?.pending || 0}
              <span className="text-sm font-normal text-muted-foreground ml-1">pending</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {pipelineStatus?.queue?.running || 0} running
              </Badge>
              <Badge variant="destructive" className="text-xs">
                {pipelineStatus?.queue?.failed || 0} failed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {executionReport?.successRate || 0}%
              <span className="text-sm font-normal text-muted-foreground ml-1">success</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {executionReport?.byStatus?.complete || 0} completed, {executionReport?.byStatus?.failed || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Tick</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeSinceLastTick !== null ? (
                timeSinceLastTick < 60 ? `${timeSinceLastTick}s` :
                timeSinceLastTick < 3600 ? `${Math.floor(timeSinceLastTick / 60)}m` :
                `${Math.floor(timeSinceLastTick / 3600)}h`
              ) : "--"}
              <span className="text-sm font-normal text-muted-foreground ml-1">ago</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Mode: {getModeBadge(pipelineStatus?.mode || "proactive")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Operation Mode
          </CardTitle>
          <CardDescription>
            Select how the pipeline operates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={pipelineStatus?.mode === "proactive" ? "default" : "outline"}
              onClick={() => handleModeChange("proactive")}
              disabled={isLoading === "mode"}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Proactive
              <span className="block text-xs opacity-70">Always running</span>
            </Button>
            <Button
              variant={pipelineStatus?.mode === "reactive" ? "default" : "outline"}
              onClick={() => handleModeChange("reactive")}
              disabled={isLoading === "mode"}
              className="flex-1"
            >
              <Activity className="w-4 h-4 mr-2" />
              Reactive
              <span className="block text-xs opacity-70">Event-driven</span>
            </Button>
            <Button
              variant={pipelineStatus?.mode === "project" ? "default" : "outline"}
              onClick={() => handleModeChange("project")}
              disabled={isLoading === "mode"}
              className="flex-1"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Project
              <span className="block text-xs opacity-70">Focused sprint</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Queue</CardTitle>
              <CardDescription>Pending and running tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* This would be populated from a query - showing structure */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon("pending")}
                    <div>
                      <p className="font-medium">Morning Brief Generation</p>
                      <p className="text-sm text-muted-foreground">research-associate • P1 • 45m ago</p>
                    </div>
                  </div>
                  <Badge variant="outline">Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon("running")}
                    <div>
                      <p className="font-medium">Social Content Prep</p>
                      <p className="text-sm text-muted-foreground">cmo • P1 • 12m ago</p>
                    </div>
                  </div>
                  <Badge>Running</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <AgentWorkload />
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>Multi-agent coordinated workflows</CardDescription>
            </CardHeader>
            <CardContent>
              {pipelineStatus?.activeWorkflows && pipelineStatus.activeWorkflows.length > 0 ? (
                <div className="space-y-4">
                  {pipelineStatus.activeWorkflows.map((workflow) => (
                    <div key={workflow.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <Badge>Step {workflow.currentStep + 1} of {workflow.totalSteps}</Badge>
                      </div>
                      <Progress 
                        value={(workflow.currentStep / workflow.totalSteps) * 100} 
                        className="h-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Started {new Date(workflow.startedAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No active workflows
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>24h Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Tasks</span>
                    <span className="font-medium">{executionReport?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-medium text-green-600">
                      {executionReport?.byStatus?.complete || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-medium text-red-600">
                      {executionReport?.byStatus?.failed || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Duration</span>
                    <span className="font-medium">{executionReport?.avgDuration || 0} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Stuck Tasks</span>
                    <Badge variant={pipelineHealth?.issues?.stuck > 0 ? "destructive" : "secondary"}>
                      {pipelineHealth?.issues?.stuck || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Failed Tasks</span>
                    <Badge variant={pipelineHealth?.issues?.failed > 0 ? "destructive" : "secondary"}>
                      {pipelineHealth?.issues?.failed || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Currently Running</span>
                    <Badge variant="secondary">
                      {pipelineHealth?.issues?.running || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
