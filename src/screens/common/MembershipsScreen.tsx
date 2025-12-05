import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';
import { useMembershipPackages, useSelectedMembership, useAppStore } from '../../store';
import { MembershipTier } from '../../types';

const TierBadge = ({ label, color }: { label: string; color?: string }) => (
  <View style={[styles.badge, { backgroundColor: color || COLORS.primary }]}>
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);

type MembershipCardProps = {
  id: MembershipTier;
  title: string;
  subtitle: string;
  priceAED: number;
  durationMonths: number;
  features: string[];
  highlight?: boolean;
  selected: boolean;
  onSelect: () => void;
};

const TIER_THEME: Record<MembershipTier, { primary: string; surface: string; accent: string; icon: string }>= {
  '1D': { primary: COLORS.primary, surface: COLORS.primaryLight + '20', accent: COLORS.primaryLight + '40', icon: 'today' },
  '1M': { primary: COLORS.primary, surface: COLORS.primaryLight + '20', accent: COLORS.primaryLight + '40', icon: 'leaf' },
  '3M': { primary: COLORS.primary, surface: COLORS.primaryLight + '20', accent: COLORS.primaryLight + '40', icon: 'calendar' },
  '6M': { primary: COLORS.primary, surface: COLORS.primaryLight + '20', accent: COLORS.primaryLight + '40', icon: 'calendar-number' },
  '12M': { primary: COLORS.primary, surface: COLORS.primaryLight + '20', accent: COLORS.primaryLight + '40', icon: 'time' },
  'VIP-1D': { primary: '#FFD700', surface: '#FFD700' + '20', accent: '#FFD700' + '40', icon: 'star' },
  'VIP-1M': { primary: '#FFD700', surface: '#FFD700' + '20', accent: '#FFD700' + '40', icon: 'star' },
  'VIP-3M': { primary: '#FFD700', surface: '#FFD700' + '20', accent: '#FFD700' + '40', icon: 'star' },
  'VIP-6M': { primary: '#FFD700', surface: '#FFD700' + '20', accent: '#FFD700' + '40', icon: 'star' },
  'VIP-12M': { primary: '#FFD700', surface: '#FFD700' + '20', accent: '#FFD700' + '40', icon: 'star' },
};

const MembershipCard: React.FC<MembershipCardProps> = ({ id, title, subtitle, priceAED, durationMonths, features, highlight, selected, onSelect }) => {
  const theme = TIER_THEME[id];
  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={onSelect} 
      style={[
        styles.card, 
        selected && styles.cardSelected,
        highlight && styles.cardHighlight,
      ]}
    >
      {/* Header with Icon and Title */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
            <Ionicons name={theme.icon as any} size={24} color={COLORS.background} />
          </View>
          <View>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
          </View>
        </View>
        {highlight && (
          <View style={[styles.recommendedBadge, { backgroundColor: theme.primary }]}>
            <Text style={styles.recommendedText}>Recommended</Text>
          </View>
        )}
        {selected && (
          <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
        )}
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <Text style={styles.priceAmount}>AED {priceAED}</Text>
        <Text style={styles.priceDuration}>
          {durationMonths === 0 ? 'for 1 day' : `for ${durationMonths} month${durationMonths > 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Features */}
      <View style={styles.features}>
        {features.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
            <Text style={styles.featureText}>{f}</Text>
          </View>
        ))}
      </View>

      {/* Select Button */}
      <TouchableOpacity 
        style={[
          styles.selectButton,
          selected && styles.selectButtonSelected
        ]}
        onPress={onSelect}
      >
        <Text style={[
          styles.selectButtonText,
          selected && styles.selectButtonTextSelected
        ]}>
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
  const packages = useMembershipPackages();
  const selectedTier = useSelectedMembership();
  const setSelectedMembership = useAppStore((s) => s.setSelectedMembership);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm, marginBottom: 20 }] }>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Memberships</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
          <Ionicons name="help-circle-outline" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.xxl * 2 }]} showsVerticalScrollIndicator={false}>
        {packages.map((p) => (
          <MembershipCard
            key={p.id}
            id={p.id}
            title={p.title}
            subtitle={p.subtitle}
            priceAED={p.priceAED}
            durationMonths={p.durationMonths}
            features={p.features}
            highlight={p.highlight}
            selected={selectedTier === p.id}
            onSelect={() => setSelectedMembership(p.id)}
          />
        ))}
        <View style={{ height: SPACING.xl }} />
      </ScrollView>
      {/* Sticky bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <View style={styles.bottomSelected}>
          <Text style={styles.bottomLabel}>Selected</Text>
          <Text style={styles.bottomValue}>{selectedTier ?? 'None'}</Text>
        </View>
        <TouchableOpacity
          disabled={!selectedTier}
          onPress={() => selectedTier && navigation.navigate('MembershipCheckout', { tier: selectedTier })}
          style={[styles.ctaButton, !selectedTier && { opacity: 0.5 }]}
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


