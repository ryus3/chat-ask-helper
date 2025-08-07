import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Bot,
  CheckCircle,
  Clock
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';

const ManagerDashboardSection = ({ stats, orders, aiOrders, profits, products }) => {
  if (!stats) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const mainStats = [
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders,
      icon: ShoppingCart,
      colors: ['blue-500', 'sky-500'],
      trend: `${stats.pendingOrders} معلق`,
      description: "جميع طلبات النظام",
      format: "number"
    },
    {
      title: "إجمالي الإيرادات",
      value: stats.totalRevenue,
      icon: DollarSign,
      colors: ['green-500', 'emerald-500'],
      description: "مجموع قيمة المبيعات",
      format: "currency"
    },
    {
      title: "إجمالي المنتجات",
      value: stats.totalProducts,
      icon: Package,
      colors: ['purple-500', 'violet-500'],
      trend: `${stats.lowStockProducts} منخفض`,
      description: "منتجات في النظام",
      format: "number"
    },
    {
      title: "طلبات الذكاء الاصطناعي",
      value: stats.aiOrdersCount,
      icon: Bot,
      colors: ['cyan-500', 'blue-500'],
      description: "طلبات ذكية تحتاج مراجعة",
      format: "number"
    }
  ];

  const operationalStats = [
    {
      title: "الطلبات المعلقة",
      value: stats.pendingOrders,
      icon: Clock,
      colors: ['orange-500', 'amber-500'],
      description: "طلبات تحتاج متابعة",
      format: "number"
    },
    {
      title: "الطلبات المكتملة",
      value: stats.completedOrders,
      icon: CheckCircle,
      colors: ['green-500', 'emerald-500'],
      description: "طلبات تم تسليمها",
      format: "number"
    },
    {
      title: "الأرباح المعلقة",
      value: stats.pendingProfits,
      icon: TrendingUp,
      colors: ['emerald-500', 'teal-500'],
      description: "أرباح تحتاج تسوية",
      format: "currency"
    },
    {
      title: "منتجات منخفضة",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      colors: ['red-500', 'orange-500'],
      description: "منتجات تحتاج تجديد المخزون",
      format: "number"
    }
  ];

  return (
    <div className="space-y-6">
      {/* الإحصائيات الرئيسية */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">نظرة عامة شاملة</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            المدير العام
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                colors={stat.colors}
                format={stat.format}
                trend={stat.trend}
                description={stat.description}
                className="hover:shadow-lg transition-shadow duration-300"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* الإحصائيات التشغيلية */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">الحالة التشغيلية</h2>
          <div className="flex space-x-2">
            <Badge 
              variant={stats.pendingOrders > 10 ? "destructive" : "secondary"}
              className="ml-2"
            >
              {stats.pendingOrders > 10 ? "يحتاج انتباه" : "الوضع طبيعي"}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operationalStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              custom={index + 4}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                colors={stat.colors}
                format={stat.format}
                description={stat.description}
                className="hover:shadow-lg transition-shadow duration-300"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* تنبيهات مهمة للمدير */}
      {(stats.lowStockProducts > 0 || stats.pendingProfits > 500000 || stats.aiOrdersCount > 5) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 ml-2" />
            <h3 className="font-semibold text-red-800">تنبيهات إدارية مهمة</h3>
          </div>
          <div className="space-y-1 text-sm text-red-700">
            {stats.lowStockProducts > 0 && (
              <p>• {stats.lowStockProducts} منتج يحتاج تجديد المخزون</p>
            )}
            {stats.pendingProfits > 500000 && (
              <p>• أرباح معلقة بقيمة {stats.pendingProfits.toLocaleString()} د.ع تحتاج تسوية</p>
            )}
            {stats.aiOrdersCount > 5 && (
              <p>• {stats.aiOrdersCount} طلب ذكي يحتاج مراجعة</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ManagerDashboardSection;