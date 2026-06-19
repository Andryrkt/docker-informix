// components/common/GlobalPagination.tsx
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

interface GlobalPaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

function GlobalPagination({
  currentPage,
  lastPage,
  onPageChange,
}: GlobalPaginationProps) {
  const pageNumbers = () => {
    const delta = 2; // number of pages around current
    const range: (number | string)[] = [];

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (
        i === currentPage - delta - 1 ||
        i === currentPage + delta + 1
      ) {
        range.push("...");
      }
    }

    return range;
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {/* Page numbers */}
        {pageNumbers().map((page, idx) => (
          <PaginationItem key={idx}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                className={cn(
                  "px-3 py-2 border text-sm font-medium transition-all duration-200 rounded-none", // base style
                  "hover:bg-gray-100 hover:text-gray-900", // hover effect
                  "focus:outline-none focus:ring-1 focus:ring-global-primary ", // accessibility
                  currentPage === page
                    ? "border-global-primary bg-global-primary text-white" // active page
                    : "border-gray-300 text-gray-700 bg-white", // inactive
                )}
                isActive={currentPage === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Number(page));
                }}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < lastPage) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export default GlobalPagination;
