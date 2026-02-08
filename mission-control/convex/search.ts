import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";

// ==================== SEARCH QUERIES ====================

export const search = query({
  args: {
    query: v.string(),
    type: v.optional(v.union(
      v.literal("memory"),
      v.literal("document"),
      v.literal("activity"),
      v.literal("task"),
      v.literal("file")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    const searchQuery = ctx.db
      .query("searchIndex")
      .withSearchIndex("search_content", (q) => 
        q.search("content", args.query)
      );
    
    const filteredQuery = args.type 
      ? searchQuery.filter((q) => q.eq(q.field("type"), args.type))
      : searchQuery;
    
    const results = await filteredQuery.take(limit);
    
    return results;
  },
});

export const getRecentSearches = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    return await ctx.db
      .query("recentSearches")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getSearchStats = query({
  args: {},
  handler: async (ctx) => {
    const allIndex = await ctx.db.query("searchIndex").collect();
    
    return {
      totalIndexed: allIndex.length,
      byType: {
        memory: allIndex.filter(i => i.type === "memory").length,
        document: allIndex.filter(i => i.type === "document").length,
        activity: allIndex.filter(i => i.type === "activity").length,
        task: allIndex.filter(i => i.type === "task").length,
        file: allIndex.filter(i => i.type === "file").length,
      },
    };
  },
});

// ==================== SEARCH MUTATIONS ====================

export const indexDocument = mutation({
  args: {
    type: v.union(
      v.literal("memory"),
      v.literal("document"),
      v.literal("activity"),
      v.literal("task"),
      v.literal("file")
    ),
    title: v.string(),
    content: v.string(),
    path: v.optional(v.string()),
    date: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("searchIndex", {
      ...args,
      tags: args.tags ?? [],
    });
  },
});

export const removeFromIndex = mutation({
  args: {
    path: v.string(),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("searchIndex")
      .filter((q) => q.eq(q.field("path"), args.path))
      .collect();
    
    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    
    return items.length;
  },
});

export const clearRecentSearches = mutation({
  args: {},
  handler: async (ctx) => {
    const searches = await ctx.db.query("recentSearches").collect();
    
    for (const search of searches) {
      await ctx.db.delete(search._id);
    }
    
    return searches.length;
  },
});
