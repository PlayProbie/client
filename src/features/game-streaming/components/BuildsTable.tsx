/**
 * BuildsTable - 빌드 목록 테이블
 */
import { Copy, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { useToast } from '@/hooks/useToast';

import type { Build } from '../types';
import { formatBytes, formatDateTime } from '../utils';
import { BuildStatusBadge } from './BuildStatusBadge';

interface BuildsTableProps {
  builds: Build[];
  onViewDetails?: (build: Build) => void;
}

export function BuildsTable({ builds, onViewDetails }: BuildsTableProps) {
  const { toast } = useToast();

  const handleCopyS3Key = async (s3Key: string) => {
    await navigator.clipboard.writeText(s3Key);
    toast({
      variant: 'success',
      title: '복사 완료',
      description: 'S3 Key가 클립보드에 복사되었습니다.',
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Filename</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {builds.map((build) => (
          <TableRow key={build.buildId}>
            <TableCell className="font-medium">
              <div>
                <span>{build.filename}</span>
                {build.version && (
                  <span className="text-muted-foreground ml-2 text-xs">
                    v{build.version}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <BuildStatusBadge status={build.status} />
            </TableCell>
            <TableCell>{formatBytes(build.size)}</TableCell>
            <TableCell>{formatDateTime(build.createdAt)}</TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleCopyS3Key(build.s3Key)}
                  title="Copy S3 Key"
                >
                  <Copy className="size-4" />
                </Button>
                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onViewDetails(build)}
                    title="View Details"
                  >
                    <Eye className="size-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
