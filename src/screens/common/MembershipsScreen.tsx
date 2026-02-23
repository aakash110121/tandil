import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';
import { getClientMemberships, ClientMembership } from '../../services/clientMembershipService';

function formatPlan(plan: string): string {
  if (!plan) return plan;
  const normalized = plan.replace(/_/g, ' ');
  return normalized.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Subtitle from plan key (e.g. 6_month -> "6 month subscription") */
function planSubtitle(plan: string): string {
  if (!plan) return 'Subscription plan';
  const normalized = plan.replace(/_/g, ' ');
  const parts = normalized.split(' ');
  const num = parts.find((p) => /^\d+$/.test(p));
  if (num) {
    const n = parseInt(num, 10);
    if (n === 1) return '1 month subscription';
    return `${n} month subscription`;
  }
  return normalized + ' subscription';
}

/** Price duration line (e.g. "for 6 months") */
function planDurationLabel(plan: string): string {
  if (!plan) return '';
  const parts = plan.replace(/_/g, ' ').split(' ');
  const num = parts.find((p) => /^\d+$/.test(p));
  if (num) {
    const n = parseInt(num, 10);
    if (n === 1) return 'for 1 month';
    return `for ${n} months`;
  }
  return '';
}

/** Default features when API has none – same style as dummy cards */
const DEFAULT_FEATURES: string[] = [
  'Regular service visits',
  'Scheduled maintenance',
  'Before/After photos',
  'Priority support',
];

/** Available plan card – same design as the original dummy membership card (icon, title, subtitle, price, features, select button). */
const AvailablePlanCard: React.FC<{
  plan: ClientMembership;
  selected: boolean;
  onSelect: () => void;
}> = ({ plan, selected, onSelect }) => {
  const title = formatPlan(plan.plan);
  const subtitle = planSubtitle(plan.plan);
  const durationLabel = planDurationLabel(plan.plan) || subtitle;
  const amount = plan.amount ?? '0';
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onSelect}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconContainer, { backgroundColor: COLORS.primary }]}>
            <Ionicons name="calendar" size={24} color={COLORS.background} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
        </View>
        {selected && (
          <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
        )}
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.priceAmount}>AED {amount}</Text>
        <Text style={styles.priceDuration}>{durationLabel}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.features}>
        {DEFAULT_FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.selectButton, selected && styles.selectButtonSelected]}
        onPress={onSelect}
      >
        <Text style={[styles.selectButtonText, selected && styles.selectButtonTextSelected]}>
          {selected ? 'Selected' : 'Choose This Plan'}
        </Text>
        <Ionicons
          name={selected ? 'checkmark' : 'arrow-forward'}
          size={18}
          color={selected ? COLORS.background : COLORS.primary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const MembershipsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [availablePlans, setAvailablePlans] = useState<ClientMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ClientMembership | null>(null);

  const fetchPlans = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const { list } = await getClientMemberships();
      setAvailablePlans(list ?? []);
    } catch {
      setAvailablePlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlans(false);
    }, [fetchPlans])
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm, marginBottom: 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memberships</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xxl * 2 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchPlans(true)} colors={[COLORS.primary]} />
        }
      >
        <Text style={styles.sectionTitle}>Available Plans</Text>
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.sectionLoader} />
        ) : availablePlans.length === 0 ? (
          <View style={styles.emptyPlans}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.textSecondary} />
            <Text style={styles.emptyPlansText}>No plans available</Text>
          </View>
        ) : (
          availablePlans.map((plan) => (
            <AvailablePlanCard
              key={plan.id}
              plan={plan}
              selected={selectedPlan?.id === plan.id}
              onSelect={() => setSelectedPlan(plan)}
            />
          ))
        )}
        <View style={{ height: SPACING.xl }} />
      </ScrollView>
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <View style={styles.bottomSelected}>
          <Text style={styles.bottomLabel}>Selected</Text>
          <Text style={styles.bottomValue}>
            {selectedPlan ? formatPlan(selectedPlan.plan) : 'None'}
          </Text>
        </View>
        <TouchableOpacity
          disabled={!selectedPlan}
          onPress={() =>
            selectedPlan &&
            navigation.navigate('MembershipCheckout', {
              tier: selectedPlan.plan as any,
              planId: selectedPlan.id,
              amount: selectedPlan.amount,
            })
          }
          style={[styles.ctaButton, !selectedPlan && { opacity: 0.5 }]}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.background} />
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
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionLoader: {
    marginVertical: SPACING.md,
  },
  emptyPlans: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyPlansText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  cardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  tierIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHighlight: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  cardSelected: {
    borderColor: COLORS.success,
    borderWidth: 2,
    backgroundColor: COLORS.success + '05',
    // Remove shadow when selected to avoid dark outline
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  recommendedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    position: 'absolute',
    top: -8,
    right: 0,
  },
  recommendedText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
  },
  priceAmount: {
    fontSize: 36,
    fontWeight: '800' as any,
    color: COLORS.primary,
    marginRight: SPACING.xs,
  },
  priceDuration: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  pricesRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  pricePill: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pricePillAlt: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary + '40',
  },
  priceValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  priceLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  features: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: 2,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  selectButton: {
    marginTop: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 0,
    backgroundColor: COLORS.primary,
  },
  selectButtonSelected: {
    backgroundColor: COLORS.success,
  },
  selectButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
    marginRight: SPACING.xs,
  },
  selectButtonTextSelected: {
    color: COLORS.background,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.round,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomSelected: {
    flexDirection: 'column',
  },
  bottomLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  bottomValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
  },
  ctaText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
  },
});

export default MembershipsScreen;


