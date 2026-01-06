import { Plus } from 'lucide-react';
import { useActionState } from 'react';

import { Button, SubmitButton } from '@/components/ui';
import { ButtonLoading } from '@/components/ui/loading';
import type { Workspace } from '@/features/workspace';
import { postWorkspace } from '@/features/workspace';
import { useToast } from '@/hooks/useToast';

interface WorkspaceCreateFormProps {
  onCreated: (workspace: Workspace) => void;
  onCancel: () => void;
}

interface FormState {
  error: string | null;
}

const initialState: FormState = { error: null };

/**
 * WorkspaceCreateForm - 워크스페이스 생성 폼 (useActionState 사용)
 */
function WorkspaceCreateForm({
  onCreated,
  onCancel,
}: WorkspaceCreateFormProps) {
  const { toast } = useToast();

  async function createWorkspaceAction(
    _prevState: FormState,
    formData: FormData
  ): Promise<FormState> {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!name?.trim()) {
      return { error: '워크스페이스 이름을 입력해주세요.' };
    }

    try {
      const created = await postWorkspace({
        name: name.trim(),
        description: description?.trim() || undefined,
      });

      toast({
        variant: 'success',
        title: '워크스페이스 생성 완료',
        description: `"${created.name}" 워크스페이스가 생성되었습니다.`,
      });

      onCreated(created);
      return { error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : '워크스페이스 생성에 실패했습니다.';

      toast({
        variant: 'destructive',
        title: '워크스페이스 생성 실패',
        description: message,
      });

      return { error: message };
    }
  }

  const [state, formAction, isPending] = useActionState(
    createWorkspaceAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="bg-muted/30 flex flex-col gap-3 rounded-lg border p-4"
    >
      <input
        type="text"
        name="name"
        placeholder="워크스페이스 이름"
        disabled={isPending}
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      <input
        type="text"
        name="description"
        placeholder="설명 (선택)"
        disabled={isPending}
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
      {state.error && <p className="text-destructive text-xs">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          취소
        </Button>
        <SubmitButton
          size="sm"
          isPending={isPending}
        >
          <ButtonLoading
            isLoading={isPending}
            loadingText="생성 중..."
          >
            생성
          </ButtonLoading>
        </SubmitButton>
      </div>
    </form>
  );
}

interface WorkspaceCreateButtonProps {
  onClick: () => void;
}

/**
 * WorkspaceCreateButton - 새로 만들기 버튼
 */
function WorkspaceCreateButton({ onClick }: WorkspaceCreateButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
    >
      <Plus className="mr-1 size-4" />
      새로 만들기
    </Button>
  );
}

export { WorkspaceCreateButton, WorkspaceCreateForm };
