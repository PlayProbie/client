import { UserMinus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatDate } from '@/lib/utils';

import type { Member } from '../types';

interface MemberListProps {
  members: Member[] | undefined;
  isLoading: boolean;
  onRemove: (member: Member) => void;
  isRemoving: boolean;
  isError: boolean;
}

export function MemberList({
  members,
  isLoading,
  onRemove,
  isRemoving,
  isError,
}: MemberListProps) {
  // 현재 로그인한 사용자의 UUID (본인 삭제 방지용)
  // useAuthStore 등에서 가져온다고 가정
  // const myUserUuid = ...;
  // TODO: 실제 Auth Store 연동 필요. 여기서는 임시로직 사용하거나 추후 연결.

  if (isError) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive mb-1 font-medium">
          멤버 목록을 불러오지 못했습니다.
        </p>
        <p className="text-muted-foreground text-sm">
          잠시 후 다시 시도해주세요.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        멤버가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>권한</TableHead>
            <TableHead>가입일</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.memberId}>
              <TableCell className="font-medium">{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    member.role === 'OWNER'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {member.role}
                </span>
              </TableCell>
              <TableCell>{formatDate(member.joinedAt)}</TableCell>
              <TableCell>
                {member.role !== 'OWNER' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(member)}
                    disabled={isRemoving}
                    title="내보내기"
                  >
                    <UserMinus className="size-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
