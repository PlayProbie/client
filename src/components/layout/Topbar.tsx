import {
  BreadcrumbNav,
  GameSelector,
  NotificationButton,
  useDynamicBreadcrumbs,
} from './topbar-components';

function Topbar() {
  const { breadcrumbs, isLoading } = useDynamicBreadcrumbs();

  return (
    <header
      id="app-topbar"
      className="border-border bg-background/80 sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-8 py-4 backdrop-blur-md"
    >
      <div className="min-w-0 flex-1">
        <BreadcrumbNav
          breadcrumbs={breadcrumbs}
          isLoading={isLoading}
        />
      </div>

      <div className="flex shrink-0 items-center gap-6">
        <GameSelector />
        <NotificationButton />
      </div>
    </header>
  );
}

export default Topbar;
