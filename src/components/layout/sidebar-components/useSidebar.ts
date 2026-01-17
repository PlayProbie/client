import { createContext, useContext } from 'react';

// =============================================================================
// Sidebar Context
// =============================================================================

export interface SidebarContextType {
  isCollapsed: boolean;
  toggle: () => void;
}

export const SidebarContext = createContext<SidebarContextType | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
