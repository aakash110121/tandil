import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const PLANS = [
  { id: '1M', name: '1 Month', price: 'AED 500', features: 'Watering • Planting • Cleaning • Full Care' },
  { id: '3M', name: '3 Months', price: 'AED 1,450', features: 'Everything in 1M • Priority Support' },
  { id: '6M', name: '6 Months', price: 'AED 2,900', features: 'Seasonal Pruning • Soil Vitamins' },
  { id: '12M', name: '12 Months', price: 'AED 5,500', features: 'Annual Care • Best Value' },
];

const AdminSubscriptionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const renderPlan = ({ item }: { item: typeof PLANS[number] }) => (
    <View style={styles.planCard}>
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planPrice}>{item.price}</Text>
      </View>
      <Text style={styles.planFeatures}>{item.features}</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.smallBtn}>
          <Ionicons name="create-outline" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallBtn}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscriptions</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={PLANS}
        renderItem={renderPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.sm }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  planCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  planName: { color: COLORS.text, fontWeight: FONT_WEIGHTS.bold },
  planPrice: { color: COLORS.primary, fontWeight: FONT_WEIGHTS.bold },
  planFeatures: { color: COLORS.textSecondary, marginBottom: SPACING.sm },
  actionsRow: { flexDirection: 'row', gap: 8 },
  smallBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
});

export default AdminSubscriptionsScreen;












