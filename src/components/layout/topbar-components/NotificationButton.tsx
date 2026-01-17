import { Bell } from 'lucide-react';

import { Button } from '@/components/ui';

function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      aria-label="알림"
    >
      <Bell className="size-5 stroke-2" />
      <span
        className="bg-destructive ring-background absolute top-1 right-1 size-2 rounded-full ring-2"
        aria-label="읽지 않은 알림 있음"
      />
    </Button>
  );
}

export default NotificationButton;
