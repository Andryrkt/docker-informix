// components/common/SimpleNextPreviousPagination.tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface SimplePaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

function SimpleNextPreviousPagination({
  currentPage,
  lastPage,
  onPageChange,
}: SimplePaginationProps) {
  const goToFirst = () => {
    if (currentPage !== 1) onPageChange(1);
  };

  const goToLast = () => {
    if (currentPage !== lastPage) onPageChange(lastPage);
  };

  const goPrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const goNext = () => {
    if (currentPage < lastPage) onPageChange(currentPage + 1);
  };

  return (
    <Pagination>
      <PaginationContent className="gap-1">
        {/* First */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goToFirst();
            }}
            className={cn(
              "px-3 py-2 border text-sm",
              currentPage === 1
                ? "opacity-50 pointer-events-none"
                : "hover:bg-gray-100",
            )}
          >
            <ChevronsLeft></ChevronsLeft>
          </PaginationLink>
        </PaginationItem>

        {/* Previous */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goPrevious();
            }}
            className={cn(
              currentPage === 1 && "opacity-50 pointer-events-none",
            )}
          >
            <ChevronLeft></ChevronLeft>
          </PaginationLink>
        </PaginationItem>

        {/* Page indicator (optional but useful) */}
        <PaginationItem>
          <span className="px-3 py-2 text-xs text-gray-600">
            Page {currentPage} / {lastPage}
          </span>
        </PaginationItem>

        {/* Next */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goNext();
            }}
            className={cn(
              currentPage === lastPage && "opacity-50 pointer-events-none",
            )}
          >
            <ChevronRight></ChevronRight>
          </PaginationLink>
        </PaginationItem>

        {/* Last */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              goToLast();
            }}
            className={cn(
              "px-3 py-2 border text-sm",
              currentPage === lastPage
                ? "opacity-50 pointer-events-none"
                : "hover:bg-gray-100",
            )}
          >
            <ChevronsRight></ChevronsRight>
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default SimpleNextPreviousPagination;
