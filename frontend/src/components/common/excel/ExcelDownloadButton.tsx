import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

type Props = {
  data: any[]; // 👈 important (au lieu de url)
  filename?: string;
  label?: string;
};

export function ExcelDownloadButton({
  data,
  filename = "export.xlsx",
  label = "Export Excel",
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);

      // 1. transform data
      const worksheet = XLSX.utils.json_to_sheet(data);

      // 2. create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Devis");

      // 3. export
      XLSX.writeFile(workbook, filename);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="mx-auto flex items-center gap-2 bg-green-600 text-white hover:bg-green-700 mt-4"
    >
      <FileSpreadsheet className="h-4 w-4" />
      {loading ? "Exporting..." : label}
    </Button>
  );
}
