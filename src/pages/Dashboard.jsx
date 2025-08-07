import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useUnifiedInventory } from '@/contexts/UnifiedInventoryProvider';

import { UserPlus, TrendingUp, DollarSign, PackageCheck, ShoppingCart, Users, Package, MapPin, User as UserIcon, Bot, Briefcase, TrendingDown, Hourglass, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Loader from '@/components/ui/loader';
import { filterOrdersByPeriod, getTopCustomers, getTopProducts, getTopProvinces } from '@/lib/dashboard-helpers';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import SettlementRequestCard from '@/components/dashboard/SettlementRequestCard';
import StockAlertsCard from '@/components/dashboard/StockAlertsCard';
import StockMonitoringSystem from '@/components/dashboard/StockMonitoringSystem';
import RecentOrdersCard from '@/components/dashboard/RecentOrdersCard';
import ManagerDashboardSection from '@/components/dashboard/ManagerDashboardSection';
import StatCard from '@/components/dashboard/StatCard';
import TopListCard from '@/components/dashboard/TopListCard';
import TopProvincesDialog from '@/components/dashboard/TopProvincesDialog';
import TopProductsDialog from '@/components/dashboard/TopProductsDialog';
import TopCustomersDialog from '@/components/dashboard/TopCustomersDialog';
import AiOrdersManager from '@/components/dashboard/AiOrdersManager';
import PendingRegistrations from '@/components/dashboard/PendingRegistrations';

const Dashboard = () => {
    const navigate = useNavigate();
    const authContext = useAuth();
    const user = authContext?.user;
    const permissionsContext = usePermissions();
    const { hasPermission, canViewAllData } = permissionsContext || {};
    
    // استخدام النظام الموحد الجديد
    const {
        products: allProducts,
        orders: allOrders,
        customers: allCustomers,
        profits: allProfits,
        calculations,
        loading: isLoading,
        error
    } = useUnifiedInventory();

    const [selectedPeriod, setSelectedPeriod] = useLocalStorage('dashboard-period', 'all');
    const [topProductsOpen, setTopProductsOpen] = useState(false);
    const [topCustomersOpen, setTopCustomersOpen] = useState(false);
    const [topProvincesOpen, setTopProvincesOpen] = useState(false);
    const [showPendingRegs, setShowPendingRegs] = useState(false);
    const [showAiOrders, setShowAiOrders] = useState(false);

    // فلترة الطلبات حسب الفترة المحددة
    const filteredOrders = useMemo(() => {
        return filterOrdersByPeriod(allOrders, selectedPeriod);
    }, [allOrders, selectedPeriod]);

    // الحسابات الموحدة للوحة التحكم
    const dashboardStats = useMemo(() => {
        const stats = calculations;
        const periodOrders = filteredOrders;
        
        return {
            ...stats,
            // إحصائيات الفترة المحددة
            periodRevenue: periodOrders
                .filter(o => o.status === 'delivered' || o.status === 'completed')
                .reduce((sum, o) => sum + (o.final_amount || 0), 0),
            periodOrders: periodOrders.length,
            periodCompleted: periodOrders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
            periodPending: periodOrders.filter(o => o.status === 'pending').length
        };
    }, [calculations, filteredOrders]);

    // قوائم أفضل العناصر
    const topItems = useMemo(() => ({
        customers: getTopCustomers(filteredOrders),
        products: getTopProducts(filteredOrders),
        provinces: getTopProvinces(filteredOrders)
    }), [filteredOrders]);

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Helmet>
                <title>لوحة التحكم - {user?.company_name || 'نظام إدارة المخزون'}</title>
            </Helmet>

            <WelcomeHeader />

            {/* تنبيه المخزون في الأعلى */}
            <StockMonitoringSystem />

            {/* إحصائيات جميلة للمديرين */}
            {canViewAllData ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <ManagerDashboardSection 
                        stats={{
                            totalOrders: dashboardStats.totalOrders || 0,
                            totalRevenue: dashboardStats.totalRevenue || 0,
                            totalProducts: dashboardStats.totalProducts || 0,
                            pendingOrders: dashboardStats.pendingOrders || 0,
                            completedOrders: dashboardStats.periodCompleted || 0,
                            lowStockProducts: dashboardStats.lowStockProducts || 0,
                            pendingProfits: dashboardStats.totalProfits || 0,
                            aiOrdersCount: allOrders?.filter(o => o.is_ai_order)?.length || 0
                        }}
                        orders={allOrders}
                        profits={allProfits}
                        products={allProducts}
                    />
                </motion.div>
            ) : (
                /* إحصائيات جميلة للموظفين */
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <StatCard
                        title="طلباتي"
                        value={filteredOrders.length}
                        format="number"
                        icon={ShoppingCart}
                        colors={['blue-500', 'sky-500']}
                    />
                    <StatCard
                        title="إجمالي المنتجات"
                        value={dashboardStats.totalProducts}
                        format="number"
                        icon={Package}
                        colors={['purple-500', 'violet-500']}
                    />
                    <StatCard
                        title="تنبيهات المخزون"
                        value={dashboardStats.lowStockProducts}
                        format="number"
                        icon={AlertTriangle}
                        colors={['red-500', 'orange-500']}
                    />
                </motion.div>
            )}

            {/* كارت طلب المحاسبة للموظفين فقط */}
            {!canViewAllData && (
                <SettlementRequestCard 
                    pendingProfit={dashboardStats.totalProfits} 
                    onSettle={() => navigate('/profits-summary')} 
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* العمود الأيسر */}
                <div className="lg:col-span-2 space-y-6">
                    <RecentOrdersCard orders={filteredOrders.slice(0, 5)} />
                    
                    {/* إدارة طلبات الذكاء الاصطناعي - للمديرين فقط */}
                    {canViewAllData && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4"
                        >
                            <Card className="overflow-hidden border-2 border-gradient-to-r from-purple-200 to-blue-200 bg-gradient-to-br from-purple-50 to-blue-50 hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                                                <Bot className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">طلبات الذكاء الاصطناعي</h3>
                                                <p className="text-sm text-muted-foreground">إدارة ومراجعة الطلبات الذكية</p>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => setShowAiOrders(true)}
                                            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                                        >
                                            إدارة الطلبات
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* العمود الأيمن */}
                <div className="space-y-6">
                    <StockAlertsCard />
                    
                    {/* طلبات التسجيل الجديدة - للمديرين فقط */}
                    {canViewAllData && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="overflow-hidden border-2 border-gradient-to-r from-green-200 to-emerald-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                                <UserPlus className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">طلبات التسجيل</h3>
                                                <p className="text-sm text-muted-foreground">موافقة على الموظفين الجدد</p>
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={() => setShowPendingRegs(true)}
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                        >
                                            عرض الطلبات
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* قوائم أفضل العناصر */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TopListCard
                    title="أفضل المنتجات"
                    items={topItems.products}
                    onViewAll={() => setTopProductsOpen(true)}
                />
                <TopListCard
                    title="أفضل العملاء"
                    items={topItems.customers}
                    onViewAll={() => setTopCustomersOpen(true)}
                />
                <TopListCard
                    title="أفضل المحافظات"
                    items={topItems.provinces}
                    onViewAll={() => setTopProvincesOpen(true)}
                />
            </div>

            {/* النوافذ المنبثقة */}
            <AnimatePresence>
                {showPendingRegs && (
                    <PendingRegistrations onClose={() => setShowPendingRegs(false)} />
                )}
                {showAiOrders && (
                    <AiOrdersManager onClose={() => setShowAiOrders(false)} />
                )}
            </AnimatePresence>

            <TopProvincesDialog 
                open={topProvincesOpen} 
                onOpenChange={setTopProvincesOpen} 
                employeeId={canViewAllData ? null : user?.id}
            />
            <TopCustomersDialog 
                open={topCustomersOpen} 
                onOpenChange={setTopCustomersOpen} 
                employeeId={canViewAllData ? null : user?.id}
            />
            <TopProductsDialog 
                open={topProductsOpen} 
                onOpenChange={setTopProductsOpen} 
                employeeId={canViewAllData ? null : (user?.id || user?.user_id)}
            />
        </div>
    );
};

export default Dashboard;