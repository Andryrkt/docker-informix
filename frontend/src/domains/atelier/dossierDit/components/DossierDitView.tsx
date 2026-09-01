import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DossierDit } from "../schema/dossierDitSchema";
import { formatFileSize } from "@/lib/utils";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import { useState } from "react";
import { urlToFile } from "@/helper/urlToFile";
import { DocTypeBadge } from "@/components/common/DocTypeBadge";

type Props = {
  dossierDit: DossierDit[];
};

function DossierDitView({ dossierDit }: Props) {
  const [selected, setSelected] = useState<DossierDit | null>(null);
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  const handleSelect = async (d: DossierDit) => {
    setSelected(d);
    setActiveFile(null); // Clear previous file viewer layout instantly

    if (d.pieceJointe?.url) {
      setIsLoadingFile(true);
      try {
        const fileObject = await urlToFile(d.pieceJointe.url, {
          fallbackName: d.nomDocument,
          fallbackType: d.pieceJointe.type,
        });

        setActiveFile(fileObject);
      } catch (err) {
        console.error("Failed to convert URL to File:", err);
      } finally {
        setIsLoadingFile(false);
      }
    }
  };
  return (
    <div className=" mx-auto ">
      <div className="flex flex-col space-y-2   mx-auto">
        <h1 className="text-2xl font-bold  tracking-tight py-2">Dossier :</h1>
      </div>

      <div className="space-y-6  border-t-0 mx-auto gap-x-5 grid lg:grid-cols-2 ">
        <div className="w-full lg:max-h-150 overflow-auto border">
          <Table>
            <TableHeader className=" bg-brand-dark  [&_th]:text-white sticky top-0">
              <TableRow className="hover:bg-brand-dark border-b-0  ">
                <TableHead className="  px-4 text-center  ">Type</TableHead>
                <TableHead>Nom Document</TableHead>
                <TableHead className=" wrap-break-word whitespace-normal max-w-20">
                  N° de document
                </TableHead>
                <TableHead className=" wrap-break-word whitespace-normal max-w-10">
                  Date création
                </TableHead>
                <TableHead className=" wrap-break-word whitespace-normal max-w-20">
                  Date mise à jour
                </TableHead>
                <TableHead>N° Version</TableHead>
                <TableHead>Nb de pages</TableHead>
                <TableHead>Taille</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {dossierDit.map((d, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleSelect(d)}
                  className="cursor-pointer text-xs font-mono text-gray-600 hover:bg-muted/40 transition"
                >
                  <TableCell className="py-4 px-4">
                    <DocTypeBadge type={d.type} />
                  </TableCell>

                  <TableCell className="py-4 px-4 font-medium text-foreground wrap-break-word whitespace-normal max-w-20">
                    {d.nomDocument}
                  </TableCell>

                  <TableCell className="py-4 px-4">
                    {d.numeroDocument}
                  </TableCell>

                  <TableCell className="py-4 px-4">{d.dateCreation}</TableCell>

                  <TableCell className="py-4 px-4">{d.dateMiseAJour}</TableCell>

                  <TableCell className="py-4 px-4 text-center">
                    {d.numeroVersion}
                  </TableCell>

                  <TableCell className="py-4 px-4 text-center">
                    {d.nombrePages}
                  </TableCell>

                  <TableCell className="py-4 px-4 font-medium">
                    {formatFileSize(d.pieceJointe.taille)}
                  </TableCell>
                </TableRow>
              ))}

              {/* EMPTY STATE */}
              {dossierDit.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-10 text-gray-500"
                  >
                    Aucun dossier DIT trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div>
          <DocumentViewer files={activeFile ? [activeFile] : []} />
        </div>
      </div>
    </div>
  );
}

export default DossierDitView;
