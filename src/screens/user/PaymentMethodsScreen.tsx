import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const PaymentMethodsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('paymentMethodsScreen.title')}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="card-outline" size={18} color={COLORS.primary} />
          <Text style={styles.pmTitle}>{t('paymentMethodsScreen.cardMask', { last4: '4242' })}</Text>
        </View>
        <Text style={styles.pmText}>{t('paymentMethodsScreen.defaultCard')}</Text>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>{t('paymentMethodsScreen.addNewCard')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, color: COLORS.text },
  card: { margin: SPACING.lg, backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.xs },
  pmTitle: { color: COLORS.text, fontWeight: FONT_WEIGHTS.medium },
  pmText: { color: COLORS.textSecondary, marginBottom: SPACING.md },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: FONT_WEIGHTS.medium },
});

export default PaymentMethodsScreen;












