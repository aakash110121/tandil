import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import Header from '../../components/common/Header';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { useAppStore } from '../../store';
// No external calendar lib; we'll render simple date chips

const BookingFormScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { service } = route.params;
  const { user, addOrder } = useAppStore();
  const { t } = useTranslation();
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [address, setAddress] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || '');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  const nextDays = useMemo(() => {
    const days: { key: string; date: Date; label: string }[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
      const key = d.toISOString();
      const label = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d
        .getDate()
        .toString()
        .padStart(2, '0')}`;
      days.push({ key, date: d, label });
    }
    return days;
  }, []);

  const formatTimeLabel = (time: string) => {
    // Parse simple 12-hour time like '09:00 AM'
    const match = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (!match) return time;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const isPM = match[3].toUpperCase() === 'PM';
    if (hours === 12) {
      hours = isPM ? 12 : 0;
    } else if (isPM) {
      hours += 12;
    }
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    // Use current i18n language
    const { default: i18next } = require('i18next');
    const lang = i18next?.language || 'en';
    const resolved = lang === 'ar' ? 'ar-EG' : lang === 'ur' ? 'ur-PK' : 'en-US';
    try {
      return d.toLocaleTimeString(resolved, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  };

  const paymentMethods = [
    { id: 'card', label: t('booking.paymentMethods.card'), icon: 'card-outline' },
    { id: 'cash', label: t('booking.paymentMethods.cash'), icon: 'cash-outline' },
    { id: 'wallet', label: t('booking.paymentMethods.wallet'), icon: 'wallet-outline' },
  ];

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || !address || !city || !state || !zipCode) {
      Alert.alert(t('booking.missingTitle'), t('booking.missingBody'));
      return;
    }

    const newOrder = {
      id: `order_${Date.now()}`,
      userId: user?.id || 'user_001',
      serviceId: service.id,
      status: 'pending' as const,
      totalAmount: service.price,
      createdAt: new Date(),
      scheduledDate: selectedDate,
      address: {
        id: 'address_001',
        street: address,
        city,
        state,
        zipCode,
        country: 'USA',
      },
      paymentMethod: selectedPaymentMethod as any,
      specialInstructions,
      tracking: [
        {
          id: '1',
          status: 'pending' as const,
          timestamp: new Date(),
          message: 'Order placed successfully',
        },
      ],
    };

    addOrder(newOrder);
    Alert.alert(
      t('booking.confirmed'),
      t('booking.success'),
      [
        {
          text: t('booking.viewOrder'),
          onPress: () => navigation.navigate('OrderTracking', { orderId: newOrder.id }),
        },
        {
          text: t('booking.continue'),
          onPress: () => navigation.navigate('Main' as never, { screen: 'Home' } as never),
        },
      ]
    );
  };

  const renderTimeSlot = (time: string) => (
    <TouchableOpacity
      key={time}
      style={[
        styles.timeSlot,
        selectedTime === time && styles.timeSlotActive
      ]}
      onPress={() => setSelectedTime(time)}
    >
      <Text style={[
        styles.timeSlotText,
        selectedTime === time && styles.timeSlotTextActive
      ]}>
        {formatTimeLabel(time)}
      </Text>
    </TouchableOpacity>
  );

  const renderPaymentMethod = (method: any) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethod,
        selectedPaymentMethod === method.id && styles.paymentMethodActive
      ]}
      onPress={() => setSelectedPaymentMethod(method.id)}
    >
      <Ionicons 
        name={method.icon as any} 
        size={24} 
        color={selectedPaymentMethod === method.id ? COLORS.background : COLORS.primary} 
      />
      <Text style={[
        styles.paymentMethodText,
        selectedPaymentMethod === method.id && styles.paymentMethodTextActive
      ]}>
        {method.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header 
        title={t('booking.title')} 
        showBack={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Service Summary */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            <Text style={styles.servicePrice}>${service.price}</Text>
          </View>
        </View>

        {/* Date and Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.dateTime')}</Text>
          
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>{t('booking.date')}</Text>
            <TouchableOpacity style={styles.dateButton} activeOpacity={0.9}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.dateButtonText}>
                {selectedDate ? selectedDate.toLocaleDateString() : t('booking.selectDate')}
              </Text>
            </TouchableOpacity>
            <View style={styles.dateChipsRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  {nextDays.map((d) => (
                    <TouchableOpacity
                      key={d.key}
                      style={[
                        styles.timeSlot,
                        selectedDate && d.date.toDateString() === selectedDate.toDateString() && styles.timeSlotActive,
                      ]}
                      onPress={() => setSelectedDate(d.date)}
                    >
                      <Text
                        style={[
                          styles.timeSlotText,
                          selectedDate && d.date.toDateString() === selectedDate.toDateString() && styles.timeSlotTextActive,
                        ]}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <Text style={styles.timeLabel}>{t('booking.time')}</Text>
          <View style={styles.timeSlots}>
            {timeSlots.map(renderTimeSlot)}
          </View>
        </View>

        {/* Address Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.addressSection')}</Text>
          
          <Input
            label={t('booking.streetAddress')}
            placeholder={t('booking.streetPlaceholder')}
            value={address}
            onChangeText={setAddress}
          />
          
          <View style={styles.addressRow}>
            <View style={styles.halfCol}>
              <Input
                label={t('booking.city')}
                placeholder={t('booking.city')}
                value={city}
                onChangeText={(text) => setCity(text)}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.halfCol}>
              <Input
                label={t('booking.state')}
                placeholder={t('booking.state')}
                value={state}
                onChangeText={(text) => setState(text)}
                autoCapitalize="words"
              />
            </View>
          </View>
          
          <Input
            label={t('booking.zip')}
            placeholder={t('booking.zipPlaceholder')}
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="numeric"
          />
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.special')}</Text>
          <Input
            label={t('booking.notes')}
            placeholder={t('booking.notesPlaceholder')}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('booking.payment')}</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map(renderPaymentMethod)}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{t('booking.orderSummary')}</Text>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('booking.service')}</Text>
            <Text style={styles.summaryValue}>{service.name}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('booking.duration')}</Text>
            <Text style={styles.summaryValue}>{service.duration} {t('booking.minutes')}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>{t('booking.total')}</Text>
            <Text style={styles.summaryTotal}>${service.price}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          title={t('booking.confirm')}
          onPress={handleConfirmBooking}
          style={styles.confirmButton}
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
    flex: 1,
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  serviceDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  servicePrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
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
  dateContainer: {
    marginBottom: SPACING.md,
  },
  dateLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  dateButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  timeLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  timeSlot: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeSlotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  timeSlotTextActive: {
    color: COLORS.background,
  },
  addressRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  halfCol: {
    flex: 1,
  },
  paymentMethods: {
    gap: SPACING.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  paymentMethodActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentMethodText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  paymentMethodTextActive: {
    color: COLORS.background,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: FONT_WEIGHTS.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  summaryTotal: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
  },
  bottomActions: {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    width: '100%',
  },
});

export default BookingFormScreen;
