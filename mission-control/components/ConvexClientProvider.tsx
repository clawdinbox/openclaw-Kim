"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  
  // If no URL is set, show a setup message instead of crashing
  if (!convexUrl || convexUrl.includes("your-deployment")) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Mission Control Setup</h1>
          <p className="text-zinc-400 mb-6">
            Convex URL not configured. Please set up your Convex deployment:
          </p>
          <ol className="text-left text-sm text-zinc-400 space-y-2 mb-6">
            <li>1. Run: <code className="bg-zinc-800 px-2 py-1 rounded">npx convex dev</code></li>
            <li>2. Copy your Convex deployment URL</li>
            <li>3. Update <code className="bg-zinc-800 px-2 py-1 rounded">.env.local</code> with the URL</li>
            <li>4. Restart the dev server</li>
          </ol>
        </div>
      </div>
    );
  }
  
  const convex = useMemo(() => new ConvexReactClient(convexUrl), [convexUrl]);
  
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
