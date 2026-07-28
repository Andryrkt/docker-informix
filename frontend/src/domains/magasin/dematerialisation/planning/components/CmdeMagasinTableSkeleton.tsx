import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CmdeMagasinModalSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-64" />

        {/* Description */}
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-px" />
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-px" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>

      {/* Status buttons */}
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-6 w-14" />
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-6 w-36" />
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-150">
        <Table>
          <TableBody>
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <TableRow key={rowIndex} className="h-10">
                {Array.from({ length: 10 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
