import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  rows?: number;
};

export function DevisTableSkeleton({ rows = 25 }: Props) {
  return (
    <div className="w-full py-4 overflow-clip ">
      <Table className="">
        <TableHeader>
          <TableRow>
            {Array.from({ length: 17 }).map((_, i) => (
              <TableCell key={i}>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {Array.from({ length: rows }).map((_, row) => (
            <TableRow key={row}>
              <TableCell>
                <Skeleton className="h-4 w-4 rounded-md" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-24 rounded-md" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-24 rounded-full" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-48" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-40" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-24 ml-auto" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-20 mx-auto" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full mx-auto" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full mx-auto" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-6 w-16 rounded-full mx-auto" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>

              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
