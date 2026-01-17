import { Fragment } from 'react';
import { Link } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Skeleton } from '@/components/ui/loading';

interface BreadcrumbNavProps {
  breadcrumbs: { label: string; to: string }[];
  isLoading?: boolean;
}

function BreadcrumbNav({ breadcrumbs, isLoading = false }: BreadcrumbNavProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const showSkeleton = isLast && isLoading && !crumb.label;

          return (
            <Fragment key={`${crumb.to}-${index}`}>
              <BreadcrumbItem>
                {isLast ? (
                  showSkeleton ? (
                    <Skeleton className="h-6 w-32" />
                  ) : (
                    <BreadcrumbPage className="max-w-[200px] truncate text-lg font-bold">
                      {crumb.label}
                    </BreadcrumbPage>
                  )
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={crumb.to}
                      className="text-muted-foreground hover:text-foreground block max-w-[200px] truncate text-lg font-medium transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default BreadcrumbNav;
