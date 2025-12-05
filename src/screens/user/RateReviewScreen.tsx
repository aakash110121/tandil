import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useTranslation } from 'react-i18next';

const RateReviewScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { orderId, serviceName } = route.params;
  
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ratingLabels = (t('rateReview.ratingLabels', { returnObjects: true }) as string[]) || [];

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert(t('rateReview.alerts.ratingRequiredTitle'), t('rateReview.alerts.ratingRequiredBody'));
      return;
    }

    if (reviewText.trim().length < 10) {
      Alert.alert(t('rateReview.alerts.reviewRequiredTitle'), t('rateReview.alerts.reviewRequiredBody'));
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        t('rateReview.alerts.submittedTitle'),
        t('rateReview.alerts.submittedBody'),
        [
          {
            text: t('rateReview.alerts.continue'),
            onPress: () => navigation.navigate('OrderHistory'),
          },
        ]
      );
    }, 1500);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[0, 1, 2, 3, 4].map((index) => (
          <TouchableOpacity
            key={index}
            style={styles.starButton}
            onPress={() => handleStarPress(index)}
          >
            <Ionicons
              name={index < rating ? 'star' : 'star-outline'}
              size={32}
              color={index < rating ? COLORS.warning : COLORS.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title={t('rateReview.title')} 
        showBack={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service Info */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{serviceName || t('services.items.service_001.name')}</Text>
            <Text style={styles.orderId}>{t('orders.orderNumber', { id: orderId })}</Text>
            <Text style={styles.completedText}>{t('rateReview.serviceCompleted')}</Text>
          </View>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rateReview.howWasExperience')}</Text>
          
          {renderStars()}
          
          {rating > 0 && (
            <Text style={styles.ratingLabel}>{ratingLabels[rating - 1]}</Text>
          )}
        </View>

        {/* Review Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rateReview.writeReview')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('rateReview.shareExperience')}
          </Text>
          
          <View style={styles.reviewInputContainer}>
            <TextInput
              style={styles.reviewInput}
              placeholder={t('rateReview.placeholder')}
              value={reviewText}
              onChangeText={setReviewText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={COLORS.textSecondary}
            />
            <Text style={styles.characterCount}>
              {t('rateReview.charCount', { current: reviewText.length })}
            </Text>
          </View>
        </View>

        {/* Review Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('rateReview.guidelinesTitle')}</Text>
          <View style={styles.guidelinesContainer}>
            {(t('rateReview.guidelines', { returnObjects: true }) as string[]).map((g, i) => (
              <View key={i} style={styles.guidelineItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.guidelineText}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title={isSubmitting ? t('rateReview.submitting') : t('rateReview.submit')}
          onPress={handleSubmitReview}
          disabled={isSubmitting || rating === 0}
          style={styles.submitButton}
        />
      </View>
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
  placeholder: {
    width: 40,
  },
  serviceCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  serviceInfo: {
    alignItems: 'center',
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  orderId: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  completedText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHTS.medium,
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
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  starButton: {
    padding: SPACING.xs,
  },
  ratingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.primary,
    textAlign: 'center',
  },
  reviewInputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  reviewInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 120,
  },
  characterCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  guidelinesContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  guidelineText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  bottomActions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    width: '100%',
  },
});

export default RateReviewScreen;
