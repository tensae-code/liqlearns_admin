import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const BreadcrumbNavigation = ({ items, className = '' }: BreadcrumbNavigationProps) => {
  const location = useLocation();

  // Route mapping for automatic breadcrumb generation
  const routeMap: Record<string, BreadcrumbItem> = {
    '/user-management-dashboard': { label: 'User Management', icon: 'UserCheck' },
    '/content-management-hub': { label: 'Content Management', icon: 'FileText' },
    '/financial-dashboard': { label: 'Financial Dashboard', icon: 'TrendingUp' },
    '/progress-analytics-panel': { label: 'Progress Analytics', icon: 'BarChart3' },
    '/store-management-system': { label: 'Store Management', icon: 'Store' },
    '/event-calendar-manager': { label: 'Event Calendar', icon: 'Calendar' },
  };

  // Generate breadcrumbs from current route if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', path: '/', icon: 'Home' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment) => {
      currentPath += `/${segment}`;
      const routeInfo = routeMap[currentPath];
      if (routeInfo) {
        breadcrumbs.push({
          ...routeInfo,
          path: currentPath
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't render if only one item (current page)
  if (breadcrumbs.length <= 1) return null;

  return (
    <nav 
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isClickable = item.path && !isLast;

          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <Icon 
                  name="ChevronRight" 
                  size={14} 
                  className="text-muted-foreground" 
                />
              )}
              
              <div className="flex items-center space-x-1.5">
                {item.icon && (
                  <Icon 
                    name={item.icon} 
                    size={14} 
                    className={isLast ? 'text-primary' : 'text-muted-foreground'} 
                  />
                )}
                
                {isClickable ? (
                  <Link
                    to={item.path!}
                    className="font-body text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span 
                    className={`font-body ${
                      isLast 
                        ? 'text-foreground font-medium' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default BreadcrumbNavigation;