'use client';

interface ResearchPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ResearchPagination({ currentPage, totalPages, onPageChange }: ResearchPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex justify-center items-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
        aria-label="First page"
      >
        First
      </button>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
        aria-label="Previous page"
      >
        Prev
      </button>
      <span className="px-4 py-1.5 text-sm font-medium">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
        aria-label="Next page"
      >
        Next
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 text-sm border rounded disabled:opacity-50 hover:bg-gray-50"
        aria-label="Last page"
      >
        Last
      </button>
    </nav>
  );
}
