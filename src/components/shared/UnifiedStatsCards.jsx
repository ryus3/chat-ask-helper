import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users,
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import useUnifiedData from '@/hooks/useUnifiedData';

/**
 * مكون موحد لعرض الإحصائيات في جميع الصفحات
 * يضمن توحيد البيانات والحسابات
 */
const UnifiedStatsCards = ({ 
  showCards = ['revenue', 'orders', 'products', 'profits'],
  layout = 'grid',
  variant = 'default'
}) => {
  const { calculations, isLoading, permissions } = useUnifiedData();

  if (isLoading) {
    return (
      <div className={`${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' : 'flex flex-wrap gap-4'}`}>
        {Array.from({ length: showCards.length }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsConfig = {
    revenue: {
      title: 'إجمالي الإيرادات',
      value: formatCurrency(calculations.totalRevenue),
      icon: DollarSign,
      trend: calculations.todaySales > 0 ? 'up' : 'neutral',
      subtitle: `اليوم: ${formatCurrency(calculations.todaySales)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      show: permissions.canViewAllData || permissions.hasPermission('view_financial_data')
    },
    orders: {
      title: 'إجمالي الطلبات',
      value: calculations.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      trend: calculations.pendingOrders > 0 ? 'up' : 'neutral',
      subtitle: `معلقة: ${calculations.pendingOrders}`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      show: true
    },
    products: {
      title: 'إجمالي المنتجات',
      value: calculations.totalProducts.toLocaleString(),
      icon: Package,
      trend: calculations.lowStockProducts > 0 ? 'down' : 'up',
      subtitle: `نشط: ${calculations.activeProducts}`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      show: true
    },
    profits: {
      title: 'إجمالي الأرباح',
      value: formatCurrency(calculations.totalProfits),
      icon: TrendingUp,
      trend: calculations.monthlyProfits > 0 ? 'up' : 'neutral',
      subtitle: `هذا الشهر: ${formatCurrency(calculations.monthlyProfits)}`,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      show: permissions.canViewAllData || permissions.hasPermission('view_profits')
    },
    inventory: {
      title: 'قيمة المخزون',
      value: formatCurrency(calculations.inventoryValue),
      icon: Package,
      trend: calculations.lowStockProducts > 0 ? 'down' : 'up',
      subtitle: `منخفض: ${calculations.lowStockProducts}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      show: permissions.hasPermission('view_inventory')
    },
    lowStock: {
      title: 'تنبيهات المخزون',
      value: calculations.lowStockProducts.toLocaleString(),
      icon: AlertTriangle,
      trend: calculations.lowStockProducts > 0 ? 'down' : 'up',
      subtitle: 'منتجات منخفضة',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      show: true
    }
  };

  const visibleStats = showCards
    .map(cardKey => ({ key: cardKey, ...statsConfig[cardKey] }))
    .filter(stat => stat.show);

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <CheckCircle className="h-4 w-4 text-gray-500" />;
  };

  const containerClass = layout === 'grid' 
    ? `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(visibleStats.length, 4)} gap-6`
    : 'flex flex-wrap gap-4';

  return (
    <div className={containerClass}>
      {visibleStats.map(({ key, title, value, icon: Icon, trend, subtitle, color, bgColor }) => (
        <Card key={key} className={`transition-all duration-300 hover:shadow-lg ${variant === 'compact' ? 'p-4' : ''}`}>
          <CardHeader className={`pb-2 ${variant === 'compact' ? 'pb-1' : ''}`}>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className={`p-2 rounded-lg ${bgColor}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className={variant === 'compact' ? 'pt-0' : ''}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${color} ${variant === 'compact' ? 'text-lg' : ''}`}>
                  {value}
                </div>
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(trend)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UnifiedStatsCards;