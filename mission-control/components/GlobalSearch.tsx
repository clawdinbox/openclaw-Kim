"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Search, 
  FileText, 
  Clock, 
  Calendar,
  Folder,
  Zap,
  X,
  CornerDownLeft,
  History
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDebounce } from "@/hooks/useDebounce";
import type { Doc } from "@/convex/_generated/dataModel";

type SearchResultType = Doc<"searchIndex">["type"];

const typeIcons: Record<SearchResultType, React.ElementType> = {
  memory: Clock,
  document: FileText,
  activity: Zap,
  task: Calendar,
  file: Folder,
};

const typeLabels: Record<SearchResultType, string> = {
  memory: "Memory",
  document: "Document",
  activity: "Activity",
  task: "Task",
  file: "File",
};

const typeColors: Record<SearchResultType, string> = {
  memory: "bg-purple-500/10 text-purple-500",
  document: "bg-blue-500/10 text-blue-500",
  activity: "bg-green-500/10 text-green-500",
  task: "bg-amber-500/10 text-amber-500",
  file: "bg-zinc-500/10 text-zinc-500",
};

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<SearchResultType | null>(null);
  const [selectedResult, setSelectedResult] = useState<Doc<"searchIndex"> | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  const results = useQuery(
    api.search.search,
    debouncedQuery.length >= 2 
      ? { query: debouncedQuery, type: selectedType ?? undefined, limit: 20 }
      : "skip"
  );
  
  const recentSearches = useQuery(api.search.getRecentSearches, { limit: 5 });
  const searchStats = useQuery(api.search.getSearchStats);

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const groupedResults = results?.reduce<
    Record<SearchResultType, Doc<"searchIndex">[]>
  >(
    (acc: Record<SearchResultType, Doc<"searchIndex">[]>, result: Doc<"searchIndex">) => {
      if (!acc[result.type]) acc[result.type] = [];
      acc[result.type].push(result);
      return acc;
    },
    { memory: [], document: [], activity: [], task: [], file: [] }
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 border-b border-zinc-800 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <Input
            id="search-input"
            placeholder="Search across all data... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-11 pr-10 py-6 text-lg bg-zinc-900 border-zinc-700 focus:border-cyan-500"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-800"
            >
              <X className="w-4 h-4 text-zinc-500" />
            </button>
          )}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-800 text-zinc-500 text-xs">
              <CornerDownLeft className="w-3 h-3" />
            </kbd>
          </div>
        </div>

        {/* Type Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedType(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedType === null
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            All ({searchStats?.totalIndexed ?? 0})
          </button>
          {(Object.keys(typeLabels) as SearchResultType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? null : type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedType === type
                  ? `${typeColors[type]} border border-current`
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {typeLabels[type]} ({searchStats?.byType[type] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 flex overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="p-4">
            {!debouncedQuery && recentSearches && recentSearches.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <History className="w-3 h-3" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search) => (
                    <button
                      key={search._id}
                      onClick={() => setQuery(search.query)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
                    >
                      {search.query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!debouncedQuery && (
              <div className="text-center py-12 text-zinc-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Start typing to search</p>
                <p className="text-sm mt-1">
                  Search across memory files, documents, activities, and more
                </p>
              </div>
            )}

            {debouncedQuery.length < 2 && debouncedQuery.length > 0 && (
              <div className="text-center py-12 text-zinc-500">
                <p>Type at least 2 characters to search</p>
              </div>
            )}

            {debouncedQuery.length >= 2 && results?.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <p>No results found for &ldquo;{debouncedQuery}&rdquo;</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}

            {groupedResults && Object.entries(groupedResults).map(([type, items]) => {
              const typedItems = items as Doc<"searchIndex">[];
              return (
                <div key={type} className="mb-6">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                    {typeLabels[type as SearchResultType]} ({typedItems.length})
                  </h3>
                  <div className="space-y-2">
                    {typedItems.map((item) => (
                      <SearchResultCard
                        key={item._id}
                        result={item}
                        query={debouncedQuery}
                        selected={selectedResult?._id === item._id}
                        onClick={() => setSelectedResult(item)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Preview Panel */}
        {selectedResult && (
          <div className="w-96 border-l border-zinc-800 bg-zinc-900/50 p-4 overflow-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className={`p-2 rounded-lg ${typeColors[selectedResult.type]}`}>
                {(() => {
                  const Icon = typeIcons[selectedResult.type];
                  return <Icon className="w-4 h-4" />;
                })()}
              </div>
              <div className="flex-1 min-w-0">
                <Badge className={`${typeColors[selectedResult.type]} mb-2`}>
                  {typeLabels[selectedResult.type]}
                </Badge>
                <h3 className="font-medium text-zinc-100">{selectedResult.title}</h3>
                {selectedResult.path && (
                  <p className="text-xs text-zinc-500 mt-1 truncate">{selectedResult.path}</p>
                )}
              </div>
            </div>

            <Separator className="my-4 bg-zinc-800" />

            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed">
                {selectedResult.content}
              </pre>
            </div>

            {selectedResult.tags.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-zinc-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {selectedResult.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-zinc-800">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-zinc-500">
              {format(new Date(selectedResult.date), "MMM d, yyyy")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultCard({
  result,
  query,
  selected,
  onClick,
}: {
  result: Doc<"searchIndex">;
  query: string;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = typeIcons[result.type];

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-cyan-500/30 text-cyan-200 rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        selected
          ? "bg-cyan-500/10 border-cyan-500/30"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-1.5 rounded ${typeColors[result.type]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-zinc-200 text-sm truncate">
            {highlightMatch(result.title, query)}
          </h4>
          <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
            {highlightMatch(result.content.slice(0, 200), query)}...
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-zinc-600">
              {formatDistanceToNow(result.date, { addSuffix: true })}
            </span>
            {result.path && (
              <>
                <span className="text-zinc-700">•</span>
                <span className="text-xs text-zinc-600 truncate max-w-[200px]">
                  {result.path}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
