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
      className="border-border bg-background/80 sticky top-0 z-10 flex items-center justify-between border-b px-8 py-4 backdrop-blur-md"
    >
      <BreadcrumbNav
        breadcrumbs={breadcrumbs}
        isLoading={isLoading}
      />

      <div className="flex items-center gap-6">
        <GameSelector />
        <NotificationButton />
      </div>
    </header>
  );
}

export default Topbar;
