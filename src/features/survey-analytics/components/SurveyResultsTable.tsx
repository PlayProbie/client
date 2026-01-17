import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { Button } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { GameGenreConfig } from '@/features/game';
import { getSessionStatusClassName, getSessionStatusLabel, type SurveySessionStatus } from '@/features/survey-session';

import type { SurveyResultListItem } from '../types';
import { SurveyResultDetailDialog } from './SurveyResultDetailDialog';
import { TablePagination } from './TablePagination';

type SurveyResultsTableProps = {
  data: SurveyResultListItem[];
};

// 나이대 변환 맵
const AGE_GROUP_LABELS: Record<string, string> = {
  '10s': '10대',
  '20s': '20대',
  '30s': '30대',
  '40s': '40대',
  '50s': '50대 이상',
};

// 장르 value -> label 변환 함수
const getGenreLabel = (genre: string): string => {
  const config = Object.values(GameGenreConfig).find((g) => g.value === genre);
  return config?.label ?? genre;
};

// 선호장르 문자열을 한글로 변환 (콤마 구분 문자열 지원)
const formatPreferGenre = (value: string): string => {
  return value
    .split(/,\s*/)
    .map((genre) => getGenreLabel(genre.trim()))
    .join(', ');
};

// 컬럼별 너비 설정
const COLUMN_WIDTHS = {
  testerId: 'w-[120px]',
  surveyName: 'w-[180px]',
  status: 'w-[80px]',
  endedAt: 'w-[160px]',
  gender: 'w-[80px]',
  preferGenre: 'w-[140px]',
  ageGroup: 'w-[80px]',
  actions: 'w-[60px]',
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

  const handleOpenDetail = useCallback((item: SurveyResultListItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }, []);

  const columns: ColumnDef<SurveyResultListItem>[] = useMemo(
    () => [
      {
        accessorKey: 'surveyName',
        header: '설문명',
        size: 180,
      },
      {
        accessorKey: 'testerId',
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
        accessorKey: 'gender',
        header: '성별',
        size: 80,
        cell: (info) => {
          const value = info.getValue<string | null>();
          if (!value) return '-';
          if (value === 'M' || value === 'MALE') return '남성';
          if (value === 'F' || value === 'FEMALE') return '여성';
          return value;
        },
      },
      {
        accessorKey: 'preferGenre',
        header: '선호장르',
        size: 140,
        cell: (info) => {
          const value = info.getValue<string | null>();
          if (!value) return '-';
          return <span className="line-clamp-1">{formatPreferGenre(value)}</span>;
        },
      },
      {
        accessorKey: 'ageGroup',
        header: '나이',
        size: 80,
        cell: (info) => {
          const value = info.getValue<string | null>();
          if (!value) return '-';
          return AGE_GROUP_LABELS[value] ?? value;
        },
      },
      {
        accessorKey: 'endedAt',
        header: '설문 일시',
        size: 160,
        cell: (info) => {
          const value = info.getValue<string>();
          if (!value) return '-';
          return new Date(value).toLocaleString('ko-KR');
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: (info) => {
          const row = info.row.original;
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenDetail(row)}
            >
              <Eye className="size-4" />
              <span className="sr-only">상세보기</span>
            </Button>
          );
        },
      },
    ],
    [handleOpenDetail]
  );

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table은 이 경고가 알려진 이슈이며 정상 동작함
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
          surveyUuid={selectedItem.surveyUuid}
          sessionUuid={selectedItem.sessionUuid}
        />
      )}
    </div>
  );
}

export { SurveyResultsTable };
