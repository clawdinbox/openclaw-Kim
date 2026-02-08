/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as agents from "../agents.js";
import type * as pipeline_delivery from "../pipeline/delivery.js";
import type * as pipeline_generator from "../pipeline/generator.js";
import type * as pipeline_index from "../pipeline/index.js";
import type * as pipeline_monitor from "../pipeline/monitor.js";
import type * as pipeline_prioritizer from "../pipeline/prioritizer.js";
import type * as pipeline_router from "../pipeline/router.js";
import type * as pipeline_worker from "../pipeline/worker.js";
import type * as projectTasks from "../projectTasks.js";
import type * as projectTemplates from "../projectTemplates.js";
import type * as projectUpdates from "../projectUpdates.js";
import type * as projects from "../projects.js";
import type * as search from "../search.js";
import type * as sync from "../sync.js";
import type * as tasks from "../tasks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  agents: typeof agents;
  "pipeline/delivery": typeof pipeline_delivery;
  "pipeline/generator": typeof pipeline_generator;
  "pipeline/index": typeof pipeline_index;
  "pipeline/monitor": typeof pipeline_monitor;
  "pipeline/prioritizer": typeof pipeline_prioritizer;
  "pipeline/router": typeof pipeline_router;
  "pipeline/worker": typeof pipeline_worker;
  projectTasks: typeof projectTasks;
  projectTemplates: typeof projectTemplates;
  projectUpdates: typeof projectUpdates;
  projects: typeof projects;
  search: typeof search;
  sync: typeof sync;
  tasks: typeof tasks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
