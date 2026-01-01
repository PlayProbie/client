import { Bell } from 'lucide-react';

function NotificationButton() {
  return (
    <button
      className="text-muted-foreground hover:text-primary relative transition-colors"
      aria-label="알림"
    >
      <Bell className="size-5 stroke-2" />
      <span
        className="bg-destructive ring-background absolute top-0 right-0 size-2 rounded-full ring-2"
        aria-label="읽지 않은 알림 있음"
      />
    </button>
  );
}

export default NotificationButton;
