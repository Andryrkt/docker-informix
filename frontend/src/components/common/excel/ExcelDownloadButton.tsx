import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

type Props = {
  data?: any[];
  fetchAllData?: () => Promise<any[]>;
  filename?: string;
  label?: string;
  disabled?: boolean;
};

export function ExcelDownloadButton({
  data,
  fetchAllData,
  filename = "export.xlsx",
  label = "Export Excel",
  disabled = false,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0–100

  const handleDownload = async () => {
    setLoading(true);
    setProgress(0);

    try {
      let exportData = data;

      // ---- Stage 1: Fetch all data (if needed) ----
      if (fetchAllData) {
        // Simulate progress during fetch (smooth increments)
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 5, 45));
        }, 200);

        exportData = await fetchAllData();
        clearInterval(progressInterval);
        setProgress(50);
      } else {
        setProgress(50);
      }

      // Check if we have data
      if (!exportData || exportData.length === 0) {
        // Optionally show a toast: "No data to export"
        return;
      }

      // ---- Stage 2: Generate Excel (blocks the main thread briefly) ----
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, filename);

      // Complete
      setProgress(100);

      // Brief pause so the user sees 100% before resetting
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Export failed", error);
      // Optionally show an error toast
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };
  const isDisabled = loading || disabled;
  return (
    <Button
      onClick={handleDownload}
      disabled={isDisabled}
      className="relative flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 cursor-pointer overflow-hidden"
    >
      {/* Progress bar background */}
      {loading && (
        <div
          className="absolute left-0 top-0 h-full bg-green-400/20 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      )}

      {/* Icon & text – keep on top of the progress bar */}
      <span className="relative z-10 flex items-center gap-2">
        <FileSpreadsheet className="h-4 w-4" />
        {loading ? (
          <span>
            {progress < 50
              ? "Chargement des données..."
              : progress < 100
                ? "Génération du fichier..."
                : "Terminé !"}
          </span>
        ) : (
          label
        )}
      </span>
    </Button>
  );
}
