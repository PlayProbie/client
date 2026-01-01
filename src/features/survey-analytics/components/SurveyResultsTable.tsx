import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  getSessionStatusClassName,
  getSessionStatusLabel,
  type SurveySessionStatus,
} from '@/features/survey-session';

import type { SurveyResultListItem } from '../types';
import { SurveyResultDetailDialog } from './SurveyResultDetailDialog';
import { TablePagination } from './TablePagination';

type SurveyResultsTableProps = {
  data: SurveyResultListItem[];
};

// 컬럼별 너비 설정
const COLUMN_WIDTHS = {
  tester_id: 'w-[120px]',
  survey_name: 'w-[180px]',
  status: 'w-[80px]',
  ended_at: 'w-[160px]',
  first_question: 'w-auto',
} as const;

/**
 * 설문 응답 리스트 테이블 컴포넌트
 * - @tanstack/react-table 사용
 * - 페이지네이션 포함
 * - 상세보기 다이얼로그 연동
 */
function SurveyResultsTable({ data }: SurveyResultsTableProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SurveyResultListItem | null>(
    null
  );

  const handleOpenDetail = (item: SurveyResultListItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const columns: ColumnDef<SurveyResultListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'survey_name',
        header: '설문명',
        size: 180,
      },
      {
        accessorKey: 'tester_id',
        header: '테스터 ID',
        size: 140,
        cell: (info) => (
          <span className="font-medium">{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: '상태',
        size: 80,
        cell: (info) => {
          const status = info.getValue<SurveySessionStatus>();
          return (
            <span className={getSessionStatusClassName(status)}>
              {getSessionStatusLabel(status)}
            </span>
          );
        },
      },
      {
        accessorKey: 'ended_at',
        header: '설문 일시',
        size: 160,
        cell: (info) => {
          const value = info.getValue<string>();
          if (!value) return '-';
          return new Date(value).toLocaleString('ko-KR');
        },
      },
      {
        accessorKey: 'first_question',
        header: '첫 질문',
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground line-clamp-1 flex-1">
                {info.getValue<string>()}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDetail(row)}
                className="shrink-0"
              >
                <Eye className="size-4" />
                <span className="sr-only">상세보기</span>
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`text-center ${COLUMN_WIDTHS[header.column.id as keyof typeof COLUMN_WIDTHS] ?? ''}`}
                    style={{
                      width:
                        header.column.columnDef.size !== 150
                          ? header.column.columnDef.size
                          : undefined,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        COLUMN_WIDTHS[
                          cell.column.id as keyof typeof COLUMN_WIDTHS
                        ] ?? ''
                      }
                      style={{
                        width:
                          cell.column.columnDef.size !== 150
                            ? cell.column.columnDef.size
                            : undefined,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  응답 데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        pageCount={table.getPageCount()}
        currentPage={table.getState().pagination.pageIndex}
        onPageChange={(pageIndex) => table.setPageIndex(pageIndex)}
        canPreviousPage={table.getCanPreviousPage()}
        canNextPage={table.getCanNextPage()}
        onPreviousPage={() => table.previousPage()}
        onNextPage={() => table.nextPage()}
      />

      {/* 상세보기 다이얼로그 */}
      {selectedItem && (
        <SurveyResultDetailDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          surveyId={selectedItem.survey_id}
          sessionId={selectedItem.session_id}
        />
      )}
    </div>
  );
}

export { SurveyResultsTable };
