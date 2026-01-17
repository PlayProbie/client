import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/Pagination';

type TablePaginationProps = {
  pageCount: number;
  currentPage: number;
  onPageChange: (pageIndex: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

/**
 * 테이블 페이지네이션 컴포넌트
 */
function TablePagination({
  pageCount,
  currentPage,
  onPageChange,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}: TablePaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={onPreviousPage}
            disabled={!canPreviousPage}
          />
        </PaginationItem>
        {Array.from({ length: pageCount }, (_, i) => (
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => onPageChange(i)}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={onNextPage}
            disabled={!canNextPage}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { TablePagination };
export type { TablePaginationProps };
