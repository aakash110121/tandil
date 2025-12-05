const fs = require('fs');
const path = require('path');

const screenTemplate = (screenName) => `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';

const ${screenName}: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>${screenName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
  },
});

export default ${screenName};
`;

const screens = {
  user: [
    'OrdersScreen',
    'StoreScreen',
    'ProfileScreen',
    'ServiceCategoryScreen',
    'ServiceDetailScreen',
    'BookingFormScreen',
    'OrderSummaryScreen',
    'OrderTrackingScreen',
    'OrderHistoryScreen',
    'LoyaltyPointsScreen',
    'NotificationsScreen',
    'ProductDetailScreen',
    'CartScreen',
    'CheckoutScreen',
    'RateReviewScreen',
    'SettingsScreen',
    'HelpCenterScreen'
  ],
  technician: [
    'TechnicianLoginScreen',
    'TechnicianDashboardScreen',
    'JobDetailScreen',
    'TechnicianOrderHistoryScreen',
    'PayoutSummaryScreen',
    'TechnicianProfileScreen',
    'AvailabilityScreen'
  ],
  delivery: [
    'DeliveryLoginScreen',
    'DeliveryDashboardScreen',
    'DeliveryOrderDetailScreen',
    'MapViewScreen',
    'DeliveryOrderStatusScreen'
  ]
};

Object.entries(screens).forEach(([folder, screenList]) => {
  const folderPath = path.join(__dirname, 'src', 'screens', folder);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  
  screenList.forEach(screenName => {
    const filePath = path.join(folderPath, `${screenName}.tsx`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, screenTemplate(screenName));
      console.log(`Created: ${filePath}`);
    }
  });
});

console.log('All placeholder screens generated!'); 