import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../../types';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

const { width } = Dimensions.get('window');

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';
  const { t } = useTranslation();
  const nameKey = `services.items.${service.id}.name`;
  const descKey = `services.items.${service.id}.description`;
  const nameRes = i18n.getResource(i18n.language, 'translation', nameKey) as string | undefined;
  const descRes = i18n.getResource(i18n.language, 'translation', descKey) as string | undefined;
  const translatedName = nameRes || t(nameKey, { defaultValue: service.name as any });
  const translatedDescription = descRes || t(descKey, { defaultValue: service.description as any });

  const fallbackUri = 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60&v=svc-fallback';
  const initialUri = (service.image || '').startsWith('http') ? service.image : fallbackUri;
  const [imgUri, setImgUri] = useState(initialUri);

  return (
    <TouchableOpacity
      style={[styles.container, isCompact && styles.compactContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: imgUri }}
        style={styles.image}
        onError={() => setImgUri(fallbackUri)}
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {translatedName}
        </Text>
        <Text style={styles.description} numberOfLines={isCompact ? 1 : 2}>
          {translatedDescription}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{t('orders.currency', { defaultValue: 'AED' })} {service.price}</Text>
            <Text style={styles.duration}>{service.duration} {t('services.details.minutes')}</Text>
          </View>
          
          {!isCompact && service.features && (
            <View style={styles.features}>
              {service.features.slice(0, 2).map((feature, index) => (
                <View key={index} style={styles.feature}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  compactContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  image: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  content: {
    padding: SPACING.md,
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  details: {
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  duration: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  features: {
    gap: SPACING.xs,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featureText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
}); 