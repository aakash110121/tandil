import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';
import Header from '../../components/common/Header';
import { getExclusiveOffers, PublicExclusiveOffer } from '../../services/exclusiveOffersService';
import { buildFullImageUrl } from '../../config/api';

function getOfferImageUrl(offer: PublicExclusiveOffer): string | null {
  const raw = offer.image_url ?? (offer as any).image ?? (offer as any).image_path;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  return raw.startsWith('http') ? raw : buildFullImageUrl(raw);
}

const OffersScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [offers, setOffers] = useState<PublicExclusiveOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOffers = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    try {
      const list = await getExclusiveOffers({ per_page: 50, page: 1 });
      setOffers(list ?? []);
    } catch (_) {
      setOffers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const offerTitle = (offer: PublicExclusiveOffer): string =>
    offer.title?.trim() || t('home.exclusiveOffer', 'Offer');
  const offerSubtitle = (offer: PublicExclusiveOffer): string =>
    offer.description?.trim() || offer.applies_to?.trim() || '';

  const renderOfferCard = ({ item }: { item: PublicExclusiveOffer }) => {
    const uri = getOfferImageUrl(item);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ExclusiveOfferProducts', { offer: item })}
        activeOpacity={0.9}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.cardImage} contentFit="cover" />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="pricetag-outline" size={40} color={COLORS.textSecondary} />
            <Text style={styles.cardImagePlaceholderText}>{t('home.noImage', 'No image')}</Text>
          </View>
        )}
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{offerTitle(item)}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2} ellipsizeMode="tail">{offerSubtitle(item)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('home.exclusiveOffers')}
        showBack
        onBackPress={() => navigation.goBack()}
      />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>{t('home.loading', 'Loading...')}</Text>
        </View>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOfferCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{t('home.noExclusiveOffers', 'No exclusive offers at the moment.')}</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchOffers(true)} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  listContent: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  card: {
    height: 140,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  cardImage: { width: '100%', height: '100%' },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  cardContent: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    bottom: SPACING.lg,
  },
  cardTitle: {
    color: COLORS.background,
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  cardSubtitle: {
    color: COLORS.background,
    opacity: 0.95,
    marginTop: 4,
    fontSize: FONT_SIZES.sm,
  },
  empty: { paddingVertical: SPACING.xxl, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
});

export default OffersScreen;
