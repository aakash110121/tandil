import React from 'react';
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
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store';

const LoyaltyPointsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { user } = useAppStore();

  const loyaltyPoints = user?.loyaltyPoints || 0;
  const availableRewards = [
    { id: '1', nameKey: 'loyaltyPoints.rewards.freeCleaning', points: 500 },
    { id: '2', nameKey: 'loyaltyPoints.rewards.premiumPolish', points: 300 },
    { id: '3', nameKey: 'loyaltyPoints.rewards.expressService', points: 200 },
    { id: '4', nameKey: 'loyaltyPoints.rewards.waterproofing', points: 400 },
  ].map(r => ({
    id: r.id,
    name: t(`${r.nameKey}.name`),
    description: t(`${r.nameKey}.description`),
    points: r.points,
  }));

  const recentTransactions = [
    { id: '1', type: 'earned' as const, points: 50, descKey: 'loyaltyPoints.transactionOrderCompleted', descParams: { id: '12345' }, date: '2024-01-15' },
    { id: '2', type: 'redeemed' as const, points: -100, descKey: 'loyaltyPoints.transactionRedeemed', descParams: { service: t('loyaltyPoints.rewards.expressService.name') }, date: '2024-01-10' },
    { id: '3', type: 'earned' as const, points: 75, descKey: 'loyaltyPoints.transactionOrderCompleted', descParams: { id: '12340' }, date: '2024-01-08' },
  ].map(tx => ({ ...tx, description: t(tx.descKey, tx.descParams) }));

  const renderReward = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.rewardCard}>
      <View style={styles.rewardContent}>
        <Text style={styles.rewardName}>{item.name}</Text>
        <Text style={styles.rewardDescription}>{item.description}</Text>
        <View style={styles.rewardFooter}>
          <Text style={styles.rewardPoints}>{item.points} {t('common.points')}</Text>
          <TouchableOpacity 
            style={[
              styles.redeemButton,
              loyaltyPoints >= item.points && styles.redeemButtonActive
            ]}
            disabled={loyaltyPoints < item.points}
          >
            <Text style={[
              styles.redeemButtonText,
              loyaltyPoints >= item.points && styles.redeemButtonTextActive
            ]}>
              {loyaltyPoints >= item.points ? t('loyaltyPoints.redeem') : t('loyaltyPoints.notEnoughPoints')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={item.type === 'earned' ? 'add-circle' : 'remove-circle'} 
          size={24} 
          color={item.type === 'earned' ? COLORS.success : COLORS.error} 
        />
      </View>
      <View style={styles.transactionContent}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transactionPoints,
        { color: item.type === 'earned' ? COLORS.success : COLORS.error }
      ]}>
        {item.type === 'earned' ? '+' : ''}{item.points}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title={t('loyaltyPoints.title')} 
        showBack={true}
        rightComponent={
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Points Summary */}
        <View style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <Ionicons name="star" size={32} color={COLORS.warning} />
            <Text style={styles.pointsTitle}>{t('loyaltyPoints.yourPoints')}</Text>
          </View>
          <Text style={styles.pointsValue}>{loyaltyPoints}</Text>
          <Text style={styles.pointsDescription}>
            {t('loyaltyPoints.earnInfo')}
          </Text>
        </View>

        {/* Available Rewards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('loyaltyPoints.availableRewards')}</Text>
          <FlatList
            data={availableRewards}
            renderItem={renderReward}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('loyaltyPoints.recentTransactions')}</Text>
          <FlatList
            data={recentTransactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
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
  infoButton: {
    padding: SPACING.sm,
  },
  pointsCard: {
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pointsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.background,
    marginLeft: SPACING.sm,
  },
  pointsValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.background,
    marginBottom: SPACING.sm,
  },
  pointsDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  rewardCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  rewardContent: {
    flex: 1,
  },
  rewardName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  rewardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  rewardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rewardPoints: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
  },
  redeemButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  redeemButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  redeemButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  redeemButtonTextActive: {
    color: COLORS.background,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionIcon: {
    marginRight: SPACING.md,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  transactionDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  transactionPoints: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
});

export default LoyaltyPointsScreen;
