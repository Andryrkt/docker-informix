import { useMemo } from "react";
import { useSearchParams } from "react-router";

export function usePageSearchParams(
  defaultPage = 1,
  defaultKeyword = "",
  defaultFilters: Record<string, string> = {},
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = searchParams.get("page");
  const keywordParam = searchParams.get("keyword");

  const currentPage = pageParam ? parseInt(pageParam, 10) : defaultPage;
  const keyword = keywordParam || defaultKeyword;

  const selectedFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    for (const key in defaultFilters) {
      filters[key] = searchParams.get(key) || defaultFilters[key];
    }
    return filters;
  }, [defaultFilters, searchParams]);

  const setPage = (page: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page.toString());
      return newParams;
    });
  };

  const setKeyword = (kw: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (kw) {
        newParams.set("keyword", kw);
        newParams.set("page", "1");
      } else {
        newParams.delete("keyword");
      }
      return newParams;
    });
  };

  const setFilter = (key: string, value: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (value && value !== "all") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      newParams.set("page", "1");
      return newParams;
    });
  };
  const reset = () => {
    setSearchParams(() => {
      const newParams = new URLSearchParams();
      if (defaultPage && defaultPage !== 1) {
        newParams.set("page", defaultPage.toString());
      }
      // Only set default keyword if not empty
      if (defaultKeyword) {
        newParams.set("keyword", defaultKeyword);
      }
      // For filters, only set if different from 'all' (optional)
      for (const key in defaultFilters) {
        if (defaultFilters[key]) {
          newParams.set(key, defaultFilters[key]);
        }
      }
      return newParams;
    });
  };

  return {
    currentPage,
    setPage,
    keyword,
    setKeyword,
    selectedFilters,
    setFilter,
    reset,
  };
}
