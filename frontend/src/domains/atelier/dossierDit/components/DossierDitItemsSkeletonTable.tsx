import { Skeleton } from "@/components/ui/skeleton";
import {
  TableBody,
  TableCell,
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function DossierDitItemsSkeletonTable() {
  return (
    <Table>
      <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0">
        <TableRow className="hover:bg-brand-dark border-b-0">
          <TableHead className="text-center">Date Demande</TableHead>
          <TableHead>N° DIT</TableHead>
          <TableHead>ID mat</TableHead>
          <TableHead>N° Parc</TableHead>
          <TableHead>N° Série</TableHead>
          <TableHead>Designation</TableHead>
          <TableHead>N° OR</TableHead>
          <TableHead>Nbr de docs</TableHead>
          <TableHead>Int / Ext</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 6 }).map((_, index) => (
          <TableRow key={index}>
            <TableCell className="text-center py-4 px-4">
              <Skeleton className="h-4  mx-auto" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 " />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-24" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-36" />
            </TableCell>

            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>

            <TableCell className="text-center">
              <Skeleton className="h-4 w-10 mx-auto" />
            </TableCell>

            <TableCell className="text-center">
              <Skeleton className="h-4 w-16 mx-auto" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DossierDitItemsSkeletonTable;
