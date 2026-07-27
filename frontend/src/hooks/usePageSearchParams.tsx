import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

export function usePageSearchParams(
  defaultPage = 1,
  defaultKeyword = "",
  defaultFilters: Record<string, string> = {},
  defaultLimit = 20, // 👈 nouveau paramètre
) {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = searchParams.get("page");
  const keywordParam = searchParams.get("keyword");
  const limitParam = searchParams.get("limit");

  const currentPage = pageParam ? parseInt(pageParam, 10) : defaultPage;
  const keyword = keywordParam || defaultKeyword;
  const currentLimit = limitParam ? parseInt(limitParam, 10) : defaultLimit;

  const selectedFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "page" && key !== "keyword" && key !== "limit") {
        filters[key] = value;
      }
    });
    return { ...defaultFilters, ...filters };
  }, [defaultFilters, searchParams]);

  const setPage = (page: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", page.toString());
      return newParams;
    });
  };

  const setLimit = (limit: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("limit", limit.toString());
      newParams.set("page", "1");
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

  const setFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        console.log(value != "");
        console.log("key : " + key);
        console.log("value : " + value);
        const newParams = new URLSearchParams(prev);
        if (value != "") {
          newParams.set(key, value);
        } else if (value === "") {
          newParams.delete(key);
        }
        newParams.set("page", "1");
        return newParams;
      });
    },
    [setSearchParams],
  );

  const setFilters = useCallback(
    (values: Record<string, string>) => {
      const strValues = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, String(v ?? "")]),
      );

      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(strValues).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            newParams.set(key, value);
          } else {
            newParams.delete(key);
          }
        });
        newParams.set("page", "1");
        return newParams;
      });
    },
    [setSearchParams],
  );

  const reset = (collapseKeys: string[] = []) => {
    setSearchParams(() => {
      const newParams = new URLSearchParams();
      if (defaultPage && defaultPage !== 1) {
        newParams.set("page", defaultPage.toString());
      }
      if (defaultKeyword) {
        newParams.set("keyword", defaultKeyword);
      }
      if (defaultLimit !== 20) {
        newParams.set("limit", defaultLimit.toString());
      }
      for (const key in defaultFilters) {
        if (defaultFilters[key]) {
          newParams.set(key, defaultFilters[key]);
        }
      }
      const current = new URLSearchParams(searchParams);
      collapseKeys.forEach((key) => {
        const value = current.get(key);
        if (value) {
          // If it's comma‑separated, take the first part
          const first = value.split(",")[0].trim();
          if (first) {
            newParams.set(key, first);
          }
        }
      });
      localStorage.removeItem("collapsible_filter_state");

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
    setFilters,
    reset,
    currentLimit,
    setLimit,
  };
}
