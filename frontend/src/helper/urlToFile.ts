// In-memory cache map storing the active or resolved file promises
const urlFileCache = new Map<string, Promise<File>>();

interface UrlToFileOptions {
  fallbackName?: string;
  fallbackType?: string;
  forceRefresh?: boolean;
}

/**
 * Fetches a URL and transforms it into a standard File object with internal caching.
 */
export async function urlToFile(
  url: string,
  options: UrlToFileOptions = {},
): Promise<File> {
  const { fallbackName, fallbackType, forceRefresh = false } = options;

  // 1. Return cached promise if available and refresh isn't forced
  if (urlFileCache.has(url) && !forceRefresh) {
    return urlFileCache.get(url)!;
  }

  // 2. Create the execution promise
  const filePromise = (async () => {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Attempt to extract filename from URL or fall back
      const urlFilename = url.split("/").pop()?.split("?")[0];
      const filename = fallbackName || urlFilename || "downloaded-file";
      const fileType = blob.type || fallbackType || "application/octet-stream";

      return new File([blob], filename, { type: fileType });
    } catch (error) {
      // If the fetch fails, evict from cache so a subsequent retry can try again
      urlFileCache.delete(url);
      throw error;
    }
  })();

  // 3. Save promise to cache
  urlFileCache.set(url, filePromise);

  return filePromise;
}

/**
 * Optional: Clear the entire cache if needed (e.g., on logout or unmount)
 */
export function clearFileCache(): void {
  urlFileCache.clear();
}
