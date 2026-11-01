import type { MouseEvent } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface PagePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  hasNextPage?: boolean;
  'aria-label'?: string;
}

export function PagePagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  hasNextPage,
  'aria-label': label = 'Page navigation',
}: PagePaginationProps) {
  const last = Math.max(1, totalPages);
  const visible = [...new Set([1, page - 1, page, page + 1, last])]
    .filter((value) => value >= 1 && value <= last)
    .sort((a, b) => a - b);
  function link(target: number, blocked = false) {
    const inactive = disabled || blocked;
    return {
      href: inactive ? undefined : '#',
      'aria-disabled': inactive || undefined,
      tabIndex: inactive ? -1 : undefined,
      className: inactive ? 'pointer-events-none opacity-50' : undefined,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        if (!inactive) onPageChange(target);
      },
    };
  }
  return (
    <Pagination aria-label={label} className="mx-0 w-auto max-w-full">
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          <PaginationPrevious {...link(page - 1, page <= 1)} />
        </PaginationItem>
        {visible.map((value, index) => (
          <PaginationItem key={value} className="flex items-center gap-0.5">
            {index > 0 && value - visible[index - 1] > 1 && (
              <PaginationEllipsis />
            )}
            <PaginationLink
              {...link(value)}
              isActive={value === page}
              aria-label={`Go to page ${value}`}
            >
              {value}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext {...link(page + 1, !(hasNextPage ?? page < last))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
