import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const { width } = Dimensions.get('window');

const VendorAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Demo analytics data
  const analyticsData = {
    overview: {
          totalProducts: 45,
    totalOrders: 156,
    totalRevenue: 'AED 23,450',
    totalViews: 12847,
    growthRate: '+12.5%',
    period: 'This Month',
    },
    performance: {
      conversionRate: 3.2,
      averageOrderValue: 'AED 150',
      customerSatisfaction: 4.8,
      returnRate: 2.1,
    },
    topProducts: [
      { name: 'Premium Leather Sneakers', orders: 23, revenue: 'AED 6,900', growth: '+15%' },
      { name: 'Designer Handbag', orders: 18, revenue: 'AED 5,400', growth: '+8%' },
      { name: 'Luxury Watch', orders: 15, revenue: 'AED 4,500', growth: '+22%' },
      { name: 'Silk Scarf', orders: 12, revenue: 'AED 1,200', growth: '+5%' },
    ],
    recentActivity: [
      { type: 'order', message: 'New order received for Premium Sneakers', time: '2 hours ago', value: '+AED 299' },
      { type: 'view', message: 'Product viewed 45 times today', time: '4 hours ago', value: '+45 views' },
      { type: 'review', message: '5-star review received', time: '6 hours ago', value: '+5.0 rating' },
      { type: 'revenue', message: 'Daily revenue target achieved', time: '8 hours ago', value: '+AED 1,200' },
    ],
    trends: {
      daily: [120, 145, 132, 167, 189, 156, 178],
      weekly: [890, 1020, 1150, 980, 1200, 1350, 1100],
      monthly: [3200, 3800, 4200, 3900, 4500, 4800, 5200],
    },
  };

  const periods = [
    { id: 'week', name: 'Week', icon: 'calendar-outline' },
    { id: 'month', name: 'Month', icon: 'calendar-outline' },
    { id: 'quarter', name: 'Quarter', icon: 'calendar-outline' },
    { id: 'year', name: 'Year', icon: 'calendar-outline' },
  ];

  const renderMetricCard = (title: string, value: string, subtitle: string, icon: string, color: string, trend?: string) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {trend && (
          <View style={[styles.trendBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.trendText, { color }]}>{trend}</Text>
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderTopProduct = (product: any, index: number) => (
    <View key={index} style={styles.topProductCard}>
      <View style={styles.productRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productStats}>
          {product.orders} orders • {product.revenue}
        </Text>
      </View>
      <View style={styles.productGrowth}>
        <Text style={styles.growthText}>{product.growth}</Text>
      </View>
    </View>
  );

  const renderActivityItem = (activity: any, index: number) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'order': return 'bag-outline';
        case 'view': return 'eye-outline';
        case 'review': return 'star-outline';
        case 'revenue': return 'trending-up-outline';
        default: return 'notifications-outline';
      }
    };

    const getActivityColor = (type: string) => {
      switch (type) {
        case 'order': return COLORS.success;
        case 'view': return COLORS.info;
        case 'review': return COLORS.warning;
        case 'revenue': return COLORS.primary;
        default: return COLORS.textSecondary;
      }
    };

    return (
      <View key={index} style={styles.activityItem}>
        <View style={[styles.activityIcon, { backgroundColor: getActivityColor(activity.type) + '20' }]}>
          <Ionicons name={getActivityIcon(activity.type) as any} size={20} color={getActivityColor(activity.type)} />
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityMessage}>{activity.message}</Text>
          <Text style={styles.activityTime}>{activity.time}</Text>
        </View>
        <Text style={[styles.activityValue, { color: getActivityColor(activity.type) }]}>
          {activity.value}
        </Text>
      </View>
    );
  };

  const renderChartPlaceholder = (title: string, data: number[]) => (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <View style={styles.chartContainer}>
        <View style={styles.chartPlaceholder}>
          <Ionicons name="analytics-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.chartPlaceholderText}>Chart Visualization</Text>
          <Text style={styles.chartPlaceholderSubtext}>
            {data.length} data points available
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>View your performance metrics</Text>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.periodButton,
                selectedPeriod === period.id && styles.periodButtonActive
              ]}
              onPress={() => setSelectedPeriod(period.id)}
            >
              <Ionicons 
                name={period.icon as any} 
                size={16} 
                color={selectedPeriod === period.id ? COLORS.background : COLORS.primary} 
              />
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period.id && styles.periodButtonTextActive
              ]}>
                {period.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Overview Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview - {analyticsData.overview.period}</Text>
          <View style={styles.metricsGrid}>
            {renderMetricCard(
              'Total Products',
              analyticsData.overview.totalProducts.toString(),
              'Active in catalog',
              'cube-outline',
              COLORS.primary,
              analyticsData.overview.growthRate
            )}
            {renderMetricCard(
              'Total Orders',
              analyticsData.overview.totalOrders.toString(),
              'Completed orders',
              'bag-outline',
              COLORS.success
            )}
            {renderMetricCard(
              'Total Revenue',
              analyticsData.overview.totalRevenue,
              'Gross earnings',
              'trending-up-outline',
              COLORS.warning
            )}
            {renderMetricCard(
              'Total Views',
              analyticsData.overview.totalViews.toLocaleString(),
              'Product impressions',
              'eye-outline',
              COLORS.info
            )}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Ionicons name="trending-up-outline" size={20} color={COLORS.success} />
                <Text style={styles.performanceTitle}>Conversion Rate</Text>
              </View>
              <Text style={styles.performanceValue}>{analyticsData.performance.conversionRate}%</Text>
              <Text style={styles.performanceSubtitle}>View to Order ratio</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Ionicons name="cash-outline" size={20} color={COLORS.warning} />
                <Text style={styles.performanceTitle}>Avg Order Value</Text>
              </View>
              <Text style={styles.performanceValue}>{analyticsData.performance.averageOrderValue}</Text>
              <Text style={styles.performanceSubtitle}>Per transaction</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Ionicons name="star-outline" size={20} color={COLORS.primary} />
                <Text style={styles.performanceTitle}>Satisfaction</Text>
              </View>
              <Text style={styles.performanceValue}>{analyticsData.performance.customerSatisfaction}/5</Text>
              <Text style={styles.performanceSubtitle}>Customer rating</Text>
            </View>
            
            <View style={styles.performanceCard}>
              <View style={styles.performanceHeader}>
                <Ionicons name="refresh-outline" size={20} color={COLORS.error} />
                <Text style={styles.performanceTitle}>Return Rate</Text>
              </View>
              <Text style={styles.performanceValue}>{analyticsData.performance.returnRate}%</Text>
              <Text style={styles.performanceSubtitle}>Product returns</Text>
            </View>
          </View>
        </View>

        {/* Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trends & Insights</Text>
          {renderChartPlaceholder('Daily Performance', analyticsData.trends.daily)}
          {renderChartPlaceholder('Weekly Revenue', analyticsData.trends.weekly)}
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Products</Text>
          <View style={styles.topProductsContainer}>
            {analyticsData.topProducts.map(renderTopProduct)}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {analyticsData.recentActivity.map(renderActivityItem)}
          </View>
        </View>

        {/* Export & Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.exportButton}>
            <Ionicons name="download-outline" size={24} color={COLORS.primary} />
            <Text style={styles.exportButtonText}>Export Report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.background} />
            <Text style={styles.shareButtonText}>Share Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    gap: SPACING.xs,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  periodButtonTextActive: {
    color: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metricCard: {
    width: (width - SPACING.lg * 3) / 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
  },
  metricValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metricTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metricSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  performanceCard: {
    width: (width - SPACING.lg * 3) / 2,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  performanceTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  performanceValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  performanceSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  chartContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  chartPlaceholderSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  topProductsContainer: {
    gap: SPACING.sm,
  },
  topProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rankNumber: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  productStats: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  productGrowth: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  growthText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.success,
  },
  activityContainer: {
    gap: SPACING.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  activityTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  activityValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
  },
  actionsSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    gap: SPACING.md,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  exportButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.primary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  shareButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
  },
});

export default VendorAnalyticsScreen;
