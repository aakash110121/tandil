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
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { Button } from '../../components/common/Button';

const PayoutSummaryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const technician = {
    id: 'tech_001',
    name: 'John Smith',
    totalEarnings: 2847.50,
    availableBalance: 1250.75,
    pendingAmount: 342.25,
    thisWeekEarnings: 342.75,
    thisMonthEarnings: 1250.75,
  };

  const payoutHistory = [
    {
      id: 'payout_001',
      amount: 450.00,
      date: '2024-01-15',
      status: 'completed',
      method: 'Bank Transfer',
      reference: 'TXN-2024-001',
    },
    {
      id: 'payout_002',
      amount: 325.50,
      date: '2024-01-08',
      status: 'completed',
      method: 'Bank Transfer',
      reference: 'TXN-2024-002',
    },
    {
      id: 'payout_003',
      amount: 280.25,
      date: '2024-01-01',
      status: 'completed',
      method: 'Bank Transfer',
      reference: 'TXN-2024-003',
    },
  ];

  const earningsBreakdown = [
    { period: 'This Week', amount: technician.thisWeekEarnings, jobs: 8 },
    { period: 'This Month', amount: technician.thisMonthEarnings, jobs: 32 },
    { period: 'Last Month', amount: 1895.50, jobs: 45 },
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
            {item.status === 'completed' ? 'Completed' : 'Pending'}
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
      <Text style={styles.earningsJobs}>{item.jobs} jobs</Text>
    </View>
  );

  const handleWithdraw = () => {
    if (technician.availableBalance < 50) {
      Alert.alert('Insufficient Balance', 'Minimum withdrawal amount is $50.');
      return;
    }

    Alert.alert(
      'Withdraw Funds',
      `Withdraw $${technician.availableBalance} to your bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Withdraw', 
          onPress: () => Alert.alert('Success', 'Withdrawal request submitted successfully!')
        },
      ]
    );
  };

  const handleAddBankAccount = () => {
    Alert.alert('Add Bank Account', 'Redirect to bank account setup page?');
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
        <Text style={styles.headerTitle}>Payout Summary</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Summary */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${technician.availableBalance}</Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Pending</Text>
              <Text style={styles.balanceValue}>${technician.pendingAmount}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Earned</Text>
              <Text style={styles.balanceValue}>${technician.totalEarnings}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.actionsContainer}>
            <Button
              title="Withdraw Funds"
              onPress={handleWithdraw}
              disabled={technician.availableBalance < 50}
              style={styles.withdrawButton}
            />
            <Button
              title="Add Bank Account"
              variant="outline"
              onPress={handleAddBankAccount}
              style={styles.bankButton}
            />
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
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
            <Text style={styles.sectionTitle}>Payout History</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
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
              <Text style={styles.emptyStateText}>No Payouts Yet</Text>
              <Text style={styles.emptyStateDescription}>
                Your payout history will appear here once you make withdrawals.
              </Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentMethodsCard}>
            <View style={styles.paymentMethod}>
              <Ionicons name="card-outline" size={24} color={COLORS.primary} />
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodName}>Bank Account</Text>
                <Text style={styles.paymentMethodDetails}>****1234 - Chase Bank</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.addPaymentMethod}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.addPaymentText}>Add Payment Method</Text>
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
    marginBottom: SPACING.lg,
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
