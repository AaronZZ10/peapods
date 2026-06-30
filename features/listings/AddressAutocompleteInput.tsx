"use client";

import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

type AddressSuggestion = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

export function AddressAutocompleteInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setIsOpen(false);
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `/api/address-search?q=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Lookup failed");
        }

        const data = (await response.json()) as {
          results: AddressSuggestion[];
        };

        setResults(data.results);
        setIsOpen(true);
      } catch (lookupError) {
        if ((lookupError as Error).name !== "AbortError") {
          setError("Could not load address suggestions.");
          setResults([]);
          setIsOpen(true);
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (result: AddressSuggestion) => {
    setQuery(result.label);
    setResults([]);
    setIsOpen(false);
    setError("");
  };

  return (
    <div className="relative">
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        Street Address
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </div>
        <input
          type="text"
          name="address"
          value={query}
          autoComplete="off"
          required
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => {
            if (results.length || error) {
              setIsOpen(true);
            }
          }}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => {
              setIsOpen(false);
            }, 200);
          }}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm shadow-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50/50 outline-none"
          placeholder="Enter address near campus..."
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <ScrollArea className="max-h-[240px]">
            <div className="p-1">
              {error && (
                <div className="px-3 py-4 text-center text-sm text-slate-500">
                  {error}
                </div>
              )}
              {results.length === 0 && !isLoading && !error && (
                <div className="px-3 py-4 text-center text-sm text-slate-500">
                  Keep typing to find your address...
                </div>
              )}
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-emerald-50 group"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-emerald-500" />
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900 group-hover:text-emerald-700">
                      {result.label.split(",")[0]}
                    </span>
                    <span className="text-xs text-slate-500 line-clamp-1">
                      {result.label.split(",").slice(1).join(",").trim()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
