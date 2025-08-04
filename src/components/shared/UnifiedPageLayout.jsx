import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Plus,
  Download,
  Upload,
  Settings,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import UnifiedStatsCards from './UnifiedStatsCards';

/**
 * مكون موحد لتخطيط جميع الصفحات
 * يوفر واجهة متسقة وموحدة
 */
const UnifiedPageLayout = ({
  title,
  subtitle,
  showStats = true,
  statsConfig = ['revenue', 'orders', 'products', 'profits'],
  children,
  headerActions = [],
  isLoading = false,
  searchValue = '',
  onSearchChange,
  showSearch = true,
  showRefresh = true,
  showFilters = false,
  filterComponent,
  pagination,
  selectedCount = 0,
  onClearSelection,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`space-y-6 p-6 ${className}`}>
        {/* Loading Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        {/* Loading Stats */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Loading Content */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {headerActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              size={action.size || 'default'}
              onClick={action.onClick}
              disabled={action.disabled}
              className={action.className}
            >
              {action.icon && <action.icon className="h-4 w-4 ml-2" />}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      {showStats && (
        <UnifiedStatsCards
          showCards={statsConfig}
          layout="grid"
          variant="default"
        />
      )}

      {/* Toolbar Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Left Side - Search and Filters */}
            <div className="flex items-center gap-4 flex-1">
              {showSearch && (
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث..."
                    value={searchValue}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              
              {showFilters && filterComponent}
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              {/* Selection Info */}
              {selectedCount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {selectedCount} محدد
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearSelection}
                  >
                    إلغاء التحديد
                  </Button>
                </div>
              )}

              {/* Refresh Button */}
              {showRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* Pagination */}
      {pagination && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                عرض {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} إلى{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} من{' '}
                {pagination.totalItems} عنصر
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.onPrevPage}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                  السابق
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => pagination.onGoToPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.onNextPage}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  التالي
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedPageLayout;