import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';
import { useSelectedMembership, useMembershipPackages } from '../../store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MembershipCheckoutScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>() as RouteProp<any>;
  const paramTier = route.params?.tier;
  const selectedTier = useSelectedMembership();
  const tier = paramTier ?? selectedTier;
  const packages = useMembershipPackages();
  const pkg = packages.find((p) => p.id === tier);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm, marginBottom: 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Membership Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      {pkg ? (
        <View style={styles.card}>
          <Text style={styles.title}>{pkg.title}</Text>
          <Text style={styles.subtitle}>{pkg.subtitle}</Text>
          <Text style={styles.price}>${pkg.priceMonthly}/month or ${pkg.priceYearly}/year</Text>
          <View style={{ height: SPACING.md }} />
          <TouchableOpacity style={styles.payButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.payText}>Confirm and Subscribe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>No membership selected</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
  back: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.semiBold },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  card: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: 4 },
  price: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semiBold, marginTop: SPACING.md, color: COLORS.text },
  payButton: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    alignItems: 'center',
  },
  payText: { color: COLORS.background, fontWeight: FONT_WEIGHTS.semiBold },
});

export default MembershipCheckoutScreen;


