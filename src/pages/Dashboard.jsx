import React, { useState, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import useUnifiedData from '@/hooks/useUnifiedData';

import { UserPlus, TrendingUp, DollarSign, PackageCheck, ShoppingCart, Users, Package, MapPin, User as UserIcon, Bot, Briefcase, TrendingDown, Hourglass, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { filterOrdersByPeriod, getTopCustomers, getTopProducts, getTopProvinces } from '@/lib/dashboard-helpers';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import SettlementRequestCard from '@/components/dashboard/SettlementRequestCard';
import StockAlertsCard from '@/components/dashboard/StockAlertsCard';
import StockMonitoringSystem from '@/components/dashboard/StockMonitoringSystem';
import RecentOrdersCard from '@/components/dashboard/RecentOrdersCard';
import UnifiedStatsCards from '@/components/shared/UnifiedStatsCards';
import TopListCard from '@/components/dashboard/TopListCard';
import TopProvincesDialog from '@/components/dashboard/TopProvincesDialog';
import TopProductsDialog from '@/components/dashboard/TopProductsDialog';
import TopCustomersDialog from '@/components/dashboard/TopCustomersDialog';
import AiOrdersManager from '@/components/dashboard/AiOrdersManager';
import PendingRegistrations from '@/components/dashboard/PendingRegistrations';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { hasPermission, canViewAllData } = usePermissions();
    
    // استخدام البيانات الموحدة بدلاً من contexts منفصلة
    const {
        products,
        orders,
        calculations,
        permissions,
        isLoading,
        operations
    } = useUnifiedData();

    const [selectedPeriod, setSelectedPeriod] = useLocalStorage('dashboard-period', 'all');
    const [topProductsOpen, setTopProductsOpen] = useState(false);
    const [topCustomersOpen, setTopCustomersOpen] = useState(false);
    const [topProvincesOpen, setTopProvincesOpen] = useState(false);
    const [showPendingRegs, setShowPendingRegs] = useState(false);
    const [showAiOrders, setShowAiOrders] = useState(false);

    // فلترة الطلبات حسب الفترة المحددة
    const filteredOrders = useMemo(() => {
        return filterOrdersByPeriod(orders, selectedPeriod);
    }, [orders, selectedPeriod]);

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

            {/* الإحصائيات الموحدة */}
            <UnifiedStatsCards 
                showCards={canViewAllData ? ['revenue', 'orders', 'products', 'profits'] : ['orders', 'products', 'lowStock']}
                layout="grid"
                variant="default"
            />

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
                        <div className="space-y-4">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowAiOrders(true)}
                                className="w-full"
                            >
                                <Bot className="w-4 h-4 mr-2" />
                                إدارة طلبات الذكاء الاصطناعي
                            </Button>
                        </div>
                    )}
                </div>

                {/* العمود الأيمن */}
                <div className="space-y-6">
                    <StockAlertsCard />
                    
                    {/* طلبات التسجيل الجديدة - للمديرين فقط */}
                    {canViewAllData && (
                        <Button 
                            variant="outline" 
                            onClick={() => setShowPendingRegs(true)}
                            className="w-full"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            طلبات التسجيل الجديدة
                        </Button>
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