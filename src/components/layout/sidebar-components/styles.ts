// =============================================================================
// Style Constants for Navigation (Kent Beck: "Extract Constant")
// =============================================================================

export const NAV_ITEM_BASE_STYLES =
  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200';

export const NAV_ITEM_ACTIVE_STYLES =
  'bg-sidebar-accent text-sidebar-accent-foreground';

export const NAV_ITEM_PARTIAL_ACTIVE_STYLES =
  'bg-sidebar-accent/50 text-sidebar-foreground';

export const NAV_ITEM_INACTIVE_STYLES =
  'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground';
