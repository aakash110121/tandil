import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { OrderCard } from '../../components/cards/OrderCard';
import { useAppStore } from '../../store';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';

const OrdersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { orders } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    if (selectedFilter === 'all') return true;
    return order.status === selectedFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'confirmed': return COLORS.info;
      case 'assigned': return COLORS.primary;
      case 'in_progress': return COLORS.primary;
      case 'completed': return COLORS.success;
      case 'delivered': return COLORS.success;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <OrderCard
      order={item}
      onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
      variant="default"
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="list-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyStateTitle}>{t('tabs.orders')}</Text>
      <Text style={styles.emptyStateDescription}>
        {t('home.placeServiceOrders')}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Main' as never, { screen: 'Services' } as never)}
      >
        <Text style={styles.browseButtonText}>{t('tabs.services')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterTab = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterTab,
        selectedFilter === filter.id && styles.filterTabActive
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Text style={[
        styles.filterTabText,
        selectedFilter === filter.id && styles.filterTabTextActive
      ]}>
        {filter.label}
      </Text>
      {filter.count > 0 && (
        <View style={[
          styles.filterCount,
          selectedFilter === filter.id && styles.filterCountActive
        ]}>
          <Text style={[
            styles.filterCountText,
            selectedFilter === filter.id && styles.filterCountTextActive
          ]}>
            {filter.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const filterTabs = [
    { id: 'all', label: t('orders.filters.all'), count: orders.length },
    { id: 'pending', label: t('orders.filters.pending'), count: orders.filter(o => o.status === 'pending').length },
    { id: 'in_progress', label: t('orders.filters.in_progress'), count: orders.filter(o => o.status === 'in_progress').length },
    { id: 'completed', label: t('orders.filters.completed'), count: orders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', label: t('orders.filters.cancelled'), count: orders.filter(o => o.status === 'cancelled').length },
  ];

  return (
    <View style={styles.container}>
      <Header 
        title={t('tabs.orders')} 
        showBack={false}
        showCart={true}
        rightComponent={
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Text style={styles.historyButtonText}>{t('home.orderHistory')}</Text>
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterTabs.map(renderFilterTab)}
        </ScrollView>
      </View>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersList}
        />
      ) : (
        renderEmptyState()
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('Main' as never, { screen: 'Services' } as never)}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionText}>{t('tabs.orders')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('HelpCenter')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="help-circle" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionText}>{t('home.learnMore')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  historyButton: {
    padding: SPACING.sm,
  },
  historyButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  filterContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  filterTabTextActive: {
    color: COLORS.background,
  },
  filterCount: {
    backgroundColor: COLORS.textSecondary,
    borderRadius: 10,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    marginLeft: SPACING.xs,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: COLORS.background,
  },
  filterCountText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.background,
    fontWeight: FONT_WEIGHTS.bold,
  },
  filterCountTextActive: {
    color: COLORS.primary,
  },
  ordersList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  browseButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
});

export default OrdersScreen;
