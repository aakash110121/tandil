import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Button } from '../../components/common/Button';

const PayoutSummaryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // No dummy data – show 0 until real payout API is connected; balance visible after jobs are completed
  const technician = {
    id: 'tech_001',
    name: '',
    totalEarnings: 0,
    availableBalance: 0,
    pendingAmount: 0,
    thisWeekEarnings: 0,
    thisMonthEarnings: 0,
  };

  const payoutHistory: any[] = [];

  const earningsBreakdown = [
    { period: t('payout.thisWeek'), amount: 0, jobs: 0 },
    { period: t('payout.thisMonth'), amount: 0, jobs: 0 },
    { period: t('payout.lastMonth'), amount: 0, jobs: 0 },
  ];

  const renderPayoutItem = ({ item }: { item: any }) => (
    <View style={styles.payoutCard}>
      <View style={styles.payoutHeader}>
        <Text style={styles.payoutAmount}>${item.amount}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'completed' ? COLORS.success + '20' : COLORS.warning + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completed' ? COLORS.success : COLORS.warning }
          ]}>
            {item.status === 'completed' ? t('technician.status.completed') : t('technician.status.pending')}
          </Text>
        </View>
      </View>
      
      <Text style={styles.payoutDate}>{item.date}</Text>
      <Text style={styles.payoutMethod}>{item.method}</Text>
      <Text style={styles.payoutReference}>Ref: {item.reference}</Text>
    </View>
  );

  const renderEarningsItem = ({ item }: { item: any }) => (
    <View style={styles.earningsCard}>
      <Text style={styles.earningsPeriod}>{item.period}</Text>
      <Text style={styles.earningsAmount}>${item.amount}</Text>
      <Text style={styles.earningsJobs}>{t('payout.jobsCount', { count: item.jobs })}</Text>
    </View>
  );

  const handleWithdraw = () => {
    if (technician.availableBalance < 50) {
      Alert.alert(t('technician.insufficientBalance'), t('technician.minimumWithdrawal'));
      return;
    }

    Alert.alert(
      t('payout.withdrawFunds'),
      t('payout.withdrawConfirm', { amount: technician.availableBalance }),
      [
        { text: t('technician.cancel'), style: 'cancel' },
        { 
          text: t('technician.withdraw'), 
          onPress: () => Alert.alert(t('technician.success'), t('technician.withdrawalSubmitted'))
        },
      ]
    );
  };

  const handleAddBankAccount = () => {
    navigation.navigate('AddBankAccount');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payout.title')}</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Summary – 0 until jobs completed */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>{t('payout.availableBalance')}</Text>
          <Text style={styles.balanceAmount}>$0</Text>
          <Text style={styles.balanceMessage}>
            {t('payout.balanceAfterJobs')}
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>{t('payout.pending')}</Text>
              <Text style={styles.balanceValue}>$0</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>{t('payout.totalEarned')}</Text>
              <Text style={styles.balanceValue}>$0</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsContainer}>
            <Button
              title={t('payout.withdrawFunds')}
              onPress={handleWithdraw}
              disabled={technician.availableBalance < 50}
              style={styles.withdrawButton}
            />
            <Button
              title={t('payout.addBankAccount')}
              variant="outline"
              onPress={handleAddBankAccount}
              style={styles.bankButton}
            />
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payout.earningsBreakdown')}</Text>
          <FlatList
            data={earningsBreakdown}
            renderItem={renderEarningsItem}
            keyExtractor={(item) => item.period}
            scrollEnabled={false}
          />
        </View>

        {/* Payout History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('payout.payoutHistory')}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>{t('payout.viewAll')}</Text>
            </TouchableOpacity>
          </View>
          
          {payoutHistory.length > 0 ? (
            <FlatList
              data={payoutHistory}
              renderItem={renderPayoutItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>{t('payout.noPayoutsYet')}</Text>
              <Text style={styles.emptyStateDescription}>
                {t('payout.payoutHistoryAfterWithdrawals')}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Methods – no dummy data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('payout.paymentMethods')}</Text>
          <View style={styles.paymentMethodsCard}>
            <TouchableOpacity style={styles.addPaymentMethod} onPress={handleAddBankAccount}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addPaymentText}>{t('payout.addPaymentMethod')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  backButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  balanceCard: {
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  balanceTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },
  balanceMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.9,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
    marginTop: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  actionsContainer: {
    gap: SPACING.md,
  },
  withdrawButton: {
    width: '100%',
  },
  bankButton: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  earningsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  earningsPeriod: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  earningsAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  earningsJobs: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  payoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  payoutAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
  },
  payoutDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  payoutMethod: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  payoutReference: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  paymentMethodsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  paymentMethodName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  paymentMethodDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  addPaymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  addPaymentText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
    marginLeft: SPACING.md,
  },
});

export default PayoutSummaryScreen;
