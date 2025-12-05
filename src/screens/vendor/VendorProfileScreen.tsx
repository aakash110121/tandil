import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const { width } = Dimensions.get('window');

const VendorProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [autoSync, setAutoSync] = useState(true);

  // Demo vendor profile data
  const vendorProfile = {
    name: 'Ahmed Al Mansouri',
    email: 'ahmed@luxuryshoes.ae',
    phone: '+971 50 123 4567',
    businessName: 'Luxury Shoes & Accessories',
    businessType: 'Retail Store',
    location: 'Dubai Marina, Dubai, UAE',
    partnershipTier: 'Silver',
    memberSince: 'January 2024',
    totalProducts: 45,
    productsDelivered: 23,
    rating: 4.8,
    reviews: 156,
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  };

  const profileSections = [
    {
      title: 'Account Settings',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', action: 'editProfile' },
        { icon: 'business-outline', label: 'Business Information', action: 'businessInfo' },
        { icon: 'location-outline', label: 'Location & Address', action: 'location' },
        { icon: 'card-outline', label: 'Payment Methods', action: 'payment' },
      ]
    },
    {
      title: 'Partnership',
      items: [
        { icon: 'diamond-outline', label: 'Partnership Status', action: 'partnership' },
        { icon: 'analytics-outline', label: 'Performance Analytics', action: 'analytics' },
        { icon: 'document-text-outline', label: 'Partnership Documents', action: 'documents' },
        { icon: 'people-outline', label: 'Support Team', action: 'support' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', action: 'notifications', toggle: true },
        { icon: 'mail-outline', label: 'Marketing Emails', action: 'marketing', toggle: true },
        { icon: 'sync-outline', label: 'Auto Sync', action: 'sync', toggle: true },
        { icon: 'language-outline', label: 'Language', action: 'language' },
      ]
    },
    {
      title: 'Support & Help',
      items: [
        { icon: 'help-circle-outline', label: 'Help Center', action: 'help' },
        { icon: 'chatbubble-outline', label: 'Live Chat', action: 'chat' },
        { icon: 'call-outline', label: 'Contact Us', action: 'contact' },
        { icon: 'document-outline', label: 'Terms & Conditions', action: 'terms' },
        { icon: 'shield-outline', label: 'Privacy Policy', action: 'privacy' },
      ]
    }
  ];

  const handleProfileAction = (action: string) => {
    switch (action) {
      case 'editProfile':
        Alert.alert('Edit Profile', 'Profile editing feature coming soon!');
        break;
      case 'businessInfo':
        Alert.alert('Business Information', 'Business info editing feature coming soon!');
        break;
      case 'location':
        Alert.alert('Location', 'Location editing feature coming soon!');
        break;
      case 'payment':
        Alert.alert('Payment Methods', 'Payment methods management coming soon!');
        break;
      case 'partnership':
        navigation.navigate('Partnership');
        break;
      case 'analytics':
        navigation.navigate('Analytics');
        break;
      case 'documents':
        Alert.alert('Documents', 'Partnership documents feature coming soon!');
        break;
      case 'support':
        Alert.alert('Support', 'Support team contact feature coming soon!');
        break;
      case 'help':
        Alert.alert('Help Center', 'Help center feature coming soon!');
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Live chat feature coming soon!');
        break;
      case 'contact':
        Alert.alert('Contact Us', 'Contact feature coming soon!');
        break;
      case 'terms':
        Alert.alert('Terms & Conditions', 'Terms and conditions feature coming soon!');
        break;
      case 'privacy':
        Alert.alert('Privacy Policy', 'Privacy policy feature coming soon!');
        break;
      case 'language':
        Alert.alert('Language', 'Language selection feature coming soon!');
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          Alert.alert('Logged Out', 'You have been successfully logged out.');
          navigation.navigate('RoleSelection');
        }},
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileImageContainer}>
        <Image source={{ uri: vendorProfile.profileImage }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editImageButton}>
          <Ionicons name="camera" size={20} color={COLORS.background} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{vendorProfile.name}</Text>
        <Text style={styles.businessName}>{vendorProfile.businessName}</Text>
        <Text style={styles.businessType}>{vendorProfile.businessType}</Text>
        
        <View style={styles.partnershipBadge}>
          <Ionicons name="diamond-outline" size={16} color={COLORS.primary} />
          <Text style={styles.partnershipText}>{vendorProfile.partnershipTier} Partner</Text>
        </View>
        
        <Text style={styles.memberSince}>Member since {vendorProfile.memberSince}</Text>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{vendorProfile.totalProducts}</Text>
        <Text style={styles.statLabel}>Total Products</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{vendorProfile.productsDelivered}</Text>
        <Text style={styles.statLabel}>Delivered</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{vendorProfile.rating}</Text>
        <Text style={styles.statLabel}>Rating</Text>
      </View>
      
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{vendorProfile.reviews}</Text>
        <Text style={styles.statLabel}>Reviews</Text>
      </View>
    </View>
  );

  const renderProfileSection = (section: any) => (
    <View key={section.title} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      
      {section.items.map((item: any, index: number) => (
        <TouchableOpacity
          key={index}
          style={styles.sectionItem}
          onPress={() => handleProfileAction(item.action)}
        >
          <View style={styles.sectionItemLeft}>
            <View style={styles.itemIcon}>
              <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </View>
          
          {item.toggle ? (
            <Switch
              value={
                item.action === 'notifications' ? notificationsEnabled :
                item.action === 'marketing' ? marketingEmails :
                item.action === 'sync' ? autoSync : false
              }
              onValueChange={(value) => {
                if (item.action === 'notifications') setNotificationsEnabled(value);
                else if (item.action === 'marketing') setMarketingEmails(value);
                else if (item.action === 'sync') setAutoSync(value);
              }}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '40' }}
              thumbColor={COLORS.primary}
            />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your vendor profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Profile Header */}
        {renderProfileHeader()}
        
        {/* Stats */}
        {renderStats()}
        
        {/* Profile Sections */}
        {profileSections.map(renderProfileSection)}
        
        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Shozy Vendor App v1.0.0</Text>
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
  profileHeader: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  businessName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  businessType: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  partnershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
    marginBottom: SPACING.sm,
  },
  partnershipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  memberSince: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  logoutSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '20',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.error,
    marginLeft: SPACING.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});

export default VendorProfileScreen;
