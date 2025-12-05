import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { PartnerTierInfo } from '../../types';

const { width } = Dimensions.get('window');

const VendorDashboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const partnerTiers: PartnerTierInfo[] = [
    {
      tier: 'Basic',
      requirement: '10-20 free products',
      adminFee: 200,
      duration: '1 month',
      benefits: [
        'Partner logo + 1 product image in Partners section',
        'Mention of the shop when gifts are distributed',
        'Monthly report with number of gifts delivered'
      ],
      color: '#FF6B00'
    },
    {
      tier: 'Silver',
      requirement: '25-50 free products',
      adminFee: 400,
      duration: '2 months',
      benefits: [
        'All Basic benefits',
        'Small banner inside the app',
        'Up to 3 product images in Partners section',
        '1 social media post per month on Shozy\'s official accounts'
      ],
      color: '#C0C0C0'
    },
    {
      tier: 'Gold',
      requirement: '51-100 free products',
      adminFee: 700,
      duration: '3 months',
      benefits: [
        'All Silver benefits',
        'Medium banner on the home page of the app',
        'Short video (Reel/Story) about partner products',
        'Special discount code for Shozy customers'
      ],
      color: '#FFD700'
    },
    {
      tier: 'Platinum',
      requirement: '101-200 free products',
      adminFee: 1200,
      duration: '6 months',
      benefits: [
        'All Gold benefits',
        'Full banner on the app\'s home page',
        'Special social media campaign dedicated to the partner',
        'Products listed under "Exclusive Offers" section',
        'Partner logo featured in app notifications'
      ],
      color: '#E5E4E2'
    },
    {
      tier: 'Diamond',
      requirement: '200+ free products',
      adminFee: 2000,
      duration: '12 months (1 year)',
      benefits: [
        'All Platinum benefits',
        'Permanent "Featured Partner" status inside the app',
        'Dedicated partner page showcasing products',
        'Joint marketing content (photos/videos) with Shozy',
        'Priority access for any future events, offers, or promotions'
      ],
      color: '#B9F2FF'
    }
  ];

  const quickActions = [
    {
      title: 'Upload Products',
      description: 'Add new products to your catalog',
      icon: 'cube-outline',
      action: () => navigation.navigate('AddProduct'),
      color: COLORS.primary
    },
    {
      title: 'View Orders',
      description: 'Check product distribution orders',
      icon: 'list-outline',
      action: () => navigation.navigate('Orders'),
      color: COLORS.success
    },
    {
      title: 'Partnership',
      description: 'Manage your partnership tier',
      icon: 'business-outline',
      action: () => navigation.navigate('Partnership'),
      color: COLORS.info
    },
    {
      title: 'Analytics',
      description: 'View your performance metrics',
      icon: 'analytics-outline',
      action: () => navigation.navigate('Analytics'),
      color: COLORS.warning
    }
  ];

  const handleSelectPlan = (tier: PartnerTierInfo) => {
    Alert.alert(
      `Select ${tier.tier} Partnership`,
      `You've selected the ${tier.tier} partnership plan.\n\nRequirement: ${tier.requirement}\nFee: AED ${tier.adminFee}/${tier.duration}\n\nWould you like to proceed to payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Proceed to Payment', 
          onPress: () => navigation.navigate('Partnership')
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Vendor Dashboard</Text>
        <Text style={styles.subtitle}>Manage your partnership with Shozy</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={action.action}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Partnership Tiers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partnership Tiers</Text>
          <Text style={styles.sectionDescription}>
            Choose your partnership level and unlock exclusive benefits
          </Text>
          
          {partnerTiers.map((tier, index) => (
            <View key={index} style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <View style={[styles.tierBadge, { backgroundColor: tier.color + '20' }]}>
                  <Text style={[styles.tierName, { color: tier.color }]}>{tier.tier}</Text>
                </View>
                <View style={styles.tierPricing}>
                  <Text style={styles.adminFee}>AED {tier.adminFee}</Text>
                  <Text style={styles.duration}>/{tier.duration}</Text>
                </View>
              </View>
              
              <View style={styles.tierDetails}>
                <Text style={styles.requirement}>Requirement: {tier.requirement}</Text>
                <Text style={styles.benefitsTitle}>Benefits:</Text>
                {tier.benefits.map((benefit, benefitIndex) => (
                  <View key={benefitIndex} style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.benefitText}>{benefit}</Text>
                  </View>
                ))}
              </View>
              
              {/* Payment Button */}
              <TouchableOpacity
                style={styles.selectPlanButton}
                onPress={() => handleSelectPlan(tier)}
              >
                <Ionicons name="card-outline" size={20} color={COLORS.background} />
                <Text style={styles.selectPlanButtonText}>Select & Pay</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.howItWorks}>
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Provide Free Products</Text>
              <Text style={styles.stepDescription}>
                Supply 10-200+ free products (shoes, accessories, etc.) based on your chosen tier
              </Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Pay Administrative Fee</Text>
              <Text style={styles.stepDescription}>
                Pay a small monthly fee (AED 200-2,000) depending on your partnership level
              </Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Get Marketing Exposure</Text>
              <Text style={styles.stepDescription}>
                Receive in-app banners, social media promotion, and customer exposure
              </Text>
            </View>
            
            <View style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepTitle}>Grow Your Business</Text>
              <Text style={styles.stepDescription}>
                Build customer loyalty and increase brand awareness through Shozy's platform
              </Text>
            </View>
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    width: (width - SPACING.lg * 3) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  tierCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  tierName: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  tierPricing: {
    alignItems: 'flex-end',
  },
  adminFee: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  duration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  tierDetails: {
    gap: SPACING.sm,
  },
  requirement: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
  benefitsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  benefitText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  howItWorks: {
    gap: SPACING.md,
  },
  stepCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumberText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  stepTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Payment Button Styles
  selectPlanButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
  },
  selectPlanButtonText: {
    color: COLORS.background,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semiBold,
    marginLeft: SPACING.xs,
  },
});

export default VendorDashboardScreen;
