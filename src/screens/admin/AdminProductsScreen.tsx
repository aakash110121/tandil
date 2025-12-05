import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const PRODUCTS = [
  { id: 'p-001', name: 'Organic Fertilizer 5kg', price: 'AED 89.99', stock: 42 },
  { id: 'p-002', name: 'Drip Irrigation Kit', price: 'AED 299.00', stock: 12 },
  { id: 'p-003', name: 'Premium Potting Soil', price: 'AED 59.99', stock: 76 },
];

const AdminProductsScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const renderProduct = ({ item }: { item: typeof PRODUCTS[number] }) => (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.iconCircle, { backgroundColor: COLORS.primary + '15' }] }>
          <Ionicons name="leaf-outline" size={18} color={COLORS.primary} />
        </View>
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>{item.price} • Stock {item.stock}</Text>
        </View>
      </View>
      <View style={styles.actions}>
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
        <Text style={styles.headerTitle}>Products</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={PRODUCTS}
        renderItem={renderProduct}
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
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  name: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  meta: { color: COLORS.textSecondary, fontSize: FONT_SIZES.sm },
  actions: { flexDirection: 'row', gap: 8 },
  smallBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
});

export default AdminProductsScreen;












